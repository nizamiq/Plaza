import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PlaywrightWrapper } from '../src/browser-automation/playwright-wrapper.js';
import { BrowserError } from '../src/shared/errors.js';

describe('PlaywrightWrapper', () => {
  let browser: PlaywrightWrapper;

  beforeEach(async () => {
    browser = new PlaywrightWrapper({ headless: true });
    await browser.init();
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
    it('should navigate to a URL', async () => {
      const sessionId = await browser.newPage();
      await expect(
        browser.navigate(sessionId, 'https://httpbin.org/html')
      ).resolves.not.toThrow();
    });

    it('should handle navigation errors gracefully', async () => {
      const sessionId = await browser.newPage();
      await expect(
        browser.navigate(sessionId, 'https://invalid-domain-that-does-not-exist.com')
      ).rejects.toThrow(BrowserError);
    });

    it('should respect timeout option', async () => {
      const sessionId = await browser.newPage();
      await expect(
        browser.navigate(sessionId, 'https://httpbin.org/delay/10', { timeout: 1000 })
      ).rejects.toThrow(BrowserError);
    });
  });

  describe('content extraction', () => {
    it('should extract page content as text', async () => {
      const sessionId = await browser.newPage('https://httpbin.org/html');
      const content = await browser.getContent(sessionId);
      expect(content).toBeDefined();
      expect(typeof content).toBe('string');
      expect(content.length).toBeGreaterThan(0);
    });

    it('should extract page text content', async () => {
      const sessionId = await browser.newPage('https://httpbin.org/html');
      const text = await browser.getText(sessionId);
      expect(text).toBeDefined();
      expect(typeof text).toBe('string');
    });
  });

  describe('screenshot functionality', () => {
    it('should capture screenshot as PNG', async () => {
      const sessionId = await browser.newPage('https://httpbin.org/html');
      const screenshot = await browser.screenshot(sessionId, { type: 'png' });
      expect(screenshot).toBeDefined();
      expect(Buffer.isBuffer(screenshot)).toBe(true);
      expect(screenshot.length).toBeGreaterThan(0);
    });

    it('should capture screenshot as JPEG', async () => {
      const sessionId = await browser.newPage('https://httpbin.org/html');
      const screenshot = await browser.screenshot(sessionId, { type: 'jpeg' });
      expect(screenshot).toBeDefined();
      expect(Buffer.isBuffer(screenshot)).toBe(true);
    });

    it('should capture full page screenshot', async () => {
      const sessionId = await browser.newPage('https://httpbin.org/html');
      const screenshot = await browser.screenshot(sessionId, { fullPage: true });
      expect(screenshot).toBeDefined();
      expect(Buffer.isBuffer(screenshot)).toBe(true);
    });
  });

  describe('PDF generation', () => {
    it('should generate PDF from page', async () => {
      const sessionId = await browser.newPage('https://httpbin.org/html');
      const pdf = await browser.pdf(sessionId);
      expect(pdf).toBeDefined();
      expect(Buffer.isBuffer(pdf)).toBe(true);
      expect(pdf.length).toBeGreaterThan(0);
      // PDF files start with %PDF
      expect(pdf.toString('ascii', 0, 4)).toBe('%PDF');
    });
  });

  describe('element interaction', () => {
    it('should click on element by selector', async () => {
      const sessionId = await browser.newPage('https://httpbin.org/forms/post');
      const result = await browser.click(sessionId, 'input[type="submit"]');
      expect(result.success).toBe(true);
    });

    it('should type text into input field', async () => {
      const sessionId = await browser.newPage('https://httpbin.org/forms/post');
      const result = await browser.type(sessionId, 'input[name="custname"]', 'Test User');
      expect(result.success).toBe(true);
    });

    it('should throw for non-existent element', async () => {
      const sessionId = await browser.newPage('https://httpbin.org/html');
      const result = await browser.click(sessionId, '#non-existent-element-12345');
      expect(result.success).toBe(false);
    });
  });

  describe('session management', () => {
    it('should create new page and return session ID', async () => {
      const sessionId = await browser.newPage();
      expect(sessionId).toBeDefined();
      expect(typeof sessionId).toBe('string');
      expect(sessionId.startsWith('session_')).toBe(true);
    });

    it('should track multiple sessions', async () => {
      const sessionId1 = await browser.newPage('https://httpbin.org/html');
      const sessionId2 = await browser.newPage('https://httpbin.org/html');
      
      const sessions = await browser.getSessions();
      expect(sessions.length).toBeGreaterThanOrEqual(2);
    });

    it('should close specific page', async () => {
      const sessionId = await browser.newPage('https://httpbin.org/html');
      await expect(browser.closePage(sessionId)).resolves.not.toThrow();
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
      const sessionId = await browser.newPage();
      await expect(
        browser.navigate(sessionId, 'http://localhost:99999')
      ).rejects.toThrow(BrowserError);
    });

    it('should handle page load failures', async () => {
      const sessionId = await browser.newPage();
      await expect(
        browser.navigate(sessionId, 'https://httpbin.org/status/500')
      ).rejects.toThrow();
    });

    it('should throw for invalid session ID', async () => {
      await expect(
        browser.navigate('invalid-session-id', 'https://httpbin.org/html')
      ).rejects.toThrow(BrowserError);
    });
  });
});
