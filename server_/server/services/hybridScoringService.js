import { INTENT_TYPES } from './queryUnderstandingService.js';

/**
 * Compute Multi-Signal Hybrid Score for each candidate chunk based on:
 * - Dense Vector Similarity
 * - BM25 / Lexical Keyword match
 * - Exact Phrase match
 * - Query Intent & Entity relevance boosts & penalties
 * - Disambiguation rules (Principal vs VP, Placement Stats vs Eligibility, Dept Entity vs Dept Field)
 * 
 * @param {string} query - Raw user query
 * @param {Object} intentAnalysis - Analyzed query intent & entities
 * @param {Array<Object>} candidates - Candidate chunks
 * @returns {Array<Object>} Candidates with calculated hybridScore
 */
export const calculateHybridScores = (query, intentAnalysis, candidates) => {
  const normQ = (intentAnalysis.normalizedQuery || query).toLowerCase();
  const qWords = normQ.replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter((w) => w.length > 2);
  const targetEntity = intentAnalysis.entity || 'general';

  return candidates.map((chunk) => {
    const txt = (chunk.text || '').toLowerCase();
    const sheet = (chunk.sheetName || chunk.sectionTitle || '').toLowerCase();
    const vecScore = chunk.vectorScore || chunk.score || 0.35;
    const bm25Score = chunk.bm25Score || 0;

    let exactMatchScore = 0;
    let intentMatchScore = 0;
    let metadataPenalty = 0;

    // 1. Cover page title-only / metadata penalty (Only for PDFs)
    const isPdf = chunk.fileType !== 'excel' && (!chunk.sheetName);
    if (
      isPdf &&
      (txt.includes('version 1') ||
        txt.includes('audience students') ||
        txt.includes('synthetic institutional policy document') ||
        (chunk.pageNumber === 1 && !/\b(must|submit|required|procedure|steps|apply|deadline|principal|dr\.)\b/i.test(txt)))
    ) {
      metadataPenalty += 0.50;
    }

    // 2. DISAMBIGUATION RULE: Principal vs Vice Principal / Deans
    if (targetEntity === 'principal' || /\b(responsibilities of the principal|principal responsibilities)\b/i.test(normQ)) {
      if (sheet.includes('administration') || sheet.includes('important_contacts')) {
        const position = (chunk.structuredData?.Position || '').toLowerCase();
        if (position === 'principal & director' || position === 'principal' || (txt.includes('principal') && !txt.includes('vice principal'))) {
          intentMatchScore += 0.80; // Heavy boost for Principal record
        } else if (position.includes('vice principal') || position.includes('dean') || position.includes('placement') || position.includes('it head')) {
          metadataPenalty += 0.70; // Heavy penalty for Vice Principal / Dean when asking for Principal!
        }
      } else {
        metadataPenalty += 0.40;
      }
    }

    if (targetEntity === 'vice_principal') {
      const position = (chunk.structuredData?.Position || '').toLowerCase();
      if (position.includes('vice principal')) {
        intentMatchScore += 0.80;
      } else if (position === 'principal & director' || position === 'principal') {
        metadataPenalty += 0.70;
      }
    }

    // 3. DISAMBIGUATION RULE: Placement Statistics vs Placement Eligibility
    if (targetEntity === 'placement_stats' || intentAnalysis.intent === INTENT_TYPES.STATISTICS) {
      if (sheet.includes('placements')) {
        if (/\b(package|placed|recruiting|highest|average|lpa|drives|companies|offers)\b/i.test(txt)) {
          intentMatchScore += 0.75;
        }
      }
      if (/\b(minimum cgpa|eligibility|backlog|faq|registration)\b/i.test(txt) && !txt.includes('package')) {
        metadataPenalty += 0.60; // Penalize placement eligibility FAQs when asking for statistics!
      }
    }

    if (targetEntity === 'placement_eligibility' || /\b(minimum cgpa.*placement|placement registration|eligibility)\b/i.test(normQ)) {
      if (/\b(minimum cgpa|eligibility|backlog criteria|cgpa)\b/i.test(txt)) {
        intentMatchScore += 0.75;
      }
      if (sheet.includes('placements') && /\b(package|highest package)\b/i.test(txt) && !txt.includes('cgpa')) {
        metadataPenalty += 0.30;
      }
    }

    // 4. DISAMBIGUATION RULE: Department Entity vs Department Field
    if (targetEntity === 'departments') {
      if (sheet.includes('departments')) {
        intentMatchScore += 0.70;
      } else if (sheet.includes('fees') || sheet.includes('students') || sheet.includes('attendance')) {
        metadataPenalty += 0.50; // Penalize fee/student records that happen to have a "Department" column
      }
    }

    // 5. DISAMBIGUATION RULE: Student Category vs Scholarship "All Categories"
    if (targetEntity === 'student_category' || /\b(caste|category)\b/i.test(normQ)) {
      if (sheet.includes('students') || sheet.includes('eligibility')) {
        intentMatchScore += 0.70;
      }
      if (sheet.includes('scholarship') && txt.includes('all categories')) {
        metadataPenalty += 0.60; // Penalize scholarship "All Categories" row
      }
    }

    // 6. Generic Keyword & Exact Word Match Check
    let keywordCount = 0;
    for (const w of qWords) {
      if (txt.includes(w)) keywordCount++;
      if (sheet.includes(w)) intentMatchScore += 0.15;
    }

    exactMatchScore = Math.min(0.30, (keywordCount / Math.max(1, qWords.length)) * 0.30);

    // Multi-Signal Combined Score Calculation:
    let hybridScore = 0.35 * vecScore + 0.25 * bm25Score + 0.20 * exactMatchScore + 0.20 * intentMatchScore - metadataPenalty;
    hybridScore = Math.max(0.0, Math.min(1.0, parseFloat(hybridScore.toFixed(4))));

    return {
      ...chunk,
      hybridScore,
      relevanceScore: hybridScore
    };
  });
};
