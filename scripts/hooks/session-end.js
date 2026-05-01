#!/usr/bin/env node
/**
 * session-end.js - 会话结束钩子
 *
 * 功能：
 * 1. 生成会话摘要
 * 2. 提取关键模式和决策
 * 3. 更新项目记忆
 */

const fs = require('fs');
const path = require('path');

// 配置
const MEMORY_DIR = path.join(process.cwd(), 'memory');
const SESSIONS_DIR = path.join(MEMORY_DIR, 'sessions');
const OBSERVATIONS_DIR = path.join(MEMORY_DIR, 'observations');
const SUMMARIES_DIR = path.join(MEMORY_DIR, 'summaries');

/**
 * 生成会话摘要
 */
function generateSessionSummary(session) {
  const observations = session.observations.map(obsId => {
    const obsFile = path.join(OBSERVATIONS_DIR, `${obsId}.json`);
    if (fs.existsSync(obsFile)) {
      return JSON.parse(fs.readFileSync(obsFile, 'utf8'));
    }
    return null;
  }).filter(Boolean);

  // 统计
  const stats = {
    total: observations.length,
    byType: {},
    byImportance: {}
  };

  observations.forEach(obs => {
    stats.byType[obs.type] = (stats.byType[obs.type] || 0) + 1;
    stats.byImportance[obs.importance] = (stats.byImportance[obs.importance] || 0) + 1;
  });

  // 关键观察
  const keyObservations = observations
    .filter(obs => obs.importance === 'high')
    .slice(0, 5)
    .map(obs => `- ${obs.summary}`)
    .join('\n');

  return {
    sessionId: session.id,
    startTime: session.startTime,
    endTime: new Date().toISOString(),
    stats,
    keyObservations,
    patterns: extractPatterns(observations)
  };
}

/**
 * 提取模式
 */
function extractPatterns(observations) {
  const patterns = [];

  // 检测重复的错误
  const errors = observations.filter(o => o.type === 'error');
  const errorGroups = groupBy(errors, o => o.summary.split(':')[0]);

  Object.entries(errorGroups).forEach(([errorType, errs]) => {
    if (errs.length >= 2) {
      patterns.push({
        type: 'recurring-error',
        description: `Recurring error: ${errorType} (${errs.length} times)`,
        frequency: errs.length
      });
    }
  });

  // 检测常用的工具组合
  const tools = observations.map(o => o.tool);
  const toolPairs = [];
  for (let i = 0; i < tools.length - 1; i++) {
    toolPairs.push(`${tools[i]} -> ${tools[i + 1]}`);
  }

  const pairCounts = countBy(toolPairs);
  Object.entries(pairCounts).forEach(([pair, count]) => {
    if (count >= 3) {
      patterns.push({
        type: 'workflow-pattern',
        description: `Common workflow: ${pair}`,
        frequency: count
      });
    }
  });

  return patterns;
}

/**
 * 保存会话摘要
 */
function saveSummary(summary) {
  const date = new Date().toISOString().split('T')[0];
  const summaryFile = path.join(SUMMARIES_DIR, `${summary.sessionId}.json`);
  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));

  console.log(`[Memory] Summary saved: ${summary.sessionId}`);
  return summaryFile;
}

/**
 * 更新项目记忆（MEMORY.md）
 */
function updateProjectMemory(summary) {
  const memoryFile = path.join(process.cwd(), 'MEMORY.md');

  let content = '';
  if (fs.existsSync(memoryFile)) {
    content = fs.readFileSync(memoryFile, 'utf8');
  } else {
    content = `# Project Memory\n\n_Last updated: ${new Date().toISOString()}_\n\n`;
  }

  // 添加新的摘要
  const newEntry = `
## Session ${summary.sessionId.slice(0, 10)} (${new Date(summary.startTime).toLocaleDateString()})

${summary.keyObservations || 'No key observations'}

${summary.patterns.length > 0 ? '**Patterns:**\n' + summary.patterns.map(p => `- ${p.description}`).join('\n') : ''}

`;

  // 保持最近 10 个会话
  const sessions = content.split('## Session').slice(1);
  const updatedContent = content.split('## Session')[0] + newEntry + '## Session' + sessions.slice(0, 9).join('## Session');

  fs.writeFileSync(memoryFile, updatedContent);
  console.log(`[Memory] Project memory updated: ${memoryFile}`);
}

// 辅助函数
function groupBy(array, keyFn) {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    groups[key] = groups[key] || [];
    groups[key].push(item);
    return groups;
  }, {});
}

function countBy(array) {
  return array.reduce((counts, item) => {
    counts[item] = (counts[item] || 0) + 1;
    return counts;
  }, {});
}

// 主函数
function main() {
  const sessionId = process.env.HBE_SESSION_ID;

  if (!sessionId) {
    console.log('[Memory] No active session');
    return;
  }

  const sessionFile = path.join(SESSIONS_DIR, `${sessionId}.json`);
  if (!fs.existsSync(sessionFile)) {
    console.log(`[Memory] Session not found: ${sessionId}`);
    return;
  }

  // 加载会话
  const session = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));

  // 更新会话结束时间
  session.endTime = new Date().toISOString();
  fs.writeFileSync(sessionFile, JSON.stringify(session, null, 2));

  // 生成摘要
  const summary = generateSessionSummary(session);

  // 保存摘要
  saveSummary(summary);

  // 更新项目记忆
  updateProjectMemory(summary);

  console.log(`[Memory] Session ended: ${sessionId}`);
}

// 执行
try {
  main();
} catch (error) {
  console.error('[Memory] Session end failed:', error.message);
  process.exit(1);
}
