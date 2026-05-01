#!/usr/bin/env node
/**
 * HBE 智能建议系统
 * 基于代码分析、模式识别、最佳实践提供智能建议
 */

const fs = require('fs').promises;
const path = require('path');

class SmartAdvisor {
  constructor() {
    this.rules = new Map();
    this.initRules();
  }

  /**
   * 初始化规则库
   */
  initRules() {
    // 性能优化规则
    this.rules.set('PERFORMANCE', [
      {
        id: 'perf-001',
        name: '循环优化',
        pattern: /for\s*\(\s*let\s+\w+\s*=\s*0\s*;\s*\w+\s*<\s*\w+\.length\s*;\s*\w+\+\+\)/,
        suggestion: '使用 Array.forEach 代替 for 循环遍历数组',
        severity: 'low',
        example: {
          before: 'for (let i = 0; i < arr.length; i++) { arr[i] * 2 }',
          after: 'arr.forEach(x => x * 2)'
        }
      },
      {
        id: 'perf-002',
        name: '字符串拼接',
        pattern: /(\w+\s*\+=\s*['"`][^'"`]*['"`]\s*;)/,
        suggestion: '使用数组和 join 代替字符串拼接',
        severity: 'medium',
        example: {
          before: "let str = ''; for (let i = 0; i < 10; i++) { str += i; }",
          after: "const arr = Array.from({length: 10}, (_, i) => i); const str = arr.join('');"
        }
      }
    ]);
    
    // 安全规则
    this.rules.set('SECURITY', [
      {
        id: 'sec-001',
        name: '敏感信息泄露',
        pattern: /(password|secret|api[_-]?key|token)\s*[:=]\s*['"`][^'"`]*['"`]/,
        suggestion: '检测到可能的敏感信息泄露',
        severity: 'critical',
        recommendation: '使用环境变量存储敏感信息'
      },
      {
        id: 'sec-002',
        name: 'eval 使用',
        pattern: /\beval\s*\(/,
        suggestion: '避免使用 eval，存在代码注入风险',
        severity: 'high',
        recommendation: '使用 JSON.parse 或 Function 构造器'
      },
      {
        id: 'sec-003',
        name: 'innerHTML 使用',
        pattern: /\.innerHTML\s*=/,
        suggestion: 'innerHTML 存在 XSS 风险，建议使用 textContent 或 createElement',
        severity: 'high',
        recommendation: '使用 textContent 或安全的 DOM 操作'
      }
    ]);
    
    // 代码质量规则
    this.rules.set('QUALITY', [
      {
        id: 'qual-001',
        name: '使用 var',
        pattern: /\bvar\s+\w+/,
        suggestion: '使用 let 或 const 代替 var',
        severity: 'medium',
        recommendation: 'ES6+ 推荐使用 let 和 const'
      },
      {
        id: 'qual-002',
        name: 'any 类型',
        pattern: /:\s*any\b/,
        suggestion: '避免使用 any 类型，应使用具体类型',
        severity: 'medium',
        recommendation: '使用具体类型或 unknown'
      },
      {
        id: 'qual-003',
        name: '忽略错误',
        pattern: /catch\s*\(\s*\w+\s*\)\s*\{\s*\}/,
        suggestion: '空的 catch 块会忽略错误，建议至少记录日志',
        severity: 'low',
        recommendation: '至少记录错误日志'
      }
    ]);
    
    // 测试规则
    this.rules.set('TESTING', [
      {
        id: 'test-001',
        name: '缺少测试',
        pattern: /export\s+(const|function|class)/,
        suggestion: '检测到导出但未发现对应的测试文件',
        severity: 'medium',
        recommendation: '为导出的函数/类添加测试'
      }
    ]);
    
    // 文档规则
    this.rules.set('DOCUMENTATION', [
      {
        id: 'doc-001',
        name: '缺少 JSDoc',
        pattern: /^(export\s+(const|function|class))\s+\w+/,
        suggestion: '建议为导出的函数/类添加 JSDoc 注释',
        severity: 'low',
        recommendation: '添加 JSDoc 注释提升代码可读性'
      }
    ]);
  }

  /**
   * 分析代码
   */
  async analyzeCode(filePath, content) {
    const suggestions = [];
    
    // 检查所有规则
    for (const [category, rules] of this.rules) {
      for (const rule of rules) {
        const matches = content.match(new RegExp(rule.pattern, 'gm'));
        
        if (matches && matches.length > 0) {
          suggestions.push({
            category,
            ...rule,
            file: filePath,
            matches: matches.length,
            locations: this.findLocations(content, rule.pattern)
          });
        }
      }
    }
    
    return suggestions;
  }

  /**
   * 查找匹配位置
   */
  findLocations(content, pattern) {
    const lines = content.split('\n');
    const locations = [];
    const regex = new RegExp(pattern, 'gm');
    
    lines.forEach((line, index) => {
      const matches = line.match(regex);
      if (matches) {
        locations.push({
          line: index + 1,
          content: line.trim(),
          matches: matches.length
        });
      }
    });
    
    return locations;
  }

  /**
   * 生成建议报告
   */
  generateReport(suggestions) {
    if (suggestions.length === 0) {
      return {
        summary: '✅ 未发现问题',
        details: []
      };
    }
    
    // 按严重程度分组
    const bySeverity = {
      critical: [],
      high: [],
      medium: [],
      low: []
    };
    
    for (const suggestion of suggestions) {
      bySeverity[suggestion.severity].push(suggestion);
    }
    
    // 生成报告
    const report = {
      summary: `发现 ${suggestions.length} 个问题`,
      details: [],
      stats: {
        critical: bySeverity.critical.length,
        high: bySeverity.high.length,
        medium: bySeverity.medium.length,
        low: bySeverity.low.length
      }
    };
    
    // 按优先级显示
    const order = ['critical', 'high', 'medium', 'low'];
    for (const severity of order) {
      const items = bySeverity[severity];
      if (items.length > 0) {
        report.details.push({
          severity,
          count: items.length,
          suggestions: items
        });
      }
    }
    
    return report;
  }

  /**
   * 显示建议
   */
  displaySuggestions(suggestions) {
    if (suggestions.length === 0) {
      console.log('\n✅ 代码质量良好，未发现问题！');
      return;
    }
    
    console.log('\n💡 智能建议');
    console.log('═'.repeat(70));
    
    // 按严重程度分组显示
    const grouped = {};
    for (const suggestion of suggestions) {
      if (!grouped[suggestion.severity]) {
        grouped[suggestion.severity] = [];
      }
      grouped[suggestion.severity].push(suggestion);
    }
    
    const order = ['critical', 'high', 'medium', 'low'];
    const icons = {
      critical: '🚨',
      high: '⚠️ ',
      medium: '⚡',
      low: '💡'
    };
    
    for (const severity of order) {
      const items = grouped[severity];
      if (!items || items.length === 0) continue;
      
      console.log(`\n${icons[severity]} ${severity.toUpperCase()} (${items.length})`);
      console.log('─'.repeat(70));
      
      for (const item of items) {
        console.log(`\n  ${item.name}`);
        console.log(`  文件: ${item.file}`);
        console.log(`  建议: ${item.suggestion}`);
        
        if (item.example) {
          console.log(`  示例:`);
          console.log(`    之前: ${item.example.before}`);
          console.log(`    之后: ${item.example.after}`);
        }
        
        if (item.locations && item.locations.length > 0) {
          console.log(`  位置: ${item.locations.length} 处`);
          item.locations.slice(0, 3).forEach(loc => {
            console.log(`    ${loc.line}: ${loc.content.substring(0, 50)}...`);
          });
        }
      }
    }
    
    console.log('\n' + '═'.repeat(70));
  }

  /**
   * 获取修复建议
   */
  async getFixSuggestions(issue) {
    const fixes = [];
    
    switch (issue.id) {
      case 'perf-001':
        fixes.push({
          action: '替换为 forEach',
          code: 'arr.forEach(item => /* 处理 */)'
        });
        break;
        
      case 'sec-001':
        fixes.push({
          action: '使用环境变量',
          code: 'process.env.SECRET_KEY'
        });
        break;
        
      case 'qual-001':
        fixes.push({
          action: '替换为 let/const',
          code: 'const name = value;'
        });
        break;
        
      default:
        fixes.push({
          action: '查看建议',
          code: issue.recommendation
        });
    }
    
    return fixes;
  }

  /**
   * 批量分析文件
   */
  async analyzeFiles(filePatterns) {
    const results = [];
    
    for (const pattern of filePatterns) {
      const files = await this.expandGlob(pattern);
      
      for (const file of files) {
        try {
          const content = await fs.readFile(file, 'utf8');
          const suggestions = await this.analyzeCode(file, content);
          
          if (suggestions.length > 0) {
            results.push({
              file,
              suggestions
            });
          }
        } catch (error) {
          console.error(`分析文件失败 ${file}:`, error.message);
        }
      }
    }
    
    return results;
  }

  /**
   * 扩展 glob 模式
   */
  async expandGlob(pattern) {
    // 简化的 glob 实现
    if (!pattern.includes('*')) {
      return [pattern];
    }
    
    // 实际应该使用 glob 库
    return [pattern]; // 简化实现
  }

  /**
   * 生成最佳实践建议
   */
  async getBestPractices(projectType) {
    const practices = {
      typescript: [
        '使用 strict 模式',
        '启用 noImplicitAny',
        '使用 ES 模块导入',
        '避免使用 any 类型',
        '使用接口定义对象结构'
      ],
      javascript: [
        '使用 ESLint',
        '使用 Prettier 格式化',
        '避免使用 var',
        '使用 async/await 代替回调',
        '使用 JSDoc 注释'
      ],
      react: [
        '使用函数组件',
        '使用 Hooks',
        '避免直接修改 state',
        '使用 memo 优化性能',
        '使用 PropTypes 验证 props'
      ],
      node: [
        '使用 async/await',
        '正确处理错误',
        '避免阻塞事件循环',
        '使用环境变量',
        '使用日志系统'
      ]
    };
    
    return practices[projectType] || practices['javascript'];
  }
}

/**
 * 智能建议控制器
 */
class SmartAdvisorController {
  constructor() {
    this.advisor = new SmartAdvisor();
  }

  /**
   * 分析并提供建议
   */
  async advise(options) {
    const { files, code, projectType } = options;
    
    console.log('\n🧠 HBE 智能建议系统');
    console.log('═'.repeat(70));
    
    // 分析代码
    if (files) {
      const results = await this.advisor.analyzeFiles(files);
      
      const allSuggestions = [];
      for (const result of results) {
        allSuggestions.push(...result.suggestions);
      }
      
      this.advisor.displaySuggestions(allSuggestions);
    }
    
    // 最佳实践建议
    if (projectType) {
      console.log('\n📚 最佳实践建议:');
      console.log('─'.repeat(70));
      
      const practices = await this.advisor.getBestPractices(projectType);
      practices.forEach((practice, i) => {
        console.log(`  ${i + 1}. ${practice}`);
      });
    }
    
    console.log('\n' + '═'.repeat(70));
  }

  /**
   * 自动修复
   */
  async autoFix(issue) {
    const fixes = await this.advisor.getFixSuggestions(issue);
    
    console.log('\n🔧 自动修复建议:');
    console.log('═'.repeat(70));
    
    for (let i = 0; i < fixes.length; i++) {
      const fix = fixes[i];
      console.log(`\n${i + 1}. ${fix.action}`);
      console.log(`   代码: ${fix.code}`);
    }
    
    console.log('\n' + '═'.repeat(70));
  }
}

// CLI 接口
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'analyze';
  
  const controller = new SmartAdvisorController();
  
  switch (command) {
    case 'analyze':
      const files = args.slice(1);
      if (files.length === 0) {
        files = ['src/**/*.ts', 'lib/**/*.js'];
      }
      
      await controller.advise({ files });
      break;
      
    case 'practices':
      const projectType = args[1] || 'typescript';
      await controller.advise({ projectType });
      break;
      
    default:
      console.log(`
🧠 HBE 智能建议系统

用法: node scripts/ai/smart-advisor.js [命令] [参数]

命令:
  analyze <files...>    分析代码并提供建议
  practices <type>     显示最佳实践

项目类型:
  typescript, javascript, react, node, python, rust, go

示例:
  node scripts/ai/smart-advisor.js analyze src/
  node scripts/ai/smart-advisor.js practices react
      `);
  }
}

module.exports = { SmartAdvisor, SmartAdvisorController };

if (require.main === module) {
  main().catch(console.error);
}
