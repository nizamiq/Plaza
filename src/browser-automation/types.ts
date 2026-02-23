export interface BrowserOptions {
  /** Run browser in headless mode */
  headless?: boolean;
  /** Browser viewport dimensions */
  viewport?: { width: number; height: number };
  /** Custom user agent */
  userAgent?: string;
  /** Proxy server URL */
  proxy?: string;
  /** Extra HTTP headers */
  extraHeaders?: Record<string, string>;
  /** Timeout for navigation in milliseconds */
  timeout?: number;
  /** Enable anti-detection measures */
  antiDetection?: boolean;
}

export interface PageOptions {
  /** Wait for specific selector */
  waitForSelector?: string;
  /** Wait for specific text */
  waitForText?: string;
  /** Wait for navigation to complete */
  waitForNavigation?: boolean;
  /** Wait for network idle */
  waitForNetworkIdle?: boolean;
  /** Additional timeout for page operations */
  timeout?: number;
}

export interface ScreenshotOptions {
  /** Screenshot type */
  type?: 'png' | 'jpeg';
  /** Image quality (0-100, only for jpeg) */
  quality?: number;
  /** Full page screenshot */
  fullPage?: boolean;
  /** Specific clip region */
  clip?: { x: number; y: number; width: number; height: number };
  /** CSS selector to screenshot */
  selector?: string;
  /** Encoding type */
  encoding?: 'binary' | 'base64';
}

export interface PdfOptions {
  /** Display header and footer */
  displayHeaderFooter?: boolean;
  /** HTML template for header */
  headerTemplate?: string;
  /** HTML template for footer */
  footerTemplate?: string;
  /** Print background graphics */
  printBackground?: boolean;
  /** Paper format */
  format?: 'A0' | 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6' | 'Legal' | 'Letter' | 'Tabloid';
  /** Paper orientation */
  landscape?: boolean;
  /** CSS selector to print */
  selector?: string;
}

export interface BrowserSession {
  id: string;
  url: string;
  title: string;
  createdAt: string;
  lastActivity: string;
}

export interface InteractionResult {
  success: boolean;
  message?: string;
  data?: unknown;
}
