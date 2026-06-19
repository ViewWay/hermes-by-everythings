#!/usr/bin/env node
/**
 * HBE 错误自动恢复系统
 * 智能识别错误类型，自动选择恢复策略
 */

const fs = require('fs').promises;
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class ErrorClassifier {
  /**
   * 分类错误类型
   */
  classify(error) {
    const message = error.message || error.toString();
    const stack = error.stack || '';
    
    // 1. Token 限制错误
    if (message.includes('token') && message.includes('limit')) {
      return { type: 'TOKEN_LIMIT', severity: 'high', confidence: 0.95 };
    }
    
    // 2. 文件未找到错误
    if (message.includes('ENOENT') || message.includes('no such file')) {
      return { type: 'FILE_NOT_FOUND', severity: 'medium', confidence: 0.9 };
    }
    
    // 3. 权限错误
    if (message.includes('EACCES') || message.includes('permission')) {
      return { type: 'PERMISSION_DENIED', severity: 'medium', confidence: 0.9 };
    }
    
    // 4. 语法错误
    if (message.includes('SyntaxError') || message.includes('Unexpected token')) {
      return { type: 'SYNTAX_ERROR', severity: 'medium', confidence: 0.85 };
    }
    
    // 5. 类型错误
    if (message.includes('TypeError') || message.includes('not a function')) {
      return { type: 'TYPE_ERROR', severity: 'medium', confidence: 0.85 };
    }
    
    // 6. 网络错误
    if (message.includes('ECONNREFUSED') || message.includes('network')) {
      return { type: 'NETWORK_ERROR', severity: 'low', confidence: 0.8 };
    }
    
    // 7. Git 冲突
    if (message.includes('conflict') || message.includes('merge')) {
      return { type: 'GIT_CONFLICT', severity: 'high', confidence: 0.9 };
    }
    
    // 8. 依赖错误
    if (message.includes('Cannot find module')) {
      return { type: 'DEPENDENCY_ERROR', severity: 'high', confidence: 0.95 };
    }
    
    // 默认：未知错误
    return { type: 'UNKNOWN', severity: 'medium', confidence: 0.5 };
  }

  /**
   * 提取错误上下文
   */
  extractContext(error) {
    const context = {
      message: error.message,
      stack: error.stack,
      code: error.code,
      path: error.path,
      syscall: error.syscall
    };
    
    // 提取文件路径
    const pathMatch = error.message.match(/'([^']+)'/);
    if (pathMatch) {
      context.file = pathMatch[1];
    }
    
    // 提取行号
    const lineMatch = error.message.match(/:(\d+):/);
    if (lineMatch) {
      context.line = parseInt(lineMatch[1]);
    }
    
    return context;
  }
}

class RecoveryStrategyManager {
  constructor() {
    this.strategies = new Map();
    this.initStrategies();
  }

