#!/usr/bin/env node
/**
 * HBE 智能文件缓存系统
 * 基于文件 hash 的增量更新机制
 */

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

const CACHE_DIR = path.join(os.homedir(), '.hbe', 'cache');
const CACHE_INDEX = path.join(CACHE_DIR, 'index.json');

class FileCache {
  constructor() {
    this.cache = new Map();
    this.index = new Map(); // path -> { hash, size, mtime }
  }

  async init() {
    try {
      await fs.mkdir(CACHE_DIR, { recursive: true });
      await this.loadIndex();
    } catch (error) {
      console.error('初始化缓存失败:', error.message);
    }
  }

  async loadIndex() {
    try {
      const content = await fs.readFile(CACHE_INDEX, 'utf8');
      const data = JSON.parse(content);
      
      for (const [filePath, info] of Object.entries(data)) {
        this.index.set(filePath, info);
      }
    } catch (error) {
      // 索引不存在，创建新的
      this.index = new Map();
    }
  }

  async saveIndex() {
    try {
      const data = Object.fromEntries(this.index);
      await fs.writeFile(CACHE_INDEX, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('保存缓存索引失败:', error.message);
    }
  }

  /**
   * 计算文件 hash (MD5)
   */
  async hashFile(filePath) {
    try {
      const content = await fs.readFile(filePath);
      return crypto.createHash('md5').update(content).digest('hex');
    } catch (error) {
      return null;
    }
  }

  /**
   * 检查文件是否已更改
   */
  async hasChanged(filePath) {
    const stats = await fs.stat(filePath).catch(() => null);
    if (!stats) return true;
    
    const cached = this.index.get(filePath);
    if (!cached) return true;
    
    // 快速检查：大小和修改时间
    if (cached.size !== stats.size || cached.mtime !== stats.mtimeMs) {
      return true;
    }
    
    return false;
  }

  /**
   * 获取文件内容（带缓存）
   */
  async getFile(filePath) {
    if (await this.hasChanged(filePath)) {
      // 文件已更改，重新加载
      const content = await fs.readFile(filePath, 'utf8');
      const stats = await fs.stat(filePath);
      const hash = crypto.createHash('md5').update(content).digest('hex');
      
      // 更新索引
      this.index.set(filePath, {
        hash,
        size: stats.size,
        mtime: stats.mtimeMs
      });
      
      // 缓存内容
      this.cache.set(filePath, content);
      
      await this.saveIndex();
      
      return { content, changed: true };
    }
    
    // 使用缓存
    const content = this.cache.get(filePath) || await fs.readFile(filePath, 'utf8');
    return { content, changed: false };
  }

  /**
   * 批量获取文件（只返回变更的）
   */
  async getFiles(filePaths) {
    const results = {
      changed: [],
      unchanged: [],
      all: {}
    };
    
    for (const filePath of filePaths) {
      const { content, changed } = await this.getFile(filePath);
      results.all[filePath] = content;
      
      if (changed) {
        results.changed.push(filePath);
      } else {
        results.unchanged.push(filePath);
      }
    }
    
    return results;
  }

  /**
   * 获取文件 diff
   */
  async getDiff(filePath, oldContent) {
    const { content, changed } = await this.getFile(filePath);
    
    if (!changed) {
      return null; // 文件未更改
    }
    
    // 简单的行级 diff
    const oldLines = oldContent.split('\n');
    const newLines = content.split('\n');
    
    const diff = {
      added: [],
      removed: [],
      modified: []
    };
    
    const maxLines = Math.max(oldLines.length, newLines.length);
    
    for (let i = 0; i < maxLines; i++) {
      const oldLine = oldLines[i];
      const newLine = newLines[i];
      
      if (oldLine === undefined) {
        diff.added.push({ line: i + 1, content: newLine });
      } else if (newLine === undefined) {
        diff.removed.push({ line: i + 1, content: oldLine });
      } else if (oldLine !== newLine) {
        diff.modified.push({ line: i + 1, old: oldLine, new: newLine });
      }
    }
    
    return diff;
  }

  /**
   * 清理缓存
   */
  async clear() {
    this.cache.clear();
    this.index.clear();
    await this.saveIndex();
  }

  /**
   * 获取缓存统计
   */
  async getStats() {
    const cachedFiles = this.index.size;
    const totalSize = Array.from(this.index.values())
      .reduce((sum, info) => sum + (info.size || 0), 0);
    
    return {
      cachedFiles,
      totalSize,
      avgSize: cachedFiles > 0 ? Math.round(totalSize / cachedFiles) : 0
    };
  }

  /**
   * 清理过期缓存（超过 7 天未访问）
   */
  async cleanup() {
    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    
    for (const [filePath, info] of this.index.entries()) {
      if (now - info.mtime > weekMs) {
        this.index.delete(filePath);
        this.cache.delete(filePath);
      }
    }
    
    await this.saveIndex();
  }
}

// 单例
const cache = new FileCache();

// 自动初始化
cache.init().catch(console.error);

module.exports = cache;

// CLI 接口
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'stats';
  
  switch (command) {
    case 'stats':
      const stats = await cache.getStats();
      console.log('\n📊 文件缓存统计');
      console.log('─'.repeat(30));
      console.log(`缓存文件数: ${stats.cachedFiles}`);
      console.log(`总大小: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`平均大小: ${stats.avgSize} bytes`);
      break;
      
    case 'clear':
      await cache.clear();
      console.log('✓ 缓存已清空');
      break;
      
    case 'cleanup':
      await cache.cleanup();
      console.log('✓ 过期缓存已清理');
      break;
      
    case 'check':
      const filePath = args[1];
      if (!filePath) {
        console.error('请指定文件路径');
        process.exit(1);
      }
      
      const changed = await cache.hasChanged(filePath);
      console.log(`${filePath}: ${changed ? '已更改' : '未更改'}`);
      break;
      
    default:
      console.log(`用法: file-cache.js [stats|clear|cleanup|check <file>]`);
  }
}

if (require.main === module) {
  main().catch(console.error);
}
