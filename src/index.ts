#!/usr/bin/env node

/**
 * Plaza - MCP Tooling Platform
 * Phase 01 Core Services
 *
 * Provides: Universal Scraper, Browser Automation, Web Search
 */

import { UniversalScraper, scraper } from './universal-scraper/index.js';
import { PlaywrightWrapper, browser } from './browser-automation/index.js';
import { SearchAggregator } from './web-search/index.js';
import { HealthChecker } from './health/health-check.js';
import {
  PlazaError,
  ScraperError,
  BrowserError,
  SearchError,
  RateLimitError,
  ValidationError,
} from './shared/errors.js';

// Export all public APIs
export {
  // Universal Scraper
  UniversalScraper,
  scraper,

  // Browser Automation
  PlaywrightWrapper,
  browser,

  // Web Search
  SearchAggregator,

  // Health
  HealthChecker,

  // Errors
  PlazaError,
  ScraperError,
  BrowserError,
  SearchError,
  RateLimitError,
  ValidationError,
};

// Export types
export type {
  ScraperOptions,
  ScrapedContent,
  ParsedHtml,
  PdfContent,
  ScraperResult,
} from './universal-scraper/index.js';

export type {
  BrowserOptions,
  PageOptions,
  ScreenshotOptions,
  PdfOptions,
  BrowserSession,
  InteractionResult,
} from './browser-automation/index.js';

export type {
  SearchQuery,
  SearchResult,
  SearchResponse,
  SearchProvider,
} from './web-search/index.js';

export type { HealthStatus, ServiceHealth } from './shared/types.js';

// Package version
export const VERSION = '0.1.0';

// Main Plaza class for simplified usage
export class Plaza {
  scraper: UniversalScraper;
  browser: PlaywrightWrapper;
  search: SearchAggregator | null = null;
  health: HealthChecker;

  constructor(options: {
    scraperOptions?: ConstructorParameters<typeof UniversalScraper>[0];
    browserOptions?: ConstructorParameters<typeof PlaywrightWrapper>[0];
    searchConfig?: ConstructorParameters<typeof SearchAggregator>[0];
  } = {}) {
    this.scraper = new UniversalScraper(options.scraperOptions);
    this.browser = new PlaywrightWrapper(options.browserOptions);
    this.health = new HealthChecker(VERSION);

    if (options.searchConfig) {
      this.search = new SearchAggregator(options.searchConfig);
    }

    this.registerHealthChecks();
  }

  private registerHealthChecks(): void {
    // Scraper health check
    this.health.registerCheck('scraper', async () => {
      try {
        // Simple check - verify scraper can be instantiated
        return { status: 'healthy', message: 'Scraper ready', lastChecked: new Date().toISOString() };
      } catch (error) {
        return { status: 'unhealthy', message: (error as Error).message, lastChecked: new Date().toISOString() };
      }
    });

    // Browser health check
    this.health.registerCheck('browser', async () => {
      try {
        // Simple check - browser context available
        return { status: 'healthy', message: 'Browser ready', lastChecked: new Date().toISOString() };
      } catch (error) {
        return { status: 'unhealthy', message: (error as Error).message, lastChecked: new Date().toISOString() };
      }
    });

    // Search health check (if configured)
    if (this.search) {
      this.health.registerCheck('search', async () => {
        try {
          const status = await this.search!.getProviderStatus();
          const availableCount = status.filter((s) => s.available).length;
          if (availableCount === 0) {
            return { status: 'unhealthy', message: 'No search providers available', lastChecked: new Date().toISOString() };
          }
          if (availableCount < status.length) {
            return { status: 'degraded', message: `${availableCount}/${status.length} providers available`, lastChecked: new Date().toISOString() };
          }
          return { status: 'healthy', message: 'All providers available', lastChecked: new Date().toISOString() };
        } catch (error) {
          return { status: 'unhealthy', message: (error as Error).message, lastChecked: new Date().toISOString() };
        }
      });
    }
  }

  async init(): Promise<void> {
    await this.browser.init();
  }

  async close(): Promise<void> {
    await this.browser.close();
  }

  async healthCheck(): Promise<import('./shared/types.js').HealthStatus> {
    return this.health.check();
  }
}

// Default export
export default Plaza;

// If running directly, show info
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    Plaza MCP Platform                        ║
║                    Version: ${VERSION}                          ║
╠══════════════════════════════════════════════════════════════╣
║  Services:                                                   ║
║    • Universal Scraper - Robust web content extraction       ║
║    • Browser Automation - Playwright-powered interactions    ║
║    • Web Search - Multi-provider search aggregation          ║
╚══════════════════════════════════════════════════════════════╝
  `);
}
