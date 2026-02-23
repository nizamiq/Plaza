import type { SearchQuery, SearchResult, SearchProvider } from '../types.js';
import { SearchError } from '../../shared/errors.js';
import { withRetry } from '../../shared/retry.js';

export interface PerplexitySearchResult {
  title: string;
  url: string;
  snippet: string;
  publishedDate?: string;
}

export interface PerplexityResponse {
  id: string;
  model: string;
  object: string;
  created: number;
  citations?: string[];
  choices: Array<{
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
    delta?: {
      role: string;
      content: string;
    };
  }>;
}

export class PerplexityProvider implements SearchProvider {
  name = 'perplexity';
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;
  private model: string;

  constructor(config: {
    apiKey: string;
    baseUrl?: string;
    timeout?: number;
    model?: string;
  }) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl ?? 'https://api.perplexity.ai';
    this.timeout = config.timeout ?? 30000;
    this.model = config.model ?? 'llama-3.1-sonar-small-128k-online';
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: 'hi' }],
          max_tokens: 1,
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
          const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
              model: this.model,
              messages: [
                {
                  role: 'system',
                  content:
                    'You are a helpful search assistant. Provide accurate information with citations.',
                },
                {
                  role: 'user',
                  content: query.query,
                },
              ],
              max_tokens: 1000,
              temperature: 0.2,
              top_p: 0.9,
              return_citations: true,
              search_domain_filter: query.site ? [query.site] : undefined,
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
              throw new SearchError(
                'Perplexity API authentication failed',
                'PERPLEXITY_AUTH_ERROR',
                response.status
              );
            }
            throw new SearchError(
              `Perplexity API error: ${response.statusText}`,
              'PERPLEXITY_API_ERROR',
              response.status,
              response.status >= 500
            );
          }

          const data = (await response.json()) as PerplexityResponse;
          return this.transformResults(data);
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      },
      { retries: 2, minTimeout: 1000 }
    );
  }

  private transformResults(response: PerplexityResponse): SearchResult[] {
    const results: SearchResult[] = [];

    // Main answer as first result
    if (response.choices?.[0]?.message?.content) {
      results.push({
        id: `perplexity_${response.id}`,
        title: 'AI Answer',
        url: '',
        snippet: response.choices[0].message.content,
        domain: 'perplexity.ai',
        score: 1.0,
        provider: this.name,
      });
    }

    // Citations as additional results
    if (response.citations) {
      response.citations.forEach((citation, index) => {
        try {
          const url = new URL(citation);
          results.push({
            id: `perplexity_citation_${index}`,
            title: `Source ${index + 1}`,
            url: citation,
            snippet: '',
            domain: url.hostname,
            score: 0.5 - index * 0.1,
            provider: this.name,
          });
        } catch {
          // Skip invalid URLs
        }
      });
    }

    return results;
  }
}
