export class PlazaError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly isRetryable: boolean = false
  ) {
    super(message);
    this.name = 'PlazaError';
    Object.setPrototypeOf(this, PlazaError.prototype);
  }
}

export class ScraperError extends PlazaError {
  constructor(
    message: string,
    code: string = 'SCRAPER_ERROR',
    statusCode: number = 500,
    isRetryable: boolean = false
  ) {
    super(message, code, statusCode, isRetryable);
    this.name = 'ScraperError';
    Object.setPrototypeOf(this, ScraperError.prototype);
  }
}

export class BrowserError extends PlazaError {
  constructor(
    message: string,
    code: string = 'BROWSER_ERROR',
    statusCode: number = 500,
    isRetryable: boolean = false
  ) {
    super(message, code, statusCode, isRetryable);
    this.name = 'BrowserError';
    Object.setPrototypeOf(this, BrowserError.prototype);
  }
}

export class SearchError extends PlazaError {
  constructor(
    message: string,
    code: string = 'SEARCH_ERROR',
    statusCode: number = 500,
    isRetryable: boolean = false
  ) {
    super(message, code, statusCode, isRetryable);
    this.name = 'SearchError';
    Object.setPrototypeOf(this, SearchError.prototype);
  }
}

export class RateLimitError extends PlazaError {
  constructor(
    message: string = 'Rate limit exceeded',
    retryAfter?: number
  ) {
    super(message, 'RATE_LIMIT_ERROR', 429, true);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }

  retryAfter?: number;
}

export class ValidationError extends PlazaError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400, false);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
