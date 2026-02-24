#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { Plaza } from './index.js';

// Initialize Plaza
const plaza = new Plaza({
  searchConfig: {
    exa: { apiKey: process.env.EXA_API_KEY || '', enabled: true },
    serper: { apiKey: process.env.SERPER_API_KEY || '', enabled: true },
    perplexity: { apiKey: process.env.PERPLEXITY_API_KEY || '', enabled: true }
  }
});

const server = new Server(
  {
    name: 'plaza-mcp-server',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define tool schemas
const ScrapeSchema = z.object({
  url: z.string().url(),
  raw: z.boolean().optional().default(false),
});

const SearchSchema = z.object({
  query: z.string(),
  numResults: z.number().optional().default(10),
});

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'universal_scrape',
        description: 'Scrape content from a URL',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'URL to scrape' },
            raw: { type: 'boolean', description: 'Extract raw HTTP response without parsing' }
          },
          required: ['url']
        }
      },
      {
        name: 'web_search',
        description: 'Perform a web search using configured providers',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query' },
            numResults: { type: 'number', description: 'Number of results to return' }
          },
          required: ['query']
        }
      }
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'universal_scrape') {
    const args = ScrapeSchema.parse(request.params.arguments);
    try {
      const result = await plaza.scraper.scrape(args.url, {
        raw: args.raw
      });
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error scraping: ${(error as Error).message}`
          }
        ],
        isError: true
      };
    }
  }

  if (request.params.name === 'web_search') {
    if (!plaza.search) {
      return {
        content: [{ type: 'text', text: 'Web search is not configured.' }],
        isError: true
      };
    }
    const args = SearchSchema.parse(request.params.arguments);
    try {
      const result = await plaza.search.search({ query: args.query, limit: args.numResults });
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error searching: ${(error as Error).message}`
          }
        ],
        isError: true
      };
    }
  }

  throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
});

async function run() {
  await plaza.init();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Plaza MCP server running on stdio');
}

run().catch((error) => {
  console.error('Fatal error in main:', error);
  process.exit(1);
});
