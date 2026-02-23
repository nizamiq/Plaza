import { describe, it, expect } from 'vitest';
import { HealthChecker } from '../src/health/health-check.js';

describe('HealthChecker', () => {
  describe('constructor', () => {
    it('should create with default version', () => {
      const checker = new HealthChecker();
      expect(checker).toBeDefined();
    });

    it('should create with custom version', () => {
      const checker = new HealthChecker('2.0.0');
      expect(checker).toBeDefined();
    });
  });

  describe('registerCheck', () => {
    it('should register a health check', async () => {
      const checker = new HealthChecker();
      checker.registerCheck('test', async () => ({
        status: 'healthy',
        lastChecked: new Date().toISOString(),
      }));

      const result = await checker.check();
      expect(result.services.test).toBeDefined();
      expect(result.services.test.status).toBe('healthy');
    });
  });

  describe('check', () => {
    it('should return healthy status when all checks pass', async () => {
      const checker = new HealthChecker();
      checker.registerCheck('service1', async () => ({
        status: 'healthy',
        lastChecked: new Date().toISOString(),
      }));

      const result = await checker.check();
      expect(result.status).toBe('healthy');
      expect(result.version).toBe('1.0.0');
      expect(result.timestamp).toBeDefined();
      expect(result.services.service1.status).toBe('healthy');
    });

    it('should return unhealthy when a check fails', async () => {
      const checker = new HealthChecker();
      checker.registerCheck('failing', async () => {
        throw new Error('Service down');
      });

      const result = await checker.check();
      expect(result.status).toBe('unhealthy');
      expect(result.services.failing.status).toBe('unhealthy');
    });

    it('should return degraded when one of multiple checks fails', async () => {
      const checker = new HealthChecker();
      checker.registerCheck('healthy', async () => ({
        status: 'healthy',
        lastChecked: new Date().toISOString(),
      }));
      checker.registerCheck('degraded', async () => ({
        status: 'degraded',
        message: 'Slow response',
        lastChecked: new Date().toISOString(),
      }));

      const result = await checker.check();
      expect(result.status).toBe('degraded');
    });
  });

  describe('checkSimple', () => {
    it('should return simple healthy result', async () => {
      const checker = new HealthChecker();
      checker.registerCheck('test', async () => ({
        status: 'healthy',
        lastChecked: new Date().toISOString(),
      }));

      const result = await checker.checkSimple();
      expect(result.healthy).toBe(true);
      expect(result.message).toBe('Status: healthy');
    });

    it('should return simple unhealthy result', async () => {
      const checker = new HealthChecker();
      checker.registerCheck('failing', async () => {
        throw new Error('Service down');
      });

      const result = await checker.checkSimple();
      expect(result.healthy).toBe(false);
    });
  });
});
