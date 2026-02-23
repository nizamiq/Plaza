import pRetry from 'p-retry';
import type { RetryOptions } from './types.js';

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'onRetry'>> = {
  retries: 3,
  minTimeout: 1000,
  maxTimeout: 30000,
  factor: 2,
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return pRetry(fn, {
    retries: opts.retries,
    minTimeout: opts.minTimeout,
    maxTimeout: opts.maxTimeout,
    factor: opts.factor,
    onFailedAttempt: (error) => {
      opts.onRetry?.(error, error.attemptNumber);
    },
  });
}

export function createRetryable<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  options: RetryOptions = {}
): T {
  return (async (...args: unknown[]) => {
    return withRetry(() => fn(...args), options);
  }) as T;
}
