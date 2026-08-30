import fs from 'fs';
import { PDFParse } from 'pdf-parse';
import { cleanExtractedText } from './textService.js';

/**
 * Extract text from PDF file page-by-page preserving 1-based page numbers.
 * 
 * @param {string} filePath - Absolute or relative path to PDF file
 * @returns {Promise<Array<{pageNumber: number, text: string, characterCount: number}>>}
 */
export const extractPdfText = async (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`PDF file not found at path: ${filePath}`);
  }

  const dataBuffer = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: dataBuffer });

  try {
    const parsed = await parser.getText();

    const pageTexts = (parsed.pages || []).map((page) => {
      const cleaned = cleanExtractedText(page.text || '');
      return {
        pageNumber: page.num,
        text: cleaned,
        characterCount: cleaned.length
      };
    });

    // Ensure pageTexts are sorted by pageNumber ascending
    pageTexts.sort((a, b) => a.pageNumber - b.pageNumber);

    console.log(`[PDF] Pages detected: ${parsed.total || pageTexts.length}`);

    return pageTexts;
  } finally {
    await parser.destroy();
  }
};

