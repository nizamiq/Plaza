import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Plaza } from '../src/index.js';

describe('Plaza Integration', () => {
  let plaza: Plaza;

  beforeAll(async () => {
    plaza = new Plaza({
      scraperOptions: { timeout: 10000 },
      browserOptions: { headless: true },
    });
    await plaza.init();
  });

  afterAll(async () => {
    await plaza.close();
  });

  describe('health check', () => {
    it('should return health status', async () => {
      const health = await plaza.healthCheck();
      expect(health).toBeDefined();
      expect(health.status).toBeDefined();
      expect(health.timestamp).toBeDefined();
      expect(health.version).toBe('0.1.0');
      expect(health.services).toBeDefined();
    });

    it('should include scraper in health check', async () => {
      const health = await plaza.healthCheck();
      expect(health.services.scraper).toBeDefined();
    });

    it('should include browser in health check', async () => {
      const health = await plaza.healthCheck();
      expect(health.services.browser).toBeDefined();
    });
  });

  describe('scraper', () => {
    it('should have scraper instance', () => {
      expect(plaza.scraper).toBeDefined();
    });
  });

  describe('browser', () => {
    it('should have browser instance', () => {
      expect(plaza.browser).toBeDefined();
    });
  });
});
