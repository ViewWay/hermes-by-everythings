#!/usr/bin/env node
/**
 * Agent ID Manager — Agent ID 管理工具
 *
 * 功能：
 * 1. 检测最新的 Agent ID（用于 resume）
 * 2. 列出所有活跃的 Agent
 * 3. 获取 Agent 的 JSONL 日志路径
 * 4. 清理过期的 Agent 元数据
 *
 * 用途：支持 Orchestrator Agent 的 Agent resume 机制
 *
 * 使用方法：
 *   node scripts/agent-id-manager.js --latest
 *   node scripts/agent-id-manager.js --list
 *   node scripts/agent-id-manager.js --jsonl <agent-id>
 *   node scripts/agent-id-manager.js --cleanup [days]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置
const CLAUDE_PROJECTS_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.claude', 'projects');

/**
 * 解析命令行参数
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const command = args[0] || '--help';
  const param = args[1];

  return { command, param };
}

/**
 * 查找所有 agent-*.meta.json 文件
 */
function findAgentMetaFiles() {
  try {
    // 跨平台命令：使用 find（Unix）或 dir（Windows）
    let command;

    if (process.platform === 'win32') {
      // Windows: 使用 PowerShell
      command = `Get-ChildItem -Path "${CLAUDE_PROJECTS_DIR}" -Recurse -Filter "agent-*.meta.json" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 20 | ForEach-Object { $_.FullName }`;
    } else {
      // Unix/macOS: 使用 find
      command = `find "${CLAUDE_PROJECTS_DIR}" -name "agent-*.meta.json" -type f -printf '%T@ %p\\n' 2>/dev/null | sort -rn | head -20 | cut -d' ' -f2-`;
    }

    const result = execSync(command, { encoding: 'utf8' });
    return result.trim().split('\n').filter(Boolean);
  } catch (error) {
    // 如果 find 命令失败，尝试使用 Node.js 递归遍历
    return findAgentMetaFilesNode();
  }
}

/**
 * 使用 Node.js 递归查找（备用方案）
 */
function findAgentMetaFilesNode() {
  const results = [];

  function walkDir(dir) {
    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          // 只遍历 subagents 目录
          if (file === 'subagents') {
            walkDir(fullPath);
          }
        } else if (file.match(/^agent-.*\.meta\.json$/)) {
          results.push({
            path: fullPath,
            mtime: stat.mtimeMs
          });
        }
      }
    } catch (error) {
      // 忽略无权限目录
    }
  }

  // 遍历所有项目目录
  try {
    const projects = fs.readdirSync(CLAUDE_PROJECTS_DIR);
    for (const project of projects) {
      const projectPath = path.join(CLAUDE_PROJECTS_DIR, project);
      walkDir(projectPath);
    }
  } catch (error) {
    // 目录不存在
  }

  // 按修改时间排序
  results.sort((a, b) => b.mtime - a.mtime);

  return results.slice(0, 20).map(r => r.path);
}

/**
 * 提取 Agent 裸 ID
 */
function extractAgentId(metaPath) {
  const match = metaPath.match(/agent-([a-f0-9]+)\.meta\.json$/);
  return match ? match[1] : null;
}

/**
 * 获取 Agent 元数据
 */
function getAgentMeta(metaPath) {
  try {
    const content = fs.readFileSync(metaPath, 'utf8');
    const meta = JSON.parse(content);

    return {
      id: extractAgentId(metaPath),
      path: metaPath,
      type: meta.name || 'unknown',
      state: meta.state || 'unknown',
      createdAt: new Date(meta.createdAt).toISOString(),
      lastActive: new Date(meta.lastActiveAt || meta.createdAt).toISOString()
    };
  } catch (error) {
    return {
      id: extractAgentId(metaPath),
      path: metaPath,
      type: 'unknown',
      state: 'error',
      error: error.message
    };
  }
}

/**
 * 获取最新的 Agent ID
 */
function getLatestAgentId() {
  const metaFiles = findAgentMetaFilesNode();

  if (metaFiles.length === 0) {
    console.log('No active agents found');
    return null;
  }

  const latest = getAgentMeta(metaFiles[0]);
  return latest.id;
}

/**
 * 列出所有活跃的 Agent
 */
function listActiveAgents() {
  const metaFiles = findAgentMetaFilesNode();

  if (metaFiles.length === 0) {
    console.log('No active agents found');
    return;
  }

  console.log(`\nFound ${metaFiles.length} active agents:\n`);

  metaFiles.slice(0, 10).forEach((metaPath, index) => {
    const meta = getAgentMeta(metaPath);

    console.log(`${index + 1}. ${meta.id}`);
    console.log(`   Type: ${meta.type}`);
    console.log(`   State: ${meta.state}`);
    console.log(`   Created: ${meta.createdAt}`);
    console.log(`   Last Active: ${meta.lastActive}`);
    console.log(`   Path: ${meta.path}`);
    console.log('');
  });
}

