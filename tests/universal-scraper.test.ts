import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UniversalScraper } from '../src/universal-scraper/scraper.js';
import { ScraperError } from '../src/shared/errors.js';

describe('UniversalScraper', () => {
  let scraper: UniversalScraper;

  beforeEach(() => {
    scraper = new UniversalScraper();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create instance with default options', () => {
      expect(scraper).toBeDefined();
    });

    it('should create instance with custom options', () => {
      const customScraper = new UniversalScraper({
        timeout: 5000,
        userAgent: 'CustomBot/1.0',
      });
      expect(customScraper).toBeDefined();
    });
  });

  describe('scrape', () => {
    it('should throw ScraperError for invalid URL', async () => {
      await expect(scraper.scrape('not-a-valid-url')).rejects.toThrow(ScraperError);
    });

    it('should throw ScraperError for unsupported protocol', async () => {
      await expect(scraper.scrape('ftp://example.com')).rejects.toThrow(ScraperError);
    });

    it('should throw ScraperError for empty URL', async () => {
      await expect(scraper.scrape('')).rejects.toThrow(ScraperError);
    });
  });

  describe('error handling', () => {
    it('should create ScraperError with correct properties', () => {
      const error = new ScraperError('Test error', 'TEST_CODE', 400, true);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.statusCode).toBe(400);
      expect(error.isRetryable).toBe(true);
    });
  });
});
