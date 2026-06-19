#!/usr/bin/env node
/**
 * HBE 智能模型路由器
 * 根据任务复杂度自动选择最优模型，降低成本
 */

/**
 * 任务复杂度评估器
 */
class TaskComplexityAnalyzer {
  constructor() {
    this.rules = {
      // 简单任务特征
      simple: [
        { pattern: /documentation|comment|doc/i, weight: -2 },
        { pattern: /format|lint|style/i, weight: -2 },
        { pattern: /simple|basic|quick/i, weight: -1 },
        { pattern: /^list|^show|^get/, weight: -1 }
      ],
      
      // 标准任务特征
      standard: [
        { pattern: /implement|create|generate/i, weight: 1 },
        { pattern: /refactor|optimize|improve/i, weight: 1 },
        { pattern: /review|analyze|check/i, weight: 1 },
        { pattern: /test|spec|mock/i, weight: 1 }
      ],
      
      // 复杂任务特征
      complex: [
        { pattern: /architecture|design|system/i, weight: 3 },
        { pattern: /complex|advanced|expert/i, weight: 2 },
        { pattern: /integration|migration/i, weight: 2 },
        { pattern: /security|performance|scalability/i, weight: 2 },
        { pattern: /multi|cross|distributed/i, weight: 2 }
      ]
    };
  }

  /**
   * 分析任务复杂度
   */
  analyze(task) {
    const { description, context = {}, files = [] } = task;
    let score = 5; // 基础分数
    
    // 基于描述分析
    if (description) {
      score += this.scoreText(description);
    }
    
    // 基于文件数量
    if (files.length > 10) score += 2;
    else if (files.length > 5) score += 1;
    
    // 基于上下文
    if (context.dependencies && context.dependencies.length > 5) score += 1;
    if (context.hasTests) score += 1;
    if (context.isProduction) score += 2;
    
    // 限制范围
    score = Math.max(1, Math.min(10, score));
    
    return {
      score,
      level: this.getLevel(score),
      confidence: this.calculateConfidence(task)
    };
  }

  scoreText(text) {
    let score = 0;
    
    for (const rule of this.rules.simple) {
      if (rule.pattern.test(text)) {
        score += rule.weight;
      }
    }
    
    for (const rule of this.rules.standard) {
      if (rule.pattern.test(text)) {
        score += rule.weight;
      }
    }
    
    for (const rule of this.rules.complex) {
      if (rule.pattern.test(text)) {
        score += rule.weight;
      }
    }
    
    return score;
  }

  getLevel(score) {
    if (score <= 3) return 'simple';
    if (score <= 6) return 'standard';
    return 'complex';
  }

  calculateConfidence(task) {
    let confidence = 0.5;
    
    // 有明确描述增加置信度
    if (task.description && task.description.length > 20) {
      confidence += 0.2;
    }
    
    // 有上下文增加置信度
    if (Object.keys(task.context || {}).length > 0) {
      confidence += 0.1;
    }
    
    // 有文件列表增加置信度
    if (task.files && task.files.length > 0) {
      confidence += 0.1;
    }
    
    return Math.min(1, confidence);
  }
}

/**
 * 模型路由器
 */
class ModelRouter {
  constructor(options = {}) {
    this.models = options.models || {
      haiku: {
        name: 'haiku',
        cost: 0.25, // per 1M tokens
        speed: 1.0,
        quality: 3,
        maxTokens: 200000
      },
      sonnet: {
        name: 'sonnet',
        cost: 3.0,
        speed: 0.7,
        quality: 4,
        maxTokens: 200000
      },
      opus: {
        name: 'opus',
        cost: 15.0,
        speed: 0.4,
        quality: 5,
        maxTokens: 200000
      }
    };
    
    this.analyzer = new TaskComplexityAnalyzer();
    this.routes = {
      simple: 'haiku',
      standard: 'sonnet',
      complex: 'opus'
    };
    
    this.stats = {
      routes: {},
      savings: 0
    };
  }

