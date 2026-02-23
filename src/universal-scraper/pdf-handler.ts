import { ScraperError } from '../shared/errors.js';
import type { PdfContent } from './types.js';

// pdf-parse is imported dynamically to handle potential issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pdfParse: any = null;

async function getPdfParse(): Promise<any> {
  if (!pdfParse) {
    const module = await import('pdf-parse');
    pdfParse = module.default || module;
  }
  return pdfParse;
}

export async function extractPdfContent(data: Buffer): Promise<PdfContent> {
  try {
    const pdfParseLib = await getPdfParse();
    const result = await pdfParseLib(data);

    return {
      text: result.text || '',
      numPages: result.numpages || 0,
      info: result.info || {},
      metadata: {},
    };
  } catch (error) {
    throw new ScraperError(
      `Failed to parse PDF: ${(error as Error).message}`,
      'PDF_PARSE_ERROR',
      422
    );
  }
}

export function isPdfUrl(url: string): boolean {
  return url.toLowerCase().endsWith('.pdf') || url.toLowerCase().includes('.pdf?');
}

export function isPdfContentType(contentType: string): boolean {
  return contentType.toLowerCase().includes('application/pdf');
}
