#!/usr/bin/env node
/**
 * HBE 预测性预加载系统
 * 基于 Markov 链预测下一个可能的操作，提前加载资源
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

class PredictiveLoader {
  constructor(options = {}) {
    this.historyFile = path.join(os.homedir(), '.hbe', 'usage-history.json');
    this.markovChain = new Map(); // 状态转移概率
    this.frequencyMap = new Map(); // 操作频率统计
    this.maxHistory = 1000;
    this.preloadCache = new Map();
  }

  /**
   * 记录操作
   */
  async recordAction(action, context = {}) {
    const timestamp = Date.now();
    const record = { action, context, timestamp };
    
    // 更新频率统计
    const count = this.frequencyMap.get(action) || 0;
    this.frequencyMap.set(action, count + 1);
    
    // 更新 Markov 链
    await this.updateMarkovChain(action, context);
    
    // 保存历史
    await this.saveHistory(record);
  }

  /**
   * 更新 Markov 链
   */
  async updateMarkovChain(action, context) {
    // 读取最近的操作以确定前一个状态
    const history = await this.getRecentHistory(5);
    const previousAction = history.length > 0 ? history[history.length - 1].action : null;
    
    if (previousAction) {
      if (!this.markovChain.has(previousAction)) {
        this.markovChain.set(previousAction, new Map());
      }
      
      const transitions = this.markovChain.get(previousAction);
      const count = transitions.get(action) || 0;
      transitions.set(action, count + 1);
    }
  }

  /**
   * 获取最近的历史记录
   */
  async getRecentHistory(limit = 10) {
    try {
      const content = await fs.readFile(this.historyFile, 'utf8');
      const history = JSON.parse(content);
      return history.slice(0, limit);
    } catch (error) {
      return [];
    }
  }

  /**
   * 保存历史记录
   */
  async saveHistory(record) {
    try {
      await fs.mkdir(path.dirname(this.historyFile), { recursive: true });
      
      let history = [];
      try {
        const content = await fs.readFile(this.historyFile, 'utf8');
        history = JSON.parse(content);
      } catch (error) {
        // 文件不存在，创建新的
      }
      
      history.unshift(record);
      
      // 限制历史记录数量
      if (history.length > this.maxHistory) {
        history = history.slice(0, this.maxHistory);
      }
      
      await fs.writeFile(this.historyFile, JSON.stringify(history, null, 2));
    } catch (error) {
      console.error('保存历史记录失败:', error.message);
    }
  }

  /**
   * 预测下一个操作
   */
  async predictNext(currentAction) {
    const predictions = [];
    
    // 1. 基于 Markov 链预测
    const markovPredictions = this.predictByMarkov(currentAction);
    predictions.push(...markovPredictions);
    
    // 2. 基于频率预测
    const frequencyPredictions = this.predictByFrequency();
    predictions.push(...frequencyPredictions);
    
    // 3. 基于时间预测（一天中的时间段）
    const timePredictions = this.predictByTime();
    predictions.push(...timePredictions);
    
    // 4. 去重并排序
    const unique = Array.from(new Set(predictions));
    const scored = unique.map(action => ({
      action,
      score: this.calculateScore(action, currentAction)
    }));
    
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(p => p.action);
  }

  /**
   * 基于 Markov 链预测
   */
  predictByMarkov(currentAction) {
    if (!this.markovChain.has(currentAction)) {
      return [];
    }
    
    const transitions = this.markovChain.get(currentAction);
    const sorted = Array.from(transitions.entries())
      .sort((a, b) => b[1] - a[1]);
    
    return sorted.slice(0, 3).map(([action]) => action);
  }

  /**
   * 基于频率预测
   */
  predictByFrequency() {
    const sorted = Array.from(this.frequencyMap.entries())
      .sort((a, b) => b[1] - a[1]);
    
    return sorted.slice(0, 3).map(([action]) => action);
  }

  /**
   * 基于时间预测
   */
  predictByTime() {
    const hour = new Date().getHours();
    
    // 早晨：文档、规划
    if (hour >= 6 && hour < 12) {
      return ['plan', 'architect', 'docs'];
    }
    
    // 下午：开发、测试
    if (hour >= 12 && hour < 18) {
      return ['tdd', 'implement', 'refactor'];
    }
    
    // 晚上：审查、学习
    if (hour >= 18 || hour < 6) {
      return ['review', 'learn', 'security'];
    }
    
    return [];
  }

  /**
   * 计算预测得分
   */
  calculateScore(action, currentAction) {
    let score = 0;
    
    // Markov 链转移概率
    if (this.markovChain.has(currentAction)) {
      const transitions = this.markovChain.get(currentAction);
      const total = Array.from(transitions.values()).reduce((a, b) => a + b, 0);
      const count = transitions.get(action) || 0;
      score += (count / total) * 50;
    }
    
    // 频率权重
    const frequency = this.frequencyMap.get(action) || 0;
    const maxFrequency = Math.max(...Array.from(this.frequencyMap.values()));
    score += (frequency / maxFrequency) * 30;
    
    // 时间模式权重
    const hour = new Date().getHours();
    if ((hour >= 6 && hour < 12) && ['plan', 'architect', 'docs'].includes(action)) {
      score += 20;
    } else if ((hour >= 12 && hour < 18) && ['tdd', 'implement', 'refactor'].includes(action)) {
      score += 20;
    } else if ((hour >= 18 || hour < 6) && ['review', 'learn', 'security'].includes(action)) {
      score += 20;
    }
    
    return score;
  }

  /**
   * 预加载资源
   */
  async preload(predictions) {
    const preloaded = [];
    
    for (const action of predictions) {
      // 检查是否已预加载
      if (this.preloadCache.has(action)) {
        continue;
      }
      
      // 预加载对应的 skill 或 agent
      try {
        const resource = await this.loadResource(action);
        if (resource) {
          this.preloadCache.set(action, resource);
          preloaded.push(action);
        }
      } catch (error) {
        // 忽略预加载失败
      }
    }
    
    return preloaded;
  }

  /**
   * 加载资源
   */
  async loadResource(action) {
    // 根据 action 映射到文件路径
    const actionMap = {
      'review': 'references/agents/code-reviewer.md',
      'tdd': 'references/agents/tdd-guide.md',
      'refactor': 'references/agents/refactor-cleaner.md',
      'architect': 'references/agents/architect.md',
      'security': 'references/agents/security-reviewer.md',
      'plan': 'references/agents/planner.md',
      'learn': 'references/agents/continuous-learning.md'
    };
    
    const filePath = actionMap[action];
    if (!filePath) {
      return null;
    }
    
    const fullPath = path.join(process.cwd(), filePath);
    const exists = await fs.access(fullPath).then(() => true).catch(() => false);
    
    if (!exists) {
      return null;
    }
    
    const content = await fs.readFile(fullPath, 'utf8');
    return { action, content, loadedAt: Date.now() };
  }

  /**
   * 获取预加载缓存
   */
  getFromCache(action) {
    return this.preloadCache.get(action);
  }

  /**
   * 清理过期缓存
   */
  async cleanCache(maxAge = 3600000) { // 1小时
    const now = Date.now();
    
    for (const [action, resource] of this.preloadCache) {
      if (now - resource.loadedAt > maxAge) {
        this.preloadCache.delete(action);
      }
    }
  }

  /**
   * 显示预测统计
   */
  async displayStats() {
    console.log('\n📊 预测性预加载统计');
    console.log('═'.repeat(60));
    
    // Markov 链统计
    console.log('\n状态转移 (Markov Chain):');
    for (const [from, transitions] of this.markovChain) {
      const sorted = Array.from(transitions.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
      
      const toList = sorted.map(([to, count]) => `${to}(${count})`).join(', ');
      console.log(`  ${from} → ${toList}`);
    }
    
    // 频率统计
    console.log('\n操作频率:');
    const sorted = Array.from(this.frequencyMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    for (const [action, count] of sorted) {
      const bar = '█'.repeat(Math.min(count, 20));
      console.log(`  ${action.padEnd(20)} ${bar} ${count}`);
    }
    
    // 预加载缓存
    console.log('\n预加载缓存:');
    console.log(`  已加载: ${this.preloadCache.size} 项`);
    
    console.log('\n' + '═'.repeat(60));
  }
}

/**
 * 智能预加载调度器
 */
class PreloadScheduler {
  constructor() {
    this.loader = new PredictiveLoader();
    this.interval = 60000; // 每分钟预测一次
    this.timer = null;
  }

  /**
   * 启动智能预加载
   */
  async start() {
    console.log('🚀 启动智能预加载系统...');
    
    // 定期预测和预加载
    this.timer = setInterval(async () => {
      const history = await this.loader.getRecentHistory(1);
      const currentAction = history.length > 0 ? history[0].action : null;
      
      if (currentAction) {
        const predictions = await this.loader.predictNext(currentAction);
        if (predictions.length > 0) {
          const preloaded = await this.loader.preload(predictions);
          
          if (preloaded.length > 0) {
            console.log(`\n📦 预加载: ${preloaded.join(', ')}`);
          }
        }
      }
      
      // 清理过期缓存
      await this.loader.cleanCache();
    }, this.interval);
  }

  /**
   * 停止预加载
   */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      console.log('✓ 预加载已停止');
    }
  }

  /**
   * 手动触发预测
   */
  async predict(currentAction) {
    const predictions = await this.loader.predictNext(currentAction);
    const preloaded = await this.loader.preload(predictions);
    
    console.log(`\n🔮 当前操作: ${currentAction}`);
    console.log('─'.repeat(60));
    console.log('预测的下一个操作:');
    
    for (let i = 0; i < predictions.length; i++) {
      const loaded = preloaded.includes(predictions[i]) ? '✓' : ' ';
      console.log(`  ${i + 1}. ${predictions[i]} ${loaded}`);
    }
    
    console.log('\n预加载状态:');
    console.log(`  成功: ${preloaded.length}/${predictions.length}`);
  }
}

// CLI 接口
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'predict';
  
  const loader = new PredictiveLoader();
  
  switch (command) {
    case 'predict':
      const currentAction = args[1];
      if (!currentAction) {
        console.error('请指定当前操作');
        process.exit(1);
      }
      
      const scheduler = new PreloadScheduler();
      await scheduler.predict(currentAction);
      break;
      
    case 'start':
      const sched = new PreloadScheduler();
      await sched.start();
      
      console.log('\n预加载系统运行中，按 Ctrl+C 停止');
      process.on('SIGINT', () => {
        sched.stop();
        process.exit(0);
      });
      
      // 保持运行
      await new Promise(() => {});
      break;
      
    case 'stats':
      await loader.displayStats();
      break;
      
    default:
      console.log(`
🔮 HBE 预测性预加载系统

用法: node scripts/ai/predictive-loader.js [命令] [参数]

命令:
  predict <action>    预测下一个操作
  start               启动自动预加载
  stats               显示预测统计

示例:
  node scripts/ai/predictive-loader.js predict review
  node scripts/ai/predictive-loader.js start
  node scripts/ai/predictive-loader.js stats
      `);
  }
}

module.exports = { PredictiveLoader, PreloadScheduler };

if (require.main === module) {
  main().catch(console.error);
}