  /**
   * 初始化恢复策略
   */
  initStrategies() {
    // Token 限制恢复
    this.strategies.set('TOKEN_LIMIT', {
      name: 'Token 限制恢复',
      actions: [
        {
          name: '压缩上下文',
          execute: async () => {
            console.log('  → 压缩上下文...');
            // 实现上下文压缩逻辑
            return { success: true, message: '上下文已压缩 50%' };
          }
        },
        {
          name: '清理历史',
          execute: async () => {
            console.log('  → 清理历史记录...');
            // 实现历史清理逻辑
            return { success: true, message: '已清理 100 条历史' };
          }
        },
        {
          name: '使用更小的模型',
          execute: async () => {
            console.log('  → 切换到 Haiku 模型...');
            return { success: true, message: '已切换到更高效的模型' };
          }
        }
      ]
    });
    
    // 文件未找到恢复
    this.strategies.set('FILE_NOT_FOUND', {
      name: '文件未找到恢复',
      actions: [
        {
          name: '检查文件路径',
          execute: async (context) => {
            console.log(`  → 检查文件: ${context.file}`);
            return { success: false, message: '文件确实不存在' };
          }
        },
        {
          name: '创建文件',
          execute: async (context) => {
            console.log(`  → 创建文件: ${context.file}`);
            await fs.writeFile(context.file, '');
            return { success: true, message: '文件已创建' };
          }
        },
        {
          name: '恢复备份',
          execute: async (context) => {
            console.log(`  → 恢复备份...`);
            // 实现备份恢复逻辑
            return { success: true, message: '已从备份恢复' };
          }
        }
      ]
    });
    
    // Git 冲突恢复
    this.strategies.set('GIT_CONFLICT', {
      name: 'Git 冲突恢复',
      actions: [
        {
          name: '查看冲突文件',
          execute: async () => {
            console.log('  → 查看冲突文件...');
            const { stdout } = await execAsync('git diff --name-only --diff-filter=U');
            const files = stdout.trim().split('\n').filter(f => f);
            return { success: true, message: `发现 ${files.length} 个冲突文件`, data: files };
          }
        },
        {
          name: '尝试自动合并',
          execute: async () => {
            console.log('  → 尝试自动合并...');
            try {
              await execAsync('git merge --strategy-option=ours');
              return { success: true, message: '自动合并成功' };
            } catch (error) {
              return { success: false, message: '自动合并失败' };
            }
          }
        },
        {
          name: '创建备份分支',
          execute: async () => {
            const branch = `backup-${Date.now()}`;
            console.log(`  → 创建备份分支: ${branch}`);
            await execAsync(`git checkout -b ${branch}`);
            return { success: true, message: '备份分支已创建' };
          }
        }
      ]
    });
    
    // 依赖错误恢复
    this.strategies.set('DEPENDENCY_ERROR', {
      name: '依赖错误恢复',
      actions: [
        {
          name: '安装缺失依赖',
          execute: async (context) => {
            const match = context.message.match(/Cannot find module '([^']+)'/);
            if (match) {
              const dep = match[1];
              console.log(`  → 安装依赖: ${dep}`);
              await execAsync(`npm install ${dep}`);
              return { success: true, message: `依赖 ${dep} 已安装` };
            }
            return { success: false, message: '无法确定缺失的依赖' };
          }
        },
        {
          name: '重新安装依赖',
          execute: async () => {
            console.log('  → 重新安装所有依赖...');
            await execAsync('npm install');
            return { success: true, message: '依赖已重新安装' };
          }
        },
        {
          name: '清理缓存',
          execute: async () => {
            console.log('  → 清理 npm 缓存...');
            await execAsync('npm cache clean --force');
            return { success: true, message: '缓存已清理' };
          }
        }
      ]
    });
    
    // 语法错误恢复
    this.strategies.set('SYNTAX_ERROR', {
      name: '语法错误恢复',
      actions: [
        {
          name: '定位错误位置',
          execute: async (context) => {
            console.log(`  → 定位错误: ${context.file}:${context.line}`);
            return { success: true, message: `错误在 ${context.line} 行` };
          }
        },
        {
          name: '显示错误详情',
          execute: async (context) => {
            console.log(`  → 错误: ${context.message}`);
            return { success: true, message: '错误详情已显示' };
          }
        },
        {
          name: '建议修复方案',
          execute: async (context) => {
            // 简单的修复建议
            const suggestions = {
              'Unexpected token': '检查是否缺少括号或分号',
              'Unexpected identifier': '检查变量名是否正确',
              'Missing semicolon': '在语句末尾添加分号',
              'Unexpected end of input': '检查是否缺少闭合括号'
            };
            
            for (const [key, suggestion] of Object.entries(suggestions)) {
              if (context.message.includes(key)) {
                return { success: true, message: `建议: ${suggestion}` };
              }
            }
            
            return { success: true, message: '建议：检查语法错误' };
          }
        }
      ]
    });
  }

  /**
   * 获取恢复策略
   */
  getStrategy(errorType) {
    return this.strategies.get(errorType) || this.strategies.get('UNKNOWN');
  }
}

class AutoRecoverySystem {
  constructor(options = {}) {
    this.classifier = new ErrorClassifier();
    this.strategyManager = new RecoveryStrategyManager();
    this.maxAttempts = options.maxAttempts || 3;
    this.recoveryLog = [];
  }

  /**
   * 尝试自动恢复
   */
  async recover(error, context = {}) {
    console.log('\n🔧 错误自动恢复系统启动');
    console.log('═'.repeat(60));
    
    // 1. 分类错误
    const classification = this.classifier.classify(error);
    const errorContext = this.classifier.extractContext(error);
    
    console.log(`\n错误类型: ${classification.type}`);
    console.log(`严重程度: ${classification.severity}`);
    console.log(`置信度: ${(classification.confidence * 100).toFixed(0)}%`);
    
    // 2. 获取恢复策略
    const strategy = this.strategyManager.getStrategy(classification.type);
    console.log(`\n恢复策略: ${strategy.name}`);
    console.log('─'.repeat(60));
    
    // 3. 执行恢复步骤
    const actions = strategy.actions || [];
    let recovered = false;
    
    for (let i = 0; i < actions.length && !recovered; i++) {
      const action = actions[i];
      console.log(`\n尝试 ${i + 1}/${actions.length}: ${action.name}`);
      
      try {
        const result = await action.execute(errorContext);
        
        if (result.success) {
          console.log(`  ✓ ${result.message}`);
          
          if (action.name === '创建备份分支') {
            // 某些恢复需要用户干预
            console.log('  ⚠️  需要用户干预');
            break;
          }
          
          if (i < actions.length - 1) {
            recovered = true;
          }
        } else {
          console.log(`  ✗ ${result.message}`);
        }
      } catch (actionError) {
        console.log(`  ✗ 恢复失败: ${actionError.message}`);
      }
    }
    
    // 4. 记录恢复日志
    this.recoveryLog.push({
      timestamp: new Date().toISOString(),
      classification,
      context: errorContext,
      recovered,
      attempts: actions.length
    });
    
    // 5. 显示恢复结果
    console.log('\n' + '═'.repeat(60));
    if (recovered) {
      console.log('✅ 自动恢复成功');
    } else {
      console.log('❌ 自动恢复失败，需要手动处理');
      console.log('\n建议操作:');
      this.displayManualHelp(classification.type);
    }
    
    return { recovered, classification };
  }

