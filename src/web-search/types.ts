export interface SearchQuery {
  /** Search query string */
  query: string;
  /** Number of results to return */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
  /** Language filter */
  language?: string;
  /** Time filter (e.g., 'd' for day, 'w' for week, 'm' for month, 'y' for year) */
  timeRange?: 'd' | 'w' | 'm' | 'y';
  /** Site-specific search */
  site?: string;
}

export interface SearchResult {
  /** Unique identifier for the result */
  id: string;
  /** Result title */
  title: string;
  /** Result URL */
  url: string;
  /** Snippet/summary of the content */
  snippet: string;
  /** Source domain */
  domain: string;
  /** Timestamp of when the content was published/crawled */
  publishedDate?: string;
  /** Relevance score */
  score: number;
  /** Provider that returned this result */
  provider: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

export interface SearchResponse {
  /** Original query */
  query: string;
  /** Aggregated results */
  results: SearchResult[];
  /** Total number of results available */
  totalResults: number;
  /** Providers that were queried */
  providers: string[];
  /** Providers that failed */
  failedProviders: string[];
  /** Time taken for the search in milliseconds */
  duration: number;
}

export interface SearchProvider {
  name: string;
  search(query: SearchQuery): Promise<SearchResult[]>;
  isAvailable(): Promise<boolean>;
}

export type ProviderConfig = {
  apiKey: string;
  baseUrl?: string;
  enabled: boolean;
  priority?: number;
  timeout?: number;
};
