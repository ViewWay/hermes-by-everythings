#!/usr/bin/env node
/**
 * HBE 主题系统
 * 支持亮色/暗色主题，自定义颜色方案
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

class ThemeManager {
  constructor() {
    this.themes = {
      dark: {
        name: '暗色主题',
        colors: {
          primary: '#61afef',      // 蓝色
          secondary: '#98c379',    // 绿色
          success: '#98c379',      // 绿色
          warning: '#e5c07b',      // 橙色
          error: '#e06c75',        // 红色
          info: '#61afef',         // 蓝色
          
          bg: '#282c34',           // 背景色
          fg: '#abb2bf',           // 前景色
          bgSecondary: '#21252b',  // 次要背景
          fgSecondary: '#5c6370',  // 次要前景
          
          border: '#4b5263',       // 边框
          bar: '#3d4250',          // 进度条背景
          barFill: '#61afef',      // 进度条填充
          
          // 语法高亮
          keyword: '#c678dd',
          string: '#98c379',
          number: '#d19a66',
          comment: '#5c6370',
          function: '#61afef'
        },
        symbols: {
          info: '📊',
          success: '✅',
          warning: '⚠️',
          error: '❌',
          progress: '█',
          progressEmpty: '░'
        }
      },
      
      light: {
        name: '亮色主题',
        colors: {
          primary: '#0369a1',
          secondary: '#059669',
          success: '#059669',
          warning: '#d97706',
          error: '#dc2626',
          info: '#0369a1',
          
          bg: '#ffffff',
          fg: '#1f2937',
          bgSecondary: '#f9fafb',
          fgSecondary: '#6b7280',
          
          border: '#e5e7eb',
          bar: '#e5e7eb',
          barFill: '#0369a1',
          
          keyword: '#7c3aed',
          string: '#059669',
          number: '#d97706',
          comment: '#9ca3af',
          function: '#0369a1'
        },
        symbols: {
          info: '📊',
          success: '✅',
          warning: '⚠️',
          error: '❌',
          progress: '█',
          progressEmpty: '░'
        }
      },
      
      minimal: {
        name: '极简主题',
        colors: {
          primary: '#000000',
          secondary: '#666666',
          success: '#008000',
          warning: '#ff9900',
          error: '#ff0000',
          info: '#0000ff',
          
          bg: '#ffffff',
          fg: '#000000',
          bgSecondary: '#f5f5f5',
          fgSecondary: '#999999',
          
          border: '#cccccc',
          bar: '#e0e0e0',
          barFill: '#000000',
          
          keyword: '#000000',
          string: '#008000',
          number: '#0000ff',
          comment: '#999999',
          function: '#000000'
        },
        symbols: {
          info: '[i]',
          success: '[√]',
          warning: '[!]',
          error: '[×]',
          progress: '=',
          progressEmpty: '-'
        }
      }
    };
    
    this.currentTheme = 'dark';
  }

  /**
   * 设置主题
   */
  setTheme(themeName) {
    if (!this.themes[themeName]) {
      throw new Error(`未知主题: ${themeName}`);
    }
    this.currentTheme = themeName;
  }

  /**
   * 获取当前主题
   */
  getTheme() {
    return this.themes[this.currentTheme];
  }

  /**
   * 获取颜色
   */
  getColor(colorName) {
    const theme = this.getTheme();
    return theme.colors[colorName] || colorName;
  }

  /**
   * 获取符号
   */
  getSymbol(symbolName) {
    const theme = this.getTheme();
    return theme.symbols[symbolName] || symbolName;
  }

  /**
   * 格式化文本（带颜色）
   */
  colorize(text, colorName) {
    const color = this.getColor(colorName);
    // 简化版：实际应该使用 ANSI 转义码
    return text;
  }

  /**
   * 创建进度条
   */
  createProgressBar(percent, width = 40) {
    const theme = this.getTheme();
    const filled = Math.round((percent / 100) * width);
    const bar = theme.symbols.progress.repeat(filled) + 
                theme.symbols.progressEmpty.repeat(width - filled);
    const color = percent >= 80 ? theme.colors.success :
                   percent >= 50 ? theme.colors.warning :
                   theme.colors.error;
    
    return [`[${bar}]`, `${percent}%`, color];
  }

  /**
   * 渲染标题
   */
  renderTitle(title, level = 1) {
    const theme = this.getTheme();
    const chars = {
      1: { top: '═', bottom: '═' },
      2: { top: '─', bottom: '─' },
      3: { top: '─', bottom: '─' }
    };
    
    const char = chars[level] || chars[1];
    const line = char.top.repeat(70);
    
    console.log('\n' + line);
    console.log(title);
    console.log(line + '\n');
  }

  /**
   * 渲染信息框
   */
  renderInfoBox(title, items) {
    const theme = this.getTheme();
    
    console.log(`${theme.symbols.info} ${title}`);
    console.log('─'.repeat(70));
    
    for (const [key, value] of Object.entries(items)) {
      console.log(`  ${key}: ${value}`);
    }
  }

  /**
   * 渲染状态卡片
   */
  renderStatusCard(title, status, details = {}) {
    const theme = this.getTheme();
    const icons = {
      success: theme.symbols.success,
      error: theme.symbols.error,
      warning: theme.symbols.warning,
      info: theme.symbols.info
    };
    
    const icon = icons[status] || icons.info;
    
    console.log(`${icon} ${title}`);
    if (Object.keys(details).length > 0) {
      for (const [key, value] of Object.entries(details)) {
        console.log(`  ${key}: ${value}`);
      }
    }
  }

  /**
   * 渲染表格
   */
  renderTable(headers, rows) {
    const colWidths = headers.map(h => h.length);
    
    // 计算每列宽度
    for (const row of rows) {
      row.forEach((cell, i) => {
        colWidths[i] = Math.max(colWidths[i], String(cell).length);
      });
    }
    
    // 渲染表头
    const header = '|' + headers.map((h, i) => 
      ' ' + h.padEnd(colWidths[i]) + ' '
    ).join('|') + '|';
    
    const separator = '|' + colWidths.map(w => 
      '-' + '-'.repeat(w) + '-'
    ).join('|') + '|';
    
    console.log('\n' + separator);
    console.log(header);
    console.log(separator);
    
    // 渲染行
    for (const row of rows) {
      const line = '|' + row.map((cell, i) => 
        ' ' + String(cell).padEnd(colWidths[i]) + ' '
      ).join('|') + '|';
      console.log(line);
    }
    
    console.log(separator + '\n');
  }

  /**
   * 保存主题配置
   */
  async saveConfig() {
    const configPath = path.join(os.homedir(), '.hbe', 'theme.json');
    
    const config = {
      currentTheme: this.currentTheme,
      customColors: this.themes[this.currentTheme].colors
    };
    
    try {
      await fs.mkdir(path.dirname(configPath), { recursive: true });
      await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    } catch (error) {
      console.error('保存主题配置失败:', error.message);
    }
  }

  /**
   * 加载主题配置
   */
  async loadConfig() {
    const configPath = path.join(os.homedir(), '.hbe', 'theme.json');
    
    try {
      const content = await fs.readFile(configPath, 'utf8');
      const config = JSON.parse(content);
      
      this.setTheme(config.currentTheme);
    } catch (error) {
      // 使用默认主题
      this.setTheme('dark');
    }
  }

  /**
   * 创建自定义主题
   */
  async createCustomTheme(name, colors = {}) {
    const baseTheme = this.themes.dark; // 基于暗色主题
    
    this.themes[name] = {
      name: `自定义主题: ${name}`,
      colors: {
        ...baseTheme.colors,
        ...colors
      },
      symbols: baseTheme.symbols
    };
    
    await this.saveConfig();
  }

  /**
   * 列出所有主题
   */
  listThemes() {
    console.log('\n🎨 可用主题:');
    console.log('═'.repeat(70));
    
    for (const [name, theme] of Object.entries(this.themes)) {
      const current = name === this.currentTheme ? ' [当前]' : '';
      console.log(`  ${name.padEnd(15)} - ${theme.name}${current}`);
    }
    
    console.log('\n使用方法:');
    console.log('  node themes/theme-manager.js use <theme>');
    console.log('═'.repeat(70) + '\n');
  }

  /**
   * 显示主题预览
   */
  preview() {
    const theme = this.getTheme();
    
    console.log(`\n${theme.name} 预览:`);
    console.log('═'.repeat(70));
    
    // 标题
    this.renderTitle('标题示例', 2);
    
    // 信息框
    this.renderInfoBox('信息框示例', {
      '键 1': '值 1',
      '键 2': '值 2',
      '键 3': '值 3'
    });
    
    // 状态卡片
    this.renderStatusCard('成功状态', 'success', { '详情': '操作成功完成' });
    this.renderStatusCard('警告状态', 'warning', { '详情': '需要注意' });
    this.renderStatusCard('错误状态', 'error', { '详情': '操作失败' });
    
    // 进度条
    console.log('\n进度条示例:');
    for (const percent of [25, 50, 75, 100]) {
      const [bar, label] = this.createProgressBar(percent);
      console.log(`  ${bar} ${label}`);
    }
    
    // 表格
    console.log('\n表格示例:');
    this.renderTable(
      ['列 1', '列 2', '列 3'],
      [
        ['数据 1', '数据 2', '数据 3'],
        ['数据 4', '数据 5', '数据 6']
      ]
    );
  }
}

