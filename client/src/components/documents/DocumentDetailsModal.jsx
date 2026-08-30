import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import {
  FileText,
  ExternalLink,
  RefreshCw,
  Trash2,
  AlertCircle,
  BookOpen,
  Layers,
  Sparkles,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Filter,
  FileSpreadsheet,
  Info
} from 'lucide-react';
import { documentService } from '../../services/documentService';

const DocumentDetailsModal = ({ doc, isOpen, onClose, onDelete, onReplace }) => {
  const [docData, setDocData] = useState(doc || null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isChunking, setIsChunking] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);
  const [isViewingPdf, setIsViewingPdf] = useState(false);
  
  // Sub-view states: 'details' | 'pages' | 'chunks'
  const [activeTab, setActiveTab] = useState('details');

  // Pages inspection states
  const [pagesList, setPagesList] = useState([]);
  const [pagePagination, setPagePagination] = useState({ page: 1, pages: 1 });
  const [pagesLoading, setPagesLoading] = useState(false);

  // Chunks inspection states
  const [chunksList, setChunksList] = useState([]);
  const [chunkPagination, setChunkPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [chunksLoading, setChunksLoading] = useState(false);
  const [filterPageNumber, setFilterPageNumber] = useState('');

  // Embedding progress state
  const [embedState, setEmbedState] = useState({
    status: doc?.embeddingStatus || 'pending',
    embeddedChunks: doc?.embeddedChunks || 0,
    totalChunks: doc?.chunks || 0,
    progress: 0,
    embeddingModel: doc?.embeddingModel || null,
    embeddingError: doc?.embeddingError || null,
    isStarting: false
  });

  // Keep docData updated when doc prop changes
  useEffect(() => {
    if (isOpen && doc) {
      setDocData(doc);
      setActiveTab('details');
      setPagesList([]);
      setChunksList([]);
      setFilterPageNumber('');
      setEmbedState({
        status: doc.embeddingStatus || 'pending',
        embeddedChunks: doc.embeddedChunks || 0,
        totalChunks: doc.chunks || 0,
        progress: doc.chunks > 0 ? Math.round(((doc.embeddedChunks || 0) / doc.chunks) * 100) : 0,
        embeddingModel: doc.embeddingModel || null,
        embeddingError: doc.embeddingError || null,
        isStarting: false
      });
    }
  }, [isOpen, doc]);

  // Real-time Polling: Automatically poll document state & embedding progress ONLY while active processing is in progress
  useEffect(() => {
    let timer;
    if (isOpen && docData?.id) {
      const activeStates = ['extracting', 'chunking', 'embedding', 'processing'];
      const isProcessing = activeStates.includes(docData.status) || embedState.status === 'processing';

      if (isProcessing) {
        timer = setInterval(async () => {
          try {
            // Poll full document details
            const updatedDoc = await documentService.getDocumentById(docData.id);
            setDocData(updatedDoc);

            // Poll embedding status
            const statusData = await documentService.getEmbeddingStatus(docData.id);
            setEmbedState((prev) => ({
              ...prev,
              status: statusData.embeddingStatus || statusData.status || 'pending',
              embeddedChunks: statusData.embeddedChunks || 0,
              totalChunks: statusData.totalChunks || updatedDoc.chunks || 0,
              progress: statusData.progress || 0,
              embeddingModel: statusData.embeddingModel,
              embeddingError: statusData.embeddingError,
              isStarting: false
            }));

            // Stop polling immediately when reached terminal states
            const isFinished =
              (updatedDoc.status === 'ready' || updatedDoc.status === 'chunked' || updatedDoc.status === 'extracted' || updatedDoc.status === 'failed') &&
              (statusData.embeddingStatus === 'completed' || statusData.embeddingStatus === 'failed' || statusData.embeddingStatus === 'pending');

            if (isFinished && timer) {
              clearInterval(timer);
            }
          } catch (err) {
            console.error('[DocumentPolling] Error:', err);
          }
        }, 3000);
      }
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isOpen, docData?.id, docData?.status, embedState.status]);

  if (!docData) return null;

  const isExcel = docData.fileType === 'excel' || /\.(xlsx|xls)$/i.test(docData.originalFileName || docData.fileName || '');
  const hasExtractedContent = isExcel ? (docData.rowsCount > 0) : (docData.pages > 0);
  const hasChunks = (docData.chunks > 0);
  const isReady = docData.status === 'ready' || docData.embeddingStatus === 'completed';

  // Handler for Step 1: Extract Text / Data
  const handleExtract = async () => {
    setIsExtracting(true);
    try {
      const res = await documentService.extractDocument(docData.id);
      if (res.document) {
        setDocData(res.document);
      }
    } catch (err) {
      alert(err.message || 'Failed to extract document content');
    } finally {
      setIsExtracting(false);
    }
  };

  // Handler for Step 2: Create Chunks
  const handleCreateChunks = async () => {
    setIsChunking(true);
    try {
      const res = await documentService.createChunks(docData.id);
      if (res.document) {
        setDocData(res.document);
      }
    } catch (err) {
      alert(err.message || 'Failed to create document chunks');
    } finally {
      setIsChunking(false);
    }
  };

  // Handler for Step 3: Generate Embeddings
  const handleStartEmbeddings = async (force = false) => {
    setEmbedState((prev) => ({ ...prev, isStarting: true, status: 'processing', progress: 0 }));
    try {
      await documentService.startDocumentEmbedding(docData.id, force);
      setDocData((prev) => ({ ...prev, status: 'embedding' }));
    } catch (err) {
      alert(err.message || 'Failed to start embedding generation');
      setEmbedState((prev) => ({
        ...prev,
        isStarting: false,
        status: 'failed',
        embeddingError: err.message
      }));
    }
  };

  const loadPages = async (pageNumber = 1) => {
    setPagesLoading(true);
    try {
      const data = await documentService.getDocumentPages(docData.id, { page: pageNumber, limit: 1 });
      setPagesList(data.pages);
      setPagePagination(data.pagination);
      setActiveTab('pages');
    } catch (err) {
      alert(err.message || 'Failed to load extracted pages');
    } finally {
      setPagesLoading(false);
    }
  };

  const loadChunks = async (pageNumber = 1, pageFilter = filterPageNumber) => {
    setChunksLoading(true);
    try {
      const data = await documentService.getDocumentChunks(docData.id, {
        page: pageNumber,
        limit: 5,
        pageNumber: pageFilter || null
      });
      setChunksList(data.chunks);
      setChunkPagination(data.pagination);
      setActiveTab('chunks');
    } catch (err) {
      alert(err.message || 'Failed to load document chunks');
    } finally {
      setChunksLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const ext = selectedFile.name.toLowerCase().slice(selectedFile.name.lastIndexOf('.'));
      if (!['.pdf', '.xls', '.xlsx'].includes(ext)) {
        alert('Supported file types: PDF, XLS, XLSX.');
        return;
      }
      setIsReplacing(true);
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        await onReplace(docData.id, formData);
        onClose();
      } catch (err) {
        alert(err.message || 'Failed to replace document file');
      } finally {
        setIsReplacing(false);
      }
    }
  };

  const handleViewPdf = async () => {
    setIsViewingPdf(true);
    try {
      await documentService.viewDocumentPdf(docData.id);
    } catch (err) {
      alert(err.message || 'Failed to load document file');
    } finally {
      setIsViewingPdf(false);
    }
  };

  // Helper for rendering status badge
  const renderStatusBadge = () => {
    const status = docData.status;
    if (status === 'extracting') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1.5 animate-pulse">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Extracting
        </span>
      );
    }
    if (status === 'extracted') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
          Extracted
        </span>
      );
    }
    if (status === 'chunking') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1.5 animate-pulse">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Chunking
        </span>
      );
    }
    if (status === 'chunked') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
          Chunked
        </span>
      );
    }
    if (status === 'embedding' || embedState.status === 'processing') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1.5 animate-pulse">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating
        </span>
      );
    }
    if (status === 'ready' || embedState.status === 'completed') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Ready
        </span>
      );
    }
    if (status === 'failed' || embedState.status === 'failed') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Failed
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-700 border border-slate-200">
        Not Extracted
      </span>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setActiveTab('details');
        onClose();
      }}
      title={
        activeTab === 'pages'
          ? `Extracted Pages — ${docData.title}`
          : activeTab === 'chunks'
          ? `Document Chunks — ${docData.title}`
          : 'Vector Embeddings'
      }
      maxWidth="max-w-2xl"
    >
      {activeTab === 'details' ? (
        /* Main Document Processing View */
        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-12 h-12 rounded-2xl ${isExcel ? 'bg-emerald-600' : 'bg-indigo-600'} text-white flex items-center justify-center shrink-0 shadow-md`}>
                {isExcel ? <FileSpreadsheet className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-extrabold text-slate-900 leading-tight truncate">
                  {docData.title}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5 truncate">
                  Generate semantic vectors for this document
                </p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                  {docData.originalFileName || docData.fileName}
                </p>
              </div>
            </div>
            <div className="shrink-0">
              {renderStatusBadge()}
            </div>
          </div>

          {/* Processing Error Banner if failed */}
          {(docData.status === 'failed' || embedState.status === 'failed') && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Processing Exception</span>
              </div>
              <p className="text-xs leading-relaxed">
                {docData.processingError || embedState.embeddingError || 'An error occurred during document processing.'}
              </p>
            </div>
          )}

          {/* STATUS CARDS GRID (3 Cards: PDF uses Pages | Excel uses Sheets & Rows) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* CARD 1: Pages or Sheets & Rows */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs text-center space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {isExcel ? 'Sheets / Rows Extracted' : 'Extracted Pages'}
              </p>
              {isExcel ? (
                <div>
                  <p className="text-lg font-black text-slate-800">
                    {docData.sheetsCount || 0} <span className="text-xs font-semibold text-slate-400">Sheets</span>
                  </p>
                  <p className="text-xs font-bold text-emerald-600">
                    {(docData.rowsCount || 0).toLocaleString()} <span className="text-[10px] font-normal text-slate-500">rows</span>
                  </p>
                </div>
              ) : (
                <p className="text-2xl font-black text-slate-800">{docData.pages || 0}</p>
              )}
            </div>

            {/* CARD 2: Generated Chunks */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs text-center space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                Generated Chunks
              </p>
              <p className="text-2xl font-black text-indigo-600">
                {(docData.chunks || 0).toLocaleString()}
              </p>
            </div>

            {/* CARD 3: Embedding Status */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs text-center space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Embedding Status
              </p>
              <p className={`text-sm font-black mt-1.5 ${
                isReady
                  ? 'text-emerald-600'
                  : embedState.status === 'processing'
                  ? 'text-amber-600 animate-pulse'
                  : embedState.status === 'failed'
                  ? 'text-rose-600'
                  : 'text-slate-400'
              }`}>
                {isReady
                  ? '✓ Ready'
                  : embedState.status === 'processing'
                  ? `Generating (${embedState.progress}%)`
                  : embedState.status === 'failed'
                  ? 'Failed'
                  : 'Not Generated'}
              </p>
            </div>
          </div>

          {/* EXPLANATORY INFO MESSAGE WHEN PAGES / CHUNKS ARE ZERO */}
          {(!hasExtractedContent || !hasChunks) && (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 space-y-1">
              <div className="flex items-center gap-2 font-extrabold text-xs">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Text extraction must be completed before embeddings can be generated.</span>
              </div>
              <p className="text-xs text-amber-800/90 pl-6 leading-relaxed">
                No extracted pages or chunks are available for this document. Execute the pipeline steps below.
              </p>
            </div>
          )}

          {/* PROGRESS INDICATOR BAR DURING EXTRACTION, CHUNKING, OR EMBEDDING */}
          {docData.status === 'extracting' && (
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-blue-800">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  Extracting document content...
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-blue-200/60 overflow-hidden">
                <div className="h-full bg-blue-600 animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          )}

          {docData.status === 'chunking' && (
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-purple-800">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                  Creating semantic chunks...
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-purple-200/60 overflow-hidden">
                <div className="h-full bg-purple-600 animate-pulse" style={{ width: '75%' }}></div>
              </div>
            </div>
          )}

          {(docData.status === 'embedding' || embedState.status === 'processing') && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white space-y-3 shadow-lg">
              <div className="flex items-center justify-between text-xs text-indigo-200 font-bold">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                  Generating embeddings...
                </span>
                <span className="font-mono">{embedState.progress}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-indigo-400 transition-all duration-300"
                  style={{ width: `${embedState.progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-indigo-300 font-medium">
                {embedState.embeddedChunks} / {embedState.totalChunks} chunks completed
              </p>
            </div>
          )}

          {/* DYNAMIC ACTION BUTTONS (STEP-BY-STEP WORKFLOW) */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
              Document Processing Pipeline Controls
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* STEP 1: Extract Text / Data */}
              <button
                type="button"
                onClick={handleExtract}
                disabled={isExtracting || docData.status === 'extracting'}
                className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md cursor-pointer"
                title="Extract text pages from PDF or sheets/rows from Excel"
              >
                {isExtracting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                ) : (
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                )}
                {isExcel ? 'Extract Data' : 'Extract Text'}
              </button>

              {/* STEP 2: Create Chunks */}
              <button
                type="button"
                onClick={handleCreateChunks}
                disabled={!hasExtractedContent || isChunking || docData.status === 'chunking'}
                className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md cursor-pointer"
                title={!hasExtractedContent ? 'Text extraction must be completed before creating chunks' : 'Create semantic chunks from extracted content'}
              >
                {isChunking ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Layers className="w-4 h-4 text-indigo-200" />
                )}
                Create Chunks
              </button>

              {/* STEP 3: Generate Embeddings / Regenerate Embeddings */}
              <button
                type="button"
                onClick={() => handleStartEmbeddings(isReady)}
                disabled={!hasChunks || embedState.isStarting || embedState.status === 'processing'}
                className={`p-3 rounded-2xl text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md cursor-pointer ${
                  isReady ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                }`}
                title={!hasChunks ? 'Chunks must be created before embeddings can be generated' : isReady ? 'Regenerate vector embeddings for all chunks' : 'Generate numerical vector embeddings for chunks'}
              >
                {embedState.isStarting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Sparkles className="w-4 h-4 text-amber-300" />
                )}
                {isReady ? 'Regenerate Embeddings' : 'Generate Embeddings'}
              </button>
            </div>
          </div>

          {/* INSPECTION BUTTONS */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => loadPages(1)}
              disabled={!hasExtractedContent}
              className="p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title={!hasExtractedContent ? 'No extracted text available yet' : 'View extracted page content'}
            >
              <BookOpen className="w-4 h-4" /> View Extracted Text ({docData.pages || 0} Pages)
            </button>
            <button
              onClick={() => loadChunks(1)}
              disabled={!hasChunks}
              className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-slate-900/20 cursor-pointer"
              title={!hasChunks ? 'No chunks generated yet' : 'Inspect generated text chunks'}
            >
              <Layers className="w-4 h-4 text-indigo-400" /> Inspect Chunks ({docData.chunks || 0} Chunks)
            </button>
          </div>

          {/* Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              icon={isViewingPdf ? Loader2 : ExternalLink}
              loading={isViewingPdf}
              onClick={handleViewPdf}
            >
              {isExcel ? 'Download Excel' : 'View PDF'}
            </Button>

            <div className="flex items-center gap-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.xls,.xlsx"
                  onChange={handleFileChange}
                  disabled={isReplacing}
                  className="hidden"
                />
                <span className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs inline-flex items-center gap-1.5 transition-colors">
                  <RefreshCw className={`w-3.5 h-3.5 ${isReplacing ? 'animate-spin' : ''}`} />
                  Replace File
                </span>
              </label>

              <Button
                variant="danger"
                icon={Trash2}
                onClick={() => {
                  onDelete(docData.id);
                  onClose();
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      ) : activeTab === 'pages' ? (
        /* Page Text Inspection Sub-view */
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <button
              onClick={() => setActiveTab('details')}
              className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Vector Embeddings
            </button>
            <span className="text-xs font-bold text-slate-500">
              Page {pagePagination.page} of {pagePagination.pages} ({pagePagination.total} Total Extracted Pages)
            </span>
          </div>

          {pagesLoading ? (
            <div className="p-8 text-center text-xs text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
              Loading page content...
            </div>
          ) : pagesList.length === 0 ? (
            <p className="text-xs text-slate-400 p-6 text-center">No extracted pages found.</p>
          ) : (
            <div className="space-y-4">
              {pagesList.map((p) => (
                <div key={p.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold border-b border-slate-200/80 pb-2">
                    <span className="text-indigo-600">Page {p.pageNumber}</span>
                    <span className="text-slate-400 text-[11px] font-normal">
                      {p.characterCount} characters
                    </span>
                  </div>
                  <pre className="text-xs text-slate-800 font-sans whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                    {p.text}
                  </pre>
                </div>
              ))}

              {pagePagination.pages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    icon={ChevronLeft}
                    disabled={pagePagination.page <= 1}
                    onClick={() => loadPages(pagePagination.page - 1)}
                  >
                    Previous Page
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pagePagination.page >= pagePagination.pages}
                    onClick={() => loadPages(pagePagination.page + 1)}
                  >
                    Next Page <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Document Chunk Inspection Sub-view */
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <button
              onClick={() => setActiveTab('details')}
              className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Vector Embeddings
            </button>

            {!isExcel && (
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={filterPageNumber}
                  onChange={(e) => {
                    setFilterPageNumber(e.target.value);
                    loadChunks(1, e.target.value);
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All PDF Pages</option>
                  {Array.from({ length: docData.pages || 1 }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      Page {num}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>
              Showing chunks {chunkPagination.page} of {chunkPagination.pages} ({chunkPagination.total} Total Generated Chunks)
            </span>
          </div>

          {chunksLoading ? (
            <div className="p-8 text-center text-xs text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
              Loading chunks...
            </div>
          ) : chunksList.length === 0 ? (
            <p className="text-xs text-slate-400 p-6 text-center">
              {filterPageNumber ? `No chunks generated for Page ${filterPageNumber}` : 'No generated chunks found.'}
            </p>
          ) : (
            <div className="space-y-3">
              {chunksList.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                        Chunk #{c.chunkIndex}
                      </span>
                      {c.sheetName ? (
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          Sheet: {c.sheetName} (Row {c.rowNumber})
                        </span>
                      ) : (
                        <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          Page {c.pageNumber}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
                      <span>{c.characterCount} chars</span>
                      {c.embeddingStatus === 'completed' && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                          ✓ Embedded ({c.embeddingDimensions || 384}d)
                        </span>
                      )}
                    </div>
                  </div>

                  <pre className="text-xs text-slate-800 font-sans whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                    {c.text}
                  </pre>
                </div>
              ))}

              {chunkPagination.pages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    icon={ChevronLeft}
                    disabled={chunkPagination.page <= 1}
                    onClick={() => loadChunks(chunkPagination.page - 1)}
                  >
                    Previous Chunks
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={chunkPagination.page >= chunkPagination.pages}
                    onClick={() => loadChunks(chunkPagination.page + 1)}
                  >
                    Next Chunks <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default DocumentDetailsModal;