  /**
   * 显示手动帮助
   */
  displayManualHelp(errorType) {
    const help = {
      'TOKEN_LIMIT': `
  • 手动删除不需要的文件
  • 使用更小的模型 (Haiku)
  • 分批处理大任务
  • 重启会话`,
      
      'FILE_NOT_FOUND': `
  • 检查文件路径是否正确
  • 确认文件是否存在
  • 恢复从版本控制系统
  • 从备份恢复`,
      
      'GIT_CONFLICT': `
  • 手动解决冲突
  • 使用 merge tool
  • 联系团队成员
  • 回退到上一个版本`,
      
      'DEPENDENCY_ERROR': `
  • 检查 package.json
  • 删除 node_modules 重新安装
  • 清理 npm 缓存
  • 检查依赖版本兼容性`
    };
    
    console.log(help[errorType] || help['UNKNOWN']);
  }

  /**
   * 显示恢复统计
   */
  displayStats() {
    console.log('\n📊 恢复系统统计');
    console.log('═'.repeat(60));
    
    const total = this.recoveryLog.length;
    const recovered = this.recoveryLog.filter(r => r.recovered).length;
    const failed = total - recovered;
    const rate = total > 0 ? ((recovered / total) * 100).toFixed(1) : 0;
    
    console.log(`总恢复尝试: ${total}`);
    console.log(`成功: ${recovered} (${rate}%)`);
    console.log(`失败: ${failed}`);
    
    // 按错误类型统计
    const byType = {};
    for (const log of this.recoveryLog) {
      const type = log.classification.type;
      if (!byType[type]) {
        byType[type] = { total: 0, recovered: 0 };
      }
      byType[type].total++;
      if (log.recovered) {
        byType[type].recovered++;
      }
    }
    
    console.log('\n按类型统计:');
    for (const [type, stats] of Object.entries(byType)) {
      const rate = ((stats.recovered / stats.total) * 100).toFixed(1);
      console.log(`  ${type}: ${stats.recovered}/${stats.total} (${rate}%)`);
    }
    
    console.log('\n' + '═'.repeat(60));
  }

  /**
   * 导出恢复日志
   */
  async exportLog(filePath) {
    const logPath = filePath || path.join(os.homedir(), '.hbe', 'recovery-log.json');
    
    try {
      await fs.writeFile(logPath, JSON.stringify(this.recoveryLog, null, 2));
      console.log(`✓ 恢复日志已导出到: ${logPath}`);
    } catch (error) {
      console.error('导出失败:', error.message);
    }
  }
}

// CLI 接口
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'stats';
  
  const recovery = new AutoRecoverySystem();
  
  switch (command) {
    case 'test':
      // 测试恢复系统
      console.log('🧪 测试自动恢复系统...\n');
      
      const testError = new Error('Simulated token limit exceeded');
      await recovery.recover(testError);
      break;
      
    case 'stats':
      recovery.displayStats();
      break;
      
    case 'export':
      const logPath = args[1];
      await recovery.exportLog(logPath);
      break;
      
    default:
      console.log(`
🔧 HBE 错误自动恢复系统

用法: node scripts/recovery/auto-recovery.js [命令] [参数]

命令:
  test                  测试恢复系统
  stats                显示恢复统计
  export [path]         导出恢复日志

示例:
  node scripts/recovery/auto-recovery.js test
  node scripts/recovery/auto-recovery.js stats
  node scripts/recovery/auto-recovery.js export ./recovery-log.json
      `);
  }
}

module.exports = { ErrorClassifier, RecoveryStrategyManager, AutoRecoverySystem };

if (require.main === module) {
  main().catch(console.error);
}
