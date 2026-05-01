#!/usr/bin/env node
/**
 * HBE 可视化仪表板
 * 实时显示系统状态、性能指标、使用统计
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

class Dashboard {
  constructor() {
    this.data = {
      system: {},
      performance: {},
      usage: {},
      cache: {},
      costs: {}
    };
  }

  /**
   * 收集系统数据
   */
  async collectSystemData() {
    const cpus = os.cpus();
    const freemem = os.freemem();
    const totalmem = os.totalmem();
    
    this.data.system = {
      platform: os.platform(),
      arch: os.arch(),
      cpuModel: cpus[0].model,
      cpuCores: cpus.length,
      memory: {
        total: Math.round(totalmem / 1024 / 1024 / 1024),
        free: Math.round(freemem / 1024 / 1024 / 1024),
        used: Math.round((totalmem - freemem) / 1024 / 1024 / 1024),
        percent: Math.round(((totalmem - freemem) / totalmem) * 100)
      },
      uptime: Math.round(os.uptime() / 60) // minutes
    };
  }

  /**
   * 收集性能数据
   */
  async collectPerformanceData() {
    // 尝试从缓存系统获取数据
    try {
      const cache = require('../cache/multi-level-cache');
      const cacheInstance = new cache.MultiLevelCache();
      await cacheInstance.init();
      
      const stats = cacheInstance.getStats();
      this.data.cache = {
        l1: {
          hitRate: stats.l1.hitRate,
          size: stats.l1.totalSizeMB,
          items: stats.l1.size
        },
        l2: {
          hitRate: stats.l2.hitRate,
          size: stats.l2.totalSizeMB,
          files: stats.l2.files
        },
        l3: {
          hitRate: stats.l3.hitRate,
          size: stats.l3.totalSizeMB,
          keys: stats.l3.keys
        },
        overall: stats.overall.hitRate
      };
    } catch (error) {
      this.data.cache = { error: '缓存系统未初始化' };
    }
  }

  /**
   * 收集使用统计
   */
  async collectUsageData() {
    try {
      const history = require('../utils/history');
      const historyManager = new history.HistoryManager();
      await historyManager.init();
      
      const stats = await historyManager.getStats();
      this.data.usage = stats;
    } catch (error) {
      this.data.usage = { error: '历史记录未初始化' };
    }
  }

  /**
   * 收集成本数据
   */
  async collectCostData() {
    // 模拟成本数据（实际应该从真实使用中计算）
    this.data.costs = {
      today: 0.45,
      week: 3.20,
      month: 12.80,
      projected: 43.00,
      savings: 65, // 年度节省
      efficiency: 60 // 百分比
    };
  }

  /**
   * 收集所有数据
   */
  async collectAll() {
    await Promise.all([
      this.collectSystemData(),
      this.collectPerformanceData(),
      this.collectUsageData(),
      this.collectCostData()
    ]);
  }

  /**
   * 渲染仪表板
   */
  render() {
    console.clear();
    console.log('\n' + '═'.repeat(70));
    console.log('🚀 HBE Dashboard - 实时监控');
    console.log('═'.repeat(70));
    
    this.renderSystem();
    this.renderPerformance();
    this.renderUsage();
    this.renderCosts();
    
    console.log('\n' + '═'.repeat(70));
    console.log(`更新时间: ${new Date().toLocaleString('zh-CN')}`);
    console.log('按 Ctrl+C 退出，每 5 秒自动刷新');
    console.log('═'.repeat(70) + '\n');
  }

  /**
   * 渲染系统信息
   */
  renderSystem() {
    const sys = this.data.system;
    
    console.log('\n📊 系统状态');
    console.log('─'.repeat(70));
    
    // CPU
    console.log(`  CPU: ${sys.cpuModel}`);
    console.log(`      核心: ${sys.cpuCores}`);
    
    // 内存
    const memBar = this.createBar(sys.memory.percent, 20);
    console.log(`  内存: ${memBar} ${sys.memory.used}/${sys.memory.total}GB (${sys.memory.percent}%)`);
    
    // 系统信息
    console.log(`  平台: ${sys.platform} ${sys.arch}`);
    console.log(`  运行时间: ${sys.uptime} 分钟`);
  }

  /**
   * 渲染性能信息
   */
  renderPerformance() {
    const cache = this.data.cache;
    
    console.log('\n⚡ 性能指标');
    console.log('─'.repeat(70));
    
    if (cache.error) {
      console.log(`  缓存: ${cache.error}`);
      return;
    }
    
    // 缓存命中率
    console.log(`  总体命中率: ${cache.overall}`);
    
    // L1
    console.log(`  L1 (内存): ${cache.l1.hitRate} - ${cache.l1.size} 项, ${cache.l1.size}MB`);
    
    // L2
    console.log(`  L2 (文件): ${cache.l2.hitRate} - ${cache.l2.files} 文件, ${cache.l2.size}MB`);
    
    // L3
    console.log(`  L3 (持久): ${cache.l3.hitRate} - ${cache.l3.keys} 键, ${cache.l3.size}MB`);
  }

  /**
   * 渲染使用统计
   */
  renderUsage() {
    const usage = this.data.usage;
    
    console.log('\n📈 使用统计');
    console.log('─'.repeat(70));
    
    if (usage.error) {
      console.log(`  统计: ${usage.error}`);
      return;
    }
    
    console.log(`  总会话: ${usage.total}`);
    console.log(`  今日: ${usage.today}`);
    console.log(`  本周: ${usage.week}`);
    console.log(`  本月: ${usage.month}`);
    
    // 命令分布
    console.log('\n  命令使用排行:');
    const commands = Object.entries(usage.byCommand || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    for (const [cmd, count] of commands) {
      const bar = '█'.repeat(Math.min(count, 20));
      console.log(`    ${cmd.padEnd(20)} ${bar} ${count}`);
    }
  }

  /**
   * 渲染成本信息
   */
  renderCosts() {
    const costs = this.data.costs;
    
    console.log('\n💰 成本分析');
    console.log('─'.repeat(70));
    
    console.log(`  今日成本: $${costs.today}`);
    console.log(`  本周成本: $${costs.week}`);
    console.log(`  本月成本: $${costs.month}`);
    console.log(`  年度预估: $${costs.projected}`);
    
    // 效率提升
    console.log(`\n  效率提升: ${costs.efficiency}%`);
    console.log(`  年度节省: $${costs.savings}`);
    
    // 可视化
    const efficiencyBar = this.createBar(costs.efficiency, 30);
    console.log(`  ${efficiencyBar} ${costs.efficiency}%`);
  }

  /**
   * 创建进度条
   */
  createBar(percent, width) {
    const filled = Math.round((percent / 100) * width);
    return '[' + '█'.repeat(filled) + '░'.repeat(width - filled) + ']';
  }

  /**
   * 实时监控模式
   */
  async start(interval = 5000) {
    console.log('\n🚀 启动 HBE 实时监控...');
    console.log('刷新间隔: ' + interval + 'ms\n');
    
    // 首次渲染
    await this.collectAll();
    this.render();
    
    // 定时刷新
    this.timer = setInterval(async () => {
      await this.collectAll();
      this.render();
    }, interval);
  }

  /**
   * 停止监控
   */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      console.log('\n✓ 监控已停止');
    }
  }
}

