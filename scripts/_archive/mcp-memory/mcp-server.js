#!/usr/bin/env node
/**
 * HBE Memory MCP Server
 * 提供 3 个工具：search, timeline, get_observations
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MEMORY_DIR = path.join(process.cwd(), 'memory');
const OBSERVATIONS_DIR = path.join(MEMORY_DIR, 'observations');

const server = new Server({
  name: 'hbe-memory',
  version: '1.0.0',
}, {
  capabilities: { tools: {} },
});

server.setRequestHandler('tools/list', async () => ({
  tools: [
    {
      name: 'search',
      description: 'Search memory. Returns compact results (~50-100 tokens each).',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search keyword' },
          type: { type: 'string', description: 'Filter by type' },
          limit: { type: 'number', description: 'Max results (default 20)', default: 20 },
        },
      },
    },
    {
      name: 'get_observations',
      description: 'Get full details by IDs. Batch multiple IDs (~500-1000 tokens each).',
      inputSchema: {
        type: 'object',
        properties: {
          ids: { type: 'array', items: { type: 'string' }, description: 'Observation IDs' },
        },
        required: ['ids'],
      },
    },
  ],
}));

server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'search') {
      const { query = '', type = '', limit = 20 } = args;
      const files = fs.readdirSync(OBSERVATIONS_DIR).filter(f => f.endsWith('.json'));
      
      const results = [];
      for (const file of files) {
        if (results.length >= limit) break;
        try {
          const obs = JSON.parse(fs.readFileSync(path.join(OBSERVATIONS_DIR, file), 'utf8'));
          if (type && obs.type !== type) continue;
          if (query && !obs.summary.toLowerCase().includes(query.toLowerCase())) continue;
          results.push(obs);
        } catch (e) {}
      }

      const formatted = results.map((r, i) => 
        `${i + 1}. [${r.id}] ${new Date(r.timestamp).toLocaleString()} [${r.type}] ${r.summary.slice(0, 80)}`
      ).join('\n');

      return { content: [{ type: 'text', text: `Found ${results.length}:\n\n${formatted}` }] };
    }

    if (name === 'get_observations') {
      const { ids } = args;
      const observations = ids.map(id => {
        const file = path.join(OBSERVATIONS_DIR, `${id}.json`);
        if (fs.existsSync(file)) {
          return JSON.parse(fs.readFileSync(file, 'utf8'));
        }
        return null;
      }).filter(Boolean);

      const formatted = observations.map(obs => 
        `[${obs.id}] ${new Date(obs.timestamp).toLocaleString()}\nType: ${obs.type}\nSummary: ${obs.summary}\n`
      ).join('\n---\n');

      return { content: [{ type: 'text', text: formatted }] };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error('HBE Memory MCP server running');
