#!/usr/bin/env node
/**
 * HBE 交互历史记录系统
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

const HISTORY_DIR = path.join(os.homedir(), '.hbe');
const HISTORY_FILE = path.join(HISTORY_DIR, 'history.json');

class HistoryManager {
  constructor() {
    this.maxHistory = 1000; // 最多保存 1000 条记录
  }

  async init() {
    try {
      await fs.mkdir(HISTORY_DIR, { recursive: true });
      
      const exists = await fs.access(HISTORY_FILE).then(() => true).catch(() => false);
      if (!exists) {
        await this.saveHistory({ sessions: [] });
      }
    } catch (error) {
      console.error('初始化历史记录失败:', error.message);
    }
  }

  async loadHistory() {
    try {
      const content = await fs.readFile(HISTORY_FILE, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      return { sessions: [] };
    }
  }

  async saveHistory(history) {
    try {
      await fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2));
    } catch (error) {
      console.error('保存历史记录失败:', error.message);
    }
  }

  async record(session) {
    const history = await this.loadHistory();
    
    const record = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      ...session
    };
    
    history.sessions.unshift(record);
    
    // 限制历史记录数量
    if (history.sessions.length > this.maxHistory) {
      history.sessions = history.sessions.slice(0, this.maxHistory);
    }
    
    await this.saveHistory(history);
    return record.id;
  }

  async getRecent(limit = 10) {
    const history = await this.loadHistory();
    return history.sessions.slice(0, limit);
  }

  async getByDate(date) {
    const history = await this.loadHistory();
    return history.sessions.filter(session => {
      return session.timestamp.startsWith(date);
    });
  }

  async getById(id) {
    const history = await this.loadHistory();
    return history.sessions.find(session => session.id === id);
  }

  async clear() {
    await this.saveHistory({ sessions: [] });
  }

  async stats() {
    const history = await this.loadHistory();
    const sessions = history.sessions;
    
    const stats = {
      total: sessions.length,
      byCommand: {},
      byStatus: {},
      today: 0,
      week: 0,
      month: 0
    };
    
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    for (const session of sessions) {
      // 按命令统计
      const command = session.command || 'unknown';
      stats.byCommand[command] = (stats.byCommand[command] || 0) + 1;
      
      // 按状态统计
      const status = session.status || 'unknown';
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
      
      // 时间统计
      const date = session.timestamp.split('T')[0];
      if (date === today) stats.today++;
      if (date >= weekAgo) stats.week++;
      if (date >= monthAgo) stats.month++;
    }
    
    return stats;
  }

  generateId() {
    return `hbe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  }

  formatSession(session) {
    const date = new Date(session.timestamp);
    const timeStr = date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    const statusIcon = {
      'success': '✅',
      'failed': '❌',
      'warning': '⚠️',
      'running': '🔄'
    }[session.status] || '📌';
    
    let output = `${timeStr}  ${statusIcon} ${session.command}`;
    
    if (session.summary) {
      output += ` (${session.summary})`;
    }
    
    if (session.duration) {
      output += ` - ${this.formatDuration(session.duration)}`;
    }
    
    return output;
  }

  async displayRecent(limit = 10) {
    const sessions = await this.getRecent(limit);
    
    if (sessions.length === 0) {
      console.log('暂无历史记录');
      return;
    }
    
    // 按日期分组
    const byDate = {};
    for (const session of sessions) {
      const date = session.timestamp.split('T')[0];
      if (!byDate[date]) byDate[date] = [];
      byDate[date].push(session);
    }
    
    // 显示
    for (const [date, sessionsOfDay] of Object.entries(byDate)) {
      console.log(`\n${date}:`);
      for (const session of sessionsOfDay) {
        console.log(`  ${this.formatSession(session)}`);
      }
    }
  }

  async displayStats() {
    const stats = await this.stats();
    
    console.log('\n📊 HBE 使用统计');
    console.log('─'.repeat(40));
    console.log(`总计: ${stats.total} 次会话`);
    console.log(`\n时间分布:`);
    console.log(`  今日: ${stats.today}`);
    console.log(`  本周: ${stats.week}`);
    console.log(`  本月: ${stats.month}`);
    console.log(`\n命令使用:`);
    
    const sortedCommands = Object.entries(stats.byCommand)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    for (const [command, count] of sortedCommands) {
      const bar = '█'.repeat(Math.min(count, 20));
      console.log(`  ${command.padEnd(20)} ${bar} ${count}`);
    }
    
    console.log(`\n状态分布:`);
    for (const [status, count] of Object.entries(stats.byStatus)) {
      console.log(`  ${status}: ${count}`);
    }
  }
}

// CLI 接口
async function main() {
  const manager = new HistoryManager();
  await manager.init();
  
  const args = process.argv.slice(2);
  const command = args[0] || 'list';
  
  switch (command) {
    case 'list':
    case 'recent':
      const limit = parseInt(args[1]) || 10;
      await manager.displayRecent(limit);
      break;
      
    case 'stats':
      await manager.displayStats();
      break;
      
    case 'clear':
      await manager.clear();
      console.log('✓ 历史记录已清空');
      break;
      
    default:
      console.log(`用法: history.js [list|stats|clear] [limit]`);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = HistoryManager;
