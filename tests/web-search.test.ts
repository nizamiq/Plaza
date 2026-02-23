import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SearchAggregator } from '../src/web-search/aggregator.js';
import { SearchError } from '../src/shared/errors.js';

describe('SearchAggregator', () => {
  describe('constructor', () => {
    it('should create instance with no providers', () => {
      const aggregator = new SearchAggregator();
      expect(aggregator).toBeDefined();
    });

    it('should create instance with exa provider', () => {
      const aggregator = new SearchAggregator({
        exa: { apiKey: 'test-key', enabled: true },
      });
      expect(aggregator).toBeDefined();
    });

    it('should create instance with serper provider', () => {
      const aggregator = new SearchAggregator({
        serper: { apiKey: 'test-key', enabled: true },
      });
      expect(aggregator).toBeDefined();
    });

    it('should create instance with perplexity provider', () => {
      const aggregator = new SearchAggregator({
        perplexity: { apiKey: 'test-key', enabled: true },
      });
      expect(aggregator).toBeDefined();
    });

    it('should create instance with all providers', () => {
      const aggregator = new SearchAggregator({
        exa: { apiKey: 'test-key', enabled: true },
        serper: { apiKey: 'test-key', enabled: true },
        perplexity: { apiKey: 'test-key', enabled: true },
      });
      expect(aggregator).toBeDefined();
    });
  });

  describe('search', () => {
    it('should throw SearchError when no providers configured', async () => {
      const aggregator = new SearchAggregator();
      await expect(
        aggregator.search({ query: 'test' })
      ).rejects.toThrow(SearchError);
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
  });
});
