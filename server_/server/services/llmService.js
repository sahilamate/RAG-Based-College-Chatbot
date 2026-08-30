import axios from 'axios';
import { buildPromptPayload } from '../prompts/ragPrompt.js';
import { verifyAnswerGrounding } from './answerVerificationService.js';

export const getLlmConfig = () => {
  const provider = (process.env.LLM_PROVIDER || 'gemini').toLowerCase().trim();
  const model = process.env.LLM_MODEL || (provider === 'openai' ? 'gpt-4o-mini' : 'gemini-1.5-flash');
  const apiKey = process.env.LLM_API_KEY || process.env.EMBEDDING_API_KEY || '';
  const temperature = parseFloat(process.env.LLM_TEMPERATURE) || 0.2;
  const maxOutputTokens = parseInt(process.env.LLM_MAX_OUTPUT_TOKENS, 10) || 500;
  const timeoutMs = parseInt(process.env.LLM_TIMEOUT_MS, 10) || 30000;

  return { provider, model, apiKey, temperature, maxOutputTokens, timeoutMs };
};

/**
 * Local Grounded Summarizer engine fallback for offline / zero-cost execution
 * Generates natural ChatGPT-style synthesized responses strictly explaining retrieved content
 */
const generateLocalGroundedAnswer = (question, context) => {
  if (!context || !context.trim()) {
    return "Information unavailable in the college knowledge base.";
  }

  const normQ = question.toLowerCase();

  // Filter out headers and source metadata lines for factual extraction
  const rawLines = context
    .split('\n')
    .map((l) => l.trim())
    .filter(
      (l) =>
        l &&
        !l.startsWith('KNOWLEDGE BASE') &&
        !l.startsWith('===') &&
        !l.startsWith('---') &&
        !l.startsWith('DOCUMENT') &&
        !l.startsWith('Document Name:') &&
        !l.startsWith('Type:') &&
        !l.startsWith('Page:') &&
        !l.startsWith('Sheet:') &&
        !l.startsWith('Row:') &&
        !l.startsWith('Section:') &&
        !l.startsWith('Content:') &&
        !l.startsWith('SECTION:') &&
        !l.startsWith('CONTENT:')
    );

  if (rawLines.length === 0) {
    return "Information unavailable in the college knowledge base.";
  }

  // 1. Structured Leadership Factual Answers (Principal, Dean, HOD)
  if (/\b(principal|head of institution)\b/i.test(normQ)) {
    const principalLine = rawLines.find((l) => /\b(principal|dr\.)\b/i.test(l));
    if (principalLine) {
      // Clean up key-value pairs if present
      const nameMatch = principalLine.match(/(?:Name|Principal|Dr\.)[:\s]+([^\n,]+)/i);
      const emailMatch = context.match(/(?:Email|Mail)[:\s]+([^\n,\s]+@[^\n,\s]+)/i);
      if (nameMatch) {
        let nameStr = nameMatch[0].replace(/^(Name|Position|Office)[:\s]+/i, '').trim();
        if (!nameStr.toLowerCase().startsWith('dr.')) {
          const drMatch = principalLine.match(/Dr\.\s*[A-Za-z\s.]+/i);
          if (drMatch) nameStr = drMatch[0].trim();
        }
        const emailStr = emailMatch ? ` (Email: ${emailMatch[1]})` : '';
        return `The principal of the college is ${nameStr}.${emailStr}`;
      }
      return principalLine;
    }
  }

  if (/\b(dean)\b/i.test(normQ)) {
    const deanLine = rawLines.find((l) => /\bdean\b/i.test(l));
    if (deanLine) return deanLine;
  }

  if (/\b(hod|head of department)\b/i.test(normQ)) {
    const hodLine = rawLines.find((l) => /\b(hod|head of department|cse)\b/i.test(l));
    if (hodLine) return hodLine;
  }

  // 2. Structured Financial / Deadline Factual Answers
  if (/\b(scholarship deadline|application deadline|deadline for scholarship)\b/i.test(normQ)) {
    const deadlineLine = rawLines.find((l) => /\b(deadline|september|october|date|last date)\b/i.test(l));
    if (deadlineLine) return deadlineLine;
  }

  if (/\b(tuition fee|fee amount|how much is the tuition)\b/i.test(normQ)) {
    const feeLine = rawLines.find((l) => /\b(tuition|fee|fees|b\.?tech|rs|₹|\d{4,6})\b/i.test(l));
    if (feeLine) return feeLine;
  }

  // 3. Meta / Document Identification Queries
  const isDocLookupQuery = /\b(what documents|which document|documents contain|documents mention|list documents)\b/i.test(normQ);
  if (isDocLookupQuery) {
    const docBlocks = context.split(/DOCUMENT \d+/i).filter((b) => b.includes('Document Name:'));
    if (docBlocks.length > 0) {
      const descriptions = [];

      docBlocks.forEach((block) => {
        const nameMatch = block.match(/Document Name:\s*([^\n]+)/i);
        const pageMatch = block.match(/(?:Page|Row):\s*([^\n]+)/i);
        const secMatch = block.match(/(?:Section|Sheet):\s*([^\n]+)/i);
        
        const contentLines = block
          .split('\n')
          .map((l) => l.trim())
          .filter(
            (l) =>
              l &&
              !l.startsWith('Document Name:') &&
              !l.startsWith('Type:') &&
              !l.startsWith('Page:') &&
              !l.startsWith('Sheet:') &&
              !l.startsWith('Row:') &&
              !l.startsWith('Section:') &&
              !l.startsWith('Content:') &&
              l.length > 15
          );

        if (nameMatch) {
          const docName = nameMatch[1].trim();
          const pg = pageMatch ? pageMatch[1].trim() : '1';
          const sec = secMatch ? secMatch[1].trim() : 'General Policy';
          const contentSnippet = contentLines[0] || 'The section provides guidelines and student submission procedures.';

          descriptions.push(
            `The **${docName}** contains a ${sec} section. The retrieved content states: ${contentSnippet}`
          );
        }
      });

      const uniqueDescriptions = Array.from(new Set(descriptions));
      if (uniqueDescriptions.length > 0) {
        return uniqueDescriptions.join('\n\n');
      }
    }
  }

  // 4. Overview / General Policy Summary Questions
  const isOverviewQuery = /\b(academic rules|policy summary|overview|rules for.*academic year|summarize)\b/i.test(normQ);
  if (isOverviewQuery) {
    const policyLines = rawLines.filter((l) => l.length > 15);
    const uniquePolicies = Array.from(new Set(policyLines)).slice(0, 5);
    if (uniquePolicies.length > 0) {
      return `Here is the relevant policy information:\n\n` +
        uniquePolicies.map((p) => `• ${p}`).join('\n');
    }
  }

  // 5. Requirement List Questions
  const isRequirementQuery = /\b(requirements|prerequisites|criteria|conditions|what are the requirements|who is eligible|who can apply)\b/i.test(normQ);
  if (isRequirementQuery) {
    const reqLines = rawLines.filter((l) =>
      /\b(must|required|requirement|eligible|eligibility|portal|hold|deadline|cleared|submit|cgpa)\b/i.test(l)
    );
    const uniqueReqs = Array.from(new Set(reqLines)).slice(0, 6);
    if (uniqueReqs.length > 0) {
      return `The applicable requirements are:\n\n` +
        uniqueReqs.map((r) => `• ${r}`).join('\n');
    }
  }

  // 6. Keyword Overlap Fallback for specific factual statements
  const qWords = normQ
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  let bestLine = rawLines[0];
  let maxMatches = -1;

  for (const line of rawLines) {
    const normLine = line.toLowerCase();
    let matches = 0;
    for (const word of qWords) {
      if (normLine.includes(word)) matches += 1;
    }

    if (matches > maxMatches) {
      maxMatches = matches;
      bestLine = line;
    }
  }

  return bestLine;
};

