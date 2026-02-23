import { chromium, firefox, webkit, type Browser, type Page, type BrowserContext } from 'playwright';
import type {
  BrowserOptions,
  PageOptions,
  ScreenshotOptions,
  PdfOptions,
  BrowserSession,
  InteractionResult,
} from './types.js';
import { BrowserError } from '../shared/errors.js';
import { browserRateLimiter } from '../shared/rate-limiter.js';
import { withRetry } from '../shared/retry.js';

export class PlaywrightWrapper {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private sessions: Map<string, Page> = new Map();
  private options: Required<BrowserOptions>;

  constructor(options: BrowserOptions = {}) {
    this.options = {
      headless: options.headless ?? true,
      viewport: options.viewport ?? { width: 1920, height: 1080 },
      userAgent:
        options.userAgent ??
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      proxy: options.proxy ?? '',
      extraHeaders: options.extraHeaders ?? {},
      timeout: options.timeout ?? 30000,
      antiDetection: options.antiDetection ?? true,
    };
  }

  async init(): Promise<void> {
    await browserRateLimiter.schedule(async () => {
      try {
        this.browser = await chromium.launch({
          headless: this.options.headless,
          args: this.getLaunchArgs(),
        });

        this.context = await this.browser.newContext({
          viewport: this.options.viewport,
          userAgent: this.options.userAgent,
          extraHTTPHeaders: this.options.extraHeaders,
          proxy: this.options.proxy
            ? { server: this.options.proxy }
            : undefined,
        });

        if (this.options.antiDetection) {
          await this.applyAntiDetection();
        }
      } catch (error) {
        throw new BrowserError(
          `Failed to initialize browser: ${(error as Error).message}`,
          'BROWSER_INIT_ERROR',
          500
        );
      }
    });
  }

  private getLaunchArgs(): string[] {
    return [
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-blink-features=AutomationControlled',
    ];
  }

