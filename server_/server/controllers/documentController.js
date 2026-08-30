import fs from 'fs';
import path from 'path';
import Document from '../models/Document.js';
import ExtractedPage from '../models/ExtractedPage.js';
import DocumentChunk from '../models/DocumentChunk.js';
import {
  processDocument,
  extractDocumentContent,
  createDocumentChunks,
  processFullDocumentPipeline
} from '../services/documentProcessingService.js';
import { generateDocumentEmbeddings } from '../services/embeddingProcessingService.js';

// @desc    Upload document (PDF, XLS, XLSX) & trigger background extraction & chunking
// @route   POST /api/documents/upload
// @access  Private/Admin
export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select a document file (PDF, XLS, XLSX) to upload'
      });
    }

    const maxSizeBytes = 25 * 1024 * 1024; // 26214400 bytes
    if (req.file.size > maxSizeBytes) {
      if (req.file.path && fs.existsSync(req.file.path)) {
        try { fs.unlinkSync(req.file.path); } catch (e) {}
      }
      return res.status(413).json({
        success: false,
        message: 'File is too large. The maximum allowed file size is 25 MB.'
      });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    const isExcel = ext === '.xlsx' || ext === '.xls';
    const isPdf = ext === '.pdf';

    if (!isExcel && !isPdf) {
      if (req.file.path && fs.existsSync(req.file.path)) {
        try { fs.unlinkSync(req.file.path); } catch (e) {}
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Supported files: PDF, XLS, XLSX.'
      });
    }

    const { title, department, category, academicYear, description } = req.body;

    if (!title || !title.trim()) {
      if (req.file.path && fs.existsSync(req.file.path)) {
        try { fs.unlinkSync(req.file.path); } catch (e) {}
      }
      return res.status(400).json({
        success: false,
        message: 'Document title is required'
      });
    }

    const fileType = isExcel ? 'excel' : 'pdf';

    // Duplicate Prevention: Check if document with same original file name already exists for this user
    const existingDoc = await Document.findOne({
      originalFileName: req.file.originalname,
      uploadedBy: req.user._id
    });

    if (existingDoc) {
      console.log(`[UploadDocument] Re-upload detected for '${req.file.originalname}'. Replacing previous document record.`);
      if (existingDoc.filePath && fs.existsSync(existingDoc.filePath)) {
        try { fs.unlinkSync(existingDoc.filePath); } catch (err) {}
      }
      await ExtractedPage.deleteMany({ documentId: existingDoc._id });
      await DocumentChunk.deleteMany({ documentId: existingDoc._id });
      await existingDoc.deleteOne();
    }

    const document = await Document.create({
      title: title.trim(),
      fileName: req.file.filename,
      originalFileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype || (isExcel ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/pdf'),
      fileType,
      department: department ? department.trim() : 'All Departments',
      category: category ? category.trim() : 'Other',
      academicYear: academicYear ? academicYear.trim() : '2026',
      description: description ? description.trim() : '',
      uploadedBy: req.user._id,
      status: 'uploaded',
      pages: 0,
      sheetsCount: 0,
      rowsCount: 0,
      chunks: 0,
      processingError: null,
      embeddingStatus: 'pending',
      embeddedChunks: 0,
      embeddingModel: null,
      embeddingError: null
    });

    // Trigger asynchronous document processing (Extraction + Chunking + Embedding) in background
    processDocument(document._id)
      .then(async (processedDoc) => {
        if (processedDoc && processedDoc.status === 'processed' && processedDoc.chunks > 0) {
          await generateDocumentEmbeddings(document._id);
        }
      })
      .catch((err) => {
        console.error('[UploadDocument] Async background processing error:', err.message);
      });

    return res.status(201).json({
      success: true,
      message: `${fileType === 'excel' ? 'Excel' : 'PDF'} document uploaded successfully. Extraction & indexing started.`,
      document: {
        id: document._id,
        title: document.title,
        fileName: document.fileName,
        originalFileName: document.originalFileName,
        fileSize: document.fileSize,
        fileType: document.fileType,
        department: document.department,
        category: document.category,
        academicYear: document.academicYear,
        description: document.description,
        status: document.status,
        pages: document.pages,
        sheetsCount: document.sheetsCount,
        rowsCount: document.rowsCount,
        chunks: document.chunks,
        embeddingStatus: document.embeddingStatus,
        embeddedChunks: document.embeddedChunks,
        createdAt: document.createdAt
      }
    });
  } catch (error) {
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('[UploadDocument] Unlink error:', err.message);
      }
    }
    next(error);
  }
};

