export interface ScraperOptions {
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Custom headers to include in the request */
  headers?: Record<string, string>;
  /** Follow redirects */
  followRedirects?: boolean;
  /** Maximum number of redirects to follow */
  maxRedirects?: number;
  /** User agent string */
  userAgent?: string;
  /** Proxy URL */
  proxy?: string;
  /** Whether to return raw response or parsed content */
  raw?: boolean;
}

export interface ScrapedContent {
  /** The URL that was scraped */
  url: string;
  /** The final URL after redirects */
  finalUrl: string;
  /** HTTP status code */
  statusCode: number;
  /** Response headers */
  headers: Record<string, string>;
  /** Content type */
  contentType: string;
  /** Scraped content */
  content: string;
  /** Title of the page (if HTML) */
  title?: string;
  /** Meta description (if HTML) */
  description?: string;
  /** Parsed metadata from the page */
  metadata?: Record<string, string>;
  /** Timestamp of the scrape */
  timestamp: string;
}

export interface ParsedHtml {
  title: string | null;
  description: string | null;
  text: string;
  links: Array<{ href: string; text: string }>;
  images: Array<{ src: string; alt: string }>;
  metadata: Record<string, string>;
}

export interface PdfContent {
  text: string;
  numPages: number;
  info: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

export type ScraperResult = ScrapedContent & {
  parsed?: ParsedHtml;
  pdfContent?: PdfContent;
};