  private async applyAntiDetection(): Promise<void> {
    if (!this.context) return;

    // Override navigator.webdriver
    await this.context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      Object.defineProperty(navigator, 'plugins', {
        get: () => [
          { name: 'Chrome PDF Plugin' },
          { name: 'Chrome PDF Viewer' },
          { name: 'Native Client' },
        ],
      });

      // Override permissions
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters: PermissionDescriptor) =>
        parameters.name === 'notifications'
          ? Promise.resolve({ state: Notification.permission } as PermissionStatus)
          : originalQuery(parameters);
    });
  }

  async newPage(url?: string, options: PageOptions = {}): Promise<string> {
    if (!this.context) {
      throw new BrowserError('Browser not initialized', 'BROWSER_NOT_INITIALIZED', 500);
    }

    return browserRateLimiter.schedule(async () => {
      try {
        const page = await this.context!.newPage();
        const sessionId = this.generateSessionId();

        if (url) {
          await this.navigate(sessionId, url, options);
        }

        this.sessions.set(sessionId, page);
        return sessionId;
      } catch (error) {
        throw new BrowserError(
          `Failed to create new page: ${(error as Error).message}`,
          'PAGE_CREATE_ERROR',
          500
        );
      }
    });
  }

  async navigate(sessionId: string, url: string, options: PageOptions = {}): Promise<void> {
    const page = this.getPage(sessionId);

    await withRetry(
      async () => {
        const navigationOptions: Parameters<Page['goto']>[1] = {
          timeout: options.timeout ?? this.options.timeout,
          waitUntil: options.waitForNetworkIdle ? 'networkidle' : 'load',
        };

        const response = await page.goto(url, navigationOptions);

        if (!response) {
          throw new BrowserError('Navigation failed: no response', 'NAVIGATION_ERROR', 500, true);
        }

        if (response.status() >= 400) {
          throw new BrowserError(
            `HTTP ${response.status()} for ${url}`,
            'HTTP_ERROR',
            response.status(),
            response.status() >= 500
          );
        }

        if (options.waitForSelector) {
          await page.waitForSelector(options.waitForSelector, {
            timeout: options.timeout ?? this.options.timeout,
          });
        }

        if (options.waitForText) {
          await page.waitForFunction(
            (text) => document.body.innerText.includes(text),
            options.waitForText,
            { timeout: options.timeout ?? this.options.timeout }
          );
        }
      },
      { retries: 2, minTimeout: 1000 }
    );
  }

  async click(sessionId: string, selector: string): Promise<InteractionResult> {
    const page = this.getPage(sessionId);

    try {
      await page.click(selector);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: `Failed to click ${selector}: ${(error as Error).message}`,
      };
    }
  }

  async type(sessionId: string, selector: string, text: string): Promise<InteractionResult> {
    const page = this.getPage(sessionId);

    try {
      await page.fill(selector, text);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: `Failed to type into ${selector}: ${(error as Error).message}`,
      };
    }
  }

  async press(sessionId: string, key: string): Promise<InteractionResult> {
    const page = this.getPage(sessionId);

    try {
      await page.keyboard.press(key);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: `Failed to press key ${key}: ${(error as Error).message}`,
      };
    }
  }

  async scroll(sessionId: string, x: number, y: number): Promise<void> {
    const page = this.getPage(sessionId);
    await page.evaluate(({ x, y }) => window.scrollTo(x, y), { x, y });
  }

  async getContent(sessionId: string): Promise<string> {
    const page = this.getPage(sessionId);
    return page.content();
  }

  async getText(sessionId: string): Promise<string> {
    const page = this.getPage(sessionId);
    return page.evaluate(() => document.body.innerText);
  }

  async screenshot(
    sessionId: string,
    options: ScreenshotOptions = {}
  ): Promise<Buffer | string> {
    const page = this.getPage(sessionId);

    const screenshotOptions: Parameters<Page['screenshot']>[0] = {
      type: options.type ?? 'png',
      fullPage: options.fullPage ?? false,
    };

    if (options.quality && options.type === 'jpeg') {
      (screenshotOptions as Record<string, unknown>).quality = options.quality;
    }

    if (options.clip) {
      (screenshotOptions as Record<string, unknown>).clip = options.clip;
    }

    if (options.selector) {
      const element = await page.$(options.selector);
      if (!element) {
        throw new BrowserError(
          `Element not found: ${options.selector}`,
          'ELEMENT_NOT_FOUND',
          404
        );
      }
      return element.screenshot(screenshotOptions);
    }

    return page.screenshot(screenshotOptions);
  }

  async pdf(sessionId: string, options: PdfOptions = {}): Promise<Buffer> {
    const page = this.getPage(sessionId);

    const pdfOptions: Parameters<Page['pdf']>[0] = {
      displayHeaderFooter: options.displayHeaderFooter ?? false,
      printBackground: options.printBackground ?? true,
      format: options.format ?? 'A4',
      landscape: options.landscape ?? false,
    };

    if (options.headerTemplate) {
      pdfOptions.headerTemplate = options.headerTemplate;
    }

    if (options.footerTemplate) {
      pdfOptions.footerTemplate = options.footerTemplate;
    }

    return page.pdf(pdfOptions);
  }

  async closePage(sessionId: string): Promise<void> {
    const page = this.sessions.get(sessionId);
    if (page) {
      await page.close();
      this.sessions.delete(sessionId);
    }
  }

  async getSessions(): Promise<BrowserSession[]> {
    const sessions: BrowserSession[] = [];

    for (const [id, page] of this.sessions) {
      const url = page.url();
      const title = await page.title().catch(() => 'Unknown');
      sessions.push({
        id,
        url,
        title,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
      });
    }

    return sessions;
  }

  async close(): Promise<void> {
    for (const [sessionId] of this.sessions) {
      await this.closePage(sessionId);
    }

    await this.context?.close();
    await this.browser?.close();

    this.context = null;
    this.browser = null;
  }

  private getPage(sessionId: string): Page {
    const page = this.sessions.get(sessionId);
    if (!page) {
      throw new BrowserError(`Session not found: ${sessionId}`, 'SESSION_NOT_FOUND', 404);
    }
    return page;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const browser = new PlaywrightWrapper();
