#!/usr/bin/env node
/**
 * HBE 三级缓存系统
 * L1: 内存缓存 (热点数据)
 * L2: 文件缓存 (项目级)
 * L3: 持久缓存 (全局)
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const crypto = require('crypto');

/**
 * L1: 内存缓存
 */
class MemoryL1Cache {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 10 * 1024 * 1024; // 10MB
    this.maxItems = options.maxItems || 100;
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0
    };
  }

  set(key, value) {
    const size = this.estimateSize(value);
    
    // 检查是否需要腾出空间
    while (this.cache.size >= this.maxItems || this.getCurrentSize() + size > this.maxSize) {
      this.evictLRU();
    }
    
    this.cache.set(key, {
      value,
      size,
      timestamp: Date.now(),
      accessCount: 1
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (item) {
      item.timestamp = Date.now();
      item.accessCount++;
      this.stats.hits++;
      return item.value;
    }
    this.stats.misses++;
    return null;
  }

  has(key) {
    return this.cache.has(key);
  }

  delete(key) {
    return this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, evictions: 0 };
  }

  evictLRU() {
    let oldestKey = null;
    let oldestTime = Infinity;
    
    for (const [key, item] of this.cache) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
    }
  }

  getCurrentSize() {
    let size = 0;
    for (const item of this.cache.values()) {
      size += item.size;
    }
    return size;
  }

  estimateSize(value) {
    if (typeof value === 'string') {
      return value.length * 2; // UTF-16
    } else if (typeof value === 'object') {
      return JSON.stringify(value).length * 2;
    }
    return 100;
  }

  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
      : 0;
    
    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      size: this.cache.size,
      totalSize: this.getCurrentSize(),
      totalSizeMB: (this.getCurrentSize() / 1024 / 1024).toFixed(2)
    };
  }
}

/**
 * L2: 文件缓存（项目级）
 */
class FileL2Cache {
  constructor(options = {}) {
    this.cacheDir = options.cacheDir || path.join(process.cwd(), '.hbe-cache');
    this.maxSize = options.maxSize || 100 * 1024 * 1024; // 100MB
    this.ttl = options.ttl || 7 * 24 * 60 * 60 * 1000; // 7天
    this.stats = {
      hits: 0,
      misses: 0,
      errors: 0
    };
  }

  async init() {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (error) {
      console.error('初始化 L2 缓存失败:', error.message);
    }
  }

  getCachePath(key) {
    const hash = crypto.createHash('md5').update(key).digest('hex');
    return path.join(this.cacheDir, `${hash}.cache`);
  }

  async get(key) {
    try {
      const cachePath = this.getCachePath(key);
      
      // 检查文件是否存在
      const exists = await fs.access(cachePath).then(() => true).catch(() => false);
      if (!exists) {
        this.stats.misses++;
        return null;
      }
      
      // 读取缓存
      const content = await fs.readFile(cachePath, 'utf8');
      const cached = JSON.parse(content);
      
      // 检查是否过期
      if (Date.now() - cached.timestamp > this.ttl) {
        await fs.unlink(cachePath);
        this.stats.misses++;
        return null;
      }
      
      this.stats.hits++;
      return cached.data;
    } catch (error) {
      this.stats.errors++;
      return null;
    }
  }

  async set(key, value) {
    try {
      const cachePath = this.getCachePath(key);
      const cached = {
        data: value,
        timestamp: Date.now(),
        size: JSON.stringify(value).length
      };
      
      await fs.writeFile(cachePath, JSON.stringify(cached));
    } catch (error) {
      this.stats.errors++;
      console.error('L2 缓存写入失败:', error.message);
    }
  }

  async has(key) {
    const value = await this.get(key);
    return value !== null;
  }

  async delete(key) {
    try {
      const cachePath = this.getCachePath(key);
      await fs.unlink(cachePath);
    } catch (error) {
      // 忽略不存在的文件
    }
  }

  async clear() {
    try {
      const files = await fs.readdir(this.cacheDir);
      await Promise.all(
        files.map(file => fs.unlink(path.join(this.cacheDir, file)))
      );
      this.stats = { hits: 0, misses: 0, errors: 0 };
    } catch (error) {
      console.error('L2 缓存清空失败:', error.message);
    }
  }

  async getStats() {
    try {
      const files = await fs.readdir(this.cacheDir);
      let totalSize = 0;
      
      for (const file of files) {
        const filePath = path.join(this.cacheDir, file);
        const stats = await fs.stat(filePath);
        totalSize += stats.size;
      }
      
      const hitRate = this.stats.hits + this.stats.misses > 0
        ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
        : 0;
      
      return {
        ...this.stats,
        hitRate: `${hitRate}%`,
        files: files.length,
        totalSize,
        totalSizeMB: (totalSize / 1024 / 1024).toFixed(2)
      };
    } catch (error) {
      return this.stats;
    }
  }
}

