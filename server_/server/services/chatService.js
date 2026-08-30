import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import { retrieveContext } from './ragService.js';
import { generateAnswer } from './llmService.js';
import { getAccurateSectionName } from './contextBuilder.js';

/**
 * Intelligent Source Deduplication & Same-Document Page Grouping Helper
 * Groups retrieved chunks by documentId, collects unique sorted pages,
 * preserves highest relevanceScore, and limits top results.
 * 
 * @param {Array<Object>} chunks - Raw retrieved vector chunks
 * @returns {Array<Object>} Grouped source metadata objects
 */
export const prepareSources = (chunks) => {
  if (!Array.isArray(chunks) || chunks.length === 0) return [];

  const sourceMap = new Map();

  for (const chunk of chunks) {
    const isExcel = chunk.fileType === 'excel' || Boolean(chunk.sheetName);
    const defaultExcelId = '6a93a845d6b59c3f18e6be3f';
    const docId = chunk.documentId?.toString() || (isExcel ? defaultExcelId : 'doc_unknown');
    const sectionName = isExcel ? (chunk.sheetName || 'Data') : getAccurateSectionName(chunk);

    const sourceKey = isExcel
      ? `${docId}_${chunk.sheetName || 'Data'}_${chunk.rowNumber || 1}`
      : docId;

    if (!sourceMap.has(sourceKey)) {
      sourceMap.set(sourceKey, {
        documentId: docId,
        documentName: chunk.documentTitle || chunk.originalFileName || (isExcel ? 'College_Knowledge_Base.xlsx' : 'College Document'),
        originalFileName: chunk.originalFileName || chunk.fileName || (isExcel ? 'College_Knowledge_Base.xlsx' : 'document.pdf'),
        fileName: chunk.originalFileName || chunk.fileName || (isExcel ? 'College_Knowledge_Base.xlsx' : 'document.pdf'),
        fileType: isExcel ? 'excel' : 'pdf',
        sheetName: chunk.sheetName || null,
        rowNumber: chunk.rowNumber || null,
        data: chunk.structuredData || undefined,
        pages: isExcel ? [] : [chunk.pageNumber || 1],
        page: chunk.pageNumber || 1,
        pageNumber: chunk.pageNumber || 1,
        section: sectionName,
        sectionTitle: sectionName,
        chunkIndex: chunk.chunkIndex,
        score: chunk.relevanceScore || chunk.score || 0,
        relevanceScore: chunk.relevanceScore || chunk.score || 0,
        content: (chunk.text || '').trim(),
        snippet: (chunk.text || '').trim().length > 300
          ? (chunk.text || '').trim().slice(0, 300) + '...'
          : (chunk.text || '').trim(),
        url: `/api/documents/${chunk.documentId}/file`
      });
    } else {
      const existing = sourceMap.get(sourceKey);

      if (!isExcel && chunk.pageNumber && !existing.pages.includes(chunk.pageNumber)) {
        existing.pages.push(chunk.pageNumber);
        existing.pages.sort((a, b) => a - b);
      }

      const currentScore = chunk.relevanceScore || chunk.score || 0;
      if (currentScore > existing.score) {
        existing.score = currentScore;
        existing.relevanceScore = currentScore;
        existing.chunkIndex = chunk.chunkIndex;
      }
    }
  }

  // Sort sources by highest relevance score descending and take top 5
  return Array.from(sourceMap.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
};

/**
 * Execute the end-to-end RAG Chatbot Pipeline with Source Extraction:
 * User Question -> RAG Service -> Grounded LLM Answer -> Source Grouping -> DB Save -> Response
 * 
 * @param {string} question - User message
 * @param {string} userId - Mongo ID of logged-in user
 * @param {string} [conversationId] - Optional existing conversation ID
 * @param {Object} [options] - RAG filter options
 * @returns {Promise<Object>}
 */
export const answerQuestion = async (question, userId, conversationId, options = {}) => {
  console.log(`[CHAT] Request received from user ${userId}`);

  // 1. Get or Create Conversation
  let conversation;
  if (conversationId) {
    conversation = await Conversation.findOne({ _id: conversationId, userId });
  }

  if (!conversation) {
    const titleSnippet = question.trim().length > 35 ? question.trim().slice(0, 35) + '...' : question.trim();
    conversation = await Conversation.create({
      userId,
      title: titleSnippet
    });
  }

  // 2. Save User Message to DB
  await Message.create({
    conversationId: conversation._id,
    role: 'user',
    content: question.trim(),
    sources: [],
    hasContext: true
  });

  // 3. Retrieve RAG Context
  const ragResult = await retrieveContext(question, options);

  // 4. Anti-Hallucination Unknown Handling: Skip LLM call if no context found
  if (!ragResult.hasContext) {
    const unknownAnswer = "Information unavailable in the college knowledge base.";

    const assistantMsg = await Message.create({
      conversationId: conversation._id,
      role: 'assistant',
      content: unknownAnswer,
      sources: [],
      hasContext: false
    });

    conversation.updatedAt = new Date();
    await conversation.save();

    console.log(`[CHAT] Response returned (hasContext = false, 0 Sources)`);
    return {
      conversationId: conversation._id,
      messageId: assistantMsg._id,
      answer: unknownAnswer,
      hasContext: false,
      sources: []
    };
  }

  // 5. Generate Grounded AI Answer via LLM Service
  const llmResult = await generateAnswer({
    question: ragResult.query,
    context: ragResult.context
  });

  // 6. Extract & Group Source Metadata
  const formattedSources = prepareSources(ragResult.chunks);

  // 7. Save Assistant Response Message to DB
  const assistantMsg = await Message.create({
    conversationId: conversation._id,
    role: 'assistant',
    content: llmResult.answer,
    sources: formattedSources,
    hasContext: true
  });

  conversation.updatedAt = new Date();
  await conversation.save();

  console.log(`[CHAT] Response returned (hasContext = true, ${formattedSources.length} Grouped Sources attached)`);

  return {
    conversationId: conversation._id,
    messageId: assistantMsg._id,
    answer: llmResult.answer,
    hasContext: true,
    sources: formattedSources
  };
};
