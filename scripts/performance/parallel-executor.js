#!/usr/bin/env node
/**
 * HBE Agent 并行执行系统
 * 支持多个 Agent 并行运行，提升执行效率
 */

const { Worker } = require('worker_threads');
const path = require('path');

class ParallelExecutor {
  constructor(options = {}) {
    this.maxConcurrency = options.maxConcurrency || 5;
    this.timeout = options.timeout || 30000; // 30s 默认超时
    this.workers = new Map();
  }

  /**
   * 并行执行多个任务
   */
  async executeParallel(tasks) {
    const results = [];
    const errors = [];
    
    // 分批执行（受并发限制）
    for (let i = 0; i < tasks.length; i += this.maxConcurrency) {
      const batch = tasks.slice(i, i + this.maxConcurrency);
      const batchResults = await Promise.allSettled(
        batch.map(task => this.executeTask(task))
      );
      
      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          errors.push(result.reason);
        }
      }
    }
    
    return { results, errors };
  }

  /**
   * 执行单个任务
   */
  async executeTask(task) {
    const { name, fn, args = [] } = task;
    const startTime = Date.now();
    
    try {
      const result = await Promise.race([
        fn(...args),
        this.createTimeout(this.timeout)
      ]);
      
      const duration = Date.now() - startTime;
      
      return {
        name,
        success: true,
        result,
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      return {
        name,
        success: false,
        error: error.message,
        duration
      };
    }
  }

  /**
   * 使用 Worker 线程执行
   */
  async executeInWorker(workerPath, data) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(workerPath, {
        workerData: data
      });
      
      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
      
      this.workers.set(worker, Date.now());
    });
  }

  /**
   * 并行执行 Agent
   */
  async executeAgents(agents) {
    console.log(`\n🚀 并行执行 ${agents.length} 个 Agent`);
    console.log('─'.repeat(50));
    
    const startTime = Date.now();
    
    // 按优先级排序
    const sortedAgents = agents.sort((a, b) => {
      const priorityA = this.getPriority(a.priority);
      const priorityB = this.getPriority(b.priority);
      return priorityB - priorityA;
    });
    
    const { results, errors } = await this.executeParallel(
      sortedAgents.map(agent => ({
        name: agent.name,
        fn: agent.execute,
        args: agent.args || [],
        priority: agent.priority
      }))
    );
    
    const duration = Date.now() - startTime;
    
    // 显示结果
    this.displayResults(results, errors, duration);
    
    return { results, errors, duration };
  }

  /**
   * 串行执行 Agent（对比）
   */
  async executeAgentsSerially(agents) {
    console.log(`\n📌 串行执行 ${agents.length} 个 Agent`);
    console.log('─'.repeat(50));
    
    const startTime = Date.now();
    const results = [];
    const errors = [];
    
    for (const agent of agents) {
      const taskStart = Date.now();
      try {
        const result = await agent.execute(...(agent.args || []));
        const duration = Date.now() - taskStart;
        
        console.log(`✅ ${agent.name} (${duration}ms)`);
        results.push({ name: agent.name, success: true, result, duration });
      } catch (error) {
        const duration = Date.now() - taskStart;
        console.log(`❌ ${agent.name} (${duration}ms) - ${error.message}`);
        errors.push(error);
        results.push({ name: agent.name, success: false, error: error.message, duration });
      }
    }
    
    const duration = Date.now() - startTime;
    console.log(`\n⏱️  总耗时: ${duration}ms`);
    
    return { results, errors, duration };
  }

  /**
   * 显示执行结果
   */
  displayResults(results, errors, duration) {
    console.log('\n执行结果:');
    console.log('─'.repeat(50));
    
    // 按完成时间排序显示
    const sorted = [...results].sort((a, b) => a.duration - b.duration);
    
    for (const result of sorted) {
      const icon = result.success ? '✅' : '❌';
      const status = result.success ? '成功' : '失败';
      console.log(`${icon} ${result.name} - ${status} (${result.duration}ms)`);
    }
    
    if (errors.length > 0) {
      console.log(`\n⚠️  ${errors.length} 个错误:`);
      errors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error.message || error}`);
      });
    }
    
    console.log('\n统计:');
    console.log(`  成功: ${results.filter(r => r.success).length}/${results.length}`);
    console.log(`  失败: ${errors.length}`);
    console.log(`  总耗时: ${duration}ms`);
    console.log(`  平均: ${Math.round(duration / results.length)}ms/agent`);
  }

  /**
   * 获取优先级数值
   */
  getPriority(priority) {
    const map = {
      'P0': 100,
      'P1': 75,
      'P2': 50,
      'P3': 25
    };
    return map[priority] || 50;
  }

  /**
   * 创建超时 Promise
   */
  createTimeout(ms) {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
    });
  }

  /**
   * 清理所有 workers
   */
  cleanup() {
    for (const [worker] of this.workers) {
      worker.terminate();
    }
    this.workers.clear();
  }
}

/**
 * 批处理执行器
 */
class BatchProcessor {
  constructor(options = {}) {
    this.batchSize = options.batchSize || 10;
    this.delay = options.delay || 100; // 批次间延迟
  }

  /**
   * 批量处理文件
   */
  async processFiles(files, processor) {
    const results = [];
    const batches = this.createBatches(files, this.batchSize);
    
    console.log(`\n📦 批处理 ${files.length} 个文件`);
    console.log(`批次大小: ${this.batchSize}`);
    console.log(`批次数: ${batches.length}`);
    console.log('─'.repeat(50));
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`\n批次 ${i + 1}/${batches.length} (${batch.length} 个文件)`);
      
      const batchResults = await Promise.all(
        batch.map(file => processor(file))
      );
      
      results.push(...batchResults);
      
      // 显示进度
      const progress = Math.round(((i + 1) / batches.length) * 100);
      console.log(`进度: ${progress}% (${results.length}/${files.length})`);
      
      // 批次间延迟（避免过载）
      if (i < batches.length - 1) {
        await this.delayMs(this.delay);
      }
    }
    
    console.log('\n✅ 批处理完成');
    return results;
  }

  /**
   * 创建批次
   */
  createBatches(items, size) {
    const batches = [];
    for (let i = 0; i < items.length; i += size) {
      batches.push(items.slice(i, i + size));
    }
    return batches;
  }

  /**
   * 延迟函数
   */
  delayMs(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 并行批处理
   */
  async processBatchesParallel(files, processor, concurrency = 3) {
    const batches = this.createBatches(files, this.batchSize);
    const results = [];
    
    console.log(`\n⚡ 并行批处理 ${files.length} 个文件`);
    console.log(`并发数: ${concurrency}`);
    console.log('─'.repeat(50));
    
    for (let i = 0; i < batches.length; i += concurrency) {
      const concurrentBatches = batches.slice(i, i + concurrency);
      
      const batchResults = await Promise.all(
        concurrentBatches.map(batch =>
          Promise.all(batch.map(file => processor(file)))
        )
      );
      
      for (const batchResult of batchResults) {
        results.push(...batchResult);
      }
      
      const progress = Math.round((results.length / files.length) * 100);
      console.log(`进度: ${progress}% (${results.length}/${files.length})`);
    }
    
    console.log('\n✅ 并行批处理完成');
    return results;
  }
}

// 示例 Agent 定义
const exampleAgents = [
  {
    name: 'code-reviewer',
    priority: 'P0',
    execute: async (files) => {
      // 模拟代码审查
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { issues: 3, warnings: 1 };
    },
    args: [['src/**/*.ts']]
  },
  {
    name: 'security-reviewer',
    priority: 'P0',
    execute: async (files) => {
      // 模拟安全审查
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { vulnerabilities: 0 };
    },
    args: [['src/**/*.ts']]
  },
  {
    name: 'performance-analyzer',
    priority: 'P1',
    execute: async () => {
      // 模拟性能分析
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { score: 85 };
    }
  }
];

// CLI 接口
async function main() {
  const executor = new ParallelExecutor({ maxConcurrency: 3 });
  
  console.log('🧪 Agent 并行执行测试');
  console.log('\n测试场景: 代码审查 + 安全审查 + 性能分析');
  
  // 并行执行
  const parallelResult = await executor.executeAgents(exampleAgents);
  
  console.log('\n' + '='.repeat(50));
  console.log('对比测试: 串行执行');
  console.log('='.repeat(50));
  
  // 串行执行（对比）
  const serialResult = await executor.executeAgentsSerially(exampleAgents);
  
  // 计算提升
  const speedup = (serialResult.duration / parallelResult.duration).toFixed(2);
  console.log('\n' + '='.repeat(50));
  console.log(`📊 性能提升: ${speedup}x`);
  console.log(`时间节省: ${serialResult.duration - parallelResult.duration}ms`);
  console.log('='.repeat(50));
  
  executor.cleanup();
}

module.exports = { ParallelExecutor, BatchProcessor };

if (require.main === module) {
  main().catch(console.error);
}
