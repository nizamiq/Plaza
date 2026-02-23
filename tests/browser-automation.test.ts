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

  describe('constructor', () => {
    it('should create instance with default options', () => {
      const defaultBrowser = new PlaywrightWrapper();
      expect(defaultBrowser).toBeDefined();
    });

    it('should create instance with custom options', () => {
      const customBrowser = new PlaywrightWrapper({
        headless: false,
        viewport: { width: 1280, height: 720 },
        userAgent: 'CustomBrowser/1.0',
      });
      expect(customBrowser).toBeDefined();
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
  });
});