/**
 * L3: 持久缓存（全局）
 */
class PersistentL3Cache {
  constructor(options = {}) {
    this.cacheDir = options.cacheDir || path.join(os.homedir(), '.hbe', 'persistent-cache');
    this.maxSize = options.maxSize || 500 * 1024 * 1024; // 500MB
    this.ttl = options.ttl || 30 * 24 * 60 * 60 * 1000; // 30天
    this.stats = {
      hits: 0,
      misses: 0,
      errors: 0
    };
  }

  async init() {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
      await this.loadIndex();
    } catch (error) {
      console.error('初始化 L3 缓存失败:', error.message);
    }
  }

  async loadIndex() {
    const indexPath = path.join(this.cacheDir, 'index.json');
    try {
      const content = await fs.readFile(indexPath, 'utf8');
      this.index = JSON.parse(content);
    } catch (error) {
      this.index = {};
    }
  }

  async saveIndex() {
    const indexPath = path.join(this.cacheDir, 'index.json');
    try {
      await fs.writeFile(indexPath, JSON.stringify(this.index, null, 2));
    } catch (error) {
      console.error('保存 L3 索引失败:', error.message);
    }
  }

  getCachePath(key) {
    const hash = crypto.createHash('md5').update(key).digest('hex');
    const subdir = hash.substring(0, 2);
    const filename = hash.substring(2);
    return path.join(this.cacheDir, subdir, `${filename}.cache`);
  }

  async get(key) {
    try {
      const cached = this.index[key];
      if (!cached) {
        this.stats.misses++;
        return null;
      }
      
      // 检查是否过期
      if (Date.now() - cached.timestamp > this.ttl) {
        await this.delete(key);
        this.stats.misses++;
        return null;
      }
      
      const cachePath = this.getCachePath(key);
      const content = await fs.readFile(cachePath, 'utf8');
      const data = JSON.parse(content);
      
      this.stats.hits++;
      return data;
    } catch (error) {
      this.stats.errors++;
      return null;
    }
  }

  async set(key, value) {
    try {
      const cachePath = this.getCachePath(key);
      const subdir = path.dirname(cachePath);
      
      await fs.mkdir(subdir, { recursive: true });
      
      const data = JSON.stringify(value);
      await fs.writeFile(cachePath, data);
      
      // 更新索引
      this.index[key] = {
        timestamp: Date.now(),
        size: data.length,
        path: cachePath
      };
      
      await this.saveIndex();
    } catch (error) {
      this.stats.errors++;
      console.error('L3 缓存写入失败:', error.message);
    }
  }

  async has(key) {
    return key in this.index && Date.now() - this.index[key].timestamp <= this.ttl;
  }

  async delete(key) {
    try {
      const cached = this.index[key];
      if (cached) {
        await fs.unlink(cached.path);
        delete this.index[key];
        await this.saveIndex();
      }
    } catch (error) {
      // 忽略
    }
  }

  async clear() {
    try {
      // 清空所有缓存文件
      for (const key in this.index) {
        await this.delete(key);
      }
      this.stats = { hits: 0, misses: 0, errors: 0 };
    } catch (error) {
      console.error('L3 缓存清空失败:', error.message);
    }
  }

  async getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
      : 0;
    
    let totalSize = 0;
    for (const cached of Object.values(this.index)) {
      totalSize += cached.size || 0;
    }
    
    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      keys: Object.keys(this.index).length,
      totalSize,
      totalSizeMB: (totalSize / 1024 / 1024).toFixed(2)
    };
  }
}

/**
 * 三级缓存管理器
 */
class MultiLevelCache {
  constructor(options = {}) {
    this.l1 = new MemoryL1Cache(options.l1);
    this.l2 = new FileL2Cache(options.l2);
    this.l3 = new PersistentL3Cache(options.l3);
    this.stats = {
      l1: 0,
      l2: 0,
      l3: 0,
      total: 0
    };
  }

  async init() {
    await this.l2.init();
    await this.l3.init();
  }

