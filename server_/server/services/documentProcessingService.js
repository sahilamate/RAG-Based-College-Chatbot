import Document from '../models/Document.js';
import ExtractedPage from '../models/ExtractedPage.js';
import DocumentChunk from '../models/DocumentChunk.js';
import { extractPdfText } from './pdfService.js';
import { chunkText, getChunkConfig } from './chunkingService.js';
import { parseExcelWorkbook } from './excelService.js';
import { generateDocumentEmbeddings } from './embeddingProcessingService.js';

/**
 * Step 1: Extract content from document (PDF text pages or Excel sheets/rows)
 * Updates Document status to 'extracting' -> 'extracted' (or 'failed')
 * 
 * @param {string} documentId
 * @returns {Promise<Document>}
 */
export const extractDocumentContent = async (documentId) => {
  const document = await Document.findById(documentId);
  if (!document) {
    throw new Error(`Document not found with ID: ${documentId}`);
  }

  const isExcel = document.fileType === 'excel' || /\.(xlsx|xls)$/i.test(document.originalFileName || document.fileName || '');
  const docTypeLabel = isExcel ? 'EXCEL' : 'PDF';

  console.log(`[${docTypeLabel}-EXTRACT] Step 1: Extraction started for ${document.title}`);

  document.status = 'extracting';
  document.processingError = null;
  await document.save();

  try {
    if (isExcel) {
      // Excel Extraction
      const parsed = parseExcelWorkbook(document.filePath);
      if (!parsed || parsed.rowsCount === 0) {
        document.status = 'failed';
        document.processingError = 'Excel extraction failed: No usable data rows found.';
        await document.save();
        return document;
      }

      document.fileType = 'excel';
      document.sheetsCount = parsed.sheetsCount;
      document.rowsCount = parsed.rowsCount;
      document.pages = 0; // PDF pages set to 0 for Excel
      document.status = 'extracted';
      document.processingError = null;
      await document.save();

      console.log(`[EXCEL-EXTRACT] Successfully extracted ${parsed.sheetsCount} sheets and ${parsed.rowsCount} rows.`);
      return document;
    } else {
      // PDF Extraction
      const extractedPagesData = await extractPdfText(document.filePath);
      const totalCharCount = extractedPagesData.reduce((sum, p) => sum + (p.characterCount || 0), 0);

      if (extractedPagesData.length === 0 || totalCharCount === 0) {
        document.status = 'failed';
        document.processingError = 'PDF extraction failed: File contains no extractable text.';
        await document.save();
        return document;
      }

      await ExtractedPage.deleteMany({ documentId: document._id });

      const pageRecords = extractedPagesData.map((p) => ({
        documentId: document._id,
        pageNumber: p.pageNumber,
        text: p.text,
        characterCount: p.characterCount
      }));

      await ExtractedPage.insertMany(pageRecords);

      document.fileType = 'pdf';
      document.pages = extractedPagesData.length;
      document.sheetsCount = 0;
      document.rowsCount = 0;
      document.status = 'extracted';
      document.processingError = null;
      await document.save();

      console.log(`[PDF-EXTRACT] Successfully extracted ${extractedPagesData.length} pages.`);
      return document;
    }
  } catch (error) {
    console.error(`[${docTypeLabel}-EXTRACT] Extraction failed: ${error.message}`);
    document.status = 'failed';
    document.processingError = error.message || 'Text extraction failed';
    await document.save();
    return document;
  }
};

/**
 * Step 2: Create semantic chunks from extracted content
 * Updates Document status to 'chunking' -> 'chunked' (or 'failed')
 * 
 * @param {string} documentId
 * @returns {Promise<Document>}
 */
