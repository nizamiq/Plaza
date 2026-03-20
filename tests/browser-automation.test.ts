import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PlaywrightWrapper } from '../src/browser-automation/playwright-wrapper.js';
import { BrowserError } from '../src/shared/errors.js';

describe('PlaywrightWrapper', () => {
  let browser: PlaywrightWrapper;

  beforeEach(() => {
    browser = new PlaywrightWrapper({ headless: true });
  });

  afterEach(async () => {
    try {
      await browser.close();
    } catch {
      // Ignore cleanup errors
    }
    vi.restoreAllMocks();
  });

  describe('navigation', () => {
    it('should navigate to a URL and return page content', async () => {
      const page = await browser.navigate('https://httpbin.org/html');
      expect(page).toBeDefined();
      expect(page?.content).toBeDefined();
      expect(page?.title).toBeDefined();
    });

    it('should handle navigation errors gracefully', async () => {
      await expect(
        browser.navigate('https://invalid-domain-that-does-not-exist.com')
      ).rejects.toThrow(BrowserError);
    });

    it('should respect timeout option', async () => {
      await expect(
        browser.navigate('https://httpbin.org/delay/10', { timeout: 1000 })
      ).rejects.toThrow(BrowserError);
    });
  });

  describe('content extraction', () => {
    it('should extract page content as text', async () => {
      await browser.navigate('https://httpbin.org/html');
      const content = await browser.getContent();
      expect(content).toBeDefined();
      expect(typeof content).toBe('string');
      expect(content.length).toBeGreaterThan(0);
    });

    it('should extract page title', async () => {
      await browser.navigate('https://httpbin.org/html');
      const title = await browser.getTitle();
      expect(title).toBeDefined();
      expect(typeof title).toBe('string');
    });
  });

  describe('screenshot functionality', () => {
    it('should capture screenshot as PNG', async () => {
      await browser.navigate('https://httpbin.org/html');
      const screenshot = await browser.screenshot({ type: 'png' });
      expect(screenshot).toBeDefined();
      expect(Buffer.isBuffer(screenshot)).toBe(true);
      expect(screenshot.length).toBeGreaterThan(0);
    });

    it('should capture screenshot as JPEG', async () => {
      await browser.navigate('https://httpbin.org/html');
      const screenshot = await browser.screenshot({ type: 'jpeg' });
      expect(screenshot).toBeDefined();
      expect(Buffer.isBuffer(screenshot)).toBe(true);
    });

    it('should capture full page screenshot', async () => {
      await browser.navigate('https://httpbin.org/html');
      const screenshot = await browser.screenshot({ fullPage: true });
      expect(screenshot).toBeDefined();
      expect(Buffer.isBuffer(screenshot)).toBe(true);
    });
  });

  describe('PDF generation', () => {
    it('should generate PDF from page', async () => {
      await browser.navigate('https://httpbin.org/html');
      const pdf = await browser.pdf();
      expect(pdf).toBeDefined();
      expect(Buffer.isBuffer(pdf)).toBe(true);
      expect(pdf.length).toBeGreaterThan(0);
      // PDF files start with %PDF
      expect(pdf.toString('ascii', 0, 4)).toBe('%PDF');
    });
  });

  describe('element interaction', () => {
    it('should click on element by selector', async () => {
      await browser.navigate('https://httpbin.org/forms/post');
      // Should not throw
      await expect(browser.click('input[type="submit"]')).resolves.not.toThrow();
    });

    it('should type text into input field', async () => {
      await browser.navigate('https://httpbin.org/forms/post');
      await expect(
        browser.type('input[name="custname"]', 'Test User')
      ).resolves.not.toThrow();
    });

    it('should throw for non-existent element', async () => {
      await browser.navigate('https://httpbin.org/html');
      await expect(
        browser.click('#non-existent-element-12345')
      ).rejects.toThrow(BrowserError);
    });
  });

  describe('session management', () => {
    it('should maintain session across navigations', async () => {
      const sessionId = 'test-session-1';
      const page1 = await browser.navigate('https://httpbin.org/cookies/set/testkey/testvalue', { sessionId });
      expect(page1).toBeDefined();
      
      // Navigate again with same session
      const page2 = await browser.navigate('https://httpbin.org/cookies', { sessionId });
      expect(page2).toBeDefined();
      expect(page2.content).toContain('testkey');
    });

    it('should isolate sessions', async () => {
      const session1 = 'session-1';
      const session2 = 'session-2';
      
      await browser.navigate('https://httpbin.org/cookies/set/key1/value1', { sessionId: session1 });
      await browser.navigate('https://httpbin.org/cookies/set/key2/value2', { sessionId: session2 });
      
      const page1 = await browser.navigate('https://httpbin.org/cookies', { sessionId: session1 });
      const page2 = await browser.navigate('https://httpbin.org/cookies', { sessionId: session2 });
      
      expect(page1.content).toContain('key1');
      expect(page2.content).toContain('key2');
    });
  });

  describe('error handling', () => {
    it('should create BrowserError with correct properties', () => {
      const error = new BrowserError('Test error', 'TEST_CODE', 500, true);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.statusCode).toBe(500);
      expect(error.isRetryable).toBe(true);
    });

    it('should handle network errors', async () => {
      await expect(
        browser.navigate('http://localhost:99999')
      ).rejects.toThrow(BrowserError);
    });

    it('should handle page load failures', async () => {
      await expect(
        browser.navigate('https://httpbin.org/status/500')
      ).rejects.toThrow();
    });
  });
});
