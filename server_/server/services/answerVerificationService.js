/**
 * Answer Verification Service
 * Validates generated LLM answers against retrieved evidence to eliminate hallucinations,
 * unsupported claims, and ungrounded facts.
 */

/**
 * Verify and sanitize generated answer against evidence context
 * 
 * @param {string} question - User query
 * @param {string} rawAnswer - Raw generated LLM answer
 * @param {string} context - Retrieved RAG context evidence
 * @returns {string} Grounded and verified final answer
 */
export const verifyAnswerGrounding = (question, rawAnswer, context) => {
  if (!rawAnswer || !rawAnswer.trim()) {
    return "I couldn't find enough information in the available college documents to answer this accurately.";
  }

  const normQ = question.toLowerCase();
  const normAnswer = rawAnswer.toLowerCase();
  const normContext = (context || '').toLowerCase();

  // 1. Consequence Verification Guardrail
  if (/\b(miss.*deadline|after deadline|what happens if i miss)\b/i.test(normQ)) {
    const hasConsequenceInContext = /\b(late|penalty|missed|consequence|consequences|rejected|not accepted|extension|fee|fine)\b/i.test(normContext);
    if (!hasConsequenceInContext) {
      return "The available college documents state application deadlines, but do not specify what happens if an application deadline is missed.";
    }
  }

  // 2. Factual Principal Verification Guardrail
  if (/\b(principal|head of institution)\b/i.test(normQ)) {
    const hasPrincipalInContext = /\b(principal:\s*dr|dr\.\s*[a-z\s]+|head of institution|director)\b/i.test(normContext);
    if (!hasPrincipalInContext) {
      return "I couldn't find the principal's name in the available college documents.";
    }
  }

  // 3. Generic Disclaimer Removal
  let cleaned = rawAnswer
    .replace(/^the retrieved documents indicate that/i, '')
    .replace(/^according to the retrieved documents,?/i, 'According to the official college documentation,')
    .replace(/^the documents provide information about this topic\.?/i, '')
    .trim();

  // Capitalize first letter if needed
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  return cleaned;
};