// CLI 接口
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'preview';
  
  const manager = new ThemeManager();
  await manager.loadConfig();
  
  switch (command) {
    case 'list':
    case 'ls':
      manager.listThemes();
      break;
      
    case 'use':
      const themeName = args[1];
      if (!themeName) {
        console.error('请指定主题名称');
        process.exit(1);
      }
      manager.setTheme(themeName);
      await manager.saveConfig();
      console.log(`✓ 主题已切换到: ${themeName}`);
      break;
      
    case 'preview':
    case 'show':
      manager.preview();
      break;
      
    case 'create':
      const customName = args[1];
      if (!customName) {
        console.error('请指定主题名称');
        process.exit(1);
      }
      await manager.createCustomTheme(customName);
      console.log(`✓ 自定义主题已创建: ${customName}`);
      break;
      
    default:
      console.log(`
🎨 HBE 主题管理器

用法: node themes/theme-manager.js [命令] [参数]

命令:
  list, ls              列出所有主题
  use <theme>           使用指定主题
  preview, show         预览当前主题
  create <name>         创建自定义主题

可用主题:
  dark                  暗色主题 (默认)
  light                 亮色主题
  minimal              极简主题

示例:
  node themes/theme-manager.js list
  node themes/theme-manager.js use light
  node themes/theme-manager.js preview
      `);
  }
}

module.exports = ThemeManager;

if (require.main === module) {
  main().catch(console.error);
}
