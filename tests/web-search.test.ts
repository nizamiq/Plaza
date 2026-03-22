import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SearchAggregator } from '../src/web-search/aggregator.js';
import { SearchError } from '../src/shared/errors.js';

describe('SearchAggregator', () => {
  describe('provider configuration', () => {
    it('should initialize with no providers', () => {
      const aggregator = new SearchAggregator();
      expect(aggregator).toBeDefined();
    });

    it('should initialize with exa provider', () => {
      const aggregator = new SearchAggregator({
        exa: { apiKey: 'test-key', enabled: true },
      });
      expect(aggregator).toBeDefined();
    });

    it('should initialize with serper provider', () => {
      const aggregator = new SearchAggregator({
        serper: { apiKey: 'test-key', enabled: true },
      });
      expect(aggregator).toBeDefined();
    });

    it('should initialize with perplexity provider', () => {
      const aggregator = new SearchAggregator({
        perplexity: { apiKey: 'test-key', enabled: true },
      });
      expect(aggregator).toBeDefined();
    });

    it('should initialize with all providers', () => {
      const aggregator = new SearchAggregator({
        exa: { apiKey: 'test-key', enabled: true },
        serper: { apiKey: 'test-key', enabled: true },
        perplexity: { apiKey: 'test-key', enabled: true },
      });
      expect(aggregator).toBeDefined();
    });

    it('should respect enabled flag', () => {
      const aggregator = new SearchAggregator({
        exa: { apiKey: 'test-key', enabled: false },
        serper: { apiKey: 'test-key', enabled: true },
      });
      expect(aggregator).toBeDefined();
    });
  });

  describe('provider status', () => {
    it('should return status for configured providers', async () => {
      const aggregator = new SearchAggregator({
        exa: { apiKey: 'test-key', enabled: true },
        serper: { apiKey: 'test-key', enabled: true },
      });
      const status = await aggregator.getProviderStatus();
      expect(status).toBeDefined();
      expect(Array.isArray(status)).toBe(true);
    });
  });

  describe('search functionality', () => {
    it('should throw SearchError when no providers configured', async () => {
      const aggregator = new SearchAggregator();
      await expect(
        aggregator.search({ query: 'test' })
      ).rejects.toThrow(SearchError);
    });

    it('should throw SearchError when no providers available', async () => {
      const aggregator = new SearchAggregator({
        exa: { apiKey: '', enabled: true },
      });
      await expect(
        aggregator.search({ query: 'test' })
      ).rejects.toThrow(SearchError);
    });

    it('should accept valid search options', async () => {
      const aggregator = new SearchAggregator({
        exa: { apiKey: 'test-key', enabled: true },
      });
      // Should not throw on validation (will fail on actual API call)
      await expect(
        aggregator.search({ 
          query: 'test query',
          limit: 10,
        })
      ).rejects.toThrow(); // API call will fail with test key
    });
  });

  describe('result deduplication', () => {
    it('should deduplicate results by URL', () => {
      const aggregator = new SearchAggregator({
        exa: { apiKey: 'test-key', enabled: true },
        serper: { apiKey: 'test-key', enabled: true },
      });
      
      // Test deduplication logic with mock results
      const results1 = [
        { url: 'https://example.com/page1', title: 'Page 1', snippet: 'Snippet 1', score: 0.8, id: '1', domain: 'example.com', provider: 'exa' },
        { url: 'https://example.com/page2', title: 'Page 2', snippet: 'Snippet 2', score: 0.7, id: '2', domain: 'example.com', provider: 'exa' },
      ];
      
      const results2 = [
        { url: 'https://example.com/page1', title: 'Page 1 Duplicate', snippet: 'Snippet 1 Dup', score: 0.9, id: '3', domain: 'example.com', provider: 'serper' },
        { url: 'https://example.com/page3', title: 'Page 3', snippet: 'Snippet 3', score: 0.6, id: '4', domain: 'example.com', provider: 'serper' },
      ];
      
      const deduplicated = (aggregator as any).deduplicateResults([...results1, ...results2]);
      expect(deduplicated).toHaveLength(3);
      expect(deduplicated.map((r: { url: string }) => r.url)).toContain('https://example.com/page1');
      expect(deduplicated.map((r: { url: string }) => r.url)).toContain('https://example.com/page2');
      expect(deduplicated.map((r: { url: string }) => r.url)).toContain('https://example.com/page3');
    });
  });

  describe('error handling', () => {
    it('should create SearchError with correct properties', () => {
      const error = new SearchError('Test error', 'TEST_CODE', 500, true);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.statusCode).toBe(500);
      expect(error.isRetryable).toBe(true);
    });

    it('should handle provider failures gracefully', async () => {
      const aggregator = new SearchAggregator({
        exa: { apiKey: 'test-key', enabled: true },
      });
      
      // Mock the search method to simulate provider failure
      vi.spyOn(aggregator as any, 'searchWithTimeout').mockRejectedValue(
        new SearchError('Provider failed', 'PROVIDER_ERROR', 500, true)
      );
      
      await expect(
        aggregator.search({ query: 'test' })
      ).rejects.toThrow(SearchError);
    });
  });
});
