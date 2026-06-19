#!/usr/bin/env node
/**
 * HBE Progress Visualization Tool
 * 显示美观的进度条和统计信息
 */

class ProgressBar {
  constructor(options = {}) {
    this.total = options.total || 100;
    this.current = options.current || 0;
    this.width = options.width || 40;
    this.completeChar = options.completeChar || '█';
    this.incompleteChar = options.incompleteChar || '░';
    this.startTime = Date.now();
  }

  update(current, currentItem = '') {
    this.current = current;
    const percent = Math.round((current / this.total) * 100);
    const filled = Math.round((percent / 100) * this.width);
    const empty = this.width - filled;
    
    const bar = this.completeChar.repeat(filled) + this.incompleteChar.repeat(empty);
    
    // 计算速度和剩余时间
    const elapsed = (Date.now() - this.startTime) / 1000;
    const rate = current / elapsed;
    const remaining = (this.total - current) / rate;
    
    let output = `\r[${bar}] ${percent}% (${current}/${this.total})`;
    
    if (currentItem) {
      output += `\n当前: ${currentItem}`;
    }
    
    if (rate > 0) {
      output += `\n速度: ${rate.toFixed(2)} items/s`;
      output += `\n剩余: ~${remaining.toFixed(1)}s`;
    }
    
    process.stdout.write(output);
    
    if (current >= this.total) {
      process.stdout.write('\n');
    }
  }

  complete(item = '') {
    this.update(this.total, item);
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(2);
    console.log(`✓ 完成! 用时: ${elapsed}s`);
  }
}

class StepProgress {
  constructor(steps) {
    this.steps = steps;
    this.current = 0;
    this.startTime = Date.now();
  }

  next(stepName = '') {
    if (stepName) {
      this.steps[this.current] = stepName;
    }
    this.current++;
    
    const percent = Math.round((this.current / this.steps.length) * 100);
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
    
    console.log(`[${this.current}/${this.steps.length}] ${this.steps[this.current - 1]} (${percent}%)`);
    console.log(`  累计用时: ${elapsed}s`);
  }

  complete() {
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(2);
    console.log(`\n✓ 所有步骤完成! 总用时: ${elapsed}s`);
  }
}

// 批处理进度
class BatchProgress {
  constructor(batches) {
    this.batches = batches;
    this.currentBatch = 0;
    this.currentItem = 0;
    this.totalItems = batches.reduce((sum, b) => sum + b.length, 0);
    this.completedItems = 0;
    this.startTime = Date.now();
  }

  update(item) {
    this.completedItems++;
    const percent = Math.round((this.completedItems / this.totalItems) * 100);
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
    const rate = (this.completedItems / elapsed).toFixed(2);
    
    console.log(`[${percent}%] ${item} (${this.completedItems}/${this.totalItems}) - ${rate} items/s`);
  }

  complete() {
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(2);
    console.log(`\n✓ 批处理完成! 处理 ${this.totalItems} 项，用时 ${elapsed}s`);
  }
}

// 导出
module.exports = { ProgressBar, StepProgress, BatchProgress };

// CLI 使用
if (require.main === module) {
  const args = process.argv.slice(2);
  const total = parseInt(args[0]) || 10;
  
  const bar = new ProgressBar({ total });
  
  console.log('进度条示例:');
  
  let current = 0;
  const interval = setInterval(() => {
    current++;
    bar.update(current, `处理项目 ${current}`);
    
    if (current >= total) {
      clearInterval(interval);
      bar.complete();
    }
  }, 500);
}
