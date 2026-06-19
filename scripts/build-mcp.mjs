#!/usr/bin/env node
/**
 * esbuild 打包 MCP server 为单文件 dist/mcp/rules-server.js
 *
 * 参考方案：android-emulator/ios-simulator 插件用同样的方式打包
 * (~1.6MB 自包含，用户端无需 npm install)
 */

import * as esbuild from 'esbuild';
import { mkdir, rm } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const outDir = path.join(root, 'dist', 'mcp');
const outfile = path.join(outDir, 'rules-server.js');

// 清理旧的打包产物
await rm(path.join(root, 'dist'), { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

console.log('Bundling MCP server...');

await esbuild.build({
  entryPoints: [path.join(root, 'src', 'mcp', 'rules-server.mjs')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node18',
  outfile,
  // MCP SDK 是 ESM，需要打进去（不能 external）
  external: [],
  // 不加 banner shebang —— ESM 模块由 `node` 命令显式调用，不需要 shebang
  // 且 shebang 放 import 后会导致 SyntaxError
  minify: false,  // 保留可读性，便于调试
  sourcemap: false,
});

console.log(`✓ Bundled to ${path.relative(root, outfile)}`);

// 写入 dist/mcp/package.json 声明 ESM，消除 Node MODULE_TYPELESS 警告
import { writeFile } from 'fs/promises';
await writeFile(path.join(outDir, 'package.json'), JSON.stringify({ type: 'module' }) + '\n');
console.log(`  + ${path.relative(root, path.join(outDir, 'package.json'))} (ESM marker)`);

// 报告大小
const { stat } = await import('fs/promises');
const stats = await stat(outfile);
const sizeKB = (stats.size / 1024).toFixed(0);
console.log(`  Size: ${sizeKB} KB (self-contained, zero-install)`);
