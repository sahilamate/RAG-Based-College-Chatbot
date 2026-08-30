import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { documentService } from '../../services/documentService';
import { useToast } from '../../hooks/useToast';
import DocumentTable from '../../components/documents/DocumentTable';
import DocumentDetailsModal from '../../components/documents/DocumentDetailsModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import Loading from '../../components/common/Loading';
import { Search, UploadCloud, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

const DEPARTMENTS = [
  'All Departments',
  'General College',
  'Computer Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electronics & Comm.'
];

const CATEGORIES = [
  'All',
  'Admissions',
  'Academics',
  'Fees',
  'Exams',
  'Hostel',
  'Library',
  'Scholarships',
  'Placements',
  'Policies',
  'Events',
  'Other'
];

const STATUSES = ['All', 'uploaded', 'processing', 'processed', 'failed'];

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All Departments');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [academicYear, setAcademicYear] = useState('All');

  // Independent state management
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteTitle, setDeleteTitle] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewingPdfId, setViewingPdfId] = useState(null);

  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const isPollingRef = useRef(false);

  const fetchDocuments = async (pageNumber = 1, isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const data = await documentService.getDocuments({
        search,
        department,
        category,
        status,
        academicYear,
        page: pageNumber,
        limit: 10
      });
      setDocuments(data.documents);
      setPagination(data.pagination);
    } catch (err) {
      if (!isSilent) addToast(err.message || 'Failed to load documents', 'error');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments(1);
  }, [search, department, category, status, academicYear]);

  // Real-time Polling: Automatically refresh list while any document status is "processing"
  useEffect(() => {
    const hasProcessing = documents.some((doc) => doc.status === 'processing');

    if (hasProcessing) {
      isPollingRef.current = true;
      const timer = setInterval(() => {
        fetchDocuments(pagination.page, true);
      }, 3000);

      return () => {
        clearInterval(timer);
        isPollingRef.current = false;
      };
    }
  }, [documents, pagination.page]);

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    const targetId = deleteId;
    setIsDeleting(true);
    try {
      await documentService.deleteDocument(targetId);
      addToast('Document deleted successfully.');
      
      // Reset target & selection states to close modal immediately
      setDeleteId(null);
      setDeleteTitle('');
      setSelectedDoc(null);

      // Update local state so deleted document disappears immediately
      setDocuments((prevDocs) => prevDocs.filter((d) => d.id !== targetId && d._id !== targetId));

      // Silently refresh list from server to maintain pagination metrics
      fetchDocuments(pagination.page, true);
    } catch (err) {
      addToast(err.message || 'Failed to delete document', 'error');
    } finally {
      setIsDeleting(false);
    }
  };


  const handleViewPdf = async (id) => {
    setViewingPdfId(id);
    try {
      await documentService.viewDocumentPdf(id);
    } catch (err) {
      addToast(err.message || 'Failed to load PDF', 'error');
    } finally {
      setViewingPdfId(null);
    }
  };

  const handleReprocess = async (id) => {
    try {
      await documentService.reprocessDocument(id);
      addToast('Document reprocessed successfully.');
      fetchDocuments(pagination.page);
    } catch (err) {
      addToast(err.message || 'Failed to reprocess document', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Document Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload, extract text, inspect page content, and manage college PDFs.
          </p>
        </div>

        <Link to="/admin/documents/upload">
          <Button variant="primary" icon={UploadCloud}>
            Upload Document
          </Button>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-1">
            <Input
              icon={Search}
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table or Loading / Empty States */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-xs">
          <Loading text="Loading documents..." />
        </div>
      ) : documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents uploaded yet"
          description="Upload your first college document to extract page content for the knowledge base."
          actionLabel="Upload Document"
          onAction={() => {}}
        />
      ) : (
        <div className="space-y-4">
          <DocumentTable
            documents={documents}
            onViewDetails={(doc) => setSelectedDoc(doc)}
            onDeleteDocument={(id) => {
              const docToDelete = documents.find((d) => d.id === id);
              setDeleteId(id);
              setDeleteTitle(docToDelete ? docToDelete.title : 'this document');
            }}
            onReprocessDocument={handleReprocess}
            onViewPdf={handleViewPdf}
            viewingPdfId={viewingPdfId}
            deletingDocumentId={isDeleting ? deleteId : null}
          />

          {/* Pagination Controls */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 text-xs">
              <span className="text-slate-500 font-medium">
                Page {pagination.page} of {pagination.pages} ({pagination.total} total documents)
              </span>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  icon={ChevronLeft}
                  disabled={pagination.page <= 1}
                  onClick={() => fetchDocuments(pagination.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => fetchDocuments(pagination.page + 1)}
                >
                  Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Details */}
      <DocumentDetailsModal
        doc={selectedDoc}
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        onDelete={(id) => {
          const docToDelete = documents.find((d) => d.id === id);
          setDeleteId(id);
          setDeleteTitle(docToDelete ? docToDelete.title : 'this document');
        }}
        onReplace={async (id, newFile) => {
          await documentService.replaceDocumentFile(id, newFile);
          addToast('PDF file replaced. Processing text extraction...');
          fetchDocuments(pagination.page);
        }}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => {
          if (!isDeleting) {
            setDeleteId(null);
            setDeleteTitle('');
          }
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Document?"
        message={`Are you sure you want to delete "${deleteTitle}"?`}
        confirmText="Delete"
        loading={isDeleting}
      />
    </div>
  );
};

export default Documents;