  /**
   * 路由任务到最优模型
   */
  route(task) {
    const analysis = this.analyzer.analyze(task);
    const modelName = this.routes[analysis.level];
    const model = this.models[modelName];
    
    // 记录路由统计
    if (!this.stats.routes[modelName]) {
      this.stats.routes[modelName] = 0;
    }
    this.stats.routes[modelName]++;
    
    return {
      model: modelName,
      analysis,
      reason: this.getReason(analysis.level, task),
      estimatedCost: this.estimateCost(task, model),
      estimatedTime: this.estimateTime(task, model)
    };
  }

  getReason(level, task) {
    const reasons = {
      simple: '简单任务（文档生成、格式化）→ 使用 Haiku 节省成本',
      standard: '标准任务（代码生成、重构）→ 使用 Sonnet 平衡质量',
      complex: '复杂任务（架构设计、系统集成）→ 使用 Opus 保证质量'
    };
    return reasons[level];
  }

  estimateCost(task, model) {
    // 估算 token 数量
    const inputTokens = this.estimateInputTokens(task);
    const outputTokens = this.estimateOutputTokens(task);
    const totalTokens = (inputTokens + outputTokens) / 1000000;
    
    return {
      input: inputTokens,
      output: outputTokens,
      total: Math.round(inputTokens + outputTokens),
      cost: (totalTokens * model.cost).toFixed(4)
    };
  }

  estimateInputTokens(task) {
    let tokens = 100; // 基础开销
    
    if (task.description) {
      tokens += task.description.length / 4; // 粗略估算
    }
    
    if (task.context) {
      tokens += JSON.stringify(task.context).length / 4;
    }
    
    if (task.files) {
      tokens += task.files.length * 500; // 每个文件约 500 tokens
    }
    
    return Math.round(tokens);
  }

  estimateOutputTokens(task) {
    // 输出通常是输入的 20-50%
    const input = this.estimateInputTokens(task);
    return Math.round(input * 0.3);
  }

  estimateTime(task, model) {
    const inputTokens = this.estimateInputTokens(task);
    const outputTokens = this.estimateOutputTokens(task);
    const totalTokens = inputTokens + outputTokens;
    
    // 基于模型速度估算时间（秒）
    const baseTime = totalTokens / 1000; // 基准速度
    return Math.round(baseTime / model.speed);
  }

  /**
   * 批量路由
   */
  routeBatch(tasks) {
    return tasks.map(task => this.route(task));
  }

  /**
   * 对比成本（vs 始终使用 Sonnet）
   */
  compareCost(tasks) {
    const routes = this.routeBatch(tasks);
    
    let optimizedCost = 0;
    let standardCost = 0;
    
    for (const route of routes) {
      optimizedCost += parseFloat(route.estimatedCost.cost);
      
      // 假设标准方案都用 Sonnet
      standardCost += parseFloat(this.estimateCost(
        routes[0].analysis, // 复用第一个任务的估算
        this.models.sonnet
      ).cost);
    }
    
    const savings = standardCost - optimizedCost;
    const savingsPercent = ((savings / standardCost) * 100).toFixed(1);
    
    return {
      optimizedCost: optimizedCost.toFixed(4),
      standardCost: standardCost.toFixed(4),
      savings: savings.toFixed(4),
      savingsPercent,
      roi: `节省 ${savingsPercent}% 成本`
    };
  }

  /**
   * 获取路由统计
   */
  getStats() {
    const total = Object.values(this.stats.routes).reduce((a, b) => a + b, 0);
    
    return {
      routes: this.stats.routes,
      total,
      distribution: Object.entries(this.stats.routes).map(([model, count]) => ({
        model,
        count,
        percent: ((count / total) * 100).toFixed(1) + '%'
      }))
    };
  }