/**
 * 获取 Agent 的 JSONL 日志路径
 */
function getAgentJsonlPath(agentId) {
  const metaFiles = findAgentMetaFilesNode();

  for (const metaPath of metaFiles) {
    const meta = getAgentMeta(metaPath);

    if (meta.id === agentId) {
      // JSONL 文件在同一目录，文件名为 agent-{id}.jsonl
      const jsonlPath = metaPath.replace('.meta.json', '.jsonl');

      if (fs.existsSync(jsonlPath)) {
        const stats = fs.statSync(jsonlPath);
        console.log(`\nAgent JSONL Log:`);
        console.log(`  ID: ${agentId}`);
        console.log(`  Path: ${jsonlPath}`);
        console.log(`  Size: ${(stats.size / 1024).toFixed(2)} KB`);
        console.log(`  Modified: ${stats.mtime.toISOString()}`);
        console.log('');
        return jsonlPath;
      } else {
        console.log(`\nError: JSONL file not found for agent ${agentId}`);
        console.log(`  Expected path: ${jsonlPath}`);
        return null;
      }
    }
  }

  console.log(`\nError: Agent ${agentId} not found`);
  return null;
}

/**
 * 清理过期的 Agent 元数据
 */
function cleanupOldAgents(days = 7) {
  const metaFiles = findAgentMetaFilesNode();
  const cutoffDate = Date.now() - (days * 24 * 60 * 60 * 1000);
  let deletedCount = 0;

  console.log(`\nCleaning up agents older than ${days} days...\n`);

  metaFiles.forEach(metaPath => {
    const meta = getAgentMeta(metaPath);
    const mtime = new Date(meta.lastActive).getTime();

    if (mtime < cutoffDate) {
      try {
        // 删除 .meta.json 和 .jsonl 文件
        const jsonlPath = metaPath.replace('.meta.json', '.jsonl');

        fs.unlinkSync(metaPath);
        if (fs.existsSync(jsonlPath)) {
          fs.unlinkSync(jsonlPath);
        }

        deletedCount++;
        console.log(`  ✓ Deleted: ${meta.id} (${meta.type})`);
      } catch (error) {
        console.log(`  ✗ Failed to delete ${meta.id}: ${error.message}`);
      }
    }
  });

  console.log(`\nDeleted ${deletedCount} old agents\n`);
}

/**
 * 显示帮助信息
 */
function showHelp() {
  console.log(`
Agent ID Manager — Agent ID 管理工具

用法:
  node scripts/agent-id-manager.js [command] [parameter]

命令:
  --latest              显示最新的 Agent ID（用于 resume）
  --list                列出所有活跃的 Agent（最多 10 个）
  --jsonl <agent-id>    获取 Agent 的 JSONL 日志路径
  --cleanup [days]      清理过期的 Agent（默认 7 天）
  --help                显示此帮助信息

示例:
  # 获取最新 Agent ID
  node scripts/agent-id-manager.js --latest

  # 列出所有活跃 Agent
  node scripts/agent-id-manager.js --list

  # 获取指定 Agent 的日志路径
  node scripts/agent-id-manager.js --jsonl abc123def456

  # 清理 30 天前的 Agent
  node scripts/agent-id-manager.js --cleanup 30

说明:
  - Agent ID 用于 Agent(resume) 机制，在修正循环中恢复同一 Agent
  - meta.json 文件包含 Agent 的元数据（类型、状态、时间戳）
  - jsonl 文件包含 Agent 的完整对话历史
  - Claude Code 项目目录: ~/.claude/projects/
  `);
}

/**
 * 主函数
 */
function main() {
  const { command, param } = parseArgs();

  switch (command) {
    case '--latest':
      const latestId = getLatestAgentId();
      if (latestId) {
        console.log(`\nLatest Agent ID: ${latestId}\n`);
      }
      break;

    case '--list':
      listActiveAgents();
      break;

    case '--jsonl':
      if (!param) {
        console.error('Error: Agent ID is required for --jsonl command');
        console.error('Usage: node scripts/agent-id-manager.js --jsonl <agent-id>');
        process.exit(1);
      }
      getAgentJsonlPath(param);
      break;

    case '--cleanup':
      const days = parseInt(param) || 7;
      cleanupOldAgents(days);
      break;

    case '--help':
    case '-h':
    default:
      showHelp();
      break;
  }
}

// 执行
try {
  main();
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
