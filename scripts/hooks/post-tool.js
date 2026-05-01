#!/usr/bin/env node
/**
 * post-tool.js - 工具使用后钩子
 *
 * 功能：
 * 1. 捕获工具使用结果
 * 2. 提取有意义的观察
 * 3. 存储到记忆系统
 */

const fs = require('fs');
const path = require('path');

// 配置
const MEMORY_DIR = path.join(process.cwd(), 'memory');
const OBSERVATIONS_DIR = path.join(MEMORY_DIR, 'observations');
const SESSIONS_DIR = path.join(MEMORY_DIR, 'sessions');

/**
 * 生成观察 ID
 */
function generateObservationId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `obs-${timestamp}-${random}`;
}

/**
 * 分析工具使用并提取观察
 */
function extractObservation(toolName, toolInput, toolOutput) {
  // 跳过不重要的工具
  const skipTools = ['AskUserQuestion', 'Bash', 'Read'];
  if (skipTools.includes(toolName)) {
    return null;
  }

  let observation = null;

  // 根据工具类型提取不同的观察
  switch (toolName) {
    case 'Write':
    case 'Edit':
      observation = {
        id: generateObservationId(),
        timestamp: new Date().toISOString(),
        type: 'action',
        tool: toolName,
        summary: `Modified ${toolInput.file_path || 'file'}`,
        details: {
          tool: toolName,
          input: toolInput,
          output: toolOutput
        },
        importance: 'low'
      };
      break;

    case 'Agent':
      observation = {
        id: generateObservationId(),
        timestamp: new Date().toISOString(),
        type: 'delegation',
        tool: toolName,
        summary: `Delegated to ${toolInput.subagent_type || 'agent'}`,
        details: {
          subagent: toolInput.subagent_type,
          description: toolInput.description
        },
        importance: 'medium'
      };
      break;

    default:
      // 其他工具的通用处理
      if (toolOutput && typeof toolOutput === 'string' && toolOutput.includes('error')) {
        observation = {
          id: generateObservationId(),
          timestamp: new Date().toISOString(),
          type: 'error',
          tool: toolName,
          summary: `Error in ${toolName}: ${toolOutput.slice(0, 100)}...`,
          details: {
            tool: toolName,
            error: toolOutput
          },
          importance: 'high'
        };
      }
  }

  return observation;
}

/**
 * 保存观察
 */
function saveObservation(observation) {
  if (!observation) return;

  const obsFile = path.join(OBSERVATIONS_DIR, `${observation.id}.json`);
  fs.writeFileSync(obsFile, JSON.stringify(observation, null, 2));

  // 添加到当前会话
  const sessionId = process.env.HBE_SESSION_ID;
  if (sessionId) {
    const sessionFile = path.join(SESSIONS_DIR, `${sessionId}.json`);
    if (fs.existsSync(sessionFile)) {
      const session = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
      session.observations.push(observation.id);
      fs.writeFileSync(sessionFile, JSON.stringify(session, null, 2));
    }
  }

  console.log(`[Memory] Observation saved: ${observation.id}`);
}

// 主函数
function main() {
  // 从环境变量获取工具使用信息（由 Claude Code 设置）
  const toolName = process.env.HBE_LAST_TOOL;
  const toolInput = process.env.HBE_LAST_TOOL_INPUT ? JSON.parse(process.env.HBE_LAST_TOOL_INPUT) : null;
  const toolOutput = process.env.HBE_LAST_TOOL_OUTPUT ? process.env.HBE_LAST_TOOL_OUTPUT : null;

  if (!toolName) {
    console.log('[Memory] No tool information available');
    return;
  }

  // 提取观察
  const observation = extractObservation(toolName, toolInput, toolOutput);

  // 保存观察
  if (observation) {
    saveObservation(observation);
  }
}

// 执行
try {
  main();
} catch (error) {
  console.error('[Memory] Post-tool failed:', error.message);
  process.exit(1);
}
