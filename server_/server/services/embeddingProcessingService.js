import Document from '../models/Document.js';
import DocumentChunk from '../models/DocumentChunk.js';
import { generateEmbeddings, getEmbeddingConfig } from './embeddingService.js';

/**
 * Coordinate embedding vector generation for all DocumentChunks of a Document.
 * Processes chunks in batches and skips chunks with embeddingStatus === 'completed'
 * unless forceRegenerate is true.
 * 
 * @param {string} documentId - MongoDB ID of Document
 * @param {boolean} [forceRegenerate=false] - If true, reset & regenerate all embeddings
 * @returns {Promise<Document>}
 */
export const generateDocumentEmbeddings = async (documentId, forceRegenerate = false) => {
  const document = await Document.findById(documentId);
  if (!document) {
    throw new Error(`Document not found with ID: ${documentId}`);
  }

  const isExcel = document.fileType === 'excel' || /\.(xlsx|xls)$/i.test(document.originalFileName || document.fileName || '');
  const hasExtractedContent = isExcel ? (document.rowsCount > 0) : (document.pages > 0);
  const totalChunks = await DocumentChunk.countDocuments({ documentId: document._id });

  // STRICT BACKEND VALIDATION BEFORE EMBEDDING GENERATION
  if (!hasExtractedContent || totalChunks === 0) {
    const errorMsg = 'Cannot generate embeddings because no chunks exist. Text extraction and chunk creation must be completed first.';
    console.error(`[EMBEDDING-VALIDATION-FAILED] Document ID: ${documentId} - ${errorMsg}`);
    document.status = 'failed';
    document.embeddingStatus = 'failed';
    document.embeddingError = errorMsg;
    await document.save();
    throw new Error(errorMsg);
  }

  console.log(`[EMBEDDING] Starting document embedding for ${document.title}`);

  const { batchSize } = getEmbeddingConfig();

  // 1. Transition Document status to "embedding" / "processing"
  document.status = 'embedding';
  document.embeddingStatus = 'processing';
  document.vectorStatus = 'not_ready';
  document.embeddingError = null;
  await document.save();

  try {
    // 2. If forceRegenerate is true, reset all existing chunk embeddings
    if (forceRegenerate) {
      await DocumentChunk.updateMany(
        { documentId: document._id },
        {
          $set: {
            embeddingStatus: 'pending',
            embeddingModel: null,
            embeddingDimensions: 0,
            embeddingError: null
          },
          $unset: { embedding: 1 }
        }
      );
      document.embeddedChunks = 0;
      await document.save();
    }

    // 3. Find chunks requiring embedding generation (pending or failed)
    const pendingChunks = await DocumentChunk.find({
      documentId: document._id,
      embeddingStatus: { $ne: 'completed' }
    }).sort({ chunkIndex: 1 });

    document.chunks = totalChunks;

    if (pendingChunks.length === 0) {
      console.log(`[EMBEDDING] All ${totalChunks} chunks already have completed embeddings.`);
      document.status = 'ready';
      document.embeddingStatus = 'completed';
      document.vectorStatus = 'ready';
      document.embeddedChunks = totalChunks;
      document.embeddingError = null;
      await document.save();
      return document;
    }

    console.log(`[EMBEDDING] Total chunks: ${totalChunks} (${pendingChunks.length} pending)`);

    // 4. Process pending chunks in batches
    const totalBatches = Math.ceil(pendingChunks.length / batchSize);

    for (let b = 0; b < totalBatches; b++) {
      const batchChunks = pendingChunks.slice(b * batchSize, (b + 1) * batchSize);
      const batchTexts = batchChunks.map((c) => c.text);

      console.log(`[EMBEDDING] Batch ${b + 1}/${totalBatches} (${batchChunks.length} chunks)`);

      const result = await generateEmbeddings(batchTexts);

      if (result.vectors.length !== batchChunks.length) {
        throw new Error(
          `Embedding model returned ${result.vectors.length} vectors for ${batchChunks.length} text chunks.`
        );
      }

      const bulkOps = batchChunks.map((chunk, idx) => {
        const vector = result.vectors[idx];
        if (!vector || vector.length === 0) {
          throw new Error(`Empty embedding vector generated for chunk index ${chunk.chunkIndex}`);
        }

        return {
          updateOne: {
            filter: { _id: chunk._id },
            update: {
              $set: {
                embedding: vector,
                embeddingModel: result.modelName,
                embeddingDimensions: result.dimensions,
                embeddingStatus: 'completed',
                embeddingError: null
              }
            }
          }
        };
      });

      await DocumentChunk.bulkWrite(bulkOps);

      const completedCount = await DocumentChunk.countDocuments({
        documentId: document._id,
        embeddingStatus: 'completed'
      });

      document.embeddedChunks = completedCount;
      document.embeddingModel = result.modelName;
      await document.save();

      console.log(`[EMBEDDING] Generated embeddings for ${batchChunks.length} chunks (${completedCount}/${totalChunks})`);
    }

    // 5. Finalize Document embedding status
    const finalCompletedCount = await DocumentChunk.countDocuments({
      documentId: document._id,
      embeddingStatus: 'completed'
    });

    document.embeddedChunks = finalCompletedCount;
    document.status = 'ready';
    document.embeddingStatus = 'completed';
    document.vectorStatus = 'ready';
    document.embeddingError = null;
    await document.save();

    console.log(`[EMBEDDING] Completed: ${finalCompletedCount}/${totalChunks}`);
    return document;
  } catch (error) {
    console.error(`[EMBEDDING] Document embedding failed: ${error.message}`);
    document.status = 'failed';
    document.embeddingStatus = 'failed';
    document.vectorStatus = 'failed';
    document.embeddingError = error.message || 'Embedding generation failed';
    await document.save();
    return document;
  }
};
