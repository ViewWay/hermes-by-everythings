#!/usr/bin/env node
/**
 * HBE CLI Tool
 *
 * Hermes-by-Everything's v3.3.0 命令行工具
 * 提供技能管理、状态查看、更新检测等功能
 */

const fs = require('fs');
const path = require('path');

const HBE_VERSION = '3.3.0';
const PROJECT_ROOT = path.resolve(__dirname, '..');

// 颜色输出
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function colorize(color, text) {
  return `${colors[color]}${text}${colors.reset}`;
}

// 获取所有 agents
function getAgents() {
  const agentsDir = path.join(PROJECT_ROOT, 'skills', 'agents');
  if (!fs.existsSync(agentsDir)) return [];
  return fs.readdirSync(agentsDir)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace('.md', ''));
}

// 获取所有 skills
function getSkills() {
  const skillsDir = path.join(PROJECT_ROOT, 'skills');
  if (!fs.existsSync(skillsDir)) return [];
  const skills = [];
  const items = fs.readdirSync(skillsDir, { withFileTypes: true });
  for (const item of items) {
    if (item.isDirectory()) {
      const skillPath = path.join(skillsDir, item.name);
      const skillFile = path.join(skillPath, 'SKILL.md');
      if (fs.existsSync(skillFile)) {
        skills.push(item.name);
      }
    }
  }
  return skills;
}

// 显示状态
function showStatus() {
  console.log(colorize('blue', '╔═══════════════════════════════════════════════════════╗'));
  console.log(colorize('blue', `║   Hermes-by-Everything's v${HBE_VERSION}                        ║`));
  console.log(colorize('blue', '╚═══════════════════════════════════════════════════════╝'));
  console.log('');

  const agents = getAgents();
  console.log(colorize('green', `✓ Agents: ${agents.length}`));
  console.log(`  ${agents.slice(0, 5).join(', ')}${agents.length > 5 ? '...' : ''}`);
  console.log('');

  const skills = getSkills();
  console.log(colorize('green', `✓ Skills: ${skills.length}`));
  console.log(`  ${skills.slice(0, 5).join(', ')}${skills.length > 5 ? '...' : ''}`);
  console.log('');

  console.log(colorize('blue', `📁 Project: ${PROJECT_ROOT}`));
  console.log('');
}

// 显示帮助
function showHelp() {
  console.log(colorize('blue', '╔═══════════════════════════════════════════════════════╗'));
  console.log(colorize('blue', '║         HBE CLI - Hermes-by-Everything\'s            ║'));
  console.log(colorize('blue', '╚═══════════════════════════════════════════════════════╝'));
  console.log('');
  console.log('用法: hbe <command> [options]');
  console.log('');
  console.log('命令:');
  console.log('  status        显示 HBE 状态');
  console.log('  agents        列出所有 agents');
  console.log('  skills        列出所有 skills');
  console.log('  test          运行测试套件');
  console.log('  help          显示此帮助信息');
  console.log('');
  console.log('示例:');
  console.log('  hbe status');
  console.log('  hbe agents');
  console.log('  hbe test');
  console.log('');
}

// 列出 agents
function listAgents() {
  const agents = getAgents();
  console.log(colorize('blue', `📋 HBE Agents (${agents.length}):`));
  console.log('');
  agents.forEach(agent => {
    console.log(`  • ${agent}`);
  });
  console.log('');
}

// 列出 skills
function listSkills() {
  const skills = getSkills();
  console.log(colorize('blue', `📋 HBE Skills (${skills.length}):`));
  console.log('');
  skills.forEach(skill => {
    console.log(`  • ${skill}`);
  });
  console.log('');
}

// 运行测试
function runTests(args) {
  const { spawn } = require('child_process');
  const testScript = path.join(PROJECT_ROOT, 'tests', 'scripts', 'test-all.sh');
  if (!fs.existsSync(testScript)) {
    console.error(colorize('red', '错误: 测试脚本不存在'));
    process.exit(1);
  }
  const testArgs = args.length > 0 ? args : ['--fast'];
  console.log(colorize('blue', `🧪 运行测试: bash ${testScript} ${testArgs.join(' ')}`));
  console.log('');
  const test = spawn('bash', [testScript, ...testArgs], {
    stdio: 'inherit',
    cwd: PROJECT_ROOT
  });
  test.on('exit', (code) => {
    process.exit(code || 0);
  });
}

// 主函数
function main() {
  const command = process.argv[2] || 'help';
  const args = process.argv.slice(3);
  switch (command) {
    case 'status':
      showStatus();
      break;
    case 'agents':
      listAgents();
      break;
    case 'skills':
      listSkills();
      break;
    case 'test':
      runTests(args);
      break;
    case 'help':
    default:
      showHelp();
      break;
  }
}

// 运行
if (require.main === module) {
  main();
}

module.exports = { getAgents, getSkills, showStatus };
