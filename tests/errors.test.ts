import { describe, it, expect } from 'vitest';
import {
  PlazaError,
  ScraperError,
  BrowserError,
  SearchError,
  RateLimitError,
  ValidationError,
} from '../src/shared/errors.js';

describe('Error Classes', () => {
  describe('PlazaError', () => {
    it('should create base error', () => {
      const error = new PlazaError('Base error', 'BASE_ERROR', 500, true);
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(PlazaError);
      expect(error.message).toBe('Base error');
      expect(error.code).toBe('BASE_ERROR');
      expect(error.statusCode).toBe(500);
      expect(error.isRetryable).toBe(true);
    });
  });

  describe('ScraperError', () => {
    it('should create scraper error with defaults', () => {
      const error = new ScraperError('Scraper failed');
      expect(error).toBeInstanceOf(PlazaError);
      expect(error).toBeInstanceOf(ScraperError);
      expect(error.code).toBe('SCRAPER_ERROR');
    });
  });

  describe('BrowserError', () => {
    it('should create browser error with defaults', () => {
      const error = new BrowserError('Browser failed');
      expect(error).toBeInstanceOf(PlazaError);
      expect(error).toBeInstanceOf(BrowserError);
      expect(error.code).toBe('BROWSER_ERROR');
    });
  });

  describe('SearchError', () => {
    it('should create search error with defaults', () => {
      const error = new SearchError('Search failed');
      expect(error).toBeInstanceOf(PlazaError);
      expect(error).toBeInstanceOf(SearchError);
      expect(error.code).toBe('SEARCH_ERROR');
    });
  });

  describe('RateLimitError', () => {
    it('should create rate limit error with default message', () => {
      const error = new RateLimitError();
      expect(error).toBeInstanceOf(PlazaError);
      expect(error).toBeInstanceOf(RateLimitError);
      expect(error.code).toBe('RATE_LIMIT_ERROR');
      expect(error.statusCode).toBe(429);
      expect(error.isRetryable).toBe(true);
    });

    it('should create rate limit error with retry after', () => {
      const error = new RateLimitError('Too many requests', 60);
      expect(error.retryAfter).toBe(60);
    });
  });

  describe('ValidationError', () => {
    it('should create validation error', () => {
      const error = new ValidationError('Invalid input');
      expect(error).toBeInstanceOf(PlazaError);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.isRetryable).toBe(false);
    });
  });
});