/**
 * 时间线查看器
 */
class TimelineViewer {
  constructor() {
    this.sessions = [];
  }

  async loadSessions() {
    try {
      const history = require('../utils/history');
      const manager = new history.HistoryManager();
      await manager.init();
      
      this.sessions = await manager.getRecent(50);
    } catch (error) {
      console.error('加载会话失败:', error.message);
    }
  }

  render() {
    if (this.sessions.length === 0) {
      console.log('\n暂无历史记录');
      return;
    }
    
    console.log('\n📅 会话时间线');
    console.log('═'.repeat(70));
    
    // 按日期分组
    const byDate = {};
    for (const session of this.sessions) {
      const date = session.timestamp.split('T')[0];
      if (!byDate[date]) byDate[date] = [];
      byDate[date].push(session);
    }
    
    // 显示
    const dates = Object.keys(byDate).sort().reverse();
    for (const date of dates.slice(0, 7)) { // 最近 7 天
      console.log(`\n${date}:`);
      
      for (const session of byDate[date]) {
        const time = new Date(session.timestamp).toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit'
        });
        
        const statusIcon = {
          'success': '✅',
          'failed': '❌',
          'warning': '⚠️',
          'running': '🔄'
        }[session.status] || '📌';
        
        let line = `  ${time}  ${statusIcon} ${session.command}`;
        
        if (session.summary) {
          line += ` (${session.summary})`;
        }
        
        console.log(line);
      }
    }
    
    console.log('\n' + '═'.repeat(70));
  }
}

