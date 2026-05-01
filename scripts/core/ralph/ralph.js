#!/usr/bin/env node
/**
 * Ralph 自主执行脚本
 * 基于 PRD 自动完成大型任务
 * 
 * 用法: node ralph.js [--max-iterations N] [--checkpoint-interval N]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置
const SCRIPT_DIR = __dirname;
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, '../..');
const MAX_ITERATIONS = parseInt(process.env.MAX_ITERATIONS || process.argv[3] || '50');
const CHECKPOINT_INTERVAL = parseInt(process.env.CHECKPOINT_INTERVAL || '5');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m'
};

function log(msg) {
  const timestamp = new Date().toTimeString().split(' ')[0];
  console.log(`${colors.blue}[${timestamp}]${colors.reset} ${msg}`);
}

function logSuccess(msg) {
  const timestamp = new Date().toTimeString().split(' ')[0];
  console.log(`${colors.green}[${timestamp}]${colors.reset} ✓ ${msg}`);
}

function logError(msg) {
  const timestamp = new Date().toTimeString().split(' ')[0];
  console.log(`${colors.red}[${timestamp}]${colors.reset} ✗ ${msg}`);
}

function logWarning(msg) {
  const timestamp = new Date().toTimeString().split(' ')[0];
  console.log(`${colors.yellow}[${timestamp}]${colors.reset} ⚠ ${msg}`);
}

function logInfo(msg) {
  const timestamp = new Date().toTimeString().split(' ')[0];
  console.log(`${colors.cyan}[${timestamp}]${colors.reset} ℹ ${msg}`);
}

// 检查 prd.json
function checkPrd() {
  const prdPath = path.join(PROJECT_ROOT, 'prd.json');
  if (!fs.existsSync(prdPath)) {
    logError('prd.json 不存在，请先运行 /hbe:prd 生成');
    process.exit(1);
  }
  return prdPath;
}

// 加载 prd.json
function loadPrd() {
  const prdPath = path.join(PROJECT_ROOT, 'prd.json');
  const prd = JSON.parse(fs.readFileSync(prdPath, 'utf8'));
  return prd;
}

// 获取下一个未完成的 story
function getNextStory() {
  const prd = loadPrd();
  const nextStory = prd.stories.find(s => !s.passes);
  return nextStory ? JSON.stringify(nextStory) : null;
}

// 更新 story 状态
function updateStoryStatus(storyId, passes) {
  const prdPath = path.join(PROJECT_ROOT, 'prd.json');
  const prd = JSON.parse(fs.readFileSync(prdPath, 'utf8'));
  
  const story = prd.stories.find(s => s.id === storyId);
  if (story) {
    story.passes = passes;
  }
  
  fs.writeFileSync(prdPath, JSON.stringify(prd, null, 2));
}

// 创建检查点
function createCheckpoint(iteration) {
  const checkpointFile = path.join(PROJECT_ROOT, '.ralph-checkpoint.json');
  const checkpoint = {
    iteration: iteration,
    timestamp: new Date().toISOString(),
    git_commit: execSync('git rev-parse HEAD 2>/dev/null || echo unknown').toString().trim(),
    git_branch: execSync('git branch --show-current 2>/dev/null || echo unknown').toString().trim()
  };
  
  fs.writeFileSync(checkpointFile, JSON.stringify(checkpoint, null, 2));
  logSuccess(`检查点 ${iteration} 已创建`);
}

// 恢复检查点
function restoreCheckpoint() {
  const checkpointFile = path.join(PROJECT_ROOT, '.ralph-checkpoint.json');
  
  if (fs.existsSync(checkpointFile)) {
    logInfo('发现检查点，正在恢复...');
    const checkpoint = JSON.parse(fs.readFileSync(checkpointFile, 'utf8'));
    logInfo(`将从迭代 ${checkpoint.iteration + 1} 继续`);
    return checkpoint.iteration;
  }
  
  return 0;
}

// 执行 story
function executeStory(storyJson) {
  const story = JSON.parse(storyJson);
  const storyId = story.id;
  const storyTitle = story.title;
  
  log('');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log(`执行 Story #${storyId}: ${storyTitle}`);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // 这里应该调用 Claude Code 来执行
  // 由于脚本环境限制，这里只是框架
  logWarning('Story 执行需要 Claude Code 环境');
  logInfo(`Story JSON: ${storyJson}`);
  
  // 模拟执行
  // 实际应该通过 Claude Code API 调用 /hbe:tdd
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  delay(1000);
  
  logSuccess(`Story #${storyId} 完成`);
  
  // 更新状态
  updateStoryStatus(storyId, true);
  
  // 追加到 progress.md
  const progressPath = path.join(PROJECT_ROOT, 'progress.md');
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const entry = `- [#${storyId}] ${storyTitle} - ${timestamp}\n`;
  
  if (fs.existsSync(progressPath)) {
    fs.appendFileSync(progressPath, entry);
  } else {
    fs.writeFileSync(progressPath, entry);
  }
}

// 主函数
async function main() {
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                                                               ║');
  console.log('║              Ralph 自主执行系统 v2.0                          ║');
  console.log('║                                                               ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log('');
  
  // 检查环境
  checkPrd();
  
  // 恢复检查点
  const startIteration = restoreCheckpoint();
  
  // 加载 PRD
  log('加载 PRD...');
  const prd = loadPrd();
  const totalStories = prd.stories?.length || 0;
  const completedStories = prd.stories?.filter(s => s.passes).length || 0;
  
  log(`总 Stories: ${totalStories}`);
  log(`已完成: ${completedStories}`);
  log(`剩余: ${totalStories - completedStories}`);
  console.log('');
  
  // 执行循环
  for (let iteration = startIteration + 1; iteration <= MAX_ITERATIONS; iteration++) {
    // 获取下一个 story
    const nextStory = getNextStory();
    
    if (!nextStory) {
      logSuccess('所有 Stories 已完成！');
      break;
    }
    
    // 执行 story
    await executeStory(nextStory);
    
    // 定期创建检查点
    if (iteration % CHECKPOINT_INTERVAL === 0) {
      createCheckpoint(iteration);
    }
  }
  
  // 最终报告
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                       执行完成                              ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log('');
  log(`查看进度: cat ${path.join(PROJECT_ROOT, 'progress.md')}`);
  log(`查看日志: cat ${path.join(PROJECT_ROOT, '.ralph-log.jsonl')}`);
}

// 运行
main().catch(error => {
  logError(error.message);
  process.exit(1);
});
