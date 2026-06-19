#!/usr/bin/env node
/**
 * HBE 成本追踪仪表板
 * 实时追踪 Token 消耗和 API 成本
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

class CostTracker {
  constructor(options = {}) {
    this.dataDir = options.dataDir || path.join(os.homedir(), '.hbe');
    this.costFile = path.join(this.dataDir, 'costs.json');
    this.pricing = {
      haiku: 0.25,
      sonnet: 3.0,
      opus: 15.0
    };
    this.sessionData = {
      startTime: Date.now(),
      requests: [],
      totalTokens: 0,
      totalCost: 0
    };
  }

  /**
   * 记录请求
   */
  async recordRequest(model, inputTokens, outputTokens, metadata = {}) {
    const cost = this.calculateCost(model, inputTokens, outputTokens);
    
    const request = {
      timestamp: Date.now(),
      model,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      cost,
      metadata
    };
    
    this.sessionData.requests.push(request);
    this.sessionData.totalTokens += request.totalTokens;
    this.sessionData.totalCost += request.cost;
    
    return request;
  }

  /**
   * 计算成本
   */
  calculateCost(model, inputTokens, outputTokens) {
    const pricing = this.pricing[model] || this.pricing.sonnet;
    const totalTokens = (inputTokens + outputTokens) / 1000000;
    return totalTokens * pricing;
  }

  /**
   * 获取会话统计
   */
  getSessionStats() {
    const duration = Date.now() - this.sessionData.startTime;
    
    return {
      duration: Math.round(duration / 1000), // seconds
      requests: this.sessionData.requests.length,
      totalTokens: this.sessionData.totalTokens,
      totalCost: this.sessionData.totalCost.toFixed(4),
      avgTokensPerRequest: Math.round(this.sessionData.totalTokens / this.sessionData.requests.length),
      avgCostPerRequest: (this.sessionData.totalCost / this.sessionData.requests.length).toFixed(4)
    };
  }

  /**
   * 按模型分组统计
   */
  getStatsByModel() {
    const stats = {};
    
    for (const request of this.sessionData.requests) {
      if (!stats[request.model]) {
        stats[request.model] = {
          count: 0,
          tokens: 0,
          cost: 0
        };
      }
      
      stats[request.model].count++;
      stats[request.model].tokens += request.totalTokens;
      stats[request.model].cost += request.cost;
    }
    
    // 格式化
    for (const model in stats) {
      stats[model].avgTokens = Math.round(stats[model].tokens / stats[model].count);
      stats[model].avgCost = (stats[model].cost / stats[model].count).toFixed(4);
    }
    
    return stats;
  }

  /**
   * 预测年度成本
   */
  predictAnnualCost() {
    const stats = this.getSessionStats();
    const secondsPerDay = 8 * 60 * 60; // 8小时工作日
    const daysPerMonth = 20;
    const monthsPerYear = 12;
    
    const requestsPerSecond = stats.requests / stats.duration;
    const requestsPerDay = requestsPerSecond * secondsPerDay;
    const requestsPerYear = requestsPerDay * daysPerMonth * monthsPerYear;
    
    const avgCostPerRequest = parseFloat(stats.avgCostPerRequest);
    
    return {
      annualRequests: Math.round(requestsPerYear),
      annualTokens: Math.round(stats.totalTokens * requestsPerYear / stats.requests),
      annualCost: (avgCostPerRequest * requestsPerYear).toFixed(2),
      dailyCost: (avgCostPerRequest * requestsPerDay).toFixed(2),
      monthlyCost: (avgCostPerRequest * requestsPerDay * daysPerMonth).toFixed(2)
    };
  }

  /**
   * 显示成本报告
   */
  displayCostReport() {
    const stats = this.getSessionStats();
    const byModel = this.getStatsByModel();
    const prediction = this.predictAnnualCost();
    
    console.log('\n💰 成本追踪报告');
    console.log('═'.repeat(70));
    
    // 会话统计
    console.log('\n当前会话:');
    console.log(`  持续时间: ${stats.duration}s`);
    console.log(`  请求数: ${stats.requests}`);
    console.log(`  总 Tokens: ${stats.totalTokens}`);
    console.log(`  总成本: $${stats.totalCost}`);
    console.log(`  平均: ${stats.avgTokensPerRequest} tokens/请求`);
    console.log(`  平均: $${stats.avgCostPerRequest}/请求`);
    
    // 按模型统计
    console.log('\n按模型统计:');
    for (const [model, data] of Object.entries(byModel)) {
      const percent = ((data.tokens / stats.totalTokens) * 100).toFixed(1);
      console.log(`  ${model}:`);
      console.log(`    请求数: ${data.count}`);
      console.log(`    Tokens: ${data.tokens} (${percent}%)`);
      console.log(`    成本: $${data.cost.toFixed(4)}`);
      console.log(`    平均: ${data.avgTokens} tokens, $${data.avgCost}`);
    }
    
    // 年度预测
    console.log('\n年度预测 (基于当前使用):');
    console.log(`  每日成本: $${prediction.dailyCost}`);
    console.log(`  每月成本: $${prediction.monthlyCost}`);
    console.log(`  年度成本: $${prediction.annualCost}`);
    console.log(`  年度请求: ${prediction.annualRequests.toLocaleString()}`);
    console.log(`  年度 Tokens: ${prediction.annualTokens.toLocaleString()}`);
    
    // 优化建议
    console.log('\n💡 成本优化建议:');
    this.displayOptimizationTips(byModel, prediction);
    
    console.log('\n' + '═'.repeat(70));
  }

  /**
   * 显示优化建议
   */
  displayOptimizationTips(byModel, prediction) {
    const tips = [];
    
    // 检查是否过度使用 Opus
    if (byModel.opus && byModel.opus.count > 0) {
      const opusCost = byModel.opus.cost;
      const sonnetSavings = opusCost * 0.8; // Sonnet 便宜 80%
      
      tips.push({
        priority: 'high',
        title: '减少 Opus 使用',
        description: `部分任务可使用 Sonnet，节省 $${sonnetSavings.toFixed(2)}`,
        potential: sonnetSavings
      });
    }
    
    // 检查 Haiku 使用率
    const haikuCount = byModel.haiku ? byModel.haiku.count : 0;
    const totalCount = Object.values(byModel).reduce((sum, m) => sum + m.count, 0);
    const haikuRate = haikuCount / totalCount;
    
    if (haikuRate < 0.3) {
      const potential = prediction.annualCost * 0.1; // 10% 节省
      tips.push({
        priority: 'medium',
        title: '增加 Haiku 使用',
        description: `30% 简单任务用 Haiku，可节省 $${potential.toFixed(2)}`,
        potential: potential
      });
    }
    
    // 批处理建议
    if (this.sessionData.requests > 10) {
      tips.push({
        priority: 'low',
        title: '使用批处理',
        description: '合并小任务减少请求次数，可节省 20-30%',
        potential: prediction.annualCost * 0.2
      });
    }
    
    // 显示建议
    if (tips.length === 0) {
      console.log('  ✅ 成本优化良好，暂无建议');
      return;
    }
    
    for (let i = 0; i < tips.length; i++) {
      const tip = tips[i];
      const priority = {
        high: '🔴',
        medium: '🟡',
        low: '🟢'
      }[tip.priority] || '⚪';
      
      console.log(`  ${priority} ${tip.title}`);
      console.log(`     ${tip.description}`);
      
      if (tip.potential) {
        console.log(`     潜在节省: $${tip.potential.toFixed(2)}/年`);
      }
      
      if (i < tips.length - 1) {
        console.log();
      }
    }
  }

  /**
   * 保存会话数据
   */
  async saveSession() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      
      const session = {
        ...this.sessionData,
        endTime: Date.now(),
        stats: this.getSessionStats(),
        byModel: this.getStatsByModel(),
        prediction: this.predictAnnualCost()
      };
      
      const historyFile = path.join(this.dataDir, 'cost-history.json');
      let history = [];
      
      try {
        const content = await fs.readFile(historyFile, 'utf8');
        history = JSON.parse(content);
      } catch (error) {
        // 文件不存在，创建新的
      }
      
      history.unshift(session);
      
      // 保留最近 30 天
      const cutoff = Date.now() - (30 * 24 * 60 * 60 * 1000);
      history = history.filter(s => s.timestamp >= cutoff);
      
      await fs.writeFile(historyFile, JSON.stringify(history, null, 2));
    } catch (error) {
      console.error('保存会话数据失败:', error.message);
    }
  }

  /**
   * 加载历史数据
   */
  async loadHistory() {
    try {
      const historyFile = path.join(this.dataDir, 'cost-history.json');
      const content = await fs.readFile(historyFile, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      return [];
    }
  }

  /**
   * 显示趋势分析
   */
  async displayTrends() {
    const history = await this.loadHistory();
    
    if (history.length === 0) {
      console.log('\n暂无历史数据');
      return;
    }
    
    // 按日期分组
    const byDate = {};
    for (const session of history) {
      const date = new Date(session.timestamp).toISOString().split('T')[0];
      if (!byDate[date]) {
        byDate[date] = { cost: 0, tokens: 0, requests: 0 };
      }
      byDate[date].cost += parseFloat(session.totalCost);
      byDate[date].tokens += session.totalTokens;
      byDate[date].requests += session.stats.requests;
    }
    
    console.log('\n📈 成本趋势 (最近 30 天)');
    console.log('═'.repeat(70));
    
    const dates = Object.keys(byDate).sort().slice(-7); // 最近 7 天
    for (const date of dates) {
      const day = byDate[date];
      console.log(`  ${date}: $${day.cost.toFixed(2)} (${day.requests} 请求, ${day.tokens} tokens)`);
    }
    
    // 计算平均值
    const totalDays = dates.length;
    const avgCost = Object.values(byDate).reduce((sum, day) => sum + day.cost, 0) / totalDays;
    const avgTokens = Math.round(Object.values(byDate).reduce((sum, day) => sum + day.tokens, 0) / totalDays);
    const avgRequests = Math.round(Object.values(byDate).reduce((sum, day) => sum + day.requests, 0) / totalDays);
    
    console.log('\n平均值:');
    console.log(`  日均成本: $${avgCost.toFixed(2)}`);
    console.log(`  日均 Tokens: ${avgTokens.toLocaleString()}`);
    console.log(`  日均请求: ${avgRequests}`);
    
    console.log('\n' + '═'.repeat(70));
  }
}

// CLI 接口
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'report';
  
  const tracker = new CostTracker();
  
  switch (command) {
    case 'record':
      // 模拟记录请求
      await tracker.recordRequest('sonnet', 1500, 2000, { action: 'code-review' });
      await tracker.recordRequest('haiku', 500, 800, { action: 'format' });
      await tracker.recordRequest('sonnet', 2000, 3000, { action: 'refactor' });
      
      tracker.displayCostReport();
      break;
      
    case 'trends':
      await tracker.displayTrends();
      break;
      
    case 'report':
      tracker.displayCostReport();
      break;
      
    default:
      console.log(`
💰 HBE 成本追踪仪表板

用法: node scripts/dashboard/cost-tracker.js [命令]

命令:
  record      记录模拟数据并显示报告
  report      显示当前会话成本报告
  trends      显示成本趋势分析

示例:
  node scripts/dashboard/cost-tracker.js report
  node scripts/dashboard/cost-tracker.js trends
      `);
  }
}

module.exports = CostTracker;

if (require.main === module) {
  main().catch(console.error);
}
