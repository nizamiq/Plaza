import axios, { type AxiosResponse } from 'axios';
import * as cheerio from 'cheerio';
import type { ScraperOptions, ScrapedContent, ParsedHtml, ScraperResult } from './types.js';
import { ScraperError } from '../shared/errors.js';
import { withRetry } from '../shared/retry.js';
import { scraperRateLimiter } from '../shared/rate-limiter.js';
import { extractPdfContent } from './pdf-handler.js';

const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export class UniversalScraper {
  private defaultOptions: Required<ScraperOptions>;

  constructor(options: ScraperOptions = {}) {
    this.defaultOptions = {
      timeout: options.timeout ?? 30000,
      headers: options.headers ?? {},
      followRedirects: options.followRedirects ?? true,
      maxRedirects: options.maxRedirects ?? 5,
      userAgent: options.userAgent ?? DEFAULT_USER_AGENT,
      proxy: options.proxy ?? '',
      raw: options.raw ?? false,
    };
  }

  async scrape(url: string, options: ScraperOptions = {}): Promise<ScraperResult> {
    return scraperRateLimiter.schedule(() => this._scrape(url, options));
  }

  private async _scrape(url: string, options: ScraperOptions): Promise<ScraperResult> {
    const opts = { ...this.defaultOptions, ...options };

    // Validate URL
    let validatedUrl: URL;
    try {
      validatedUrl = new URL(url);
      if (!['http:', 'https:'].includes(validatedUrl.protocol)) {
        throw new ScraperError(`Invalid protocol: ${validatedUrl.protocol}`, 'INVALID_PROTOCOL', 400);
      }
    } catch (error) {
      if (error instanceof ScraperError) throw error;
      throw new ScraperError(`Invalid URL: ${url}`, 'INVALID_URL', 400);
    }

    try {
      const response = await withRetry(
        () => this.fetchWithAxios(validatedUrl.toString(), opts),
        {
          retries: 3,
          minTimeout: 1000,
          onRetry: (error, attempt) => {
            console.warn(`Retry ${attempt} for ${url}: ${error.message}`);
          },
        }
      );

      const contentType = response.headers['content-type'] || 'application/octet-stream';
      const scrapedContent = this.buildScrapedContent(validatedUrl.toString(), response, contentType);

      // Handle PDF content
      if (contentType.includes('application/pdf')) {
        const pdfContent = await extractPdfContent(response.data);
        return { ...scrapedContent, pdfContent };
      }

      // Handle HTML content
      if (contentType.includes('text/html')) {
        const parsed = this.parseHtml(response.data);
        return { ...scrapedContent, parsed };
      }

      return scrapedContent;
    } catch (error) {
      if (error instanceof ScraperError) throw error;

      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new ScraperError(
            `Request timeout for ${url}`,
            'TIMEOUT',
            408,
            true
          );
        }
        if (error.response) {
          throw new ScraperError(
            `HTTP ${error.response.status} for ${url}`,
            'HTTP_ERROR',
            error.response.status,
            error.response.status >= 500
          );
        }
        throw new ScraperError(
          `Network error for ${url}: ${error.message}`,
          'NETWORK_ERROR',
          503,
          true
        );
      }

      throw new ScraperError(
        `Unexpected error scraping ${url}: ${(error as Error).message}`,
        'UNKNOWN_ERROR',
        500
      );
    }
  }

  private async fetchWithAxios(url: string, opts: Required<ScraperOptions>): Promise<AxiosResponse> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const axiosConfig: any = {
      url,
      method: 'GET',
      timeout: opts.timeout,
      headers: {
        'User-Agent': opts.userAgent,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        Connection: 'keep-alive',
        ...opts.headers,
      },
      maxRedirects: opts.maxRedirects,
      responseType: 'arraybuffer',
      validateStatus: (status: number) => status < 400,
    };

    if (opts.proxy) {
      axiosConfig.proxy = {
        host: new URL(opts.proxy).hostname,
        port: parseInt(new URL(opts.proxy).port, 10),
        protocol: new URL(opts.proxy).protocol.slice(0, -1),
      };
    }

    return axios(axiosConfig);
  }

  private buildScrapedContent(
    url: string,
    response: AxiosResponse,
    contentType: string
  ): ScrapedContent {
    const encoding = this.detectEncoding(response.headers, response.data);
    const content = Buffer.isBuffer(response.data)
      ? response.data.toString(encoding as BufferEncoding)
      : String(response.data);

    return {
      url,
      finalUrl: response.request?.res?.responseUrl || url,
      statusCode: response.status,
      headers: Object.fromEntries(
        Object.entries(response.headers).map(([k, v]) => [
          k,
          Array.isArray(v) ? v.join(', ') : String(v),
        ])
      ),
      contentType: contentType.split(';')[0].trim(),
      content,
      timestamp: new Date().toISOString(),
    };
  }

  private detectEncoding(headers: Record<string, unknown>, data: Buffer): string {
    // Check Content-Type header
    const contentType = String(headers['content-type'] || '');
    const charsetMatch = contentType.match(/charset=([^;]+)/i);
    if (charsetMatch) {
      return charsetMatch[1].trim();
    }

    // Check meta tag in HTML
    if (data.length > 0) {
      const sample = data.slice(0, 1024).toString('utf-8');
      const metaCharsetMatch = sample.match(/<meta[^>]*charset=["']?([^"';\s>]+)/i);
      if (metaCharsetMatch) {
        return metaCharsetMatch[1].trim();
      }
    }

    return 'utf-8';
  }

  private parseHtml(html: string): ParsedHtml {
    const $ = cheerio.load(html);

    // Extract title
    const title = $('title').text().trim() || null;

    // Extract meta description
    const description =
      $('meta[name="description"]').attr('content') ||
      $('meta[property="og:description"]').attr('content') ||
      null;

    // Extract main text content
    // Remove script and style elements
    $('script, style, nav, footer, header').remove();
    const text = $('body').text().replace(/\s+/g, ' ').trim();

    // Extract links
    const links: Array<{ href: string; text: string }> = [];
    $('a[href]').each((_, elem) => {
      const href = $(elem).attr('href');
      const linkText = $(elem).text().trim();
      if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
        links.push({ href, text: linkText });
      }
    });

    // Extract images
    const images: Array<{ src: string; alt: string }> = [];
    $('img[src]').each((_, elem) => {
      const src = $(elem).attr('src');
      const alt = $(elem).attr('alt') || '';
      if (src) {
        images.push({ src, alt });
      }
    });

    // Extract metadata
    const metadata: Record<string, string> = {};
    $('meta[property^="og:"], meta[name^="twitter:"]').each((_, elem) => {
      const property = $(elem).attr('property') || $(elem).attr('name');
      const content = $(elem).attr('content');
      if (property && content) {
        metadata[property] = content;
      }
    });

    return { title, description, text, links, images, metadata };
  }
}

// Export singleton instance
export const scraper = new UniversalScraper();
