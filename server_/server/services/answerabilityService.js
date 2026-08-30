import { INTENT_TYPES } from './queryUnderstandingService.js';

/**
 * Answerability Guardrail & Evidence Completeness Check
 * Evaluates whether retrieved evidence actually contains answers to the user query intent.
 * 
 * @param {string} query 
 * @param {Object} intentAnalysis 
 * @param {Array<Object>} evidenceChunks 
 * @returns {{ isAnswerable: boolean, reason: string|null }}
 */
export const verifyAnswerability = (query, intentAnalysis, evidenceChunks) => {
  if (!Array.isArray(evidenceChunks) || evidenceChunks.length === 0) {
    return { isAnswerable: false, reason: 'No evidence chunks retrieved' };
  }

  const normQ = query.toLowerCase();
  const allText = evidenceChunks.map((c) => (c.text || '').toLowerCase()).join('\n');

  // 1. Factual Principal Check
  if (/\b(principal|head of institution)\b/i.test(normQ)) {
    const hasPrincipalName = /\b(principal:\s*dr|dr\.\s*[a-z\s]+|head of institution|director)\b/i.test(allText);
    if (!hasPrincipalName) {
      console.log('[ANSWERABILITY CHECK] Failed: Principal name not present in evidence.');
      return { isAnswerable: false, reason: "I couldn't find the principal's name in the available college documents." };
    }
  }

  // 2. Fee / Cost Check
  if (/\b(fee|fees|cost|tuition)\b/i.test(normQ)) {
    const hasFeeDetails = /\b(fee|fees|cost|charge|charges|price|n?\d{2,6}|₹|\$)\b/i.test(allText);
    if (!hasFeeDetails) {
      console.log('[ANSWERABILITY CHECK] Failed: Fee figures not present in evidence.');
      return { isAnswerable: false, reason: 'Information unavailable in the college knowledge base.' };
    }
  }

  // 3. Consequence Check (e.g. "What happens if I miss deadline?")
  if (intentAnalysis.intent === INTENT_TYPES.CONSEQUENCE || /\b(miss.*deadline|after deadline)\b/i.test(normQ)) {
    const hasConsequenceDetails = /\b(late|penalty|missed|consequence|consequences|rejected|not accepted|extension|fee|fine)\b/i.test(allText);
    if (!hasConsequenceDetails) {
      console.log('[ANSWERABILITY CHECK] Failed: Specific consequence details not present in evidence.');
      return { isAnswerable: false, reason: 'The available documents state application deadlines but do not specify the exact consequences of a missed deadline.' };
    }
  }

  // 4. Metadata Only Cover Page Check (PDFs only)
  const isOnlyMetadata = evidenceChunks.every((c) => {
    if (c.fileType === 'excel' || c.sheetName) return false;
    const t = (c.text || '').toLowerCase();
    return (
      t.includes('version 1') ||
      t.includes('audience students') ||
      t.includes('synthetic institutional policy document') ||
      (c.pageNumber === 1 && !/\b(must|submit|required|procedure|steps|apply|deadline|principal|dr\.)\b/i.test(t))
    );
  });

  if (isOnlyMetadata) {
    console.log('[ANSWERABILITY CHECK] Failed: Evidence consists only of cover metadata disclaimers.');
    return { isAnswerable: false, reason: 'I found references to this document, but the available retrieved content does not contain enough detail to answer your specific question.' };
  }

  return { isAnswerable: true, reason: null };
};
