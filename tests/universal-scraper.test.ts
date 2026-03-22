import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UniversalScraper } from '../src/universal-scraper/scraper.js';
import { ScraperError } from '../src/shared/errors.js';

/**
 * Universal scraper tests that depend on external HTTP services (httpbin.org)
 * are unreliable in CI. Skip HTTP scraping, error handling, and retry tests
 * when running in CI without explicit opt-in.
 */
const skipExternalTests = process.env.CI === 'true' && !process.env.PLAZA_TEST_EXTERNAL;

describe('UniversalScraper', () => {
  let scraper: UniversalScraper;

  beforeEach(() => {
    scraper = new UniversalScraper();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('URL validation', () => {
    it('should throw ScraperError for invalid URL', async () => {
      await expect(scraper.scrape('not-a-valid-url')).rejects.toThrow(ScraperError);
    });

    it('should throw ScraperError for unsupported protocol', async () => {
      await expect(scraper.scrape('ftp://example.com')).rejects.toThrow(ScraperError);
    });

    it('should throw ScraperError for empty URL', async () => {
      await expect(scraper.scrape('')).rejects.toThrow(ScraperError);
    });

    it('should throw ScraperError for javascript: protocol', async () => {
      await expect(scraper.scrape('javascript:alert(1)')).rejects.toThrow(ScraperError);
    });

    it('should throw ScraperError for data: protocol', async () => {
      await expect(scraper.scrape('data:text/html,<h1>Test</h1>')).rejects.toThrow(ScraperError);
    });
  });

  describe.skipIf(skipExternalTests)('HTTP scraping', () => {
    it('should scrape HTML content from URL', async () => {
      const result = await scraper.scrape('https://httpbin.org/html');
      expect(result).toBeDefined();
      expect(result.url).toBe('https://httpbin.org/html');
      expect(result.content).toBeDefined();
      expect(result.contentType).toContain('text/html');
    });

    it('should extract text content from HTML', async () => {
      const result = await scraper.scrape('https://httpbin.org/html');
      expect(result.parsed).toBeDefined();
      expect(result.parsed!.text).toBeDefined();
      expect(typeof result.parsed!.text).toBe('string');
      expect(result.parsed!.text.length).toBeGreaterThan(0);
    });

    it('should extract title from HTML', async () => {
      const result = await scraper.scrape('https://httpbin.org/html');
      expect(result.parsed).toBeDefined();
      expect(result.parsed!.title).toBeDefined();
    });

    it('should extract links from HTML', async () => {
      const result = await scraper.scrape('https://httpbin.org/html');
      expect(result.parsed).toBeDefined();
      expect(result.parsed!.links).toBeDefined();
      expect(Array.isArray(result.parsed!.links)).toBe(true);
    });

    it('should respect timeout option', async () => {
      const scraperWithTimeout = new UniversalScraper({ timeout: 100 });
      await expect(
        scraperWithTimeout.scrape('https://httpbin.org/delay/5')
      ).rejects.toThrow(ScraperError);
    });

    it('should follow redirects', async () => {
      const result = await scraper.scrape('https://httpbin.org/redirect/1');
      expect(result).toBeDefined();
      expect(result.statusCode).toBe(200);
    });

    it('should handle 404 errors', async () => {
      await expect(
        scraper.scrape('https://httpbin.org/status/404')
      ).rejects.toThrow(ScraperError);
    });

    it('should handle 500 errors', async () => {
      await expect(
        scraper.scrape('https://httpbin.org/status/500')
      ).rejects.toThrow(ScraperError);
    });
  });

  describe('content type handling', () => {
    it('should handle JSON responses', async () => {
      const result = await scraper.scrape('https://httpbin.org/json');
      expect(result).toBeDefined();
      expect(result.contentType).toContain('application/json');
    });

    it('should handle XML responses', async () => {
      const result = await scraper.scrape('https://httpbin.org/xml');
      expect(result).toBeDefined();
      expect(result.contentType).toContain('application/xml');
    });

    it('should handle raw content when requested', async () => {
      const result = await scraper.scrape('https://httpbin.org/html', { raw: true });
      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });
  });

  describe('custom headers', () => {
    it('should send custom User-Agent', async () => {
      const customScraper = new UniversalScraper({
        userAgent: 'TestBot/1.0'
      });
      const result = await customScraper.scrape('https://httpbin.org/user-agent');
      expect(result.content).toContain('TestBot/1.0');
    });

    it('should send custom headers', async () => {
      const customScraper = new UniversalScraper({
        headers: { 'X-Custom-Header': 'test-value' }
      });
      const result = await customScraper.scrape('https://httpbin.org/headers');
      expect(result.content).toContain('X-Custom-Header');
      expect(result.content).toContain('test-value');
    });
  });

  describe.skipIf(skipExternalTests)('retry logic', () => {
    it('should retry on transient failures', async () => {
      // Mock axios to fail once then succeed
      const mockAxios = vi.fn()
        .mockRejectedValueOnce({ response: { status: 503 } })
        .mockResolvedValueOnce({
          data: '<html><body>Test</body></html>',
          headers: { 'content-type': 'text/html' },
          status: 200,
        });
      
      vi.spyOn(scraper as any, 'fetchWithAxios').mockImplementation(mockAxios);
      
      const result = await scraper.scrape('https://example.com');
      expect(result).toBeDefined();
      expect(mockAxios).toHaveBeenCalledTimes(2);
    });
  });

  describe.skipIf(skipExternalTests)('encoding handling', () => {
    it('should handle UTF-8 content', async () => {
      const result = await scraper.scrape('https://httpbin.org/encoding/utf8');
      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });
  });

  describe('metadata extraction', () => {
    it('should extract metadata from HTML', async () => {
      const result = await scraper.scrape('https://httpbin.org/html');
      expect(result.parsed).toBeDefined();
      expect(result.parsed!.metadata).toBeDefined();
      expect(result.timestamp).toBeDefined();
      expect(result.url).toBe('https://httpbin.org/html');
    });

    it('should include status code in result', async () => {
      const result = await scraper.scrape('https://httpbin.org/html');
      expect(result.statusCode).toBe(200);
    });
  });

  describe.skipIf(skipExternalTests)('error handling', () => {
    it('should create ScraperError with correct properties', () => {
      const error = new ScraperError('Test error', 'TEST_CODE', 400, true);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.statusCode).toBe(400);
      expect(error.isRetryable).toBe(true);
    });

    it('should include URL in error context', async () => {
      const testUrl = 'https://httpbin.org/status/404';
      try {
        await scraper.scrape(testUrl);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ScraperError);
        expect((error as ScraperError).message).toContain('404');
      }
    });

    it('should handle network errors', async () => {
      await expect(
        scraper.scrape('https://invalid-domain-that-does-not-exist-12345.com')
      ).rejects.toThrow(ScraperError);
    });

    it('should handle timeout errors', async () => {
      const slowScraper = new UniversalScraper({ timeout: 1 });
      await expect(
        slowScraper.scrape('https://httpbin.org/delay/10')
      ).rejects.toThrow(ScraperError);
    });
  });
});
