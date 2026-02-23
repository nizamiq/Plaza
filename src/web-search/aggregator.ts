import type { SearchQuery, SearchResult, SearchResponse, SearchProvider } from './types.js';
import { ExaProvider } from './providers/exa.js';
import { SerperProvider } from './providers/serper.js';
import { PerplexityProvider } from './providers/perplexity.js';
import { SearchError } from '../shared/errors.js';
import { searchRateLimiter } from '../shared/rate-limiter.js';

export interface AggregatorConfig {
  exa?: { apiKey: string; enabled?: boolean };
  serper?: { apiKey: string; enabled?: boolean };
  perplexity?: { apiKey: string; enabled?: boolean };
  maxResults?: number;
  deduplicate?: boolean;
  timeout?: number;
}

export class SearchAggregator {
  private providers: SearchProvider[] = [];
  private config: Required<AggregatorConfig>;

  constructor(config: AggregatorConfig = {}) {
    this.config = {
      exa: config.exa ?? { apiKey: '', enabled: false },
      serper: config.serper ?? { apiKey: '', enabled: false },
      perplexity: config.perplexity ?? { apiKey: '', enabled: false },
      maxResults: config.maxResults ?? 10,
      deduplicate: config.deduplicate ?? true,
      timeout: config.timeout ?? 30000,
    };

    this.initializeProviders();
  }

  private initializeProviders(): void {
    if (this.config.exa.enabled && this.config.exa.apiKey) {
      this.providers.push(
        new ExaProvider({
          apiKey: this.config.exa.apiKey,
          timeout: this.config.timeout,
        })
      );
    }

    if (this.config.serper.enabled && this.config.serper.apiKey) {
      this.providers.push(
        new SerperProvider({
          apiKey: this.config.serper.apiKey,
          timeout: this.config.timeout,
        })
      );
    }

    if (this.config.perplexity.enabled && this.config.perplexity.apiKey) {
      this.providers.push(
        new PerplexityProvider({
          apiKey: this.config.perplexity.apiKey,
          timeout: this.config.timeout,
        })
      );
    }

    if (this.providers.length === 0) {
      console.warn('No search providers configured');
    }
  }

  async search(query: SearchQuery): Promise<SearchResponse> {
    const startTime = Date.now();

    if (this.providers.length === 0) {
      throw new SearchError(
        'No search providers configured',
        'NO_PROVIDERS',
        503
      );
    }

    // Query all providers in parallel with rate limiting
    const providerPromises = this.providers.map(async (provider) => {
      try {
        const results = await searchRateLimiter.schedule(() =>
          this.searchWithTimeout(provider, query)
        );
        return { provider: provider.name, results, error: null };
      } catch (error) {
        console.error(`Provider ${provider.name} failed:`, (error as Error).message);
        return {
          provider: provider.name,
          results: [],
          error: (error as Error).message,
        };
      }
    });

    const providerResults = await Promise.all(providerPromises);

    // Collect successful results and failed providers
    const allResults: SearchResult[] = [];
    const failedProviders: string[] = [];

    for (const result of providerResults) {
      if (result.error) {
        failedProviders.push(result.provider);
      } else {
        allResults.push(...result.results);
      }
    }

    // Deduplicate and rank results
    let finalResults = this.config.deduplicate
      ? this.deduplicateResults(allResults)
      : allResults;

    // Sort by score and limit results
    finalResults = finalResults
      .sort((a, b) => b.score - a.score)
      .slice(0, this.config.maxResults);

    const duration = Date.now() - startTime;

    return {
      query: query.query,
      results: finalResults,
      totalResults: finalResults.length,
      providers: this.providers.map((p) => p.name),
      failedProviders,
      duration,
    };
  }

  private async searchWithTimeout(
    provider: SearchProvider,
    query: SearchQuery
  ): Promise<SearchResult[]> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Provider ${provider.name} timed out`));
      }, this.config.timeout);
    });

    return Promise.race([provider.search(query), timeoutPromise]);
  }

  private deduplicateResults(results: SearchResult[]): SearchResult[] {
    const seen = new Set<string>();
    const deduplicated: SearchResult[] = [];

    for (const result of results) {
      // Use normalized URL as deduplication key
      const key = this.normalizeUrl(result.url);

      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(result);
      } else {
        // If duplicate, boost score of existing result slightly
        const existing = deduplicated.find((r) => this.normalizeUrl(r.url) === key);
        if (existing) {
          existing.score = Math.max(existing.score, result.score) * 1.1;
        }
      }
    }

    return deduplicated;
  }

  private normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      // Remove common tracking parameters
      const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'ref', 'fbclid'];
      trackingParams.forEach((param) => urlObj.searchParams.delete(param)
      );
      return urlObj.toString().toLowerCase();
    } catch {
      return url.toLowerCase();
    }
  }

  async getProviderStatus(): Promise<
    Array<{ name: string; available: boolean }>
  > {
    const statusPromises = this.providers.map(async (provider) => {
      try {
        const available = await provider.isAvailable();
        return { name: provider.name, available };
      } catch {
        return { name: provider.name, available: false };
      }
    });

    return Promise.all(statusPromises);
  }
}
