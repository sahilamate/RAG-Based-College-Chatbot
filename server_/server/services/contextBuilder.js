/**
 * Context Builder Service
 * Formats retrieved DocumentChunks into a clean, structured RAG context string
 * for LLM interpretation without modifying or rewriting original source text.
 */

export const getContextBuilderConfig = () => {
  return {
    maxChars: parseInt(process.env.RAG_CONTEXT_MAX_CHARS, 10) || 12000,
    maxTokens: parseInt(process.env.RAG_MAX_CONTEXT_TOKENS, 10) || 3000
  };
};

/**
 * Check if a new chunk text is heavily duplicated in an existing list of text chunks.
 */
const isDuplicateText = (newText, existingTexts) => {
  const normNew = newText.toLowerCase().trim();
  for (const text of existingTexts) {
    const normExisting = text.toLowerCase().trim();
    if (normExisting.includes(normNew) || normNew.includes(normExisting)) {
      return true;
    }
  }
  return false;
};

/**
 * Helper to extract accurate section name from chunk text or sectionTitle metadata
 */
export const getAccurateSectionName = (chunk) => {
  if (chunk.sectionTitle && chunk.sectionTitle !== 'General Policy') {
    return chunk.sectionTitle;
  }
  if (chunk.text && typeof chunk.text === 'string') {
    const match = chunk.text.match(/SECTION:\s*([^\n]+)/i);
    if (match && match[1].trim() && match[1].trim() !== 'General Policy') {
      return match[1].trim();
    }
  }
  return 'Eligibility';
};

/**
 * Construct RAG context string from retrieved DocumentChunk records.
 * 
 * @param {Array<Object>} chunks - Array of retrieved chunk objects
 * @param {Object} [options] - Overrides { maxChars, maxTokens }
 * @returns {{ context: string, includedChunks: Array<Object>, totalChars: number, totalTokens: number }}
 */
export const buildRagContext = (chunks, options = {}) => {
  if (!Array.isArray(chunks) || chunks.length === 0) {
    return {
      context: null,
      includedChunks: [],
      totalChars: 0,
      totalTokens: 0
    };
  }

  const config = getContextBuilderConfig();
  const maxChars = options.maxChars || config.maxChars;

  // Sort chunks by relevance score descending
  const sortedChunks = [...chunks].sort((a, b) => (b.score || b.relevanceScore || 0) - (a.score || a.relevanceScore || 0));

  const includedChunks = [];
  const existingTexts = [];
  let contextBlocks = [];
  let currentChars = 0;
  let currentTokens = 0;

  const header = `KNOWLEDGE BASE EVIDENCE:\n========================================\n\n`;
  currentChars += header.length;

  for (let i = 0; i < sortedChunks.length; i++) {
    const chunk = sortedChunks[i];
    const chunkText = (chunk.text || '').trim();

    if (!chunkText) continue;

    // Skip heavy duplicate content
    if (isDuplicateText(chunkText, existingTexts)) {
      continue;
    }

    const sourceNumber = includedChunks.length + 1;
    const isExcel = chunk.fileType === 'excel' || Boolean(chunk.sheetName);
    const sectionTitle = getAccurateSectionName(chunk);

    const blockHeader = isExcel
      ? `DOCUMENT ${sourceNumber}\nDocument Name: ${chunk.originalFileName || chunk.documentTitle || 'College Document'}\nType: Excel\nSheet: ${chunk.sheetName || 'Data'}\nRow: ${chunk.rowNumber || 1}\n\nContent:\n`
      : `DOCUMENT ${sourceNumber}\nDocument Name: ${chunk.originalFileName || chunk.documentTitle || 'College Document'}\nType: PDF\nPage: ${chunk.pageNumber || 1}\nSection: ${sectionTitle}\n\nContent:\n`;

    const blockText = `${chunkText}\n\n`;
    const blockFull = blockHeader + blockText;

    // Check character budget
    if (currentChars + blockFull.length > maxChars && includedChunks.length > 0) {
      console.log(`[CONTEXT_BUILDER] Reached max context character limit (${maxChars} chars). Stopping at ${includedChunks.length} chunks.`);
      break;
    }

    contextBlocks.push(blockFull);
    includedChunks.push({
      documentId: chunk.documentId,
      documentTitle: chunk.documentTitle,
      originalFileName: chunk.originalFileName,
      fileType: isExcel ? 'excel' : 'pdf',
      department: chunk.department,
      category: chunk.category,
      academicYear: chunk.academicYear,
      pageNumber: chunk.pageNumber || 1,
      sheetName: chunk.sheetName || null,
      rowNumber: chunk.rowNumber || null,
      headers: chunk.headers || undefined,
      structuredData: chunk.structuredData || undefined,
      chunkIndex: chunk.chunkIndex,
      sectionTitle: isExcel ? (chunk.sheetName || 'Data') : sectionTitle,
      text: chunkText,
      relevanceScore: chunk.score || chunk.relevanceScore || 0
    });
    existingTexts.push(chunkText);

    currentChars += blockFull.length;
    currentTokens += chunk.tokenCount || Math.ceil(chunkText.length / 4);
  }

  if (includedChunks.length === 0) {
    return {
      context: null,
      includedChunks: [],
      totalChars: 0,
      totalTokens: 0
    };
  }

  const finalContext = header + contextBlocks.join('----------------------------------------\n\n');

  return {
    context: finalContext,
    includedChunks,
    totalChars: finalContext.length,
    totalTokens: currentTokens
  };
};
