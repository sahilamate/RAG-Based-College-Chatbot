import { pipeline } from '@xenova/transformers';
import axios from 'axios';

/**
 * Get Embedding Configuration from Environment Variables
 */
export const getEmbeddingConfig = () => {
  const provider = (process.env.EMBEDDING_PROVIDER || 'local').toLowerCase().trim();
  const model = process.env.EMBEDDING_MODEL || (provider === 'google' ? 'text-embedding-004' : provider === 'openai' ? 'text-embedding-3-small' : 'all-MiniLM-L6-v2');
  const apiKey = process.env.EMBEDDING_API_KEY || '';
  const batchSize = parseInt(process.env.EMBEDDING_BATCH_SIZE, 10) || 20;
  const maxRetries = parseInt(process.env.EMBEDDING_MAX_RETRIES, 10) || 3;

  return { provider, model, apiKey, batchSize, maxRetries };
};

/**
 * Exponential backoff helper delay
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Singleton promise for loading local ONNX all-MiniLM-L6-v2 model pipeline
let pipelinePromise = null;

const getLocalEmbedder = async () => {
  if (!pipelinePromise) {
    console.log('[EMBEDDING] Initializing local HuggingFace all-MiniLM-L6-v2 ONNX model...');
    pipelinePromise = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return await pipelinePromise;
};

/**
 * Generate real 384-dimensional semantic embeddings locally using ONNX all-MiniLM-L6-v2
 * 
 * @param {Array<string>} texts - Chunks/texts to embed
 * @returns {Promise<{vectors: Array<Array<number>>, modelName: string, dimensions: number}>}
 */
const generateRealLocalEmbeddings = async (texts) => {
  const extractor = await getLocalEmbedder();
  const vectors = [];

  for (const text of texts) {
    const cleanText = (text || '').trim() || 'empty chunk';
    const output = await extractor(cleanText, { pooling: 'mean', normalize: true });
    vectors.push(Array.from(output.data));
  }

  return {
    vectors,
    modelName: 'all-MiniLM-L6-v2',
    dimensions: 384
  };
};

/**
 * Generate Embeddings with Provider Routing, Batching, and Exponential Backoff Retries
 * 
 * @param {Array<string>} texts - Array of chunk texts
 * @param {Object} [options] - Custom config overrides
 * @returns {Promise<{vectors: Array<Array<number>>, modelName: string, dimensions: number}>}
 */
export const generateEmbeddings = async (texts, options = {}) => {
  if (!Array.isArray(texts) || texts.length === 0) {
    return { vectors: [], modelName: 'none', dimensions: 0 };
  }

  const config = getEmbeddingConfig();
  const provider = options.provider || config.provider;
  const model = options.model || config.model;
  const apiKey = options.apiKey || config.apiKey;
  const maxRetries = options.maxRetries || config.maxRetries;

  console.log(`[EMBEDDING] Provider: ${provider}`);
  console.log(`[EMBEDDING] Model: ${model}`);
  console.log(`[EMBEDDING] Number of texts: ${texts.length}`);

  // 1. Local ONNX Model Provider (Default / Free / Offline)
  if (provider === 'local' || !apiKey) {
    if (provider !== 'local' && !apiKey) {
      console.log(`[EMBEDDING] Warning: No EMBEDDING_API_KEY found for provider '${provider}'. Falling back to local ONNX model.`);
    }
    const result = await generateRealLocalEmbeddings(texts);
    console.log(`[EMBEDDING] Dimensions: ${result.dimensions}`);
    return result;
  }

  // 2. External Provider Routing (OpenAI, Google, HuggingFace API)
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      if (provider === 'openai') {
        const response = await axios.post(
          'https://api.openai.com/v1/embeddings',
          { input: texts, model },
          { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, timeout: 30000 }
        );
        const vectors = response.data.data.map((item) => item.embedding);
        const dimensions = vectors[0]?.length || 1536;
        console.log(`[EMBEDDING] Dimensions: ${dimensions}`);
        return { vectors, modelName: model, dimensions };
      } else if (provider === 'google') {
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:batchEmbedContents?key=${apiKey}`,
          { requests: texts.map((t) => ({ model: `models/${model}`, content: { parts: [{ text: t }] } })) },
          { headers: { 'Content-Type': 'application/json' }, timeout: 30000 }
        );
        const vectors = response.data.embeddings.map((e) => e.values);
        const dimensions = vectors[0]?.length || 768;
        console.log(`[EMBEDDING] Dimensions: ${dimensions}`);
        return { vectors, modelName: model, dimensions };
      } else if (provider === 'huggingface') {
        const response = await axios.post(
          `https://api-inference.huggingface.co/pipeline/feature-extraction/${model}`,
          { inputs: texts },
          { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 30000 }
        );
        const vectors = response.data;
        const dimensions = Array.isArray(vectors[0]) ? vectors[0].length : 384;
        console.log(`[EMBEDDING] Dimensions: ${dimensions}`);
        return { vectors, modelName: model, dimensions };
      } else {
        const result = await generateRealLocalEmbeddings(texts);
        console.log(`[EMBEDDING] Dimensions: ${result.dimensions}`);
        return result;
      }
    } catch (error) {
      attempt++;
      const isRateLimit = error.response && error.response.status === 429;
      const statusText = error.response ? `HTTP ${error.response.status}` : error.message;

      console.error(`[EMBEDDING] Attempt ${attempt}/${maxRetries + 1} failed (${statusText}).`);

      if (attempt > maxRetries) {
        console.log(`[EMBEDDING] External API failed after ${maxRetries} retries. Falling back to local ONNX model.`);
        return await generateRealLocalEmbeddings(texts);
      }

      const delayMs = Math.pow(2, attempt - 1) * 1000 + (isRateLimit ? 2000 : 0);
      await sleep(delayMs);
    }
  }
};
