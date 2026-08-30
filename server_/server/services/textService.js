/**
 * Text Normalization Service
 * Performs basic, non-destructive text cleaning for extracted PDF page content.
 */

export const cleanExtractedText = (rawText) => {
  if (!rawText || typeof rawText !== 'string') return '';

  return rawText
    // Standardize CRLF to LF
    .replace(/\r\n/g, '\n')
    // Replace non-breaking spaces and tabs with standard space
    .replace(/[\t\f\v]/g, ' ')
    // Replace multiple horizontal spaces with a single space
    .replace(/ {2,}/g, ' ')
    // Remove trailing spaces at line endings
    .replace(/ +\n/g, '\n')
    // Remove leading spaces at line starts
    .replace(/\n +/g, '\n')
    // Compress 3 or more consecutive newlines into 2 (paragraph spacing)
    .replace(/\n{3,}/g, '\n\n')
    // Trim leading/trailing whitespace from full text
    .trim();
};