  /**
   * 设置自定义路由规则
   */
  setRoute(level, model) {
    if (!this.models[model]) {
      throw new Error(`未知模型: ${model}`);
    }
    this.routes[level] = model;
  }
}

/**
 * Token 预算管理器
 */
class TokenBudgetManager {
  constructor(options = {}) {
    this.budgets = options.budgets || {
      P0: 50000,
      P1: 30000,
      P2: 15000,
      P3: 5000
    };
    
    this.usage = {};
  }

  /**
   * 分配 token 预算
   */
  allocate(priority, task) {
    const budget = this.budgets[priority] || this.budgets.P1;
    const estimated = this.estimateTokens(task);
    
    return {
      allocated: Math.min(budget, estimated),
      budget,
      sufficient: estimated <= budget
    };
  }

  estimateTokens(task) {
    // 简单估算
    let tokens = 1000;
    
    if (task.description) {
      tokens += task.description.length / 4;
    }
    
    if (task.files) {
      tokens += task.files.length * 1000;
    }
    
    return Math.round(tokens);
  }

  /**
   * 记录实际使用
   */
  record(priority, tokens) {
    if (!this.usage[priority]) {
      this.usage[priority] = 0;
    }
    this.usage[priority] += tokens;
  }

  /**
   * 获取使用统计
   */
  getUsage() {
    return this.usage;
  }
}

// 示例任务
const exampleTasks = [
  {
    description: 'Generate documentation for the API',
    context: { type: 'documentation' }
  },
  {
    description: 'Implement user authentication feature',
    files: ['auth.ts', 'user.ts', 'middleware.ts'],
    context: { hasTests: true, isProduction: false }
  },
  {
    description: 'Design microservices architecture for the payment system',
    files: ['payment.ts', 'order.ts', 'inventory.ts', 'shipping.ts', 'notification.ts'],
    context: { dependencies: 15, isProduction: true }
  },
  {
    description: 'Format codebase with prettier',
    context: { type: 'formatting' }
  },
  {
    description: 'Refactor user module to improve performance',
    files: ['user.ts', 'user.service.ts', 'user.controller.ts'],
    context: { hasTests: true }
  }
];

// CLI 接口
async function main() {
  const router = new ModelRouter();
  
  console.log('🧪 智能模型路由测试');
  console.log('═'.repeat(60));
  
  // 单个任务路由
  console.log('\n1. 单任务路由:');
  const task1 = exampleTasks[0];
  const route1 = router.route(task1);
  console.log(`   任务: ${task1.description}`);
  console.log(`   → 模型: ${route1.model}`);
  console.log(`   → 原因: ${route1.reason}`);
  console.log(`   → 预估成本: $${route1.estimatedCost.cost}`);
  console.log(`   → 预估时间: ${route1.estimatedTime}s`);
  
  // 批量路由
  console.log('\n2. 批量路由:');
  const routes = router.routeBatch(exampleTasks);
  routes.forEach((route, i) => {
    console.log(`   ${i + 1}. ${route.model} - ${route.estimatedCost.total} tokens`);
  });
  
  // 成本对比
  console.log('\n3. 成本对比:');
  const comparison = router.compareCost(exampleTasks);
  console.log(`   优化后成本: $${comparison.optimizedCost}`);
  console.log(`   标准成本: $${comparison.standardCost} (始终用 Sonnet)`);
  console.log(`   节省: $${comparison.savings} (${comparison.savingsPercent})`);
  
  // 路由统计
  console.log('\n4. 路由统计:');
  const stats = router.getStats();
  stats.distribution.forEach(dist => {
    console.log(`   ${dist.model}: ${dist.count} 次 (${dist.percent})`);
  });
  
  console.log('\n═'.repeat(60));
}

module.exports = { ModelRouter, TaskComplexityAnalyzer, TokenBudgetManager };

if (require.main === module) {
  main().catch(console.error);
}
