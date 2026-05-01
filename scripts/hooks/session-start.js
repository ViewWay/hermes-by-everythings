#!/usr/bin/env node
/**
 * session-start.js - 会话开始钩子
 *
 * 功能：
 * 1. 创建新会话记录
 * 2. 加载项目相关的历史记忆
 * 3. 生成渐进式上下文摘要
 */

const fs = require('fs');
const path = require('path');

// 配置
const MEMORY_DIR = path.join(process.cwd(), 'memory');
const SESSIONS_DIR = path.join(MEMORY_DIR, 'sessions');
const OBSERVATIONS_DIR = path.join(MEMORY_DIR, 'observations');
const SUMMARIES_DIR = path.join(MEMORY_DIR, 'summaries');

// 确保目录存在
[MEMORY_DIR, SESSIONS_DIR, OBSERVATIONS_DIR, SUMMARIES_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * 生成会话 ID
 */
function generateSessionId() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}`;
}

/**
 * 创建新会话记录
 */
function createSession() {
  const sessionId = generateSessionId();
  const sessionFile = path.join(SESSIONS_DIR, `${sessionId}.json`);

  const session = {
    id: sessionId,
    startTime: new Date().toISOString(),
    endTime: null,
    project: process.cwd(),
    observations: [],
    summary: null
  };

  fs.writeFileSync(sessionFile, JSON.stringify(session, null, 2));
  console.log(`[Memory] Session started: ${sessionId}`);

  return sessionId;
}

/**
 * 加载项目相关的历史观察
 */
function loadHistoricalObservations(limit = 20) {
  const observationFiles = fs.readdirSync(OBSERVATIONS_DIR)
    .filter(f => f.endsWith('.json'))
    .sort((a, b) => {
      const statA = fs.statSync(path.join(OBSERVATIONS_DIR, a));
      const statB = fs.statSync(path.join(OBSERVATIONS_DIR, b));
      return statB.mtimeMs - statA.mtimeMs;
    })
    .slice(0, limit);

  const observations = observationFiles.map(file => {
    const content = fs.readFileSync(path.join(OBSERVATIONS_DIR, file), 'utf8');
    return JSON.parse(content);
  });

  console.log(`[Memory] Loaded ${observations.length} historical observations`);
  return observations;
}

/**
 * 生成渐进式上下文
 */
function generateProgressiveContext(observations) {
  // 按类型分组
  const byType = {
    errors: observations.filter(o => o.type === 'error').slice(0, 3),
    successes: observations.filter(o => o.type === 'success').slice(0, 3),
    patterns: observations.filter(o => o.type === 'pattern').slice(0, 5),
    decisions: observations.filter(o => o.type === 'decision').slice(0, 3)
  };

  let context = '# Historical Context\n\n';

  if (byType.errors.length > 0) {
    context += '## Recent Errors & Fixes\n';
    byType.errors.forEach(obs => {
      context += `- ${obs.summary} (${obs.timestamp})\n`;
    });
    context += '\n';
  }

  if (byType.successes.length > 0) {
    context += '## Successful Patterns\n';
    byType.successes.forEach(obs => {
      context += `- ${obs.summary} (${obs.timestamp})\n`;
    });
    context += '\n';
  }

  if (byType.patterns.length > 0) {
    context += '## Learned Patterns\n';
    byType.patterns.forEach(obs => {
      context += `- ${obs.summary}\n`;
    });
    context += '\n';
  }

  if (byType.decisions.length > 0) {
    context += '## Key Decisions\n';
    byType.decisions.forEach(obs => {
      context += `- ${obs.summary}\n`;
    });
  }

  return context;
}

// 主函数
function main() {
  // 创建新会话
  const sessionId = createSession();

  // 加载历史观察
  const observations = loadHistoricalObservations(10);

  // 生成渐进式上下文
  if (observations.length > 0) {
    const context = generateProgressiveContext(observations);
    const contextFile = path.join(MEMORY_DIR, 'context-latest.md');
    fs.writeFileSync(contextFile, context);
    console.log(`[Memory] Context written to ${contextFile}`);
  }

  // 返回会话 ID（通过环境变量传递给后续钩子）
  process.env.HBE_SESSION_ID = sessionId;

  return sessionId;
}

// 执行
try {
  main();
} catch (error) {
  console.error('[Memory] Session start failed:', error.message);
  process.exit(1);
}
