#!/usr/bin/env node
/**
 * HBE Rules MCP Server
 *
 * 让 LLM 按需查询 HBE 的 83 条编码规则，避免把全部规则塞进上下文。
 *
 * 3 个工具：
 *   - list_languages: 列出支持的语言及其规则类别
 *   - get_rules:      按语言 + 类别获取规则全文
 *   - search_rules:   全文搜索规则内容
 *
 * 设计呼应 HBE 的 L0/L1/L2 分层加载：LLM 先 list（L0 索引），再 get（L2 详情），
 * 只在需要时加载相关规则，节省上下文窗口。
 *
 * 使用高层 McpServer API（SDK >= 1.27）。
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 规则根目录：打包后 __dirname 是 dist/mcp/，源码时是 src/mcp/
function findRulesDir() {
  let dir = __dirname;
  for (let i = 0; i < 5; i++) {
    const candidate = path.join(dir, 'skills', 'rules');
    if (fs.existsSync(candidate)) return candidate;
    dir = path.dirname(dir);
  }
  return path.join(process.cwd(), 'skills', 'rules');
}

const RULES_DIR = findRulesDir();

// --- 规则读取工具函数 ---

const CATEGORIES = ['coding-style', 'security', 'testing', 'patterns', 'hooks', 'performance'];
const TOP_LEVEL_RULES = [
  'agent-orchestration', 'coding-style', 'git-workflow', 'hooks',
  'patterns', 'performance', 'security', 'testing',
];

function listLanguages() {
  if (!fs.existsSync(RULES_DIR)) return [];
  return fs.readdirSync(RULES_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory() && !['common', 'zh', 'web'].includes(d.name))
    .map(d => d.name)
    .sort();
}

function listCategories(lang) {
  const langDir = path.join(RULES_DIR, lang);
  if (!fs.existsSync(langDir)) return [];
  return fs.readdirSync(langDir)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace(/\.md$/, ''));
}

function readRule(lang, category) {
  const filePath = path.join(RULES_DIR, lang, `${category}.md`);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf8');
}

function readTopLevelRule(name) {
  const filePath = path.join(RULES_DIR, `${name}.md`);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf8');
}

function searchRules(query, limit = 10) {
  const results = [];
  const lowerQuery = query.toLowerCase();

  function walkDir(dir, lang) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (results.length >= limit) return;
      if (entry.isDirectory() && !['common', 'zh'].includes(entry.name)) {
        walkDir(path.join(dir, entry.name), lang || entry.name);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const filePath = path.join(dir, entry.name);
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.toLowerCase().includes(lowerQuery)) {
          const category = entry.name.replace(/\.md$/, '');
          const lines = content.split('\n');
          const matchIdx = lines.findIndex(l => l.toLowerCase().includes(lowerQuery));
          const context = matchIdx >= 0
            ? lines.slice(Math.max(0, matchIdx - 1), matchIdx + 2).join('\n')
            : '';
          results.push({
            language: lang || '(top-level)',
            category,
            path: path.relative(RULES_DIR, filePath),
            context: context.slice(0, 200),
          });
        }
      }
    }
  }

  walkDir(RULES_DIR, null);
  return results;
}

// --- MCP Server (高层 API) ---

const server = new McpServer({
  name: 'hbe-rules',
  version: '3.3.1',
});

// 工具 1: list_languages
server.tool(
  'list_languages',
  'List all programming languages with available coding rules and their categories. '
    + 'Use this first (L0 index) to discover what rules exist before fetching specific ones.',
  {
    detail: z.boolean().optional().describe(
      'If true, include rule categories per language. Default false (names only).'
    ),
  },
  async ({ detail = false }) => {
    const langs = listLanguages();

    if (!detail) {
      const text = `Supported languages (${langs.length}):\n`
        + langs.map(l => `  - ${l}`).join('\n')
        + '\n\nPlus: common (shared), web, zh (Chinese versions)';
      return { content: [{ type: 'text', text }] };
    }

    const lines = [`Languages (${langs.length}):`];
    for (const lang of langs) {
      const cats = listCategories(lang);
      lines.push(`  ${lang}: ${cats.join(', ')}`);
    }
    lines.push('\nTop-level rules: ' + TOP_LEVEL_RULES.join(', '));
    return { content: [{ type: 'text', text: lines.join('\n') }] };
  }
);

// 工具 2: get_rules
server.tool(
  'get_rules',
  'Get the full content of coding rules for a specific language and category (L2 detail). '
    + 'Call list_languages first to see available options. '
    + 'Only fetch rules relevant to the current task to save context.',
  {
    language: z.string().describe(
      'Programming language (e.g. python, typescript, rust, go) or "common" for shared rules.'
    ),
    category: z.string().optional().describe(
      'Rule category: coding-style, security, testing, patterns, hooks, performance. '
      + 'Defaults to "coding-style".'
    ),
  },
  async ({ language = 'common', category = 'coding-style' }) => {
    let content;
    if (language === 'common' || listLanguages().includes(language)) {
      content = readRule(language, category);
    }
    if (!content && TOP_LEVEL_RULES.includes(category)) {
      content = readTopLevelRule(category);
    }

    if (!content) {
      const available = listCategories(language);
      return {
        content: [{ type: 'text',
          text: `No rule found for language="${language}", category="${category}".\n`
            + `Available categories for ${language}: ${available.join(', ') || '(none)'}\n`
            + `Use list_languages to see all options.` }],
      };
    }

    return { content: [{ type: 'text', text: content }] };
  }
);

// 工具 3: search_rules
server.tool(
  'search_rules',
  'Full-text search across all coding rules. Use when you need rules about a specific topic '
    + '(e.g. "SQL injection", "error handling", "null check") across all languages.',
  {
    query: z.string().describe('Search keyword or phrase'),
    limit: z.number().optional().describe('Max results (default 10)'),
  },
  async ({ query, limit = 10 }) => {
    if (!query) {
      return { content: [{ type: 'text', text: 'Error: query is required' }] };
    }
    const results = searchRules(query, limit);

    if (results.length === 0) {
      return { content: [{ type: 'text',
        text: `No rules matching "${query}". Try broader terms or use list_languages.` }] };
    }

    const lines = [`Found ${results.length} matching rule(s) for "${query}":\n`];
    results.forEach((r, i) => {
      lines.push(`${i + 1}. [${r.language}/${r.category}] (${r.path})`);
      if (r.context) lines.push(`   ${r.context.replace(/\n/g, '\n   ')}`);
      lines.push('');
    });
    return { content: [{ type: 'text', text: lines.join('\n') }] };
  }
);

// 启动
const transport = new StdioServerTransport();
await server.connect(transport);
console.error('HBE Rules MCP server running (83 rules available)');
