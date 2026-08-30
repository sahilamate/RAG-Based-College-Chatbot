import { calculateHybridScores } from './hybridScoringService.js';

/**
 * Cross-Encoder Candidate Reranker Service
 * Reranks candidate pool and selects top 1-3 strong, entity-matched evidence chunks.
 * 
 * @param {string} query 
 * @param {Object} intentAnalysis 
 * @param {Array<Object>} candidates 
 * @param {number} topK 
 * @returns {Array<Object>} Top reranked evidence chunks
 */
export const rerankAndSelectEvidence = (query, intentAnalysis, candidates, topK = 3) => {
  if (!Array.isArray(candidates) || candidates.length === 0) return [];

  // 1. Calculate multi-signal hybrid scores
  const scoredCandidates = calculateHybridScores(query, intentAnalysis, candidates);

  // 2. Sort by hybridScore descending
  scoredCandidates.sort((a, b) => b.hybridScore - a.hybridScore);

  console.log(`\n[MULTI-SIGNAL HYBRID RERANKING]`);
  scoredCandidates.slice(0, 5).forEach((c, idx) => {
    console.log(`Rank #${idx + 1} | HybridScore: ${(c.hybridScore * 100).toFixed(1)}% | Document: ${c.documentTitle} | Sheet/Page: ${c.sheetName || c.pageNumber} | Text: ${(c.text || '').slice(0, 80)}...`);
  });

  // 3. Determine optimal topK limit based on query intent (Smallest Sufficient Source Set)
  let maxSources = topK;
  if (intentAnalysis.entity === 'principal' || intentAnalysis.entity === 'vice_principal') {
    maxSources = 1; // Exactly 1 source for Principal or Vice Principal
  } else if (intentAnalysis.entity === 'placement_stats' || intentAnalysis.intent === 'STATISTICS') {
    maxSources = 2;
  } else if (intentAnalysis.intent === 'LOOKUP') {
    maxSources = 2;
  }

  // 4. Select top K non-duplicate strong evidence chunks
  const selected = [];
  const existingTexts = new Set();

  for (const chunk of scoredCandidates) {
    if (selected.length >= maxSources) break;

    // Minimum relevance score threshold (0.20)
    if (chunk.hybridScore < 0.20) continue;

    const normText = (chunk.text || '').toLowerCase().trim().slice(0, 100);
    if (!existingTexts.has(normText)) {
      existingTexts.add(normText);
      selected.push(chunk);
    }
  }

  return selected;
};
