import DocumentChunk from '../models/DocumentChunk.js';
import Document from '../models/Document.js';
import { generateEmbeddings } from './embeddingService.js';
import { searchSimilarChunks } from './vectorSearchService.js';

/**
 * Compute BM25-style term frequency lexical relevance score between query terms and chunk text.
 * @param {Array<string>} queryTerms 
 * @param {string} text 
 * @returns {number} Normalized BM25 score (0.0 to 1.0)
 */
const computeLexicalBM25Score = (queryTerms, text) => {
  if (!queryTerms || queryTerms.length === 0 || !text) return 0;
  const normText = text.toLowerCase();
  let matches = 0;
  let exactMatchBoost = 0;

  for (const term of queryTerms) {
    const normTerm = term.toLowerCase().trim();
    if (normTerm.length <= 2) continue;

    if (normText.includes(normTerm)) {
      matches += 1;
      // Bonus for exact word boundaries
      const regex = new RegExp(`\\b${normTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(normText)) {
        exactMatchBoost += 0.2;
      }
    }
  }

  const score = (matches / queryTerms.length) * 0.7 + Math.min(0.3, exactMatchBoost);
  return parseFloat(Math.min(1.0, score).toFixed(4));
};

/**
 * Execute Multi-Strategy Parallel Search across:
 * 1. Dense Vector Similarity Search
 * 2. Lexical / BM25 Term Frequency Search
 * 3. Exact Substring & Phrase Matching
 * 4. Section / Metadata Matching
 * 
 * @param {string} query - User question string
 * @param {Object} multiPassQueries - Generated 5-pass search variations
 * @param {Object} [options] - Search options
 * @returns {Promise<Array<Object>>} Merged and deduplicated candidate chunks
 */
export const executeMultiStrategySearch = async (query, multiPassQueries, options = {}) => {
  console.log(`\n[MULTI-STRATEGY PARALLEL RETRIEVAL]`);
  console.log(`[PASS 1 Original Query]: "${multiPassQueries.pass1Original}"`);
  console.log(`[PASS 2 Expanded Keywords]: ${multiPassQueries.pass2Keywords.join(', ')}`);
  console.log(`[PASS 4 Section Targets]: ${multiPassQueries.pass4Sections.join(', ')}`);

  // 1. Generate Embedding Vector for Original & Expanded Queries
  const embedQuery = multiPassQueries.pass3Semantic[0] || query;
  const embeddingResult = await generateEmbeddings([embedQuery]);
  const queryVector = embeddingResult.vectors?.[0] || [];

  // 2. Strategy A: Dense Vector Search
  const vectorCandidates = queryVector.length > 0
    ? await searchSimilarChunks(queryVector, {
        query,
        limit: options.retrievalLimit || 25,
        minScore: 0.25,
        department: options.department,
        category: options.category,
        academicYear: options.academicYear,
        documentId: options.documentId
      })
    : [];

  console.log(`[STRATEGY A: VECTOR SEARCH] Found ${vectorCandidates.length} candidate chunks`);

  // 3. Strategy B & C: Lexical / BM25 & Exact Substring Match across DB
  const lexKeywords = [...multiPassQueries.pass2Keywords, ...multiPassQueries.pass5Lexical];
  const regexConditions = lexKeywords
    .filter((k) => k && k.length > 2)
    .map((k) => new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));

  let lexicalDbChunks = [];
  if (regexConditions.length > 0) {
    const matchFilter = {
      $or: regexConditions.map((re) => ({ text: re }))
    };
    if (options.documentId) matchFilter.documentId = options.documentId;

    const rawDbChunks = await DocumentChunk.find(matchFilter).limit(30);

    // Populate Document metadata
    const docIds = [...new Set(rawDbChunks.map((c) => c.documentId.toString()))];
    const docs = await Document.find({ _id: { $in: docIds } }).select('title originalFileName fileType department category academicYear');
    const docMap = {};
    docs.forEach((d) => (docMap[d._id.toString()] = d));

    lexicalDbChunks = rawDbChunks.map((c) => {
      const doc = docMap[c.documentId.toString()];
      const bm25Score = computeLexicalBM25Score(lexKeywords, c.text);
      return {
        id: c._id,
        documentId: c.documentId,
        documentTitle: doc ? doc.title : 'College Document',
        originalFileName: doc ? doc.originalFileName : 'document.pdf',
        fileType: c.fileType || (doc ? doc.fileType : 'pdf') || 'pdf',
        department: doc ? doc.department : 'All Departments',
        category: doc ? doc.category : 'Other',
        academicYear: doc ? doc.academicYear : '2026',
        pageNumber: c.pageNumber || 1,
        sheetName: c.sheetName || null,
        rowNumber: c.rowNumber || null,
        headers: c.headers || undefined,
        structuredData: c.structuredData || undefined,
        chunkIndex: c.chunkIndex,
        text: c.text,
        sectionTitle: c.sheetName || c.sectionTitle || 'General Policy',
        vectorScore: 0.35,
        bm25Score
      };
    });
  }

  console.log(`[STRATEGY B & C: LEXICAL & EXACT MATCH] Found ${lexicalDbChunks.length} candidate chunks`);

  // 4. Merge All Strategies & Deduplicate
  const chunkMap = new Map();

  // Insert vector candidates first
  vectorCandidates.forEach((v) => {
    const key = `${v.documentId}_${v.chunkIndex}`;
    chunkMap.set(key, {
      ...v,
      vectorScore: v.score || 0.4,
      bm25Score: computeLexicalBM25Score(lexKeywords, v.text)
    });
  });

  // Merge lexical candidates
  lexicalDbChunks.forEach((l) => {
    const key = `${l.documentId}_${l.chunkIndex}`;
    if (chunkMap.has(key)) {
      const existing = chunkMap.get(key);
      existing.bm25Score = Math.max(existing.bm25Score || 0, l.bm25Score);
    } else {
      chunkMap.set(key, l);
    }
  });

  const mergedCandidates = Array.from(chunkMap.values());
  console.log(`[MERGE & DEDUPLICATE] Total unique candidates merged: ${mergedCandidates.length}`);

  return mergedCandidates;
};