  async get(key) {
    this.stats.total++;
    
    // L1: 内存缓存
    let value = this.l1.get(key);
    if (value !== null) {
      this.stats.l1++;
      return { value, level: 1 };
    }
    
    // L2: 文件缓存
    value = await this.l2.get(key);
    if (value !== null) {
      this.stats.l2++;
      // 回填 L1
      this.l1.set(key, value);
      return { value, level: 2 };
    }
    
    // L3: 持久缓存
    value = await this.l3.get(key);
    if (value !== null) {
      this.stats.l3++;
      // 回填 L1 和 L2
      this.l1.set(key, value);
      await this.l2.set(key, value);
      return { value, level: 3 };
    }
    
    return { value: null, level: 0 };
  }

  async set(key, value) {
    // 写入所有级别
    this.l1.set(key, value);
    await this.l2.set(key, value);
    await this.l3.set(key, value);
  }

  async has(key) {
    return (await this.get(key)).value !== null;
  }

  async delete(key) {
    this.l1.delete(key);
    await this.l2.delete(key);
    await this.l3.delete(key);
  }

  async clear() {
    this.l1.clear();
    await this.l2.clear();
    await this.l3.clear();
  }

  getStats() {
    const total = this.stats.l1 + this.stats.l2 + this.stats.l3 + this.stats.total;
    
    return {
      l1: {
        ...this.l1.getStats(),
        hitRate: `${(this.stats.l1 / this.stats.total * 100).toFixed(2)}%`
      },
      l2: {
        ...this.l2.getStats(),
        hitRate: `${(this.stats.l2 / this.stats.total * 100).toFixed(2)}%`
      },
      l3: {
        ...this.l3.getStats(),
        hitRate: `${(this.stats.l3 / this.stats.total * 100).toFixed(2)}%`
      },
      overall: {
        total: this.stats.total,
        l1: this.stats.l1,
        l2: this.stats.l2,
        l3: this.stats.l3,
        misses: this.stats.total - this.stats.l1 - this.stats.l2 - this.stats.l3,
        hitRate: `${((this.stats.l1 + this.stats.l2 + this.stats.l3) / this.stats.total * 100).toFixed(2)}%`
      }
    };
  }

  displayStats() {
    const stats = this.getStats();
    
    console.log('\n📊 三级缓存统计');
    console.log('═'.repeat(60));
    
    console.log('\nL1 (内存缓存):');
    console.log(`  命中率: ${stats.l1.hitRate}`);
    console.log(`  大小: ${stats.l1.totalSizeMB} MB (${stats.l1.size} 项)`);
    
    console.log('\nL2 (文件缓存):');
    console.log(`  命中率: ${stats.l2.hitRate}`);
    console.log(`  大小: ${stats.l2.totalSizeMB} MB (${stats.l2.files} 文件)`);
    
    console.log('\nL3 (持久缓存):');
    console.log(`  命中率: ${stats.l3.hitRate}`);
    console.log(`  大小: ${stats.l3.totalSizeMB} MB (${stats.l3.keys} 键)`);
    
    console.log('\n总体:');
    console.log(`  命中率: ${stats.overall.hitRate}`);
    console.log(`  L1: ${stats.overall.l1} 次`);
    console.log(`  L2: ${stats.overall.l2} 次`);
    console.log(`  L3: ${stats.overall.l3} 次`);
    console.log(`  未命中: ${stats.overall.misses} 次`);
    
    console.log('═'.repeat(60));
  }
}

// CLI 接口
async function main() {
  const cache = new MultiLevelCache();
  await cache.init();
  
  console.log('🧪 三级缓存测试');
  console.log('═'.repeat(60));
  
  // 测试写入
  console.log('\n1. 写入测试数据...');
  await cache.set('test:1', { message: 'Hello from HBE', timestamp: Date.now() });
  await cache.set('test:2', { message: 'Cache test', data: [1, 2, 3] });
  await cache.set('test:3', { message: 'Performance test', value: 42 });
  
  // 测试读取
  console.log('\n2. 读取测试数据...');
  const result1 = await cache.get('test:1');
  console.log(`   test:1 -> L${result1.level} 缓存`);
  
  const result2 = await cache.get('test:2');
  console.log(`   test:2 -> L${result2.level} 缓存`);
  
  const result3 = await cache.get('test:3');
  console.log(`   test:3 -> L${result3.level} 缓存`);
  
  // 再次读取（应该命中 L1）
  console.log('\n3. 再次读取（应命中 L1）...');
  const result4 = await cache.get('test:1');
  console.log(`   test:1 -> L${result4.level} 缓存`);
  
  // 显示统计
  console.log('\n4. 缓存统计:');
  cache.displayStats();
}

module.exports = { MultiLevelCache, MemoryL1Cache, FileL2Cache, PersistentL3Cache };

if (require.main === module) {
  main().catch(console.error);
}
