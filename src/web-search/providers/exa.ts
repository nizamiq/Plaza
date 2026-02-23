import type { SearchQuery, SearchResult, SearchProvider } from '../types.js';
import { SearchError } from '../../shared/errors.js';
import { withRetry } from '../../shared/retry.js';

export interface ExaSearchResult {
  id: string;
  title: string;
  url: string;
  publishedDate?: string;
  author?: string;
  score: number;
  text: string;
  highlights?: string[];
  highlightScores?: number[];
}

export class ExaProvider implements SearchProvider {
  name = 'exa';
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;

  constructor(config: { apiKey: string; baseUrl?: string; timeout?: number }) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl ?? 'https://api.exa.ai';
    this.timeout = config.timeout ?? 30000;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
        },
        body: JSON.stringify({
          query: 'test',
          numResults: 1,
        }),
      });
      return response.status !== 401 && response.status !== 403;
    } catch {
      return false;
    }
  }

  async search(query: SearchQuery): Promise<SearchResult[]> {
    return withRetry(
      async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
          const response = await fetch(`${this.baseUrl}/search`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': this.apiKey,
            },
            body: JSON.stringify({
              query: query.query,
              numResults: query.limit ?? 10,
              ...(query.timeRange && { startPublishedDate: this.getStartDate(query.timeRange) }),
              ...(query.site && { includeDomains: [query.site] }),
              contents: {
                text: true,
                highlights: true,
              },
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
              throw new SearchError(
                'Exa API authentication failed',
                'EXA_AUTH_ERROR',
                response.status
              );
            }
            throw new SearchError(
              `Exa API error: ${response.statusText}`,
              'EXA_API_ERROR',
              response.status,
              response.status >= 500
            );
          }

          const data = (await response.json()) as { results: ExaSearchResult[] };
          return this.transformResults(data.results);
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      },
      { retries: 2, minTimeout: 1000 }
    );
  }

  private transformResults(results: ExaSearchResult[]): SearchResult[] {
    return results.map((result) => ({
      id: result.id,
      title: result.title || 'Untitled',
      url: result.url,
      snippet: result.text?.substring(0, 500) || '',
      domain: new URL(result.url).hostname,
      publishedDate: result.publishedDate,
      score: result.score,
      provider: this.name,
      metadata: {
        author: result.author,
        highlights: result.highlights,
      },
    }));
  }

  private getStartDate(range: 'd' | 'w' | 'm' | 'y'): string {
    const now = new Date();
    switch (range) {
      case 'd':
        now.setDate(now.getDate() - 1);
        break;
      case 'w':
        now.setDate(now.getDate() - 7);
        break;
      case 'm':
        now.setMonth(now.getMonth() - 1);
        break;
      case 'y':
        now.setFullYear(now.getFullYear() - 1);
        break;
    }
    return now.toISOString().split('T')[0];
  }
}