// @desc    Get all documents with search, filter, and pagination
// @route   GET /api/documents
// @access  Private/Admin
export const getDocuments = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const skip = (page - 1) * limit;

    const { search, department, category, status, academicYear } = req.query;

    const query = {};

    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { originalFileName: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    if (department && department !== 'All' && department !== 'All Departments') {
      query.department = department;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (academicYear && academicYear !== 'All') {
      query.academicYear = academicYear;
    }

    const total = await Document.countDocuments(query);
    const documents = await Document.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('uploadedBy', 'name email');

    const formattedDocs = documents.map((doc) => ({
      id: doc._id,
      title: doc.title,
      fileName: doc.fileName,
      originalFileName: doc.originalFileName,
      fileSize: doc.fileSize,
      fileType: doc.fileType || 'pdf',
      department: doc.department,
      category: doc.category,
      academicYear: doc.academicYear,
      description: doc.description,
      status: doc.status,
      pages: doc.pages,
      sheetsCount: doc.sheetsCount || 0,
      rowsCount: doc.rowsCount || 0,
      chunks: doc.chunks,
      processingError: doc.processingError,
      embeddingStatus: doc.embeddingStatus || 'pending',
      embeddedChunks: doc.embeddedChunks || 0,
      embeddingModel: doc.embeddingModel,
      embeddingError: doc.embeddingError,
      uploadedBy: {
        id: doc.uploadedBy?._id,
        name: doc.uploadedBy?.name || 'College Admin'
      },
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    }));

    const totalPages = Math.ceil(total / limit) || 1;

    return res.status(200).json({
      success: true,
      documents: formattedDocs,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get document details by ID
// @route   GET /api/documents/:id
// @access  Private/Admin
export const getDocumentById = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id).populate('uploadedBy', 'name email');
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    return res.status(200).json({
      success: true,
      document: {
        id: document._id,
        title: document.title,
        fileName: document.fileName,
        originalFileName: document.originalFileName,
        fileSize: document.fileSize,
        fileType: document.fileType || 'pdf',
        mimeType: document.mimeType,
        department: document.department,
        category: document.category,
        academicYear: document.academicYear,
        description: document.description,
        status: document.status,
        pages: document.pages,
        sheetsCount: document.sheetsCount || 0,
        rowsCount: document.rowsCount || 0,
        chunks: document.chunks,
        processingError: document.processingError,
        embeddingStatus: document.embeddingStatus || 'pending',
        embeddedChunks: document.embeddedChunks || 0,
        embeddingModel: document.embeddingModel,
        embeddingError: document.embeddingError,
        uploadedBy: {
          id: document.uploadedBy?._id,
          name: document.uploadedBy?.name || 'College Admin'
        },
        createdAt: document.createdAt,
        updatedAt: document.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Extract text (PDF) or sheets/rows (Excel) on demand
// @route   POST /api/documents/:id/extract
// @access  Private/Admin
export const extractDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    const updatedDoc = await extractDocumentContent(document._id);
    return res.status(200).json({
      success: updatedDoc.status !== 'failed',
      message: updatedDoc.status === 'failed' ? updatedDoc.processingError : 'Text/data extraction completed successfully',
      document: updatedDoc
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create semantic chunks from extracted content on demand
// @route   POST /api/documents/:id/chunk
// @access  Private/Admin
export const chunkDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    const isExcel = document.fileType === 'excel' || /\.(xlsx|xls)$/i.test(document.originalFileName || document.fileName || '');
    const hasExtracted = isExcel ? document.rowsCount > 0 : document.pages > 0;

    if (!hasExtracted) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create chunks because text extraction has not been performed yet.'
      });
    }

    const updatedDoc = await createDocumentChunks(document._id);
    return res.status(200).json({
      success: updatedDoc.status !== 'failed',
      message: updatedDoc.status === 'failed' ? updatedDoc.processingError : 'Semantic chunk creation completed successfully',
      document: updatedDoc
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Start background embedding generation for a document
// @route   POST /api/documents/:id/embed
// @access  Private/Admin
export const startDocumentEmbedding = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    const totalChunks = document.chunks || (await DocumentChunk.countDocuments({ documentId: document._id }));

    // BACKEND VALIDATION: Chunks MUST exist before embeddings can be generated
    if (totalChunks === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot generate embeddings because no chunks exist.'
      });
    }

    const force = req.query.force === 'true';

    // Trigger asynchronous background embedding process
    generateDocumentEmbeddings(document._id, force).catch((err) => {
      console.error('[StartEmbedding] Async embedding error:', err.message);
    });

    return res.status(202).json({
      success: true,
      message: 'Embedding generation started',
      documentId: document._id,
      status: 'processing'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Run full document processing pipeline (Extract -> Chunk -> Embed)
// @route   POST /api/documents/:id/process-all
// @access  Private/Admin
export const processFullDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    processFullDocumentPipeline(document._id).catch((err) => {
      console.error('[ProcessFull] Async error:', err.message);
    });

    return res.status(202).json({
      success: true,
      message: 'Full processing pipeline started (Extract -> Chunk -> Embed)',
      documentId: document._id,
      status: 'processing'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get live embedding progress & document processing status for a document
// @route   GET /api/documents/:id/embedding-status
// @access  Private/Admin
export const getEmbeddingStatus = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    const totalChunks = document.chunks || (await DocumentChunk.countDocuments({ documentId: document._id }));
    const embeddedChunks = await DocumentChunk.countDocuments({
      documentId: document._id,
      embeddingStatus: 'completed'
    });
    const failedChunks = await DocumentChunk.countDocuments({
      documentId: document._id,
      embeddingStatus: 'failed'
    });

    const progress = totalChunks > 0 ? parseFloat(((embeddedChunks / totalChunks) * 100).toFixed(2)) : 0;

    return res.status(200).json({
      success: true,
      documentStatus: document.status || 'uploaded',
      embeddingStatus: document.embeddingStatus || 'pending',
      fileType: document.fileType || 'pdf',
      pages: document.pages || 0,
      sheetsCount: document.sheetsCount || 0,
      rowsCount: document.rowsCount || 0,
      totalChunks,
      embeddedChunks,
      failedChunks,
      progress,
      embeddingModel: document.embeddingModel,
      embeddingError: document.embeddingError,
      processingError: document.processingError
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get extracted page text for a document
// @route   GET /api/documents/:id/pages
// @access  Private/Admin
export const getDocumentPages = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const skip = (page - 1) * limit;

    const total = await ExtractedPage.countDocuments({ documentId: document._id });
    const pagesList = await ExtractedPage.find({ documentId: document._id })
      .sort({ pageNumber: 1 })
      .skip(skip)
      .limit(limit);

    const formattedPages = pagesList.map((p) => ({
      id: p._id,
      pageNumber: p.pageNumber,
      text: p.text,
      characterCount: p.characterCount
    }));

    const totalPages = Math.ceil(total / limit) || 1;

    return res.status(200).json({
      success: true,
      pages: formattedPages,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get generated DocumentChunk records (heavy embedding vectors stripped for security/bandwidth)
// @route   GET /api/documents/:id/chunks
// @access  Private/Admin
export const getDocumentChunks = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const skip = (page - 1) * limit;

    const query = { documentId: document._id };

    if (req.query.pageNumber) {
      const pageNum = parseInt(req.query.pageNumber, 10);
      if (!isNaN(pageNum)) {
        query.pageNumber = pageNum;
      }
    }

    const total = await DocumentChunk.countDocuments(query);
    // Explicitly exclude heavy embedding array from frontend API output
    const chunksList = await DocumentChunk.find(query)
      .select('-embedding')
      .sort({ chunkIndex: 1 })
      .skip(skip)
      .limit(limit);

    const formattedChunks = chunksList.map((c) => ({
      id: c._id,
      documentId: c.documentId,
      fileType: c.fileType || 'pdf',
      pageNumber: c.pageNumber,
      sheetName: c.sheetName,
      rowNumber: c.rowNumber,
      headers: c.headers,
      structuredData: c.structuredData,
      chunkIndex: c.chunkIndex,
      text: c.text,
      characterCount: c.characterCount,
      tokenCount: c.tokenCount,
      embeddingStatus: c.embeddingStatus || 'pending',
      embeddingModel: c.embeddingModel,
      embeddingDimensions: c.embeddingDimensions,
      createdAt: c.createdAt
    }));

    const totalPages = Math.ceil(total / limit) || 1;

    return res.status(200).json({
      success: true,
      chunks: formattedChunks,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Stream physical document file to browser with inline disposition
// @route   GET /api/documents/:id/file
// @access  Private
export const getDocumentFile = async (req, res, next) => {

  try {
    console.log(`\n[FILE VIEW] Request received for document ID: ${req.params.id}`);
    if (req.user) {
      console.log(`[FILE VIEW] User authenticated: true | User ID: ${req.user._id} | Role: ${req.user.role}`);
    }

    const document = await Document.findById(req.params.id);
    if (!document) {
      console.log(`[VIEW SOURCE] Document not found: ${req.params.id}`);
      return res.status(404).json({
        success: false,
        message: 'Source document is no longer available.'
      });
    }

    const absolutePath = path.resolve(document.filePath);
    const fileExists = fs.existsSync(absolutePath);

    console.log(`\n[VIEW SOURCE]`);
    console.log(`[VIEW SOURCE] Document ID: ${document._id}`);
    console.log(`[VIEW SOURCE] Database filePath: ${document.filePath}`);
    console.log(`[VIEW SOURCE] Resolved filePath: ${absolutePath}`);
    console.log(`[VIEW SOURCE] File exists: ${fileExists}`);
    console.log(`[VIEW SOURCE] Original filename: ${document.originalFileName}`);
    console.log(`[VIEW SOURCE] URL: /api/documents/${document._id}/file`);

    if (!fileExists) {
      console.log(`[VIEW SOURCE] Error: Physical file missing on server: ${absolutePath}`);
      return res.status(404).json({
        success: false,
        message: 'Source document is no longer available.'
      });
    }

    const isExcel = document.fileType === 'excel' || /\.(xlsx|xls)$/i.test(document.originalFileName);
    const contentType = isExcel
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : 'application/pdf';

    res.setHeader('Content-Type', contentType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(document.originalFileName)}"`
    );

    return res.sendFile(absolutePath);
  } catch (error) {
    console.error(`[VIEW SOURCE] Error: ${error.message}`);
    next(error);
  }
};

// @desc    Replace existing PDF file & reset text extraction, chunking, and embeddings
// @route   PUT /api/documents/:id/file
// @access  Private/Admin
export const replaceDocumentFile = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select a new PDF file to replace the existing one'
      });
    }

    // Delete old physical file
    if (document.filePath && fs.existsSync(document.filePath)) {
      try {
        fs.unlinkSync(document.filePath);
      } catch (err) {
        console.error('[ReplaceFile] Unlink old file error:', err.message);
      }
    }

    // Delete old extracted pages & chunks
    await ExtractedPage.deleteMany({ documentId: document._id });
    await DocumentChunk.deleteMany({ documentId: document._id });

    // Update document metadata & reset embedding fields
    document.fileName = req.file.filename;
    document.originalFileName = req.file.originalname;
    document.filePath = req.file.path;
    document.fileSize = req.file.size;
    document.mimeType = req.file.mimetype;
    document.status = 'uploaded';
    document.pages = 0;
    document.chunks = 0;
    document.processingError = null;
    document.embeddingStatus = 'pending';
    document.embeddedChunks = 0;
    document.embeddingModel = null;
    document.embeddingError = null;

    await document.save();

    // Trigger background PDF re-extraction & chunking & embedding
    processDocument(document._id)
      .then(async (processedDoc) => {
        if (processedDoc && processedDoc.status === 'processed' && processedDoc.chunks > 0) {
          await generateDocumentEmbeddings(document._id);
        }
      })
      .catch((err) => {
        console.error('[ReplaceFile] Async re-processing error:', err.message);
      });

    return res.status(200).json({
      success: true,
      message: 'PDF file replaced successfully. Extraction & chunking started.',
      document: {
        id: document._id,
        title: document.title,
        fileName: document.fileName,
        originalFileName: document.originalFileName,
        fileSize: document.fileSize,
        status: document.status,
        pages: document.pages,
        chunks: document.chunks,
        embeddingStatus: document.embeddingStatus,
        updatedAt: document.updatedAt
      }
    });
  } catch (error) {
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('[ReplaceFile] Error cleanup:', err.message);
      }
    }
    next(error);
  }
};

// @desc    Reprocess PDF text extraction & chunking
// @route   POST /api/documents/:id/reprocess
// @access  Private/Admin
export const reprocessDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Delete old extracted pages & chunks
    await ExtractedPage.deleteMany({ documentId: document._id });
    await DocumentChunk.deleteMany({ documentId: document._id });

    document.embeddingStatus = 'pending';
    document.embeddedChunks = 0;
    document.embeddingModel = null;
    document.embeddingError = null;
    await document.save();

    // Perform text extraction & chunking synchronously for reprocess action
    const updatedDoc = await processDocument(document._id);
    if (updatedDoc && updatedDoc.status === 'processed' && updatedDoc.chunks > 0) {
      await generateDocumentEmbeddings(document._id);
    }


    return res.status(200).json({
      success: true,
      message: 'Document reprocessed successfully',
      document: updatedDoc
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete document, physical file, ExtractedPage & DocumentChunk records
// @route   DELETE /api/documents/:id
// @access  Private/Admin
export const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // 1. Delete physical file safely
    if (document.filePath && fs.existsSync(document.filePath)) {
      try {
        fs.unlinkSync(document.filePath);
      } catch (err) {
        console.error('[DeleteDocument] Physical file unlink error:', err.message);
      }
    }

    // 2. Delete all associated extracted pages & chunks (including embeddings) from MongoDB
    await ExtractedPage.deleteMany({ documentId: document._id });
    await DocumentChunk.deleteMany({ documentId: document._id });

    // 3. Delete document record
    await document.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Document, physical PDF file, extracted pages, and document chunks deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
