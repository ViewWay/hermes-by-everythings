#!/usr/bin/env node
/**
 * mem-search - 记忆搜索工具
 */

const fs = require('fs');
const path = require('path');

const MEMORY_DIR = path.join(process.cwd(), 'memory');
const OBSERVATIONS_DIR = path.join(MEMORY_DIR, 'observations');

function searchObservations(options = {}) {
  const { query = '', type = '', tool = '', importance = '', days = 0, limit = 20 } = options;

  if (!fs.existsSync(OBSERVATIONS_DIR)) {
    console.error('Memory not found. Run a session first.');
    return [];
  }

  const files = fs.readdirSync(OBSERVATIONS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => path.join(OBSERVATIONS_DIR, f))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);

  const results = [];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  for (const file of files) {
    if (results.length >= limit) break;
    try {
      const obs = JSON.parse(fs.readFileSync(file, 'utf8'));
      
      if (days > 0 && (now - new Date(obs.timestamp).getTime() > days * dayMs)) continue;
      if (type && obs.type !== type) continue;
      if (tool && obs.tool !== tool) continue;
      if (importance && obs.importance !== importance) continue;
      if (query && !obs.summary.toLowerCase().includes(query.toLowerCase())) continue;

      results.push(obs);
    } catch (e) {}
  }

  return results;
}

function main() {
  const args = process.argv.slice(2);
  const options = { query: '', type: '', tool: '', importance: '', days: 0, limit: 20, format: 'summary' };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--query': options.query = args[++i]; break;
      case '--type': options.type = args[++i]; break;
      case '--tool': options.tool = args[++i]; break;
      case '--importance': options.importance = args[++i]; break;
      case '--days': options.days = parseInt(args[++i]); break;
      case '--limit': options.limit = parseInt(args[++i]); break;
      case '--format': options.format = args[++i]; break;
      case '--json': options.format = 'json'; break;
      case '--verbose': options.format = 'detailed'; break;
      case '--help': 
        console.log('Usage: mem-search [--query text] [--type type] [--tool tool] [--days n] [--limit n]');
        return;
    }
  }

  const results = searchObservations(options);
  
  if (options.format === 'json') {
    console.log(JSON.stringify(results, null, 2));
  } else {
    results.forEach(r => {
      const time = new Date(r.timestamp).toLocaleString();
      console.log(`[${time}] [${r.type}] ${r.summary}`);
    });
    console.log(`\nFound ${results.length} results`);
  }
}

if (require.main === module) main();
module.exports = { searchObservations };
