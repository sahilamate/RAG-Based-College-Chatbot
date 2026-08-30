import { analyzeQueryIntent, generateMultiPassQueries } from './queryUnderstandingService.js';
import { executeStructuredQuery } from './structuredQueryEngine.js';
import { executeMultiStrategySearch } from './hybridSearchService.js';
import { rerankAndSelectEvidence } from './rerankerService.js';
import { verifyAnswerability } from './answerabilityService.js';
import { buildRagContext } from './contextBuilder.js';

export const getRagConfig = () => {
  return {
    retrievalLimit: parseInt(process.env.RAG_RETRIEVAL_LIMIT, 10) || 25,
    contextLimit: parseInt(process.env.RAG_CONTEXT_LIMIT, 10) || 3,
    minScore: parseFloat(process.env.VECTOR_SEARCH_MIN_SCORE) || 0.25,
    maxQueryLength: parseInt(process.env.MAX_QUERY_LENGTH, 10) || 1000
  };
};

/**
 * Execute the complete Multi-Stage RAG & Structured Query Pipeline:
 * Question Normalization -> Intent Detection -> Entity/Field Detection ->
 * Structured Query Engine (Skip Vector Search if Deterministic) ->
 * Multi-Strategy Hybrid Retrieval -> Cross-Encoder Reranking -> Context Builder
 * 
 * @param {string} query - Raw user question string
 * @param {Object} [options]
 * @returns {Promise<Object>}
 */
export const retrieveContext = async (query, options = {}) => {
  const config = getRagConfig();

  if (!query || typeof query !== 'string' || !query.trim()) {
    throw new Error('Invalid query: User question must be a non-empty string');
  }

  const cleanedQuery = query.trim();

  if (cleanedQuery.length > config.maxQueryLength) {
    throw new Error(`Query exceeds maximum allowed length of ${config.maxQueryLength} characters`);
  }

  // 1. Query Normalization, Intent Classification & Entity Detection
  const intentAnalysis = analyzeQueryIntent(cleanedQuery);

  console.log(`\n==================================================`);
  console.log(`[RAG PIPELINE DEBUG AUDIT LOG]`);
  console.log(`Original Question:     "${cleanedQuery}"`);
  console.log(`Normalized Question:   "${intentAnalysis.normalizedQuery}"`);
  console.log(`Detected Intent:       ${intentAnalysis.intent}`);
  console.log(`Sub-Operation:         ${intentAnalysis.subOperation || 'N/A'}`);
  console.log(`Detected Entity:       ${intentAnalysis.entity}`);
  console.log(`Metadata Filters:      ${JSON.stringify(intentAnalysis.filters)}`);

  // 2. STAGE 2: Structured Query Engine Execution (Deterministic Aggregation / Count / Distinct / Exact Person Lookup)
  const structuredResult = await executeStructuredQuery(cleanedQuery, intentAnalysis, options);

  if (structuredResult.isStructured) {
    console.log(`[VECTOR SEARCH STATUS]: SKIPPED (Deterministic Structured Query Executed)`);
    console.log(`[STRUCTURED RESULT]: ${structuredResult.answer}`);
    console.log(`==================================================\n`);

    return {
      query: cleanedQuery,
      hasContext: true,
      isStructured: true,
      answer: structuredResult.answer,
      chunks: structuredResult.chunks,
      context: structuredResult.context,
      intent: intentAnalysis.intent,
      entity: intentAnalysis.entity,
      stats: structuredResult.stats
    };
  }

  console.log(`[VECTOR SEARCH STATUS]: EXECUTED (Semantic & Hybrid Vector Search Triggered)`);

  // 3. Query Expansion & Multi-Pass Search
  const multiPassQueries = generateMultiPassQueries(cleanedQuery, intentAnalysis);

  // 4. Multi-Strategy Parallel Search
  let candidateChunks = await executeMultiStrategySearch(cleanedQuery, multiPassQueries, options);

  // 5. Cross-Encoder / Hybrid Reranking & Evidence Selection
  let selectedEvidence = rerankAndSelectEvidence(cleanedQuery, intentAnalysis, candidateChunks, config.contextLimit);

  // 6. Answerability Guardrail & Evidence Check
  let answerability = verifyAnswerability(cleanedQuery, intentAnalysis, selectedEvidence);

  if (!answerability.isAnswerable) {
    const fallbackMsg = "I couldn't find reliable information about that in the uploaded knowledge base.";
    console.log(`[CONTEXT VALIDATION FAILED]: ${fallbackMsg}`);
    console.log(`==================================================\n`);

    return {
      query: cleanedQuery,
      hasContext: false,
      chunks: [],
      context: null,
      message: fallbackMsg,
      stats: {
        retrievalCount: candidateChunks.length,
        filteredCount: 0,
        topScore: 0,
        contextChars: 0
      }
    };
  }

  // 7. Build Final Structured RAG Context for LLM
  const buildResult = buildRagContext(selectedEvidence, {
    maxChars: options.maxChars,
    maxTokens: options.maxTokens
  });

  console.log(`[FINAL RANKED EVIDENCE CHUNKS]: ${buildResult.includedChunks.length} chunks (${buildResult.totalChars} chars)`);
  console.log(`==================================================\n`);

  return {
    query: cleanedQuery,
    hasContext: true,
    isStructured: false,
    chunks: buildResult.includedChunks,
    context: buildResult.context,
    intent: intentAnalysis.intent,
    entity: intentAnalysis.entity,
    stats: {
      retrievalCount: candidateChunks.length,
      filteredCount: buildResult.includedChunks.length,
      topScore: buildResult.includedChunks[0]?.relevanceScore || 0,
      contextChars: buildResult.totalChars,
      contextTokens: buildResult.totalTokens
    }
  };
};