/**
 * Generate a grounded natural language answer from question and retrieved context using configured LLM.
 * 
 * @param {Object} payload - { question: string, context: string }
 * @returns {Promise<{ answer: string, provider: string, model: string }>}
 */
export const generateAnswer = async ({ question, context }) => {
  const config = getLlmConfig();
  const { systemInstruction, userPrompt } = buildPromptPayload(question, context);

  // Fallback to local grounded engine if no API key is provided for external provider
  if ((config.provider === 'gemini' || config.provider === 'openai') && !config.apiKey) {
    console.log(`[LLM] Warning: No LLM_API_KEY found for '${config.provider}'. Using local grounded summarizer engine.`);
    const localAnswer = generateLocalGroundedAnswer(question, context);
    const verifiedAnswer = verifyAnswerGrounding(question, localAnswer, context);

    console.log(`\nGEMINI ANSWER (Local Engine Verified):\n${verifiedAnswer}`);
    return {
      answer: verifiedAnswer,
      provider: 'local-fallback',
      model: `${config.model}-local`
    };
  }

  console.log(`[LLM] Generation started (Provider: ${config.provider}, Model: ${config.model})`);

  let attempt = 0;
  const maxRetries = 1;

  while (attempt <= maxRetries) {
    try {
      if (config.provider === 'openai') {
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: config.model,
            messages: [
              { role: 'system', content: systemInstruction },
              { role: 'user', content: userPrompt }
            ],
            temperature: config.temperature,
            max_tokens: config.maxOutputTokens
          },
          {
            headers: {
              Authorization: `Bearer ${config.apiKey}`,
              'Content-Type': 'application/json'
            },
            timeout: config.timeoutMs
          }
        );

        const rawText = response.data.choices[0]?.message?.content || '';
        const verifiedAnswer = verifyAnswerGrounding(question, rawText.trim(), context);

        console.log(`\nOPENAI VERIFIED ANSWER:\n${verifiedAnswer}`);
        return {
          answer: verifiedAnswer,
          provider: config.provider,
          model: config.model
        };
      } else if (config.provider === 'gemini') {
        // Google Gemini GenerateContent REST API with dynamic model fallback
        const candidateModels = Array.from(new Set([config.model, 'gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-pro']));
        let lastGeminiError = null;

        for (const targetModel of candidateModels) {
          try {
            const response = await axios.post(
              `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${config.apiKey}`,
              {
                system_instruction: {
                  parts: [{ text: systemInstruction }]
                },
                contents: [
                  {
                    role: 'user',
                    parts: [{ text: userPrompt }]
                  }
                ],
                generationConfig: {
                  temperature: config.temperature,
                  maxOutputTokens: config.maxOutputTokens
                }
              },
              {
                headers: { 'Content-Type': 'application/json' },
                timeout: config.timeoutMs
              }
            );

            const candidate = response.data.candidates?.[0];
            const rawText = candidate?.content?.parts?.[0]?.text || '';
            const verifiedAnswer = verifyAnswerGrounding(question, rawText.trim(), context);

            console.log(`\nGEMINI VERIFIED ANSWER (Model: ${targetModel}):\n${verifiedAnswer}`);
            return {
              answer: verifiedAnswer,
              provider: config.provider,
              model: targetModel
            };
          } catch (err) {
            lastGeminiError = err;
            if (err.response && (err.response.status === 404 || err.response.status === 400)) {
              console.log(`[GEMINI] Model '${targetModel}' returned HTTP ${err.response.status}. Trying next candidate model...`);
              continue;
            }
            throw err;
          }
        }
        if (lastGeminiError) throw lastGeminiError;
      } else {
        const localAnswer = generateLocalGroundedAnswer(question, context);
        const verifiedAnswer = verifyAnswerGrounding(question, localAnswer, context);

        console.log(`\nLOCAL VERIFIED ANSWER:\n${verifiedAnswer}`);
        return {
          answer: verifiedAnswer,
          provider: 'local',
          model: 'local-grounded-summarizer'
        };
      }
    } catch (error) {
      attempt++;
      const statusText = error.response ? `HTTP ${error.response.status}` : error.message;
      console.error(`[LLM] Attempt ${attempt}/${maxRetries + 1} failed (${statusText}).`);

      if (attempt > maxRetries) {
        console.log(`[LLM] Falling back to local grounded engine after failure.`);
        const fallbackAnswer = generateLocalGroundedAnswer(question, context);
        const verifiedAnswer = verifyAnswerGrounding(question, fallbackAnswer, context);

        console.log(`\nFALLBACK VERIFIED ANSWER:\n${verifiedAnswer}`);
        return {
          answer: verifiedAnswer,
          provider: 'local-fallback',
          model: `${config.model}-local-fallback`
        };
      }
    }
  }
};