export const createDocumentChunks = async (documentId) => {
  const document = await Document.findById(documentId);
  if (!document) {
    throw new Error(`Document not found with ID: ${documentId}`);
  }

  const isExcel = document.fileType === 'excel' || /\.(xlsx|xls)$/i.test(document.originalFileName || document.fileName || '');
  const isExtracted = isExcel ? (document.rowsCount > 0) : (document.pages > 0);

  if (!isExtracted) {
    throw new Error('Cannot create chunks: Document text or rows have not been extracted yet.');
  }

  console.log(`[CHUNKING] Step 2: Creating chunks for ${document.title}`);

  document.status = 'chunking';
  document.processingError = null;
  await document.save();

  try {
    // Clear old chunks
    await DocumentChunk.deleteMany({ documentId: document._id });

    if (isExcel) {
      const parsed = parseExcelWorkbook(document.filePath);
      const chunkRecords = [];
      let globalChunkIndex = 0;

      for (const sheetObj of parsed.sheetsData) {
        for (const rowObj of sheetObj.rows) {
          chunkRecords.push({
            documentId: document._id,
            fileType: 'excel',
            pageNumber: 1,
            chunkIndex: globalChunkIndex,
            sheetName: sheetObj.sheetName,
            rowNumber: rowObj.rowNumber,
            headers: rowObj.headers,
            structuredData: rowObj.data,
            sectionTitle: sheetObj.sheetName,
            text: rowObj.text,
            characterCount: rowObj.text.length,
            tokenCount: Math.ceil(rowObj.text.length / 4),
            keywords: rowObj.keywords,
            academicYear: document.academicYear || '2026',
            embeddingStatus: 'pending',
            embedding: null
          });
          globalChunkIndex++;
        }
      }

      if (chunkRecords.length === 0) {
        document.status = 'failed';
        document.processingError = 'Chunk creation failed: No data chunks produced.';
        await document.save();
        return document;
      }

      const insertBatchSize = 5000;
      for (let i = 0; i < chunkRecords.length; i += insertBatchSize) {
        const batch = chunkRecords.slice(i, i + insertBatchSize);
        await DocumentChunk.collection.insertMany(batch, { ordered: false });
      }

      document.chunks = chunkRecords.length;
      document.status = 'chunked';
      document.processingError = null;
      await document.save();

      console.log(`[EXCEL-CHUNK] Created ${chunkRecords.length} chunks.`);
      return document;
    } else {
      const extractedPagesData = await ExtractedPage.find({ documentId: document._id }).sort({ pageNumber: 1 });

      if (extractedPagesData.length === 0) {
        document.status = 'failed';
        document.processingError = 'Chunk creation failed: No extracted pages found in database.';
        await document.save();
        return document;
      }

      const chunkConfig = getChunkConfig();
      const chunkRecords = [];
      let globalChunkIndex = 0;

      for (const pageObj of extractedPagesData) {
        if (!pageObj.text || !pageObj.text.trim()) continue;

        const pageChunks = chunkText(pageObj.text, chunkConfig);
        for (const c of pageChunks) {
          chunkRecords.push({
            documentId: document._id,
            fileType: 'pdf',
            pageNumber: pageObj.pageNumber,
            chunkIndex: globalChunkIndex,
            sectionTitle: c.sectionTitle || 'General Policy',
            text: c.text,
            characterCount: c.characterCount,
            tokenCount: Math.ceil(c.characterCount / 4),
            academicYear: document.academicYear || '2026',
            embeddingStatus: 'pending',
            embedding: null
          });
          globalChunkIndex++;
        }
      }

      if (chunkRecords.length === 0) {
        document.status = 'failed';
        document.processingError = 'Chunk creation failed: No valid text chunks generated.';
        await document.save();
        return document;
      }

      await DocumentChunk.insertMany(chunkRecords);

      document.chunks = chunkRecords.length;
      document.status = 'chunked';
      document.processingError = null;
      await document.save();

      console.log(`[PDF-CHUNK] Created ${chunkRecords.length} chunks.`);
      return document;
    }
  } catch (error) {
    console.error(`[CHUNK] Chunk creation failed: ${error.message}`);
    document.status = 'failed';
    document.processingError = error.message || 'Chunk creation failed';
    await document.save();
    return document;
  }
};

/**
 * Step 3: Run Full Document Pipeline (Extract -> Chunk -> Embed)
 * 
 * @param {string} documentId
 * @returns {Promise<Document>}
 */
export const processDocument = async (documentId) => {
  const extractedDoc = await extractDocumentContent(documentId);
  if (extractedDoc.status === 'failed') return extractedDoc;

  const chunkedDoc = await createDocumentChunks(documentId);
  if (chunkedDoc.status === 'failed') return chunkedDoc;

  const embeddedDoc = await generateDocumentEmbeddings(documentId);
  return embeddedDoc;
};

export const processFullDocumentPipeline = processDocument;
