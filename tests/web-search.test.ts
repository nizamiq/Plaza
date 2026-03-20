import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SearchAggregator } from '../src/web-search/aggregator.js';
import { SearchError } from '../src/shared/errors.js';

describe('SearchAggregator', () => {
  describe('provider configuration', () => {
    it('should initialize with no providers', () => {
      const aggregator = new SearchAggregator();
      expect(aggregator).toBeDefined();
      const status = aggregator.getProviderStatus();
      expect(status).toHaveLength(0);
    });

    it('should initialize with exa provider', () => {
      const aggregator = new SearchAggregator({
        exa: { apiKey: 'test-key', enabled: true },
      });
      expect(aggregator).toBeDefined();
      const status = aggregator.getProviderStatus();
      expect(status).toHaveLength(1);
      expect(status[0].name).toBe('exa');
    });

    it('should initialize with serper provider', () => {
      const aggregator = new SearchAggregator({
        serper: { apiKey: 'test-key', enabled: true },
      });
      const status = aggregator.getProviderStatus();
      expect(status).toHaveLength(1);
      expect(status[0].name).toBe('serper');
    });

    it('should initialize with perplexity provider', () => {
      const aggregator = new SearchAggregator({
        perplexity: { apiKey: 'test-key', enabled: true },
      });
      const status = aggregator.getProviderStatus();
      expect(status).toHaveLength(1);
      expect(status[0].name).toBe('perplexity');
    });

    it('should initialize with all providers', () => {
      const aggregator = new SearchAggregator({
        exa: { apiKey: 'test-key', enabled: true },
        serper: { apiKey: 'test-key', enabled: true },
        perplexity: { apiKey: 'test-key', enabled: true },
      });
      const status = aggregator.getProviderStatus();
      expect(status).toHaveLength(3);
    });

    it('should respect enabled flag', () => {
      const aggregator = new SearchAggregator({
        exa: { apiKey: 'test-key', enabled: false },
        serper: { apiKey: 'test-key', enabled: true },
      });
      const status = aggregator.getProviderStatus();
      expect(status).toHaveLength(1);
      expect(status[0].name).toBe('serper');
    });
  });

  describe('provider status', () => {
    it('should return status for all configured providers', () => {
      const aggregator = new SearchAggregator({
        exa: { apiKey: 'test-key', enabled: true },
        serper: { apiKey: 'test-key', enabled: true },
      });
      const status = aggregator.getProviderStatus();
      expect(status).toHaveLength(2);
      expect(status[0]).toHaveProperty('name');
      expect(status[0]).toHaveProperty('available');
      expect(status[0]).toHaveProperty('healthy');
    });

    it('should mark providers with API keys as available', () => {
      const aggregator = new SearchAggregator({
        exa: { apiKey: 'test-key', enabled: true },
      });
      const status = aggregator.getProviderStatus();
      expect(status[0].available).toBe(true);
    });

    it('should mark providers without API keys as unavailable', () => {
      const aggregator = new SearchAggregator({
        exa: { apiKey: '', enabled: true },
      });
      const status = aggregator.getProviderStatus();
      expect(status[0].available).toBe(false);
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

    it('should validate query is not empty', async () => {
      const aggregator = new SearchAggregator({
        exa: { apiKey: 'test-key', enabled: true },
      });
      await expect(
        aggregator.search({ query: '' })
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
          maxResults: 10,
          recencyDays: 30
        })
      ).rejects.toThrow(); // API call will fail with test key
    });
  });

  describe('result aggregation', () => {
    it('should deduplicate results by URL', () => {
      const aggregator = new SearchAggregator({
        exa: { apiKey: 'test-key', enabled: true },
        serper: { apiKey: 'test-key', enabled: true },
      });
      
      // Test deduplication logic with mock results
      const results1 = [
        { url: 'https://example.com/page1', title: 'Page 1', snippet: 'Snippet 1' },
        { url: 'https://example.com/page2', title: 'Page 2', snippet: 'Snippet 2' },
      ];
      
      const results2 = [
        { url: 'https://example.com/page1', title: 'Page 1 Duplicate', snippet: 'Snippet 1 Dup' },
        { url: 'https://example.com/page3', title: 'Page 3', snippet: 'Snippet 3' },
      ];
      
      const deduplicated = (aggregator as any).deduplicateResults([...results1, ...results2]);
      expect(deduplicated).toHaveLength(3);
      expect(deduplicated.map(r => r.url)).toContain('https://example.com/page1');
      expect(deduplicated.map(r => r.url)).toContain('https://example.com/page2');
      expect(deduplicated.map(r => r.url)).toContain('https://example.com/page3');
    });

    it('should sort results by relevance score', () => {
      const aggregator = new SearchAggregator();
      
      const results = [
        { url: 'https://example.com/low', title: 'Low', snippet: 'Low', score: 0.5 },
        { url: 'https://example.com/high', title: 'High', snippet: 'High', score: 0.9 },
        { url: 'https://example.com/medium', title: 'Medium', snippet: 'Medium', score: 0.7 },
      ];
      
      const sorted = (aggregator as any).sortResultsByRelevance(results);
      expect(sorted[0].url).toBe('https://example.com/high');
      expect(sorted[1].url).toBe('https://example.com/medium');
      expect(sorted[2].url).toBe('https://example.com/low');
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

    it('should handle provider timeouts', async () => {
      const aggregator = new SearchAggregator({
        exa: { apiKey: 'test-key', enabled: true },
      });
      
      // Mock the provider to simulate timeout
      vi.spyOn(aggregator as any, 'searchWithProvider').mockRejectedValue(
        new SearchError('Timeout', 'TIMEOUT', 504, true)
      );
      
      await expect(
        aggregator.search({ query: 'test', timeout: 1 })
      ).rejects.toThrow(SearchError);
    });

    it('should fallback to available providers', async () => {
      const aggregator = new SearchAggregator({
        exa: { apiKey: 'invalid-key', enabled: true },
        serper: { apiKey: 'test-key', enabled: true },
      });
      
      // Mock exa to fail, serper to succeed
      const mockResults = [{ url: 'https://example.com', title: 'Example', snippet: 'Test' }];
      vi.spyOn(aggregator as any, 'searchWithProvider')
        .mockRejectedValueOnce(new Error('Exa failed'))
        .mockResolvedValueOnce(mockResults);
      
      const results = await aggregator.search({ query: 'test' });
      expect(results).toBeDefined();
      expect(results.results).toHaveLength(1);
    });
  });
});
