import Bottleneck from 'bottleneck';
import type { RateLimitOptions } from './types.js';

export class RateLimiter {
  private limiter: Bottleneck;

  constructor(options: RateLimitOptions = {}) {
    this.limiter = new Bottleneck({
      maxConcurrent: options.maxConcurrent ?? 5,
      minTime: options.minTime ?? 100,
      reservoir: options.reservoir,
      reservoirRefreshAmount: options.reservoirRefreshAmount,
      reservoirRefreshInterval: options.reservoirRefreshInterval,
    });

    this.limiter.on('failed', async (error, jobInfo) => {
      const id = jobInfo.options.id;
      console.warn(`Job ${id} failed: ${error.message}`);
    });
  }

  async schedule<T>(fn: () => Promise<T>): Promise<T> {
    return this.limiter.schedule(fn);
  }

  async scheduleWithKey<T>(key: string, fn: () => Promise<T>): Promise<T> {
    return this.limiter.schedule({ id: key }, fn);
  }

  get queueSize(): number {
    return this.limiter.queued();
  }

  get runningCount(): number {
    // Bottleneck doesn't have a direct running count, return queued count
    return this.limiter.queued();
  }

  async stop(options: { dropWaitingJobs?: boolean } = {}): Promise<void> {
    await this.limiter.stop(options);
  }
}

// Domain-specific rate limiters
export const scraperRateLimiter = new RateLimiter({
  maxConcurrent: 3,
  minTime: 500,
});

export const browserRateLimiter = new RateLimiter({
  maxConcurrent: 2,
  minTime: 1000,
});

export const searchRateLimiter = new RateLimiter({
  maxConcurrent: 5,
  minTime: 200,
  reservoir: 100,
  reservoirRefreshAmount: 100,
  reservoirRefreshInterval: 60 * 1000, // 1 minute
});
