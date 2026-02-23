import type { SearchQuery, SearchResult, SearchProvider } from '../types.js';
import { SearchError } from '../../shared/errors.js';
import { withRetry } from '../../shared/retry.js';

export interface SerperSearchResult {
  title: string;
  link: string;
  snippet: string;
  date?: string;
  sitelinks?: Array<{ title: string; link: string; snippet: string }>;
  position: number;
}

export interface SerperResponse {
  searchParameters: {
    q: string;
    gl?: string;
    hl?: string;
  };
  organic: SerperSearchResult[];
  answerBox?: {
    title?: string;
    answer?: string;
    snippet?: string;
  };
  knowledgeGraph?: unknown;
}

export class SerperProvider implements SearchProvider {
  name = 'serper';
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;

  constructor(config: { apiKey: string; baseUrl?: string; timeout?: number }) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl ?? 'https://google.serper.dev';
    this.timeout = config.timeout ?? 30000;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': this.apiKey,
        },
        body: JSON.stringify({ q: 'test', num: 1 }),
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
              'X-API-KEY': this.apiKey,
            },
            body: JSON.stringify({
              q: query.query,
              num: query.limit ?? 10,
              page: query.offset ? Math.floor(query.offset / (query.limit ?? 10)) + 1 : 1,
              ...(query.language && { hl: query.language }),
              ...(query.timeRange && { tbs: this.getTimeRangeParam(query.timeRange) }),
              ...(query.site && { q: `site:${query.site} ${query.query}` }),
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
              throw new SearchError(
                'Serper API authentication failed',
                'SERPER_AUTH_ERROR',
                response.status
              );
            }
            throw new SearchError(
              `Serper API error: ${response.statusText}`,
              'SERPER_API_ERROR',
              response.status,
              response.status >= 500
            );
          }

          const data = (await response.json()) as SerperResponse;
          return this.transformResults(data.organic);
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      },
      { retries: 2, minTimeout: 1000 }
    );
  }

  private transformResults(results: SerperSearchResult[]): SearchResult[] {
    return results.map((result, index) => ({
      id: `serper_${result.position || index}`,
      title: result.title,
      url: result.link,
      snippet: result.snippet,
      domain: this.extractDomain(result.link),
      publishedDate: result.date,
      score: 1 / (result.position || index + 1),
      provider: this.name,
      metadata: {
        sitelinks: result.sitelinks,
      },
    }));
  }

  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }

  private getTimeRangeParam(range: 'd' | 'w' | 'm' | 'y'): string {
    const map = {
      d: 'qdr:d',
      w: 'qdr:w',
      m: 'qdr:m',
      y: 'qdr:y',
    };
    return map[range];
  }
}