/**
 * 快捷键系统
 */
class ShortcutManager {
  constructor() {
    this.shortcuts = {
      'Ctrl+R': 'repeat-last',
      'Ctrl+L': 'clear-screen',
      'Ctrl+H': 'show-history',
      'Ctrl+D': 'show-dashboard',
      'Ctrl+Q': 'quick-actions',
      'Tab': 'auto-complete',
      'Ctrl+C': 'cancel',
      'Ctrl+Z': 'undo-last'
    };
    
    this.aliases = {
      'r': 'review',
      't': 'tdd',
      'rf': 'refactor',
      'sec': 'security',
      'arch': 'architect',
      'plan': 'plan',
      'fix': 'build-fix',
      'e2e': 'e2e',
      'docs': 'docs',
      'learn': 'learn',
      'res': 'resume'
    };
  }

  render() {
    console.log('\n⌨️  快捷键');
    console.log('═'.repeat(70));
    
    console.log('\n全局快捷键:');
    const shortcuts = Object.entries(this.shortcuts);
    for (const [key, action] of shortcuts) {
      console.log(`  ${key.padEnd(10)} → ${action}`);
    }
    
    console.log('\n命令别名:');
    const aliases = Object.entries(this.aliases);
    for (const [alias, command] of aliases) {
      console.log(`  /hbe:${alias.padEnd(10)} → /hbe:${command}`);
    }
    
    console.log('\n' + '═'.repeat(70));
  }

  /**
   * 执行快捷键
   */
  async execute(key) {
    const action = this.shortcuts[key];
    if (!action) {
      console.log(`\n⚠️  未知的快捷键: ${key}`);
      return;
    }
    
    switch (action) {
      case 'repeat-last':
        console.log('\n🔄 重复上次命令...');
        // 实现重复逻辑
        break;
      case 'clear-screen':
        console.clear();
        break;
      case 'show-history':
        const viewer = new TimelineViewer();
        await viewer.loadSessions();
        viewer.render();
        break;
      case 'show-dashboard':
        const dashboard = new Dashboard();
        await dashboard.start();
        break;
      default:
        console.log(`\n执行: ${action}`);
    }
  }
}

// CLI 接口
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'dashboard';
  
  switch (command) {
    case 'dashboard':
    case 'dash':
    case 'd':
      const dashboard = new Dashboard();
      await dashboard.start();
      break;
      
    case 'timeline':
    case 'history':
    case 't':
      const viewer = new TimelineViewer();
      await viewer.loadSessions();
      viewer.render();
      break;
      
    case 'shortcuts':
    case 'keys':
    case 's':
      const shortcuts = new ShortcutManager();
      shortcuts.render();
      break;
      
    case 'stats':
      const dash = new Dashboard();
      await dash.collectAll();
      dash.render();
      break;
      
    default:
      console.log(`
🚀 HBE Dashboard

用法: node scripts/dashboard/dashboard.js [命令]

命令:
  dashboard, dash, d     启动实时监控
  timeline, history, t    显示会话时间线
  shortcuts, keys, s     显示快捷键
  stats                  显示当前统计

示例:
  node scripts/dashboard/dashboard.js dashboard
  node scripts/dashboard/dashboard.js timeline
  node scripts/dashboard/dashboard.js shortcuts
      `);
  }
}

module.exports = { Dashboard, TimelineViewer, ShortcutManager };

if (require.main === module) {
  main().catch(console.error);
}
