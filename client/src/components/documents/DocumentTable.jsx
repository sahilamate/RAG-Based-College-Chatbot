import React from 'react';
import { FileText, Eye, Trash2, ExternalLink, RefreshCw, CheckCircle2, AlertCircle, Loader2, FileSpreadsheet } from 'lucide-react';
import Button from '../common/Button';
import { documentService } from '../../services/documentService';

const renderStatusBadge = (status) => {
  switch (status) {
    case 'ready':
    case 'processed':
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Ready
        </span>
      );
    case 'chunked':
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
          Chunked
        </span>
      );
    case 'extracted':
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
          Extracted
        </span>
      );
    case 'extracting':
    case 'chunking':
    case 'embedding':
    case 'processing':
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1.5 animate-pulse">
          <Loader2 className="w-3 h-3 animate-spin" /> Processing...
        </span>
      );
    case 'failed':
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1">
          <AlertCircle className="w-3 h-3 text-rose-600" /> Failed
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
          Not Extracted
        </span>
      );
  }
};

const DocumentTable = ({
  documents,
  onViewDetails,
  onDeleteDocument,
  onReprocessDocument,
  onViewPdf,
  viewingPdfId,
  deletingDocumentId
}) => {
  const handleViewPdfClick = (e, id) => {
    e.stopPropagation();
    if (onViewPdf) {
      onViewPdf(id);
    } else {
      documentService.viewDocumentPdf(id);
    }
  };

  return (
    <div className="w-full">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4">Document</th>
              <th className="py-3.5 px-4">Type</th>
              <th className="py-3.5 px-4">Department</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Structure</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Uploaded</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {documents.map((doc) => {
              const isExcel = doc.fileType === 'excel' || /\.(xlsx|xls)$/i.test(doc.originalFileName || doc.fileName || '');
              return (
                <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 max-w-[200px] truncate">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg ${isExcel ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'} flex items-center justify-center shrink-0`}>
                        {isExcel ? <FileSpreadsheet className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <span className="block truncate">{doc.title}</span>
                        <span className="block text-[10px] text-slate-400 font-mono font-normal truncate">
                          {doc.originalFileName || doc.fileName}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider ${isExcel ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                      {isExcel ? 'EXCEL' : 'PDF'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">{doc.department}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-[11px]">
                      {doc.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">
                    {isExcel
                      ? `${doc.sheetsCount || doc.pages || 0} sheets • ${(doc.rowsCount || doc.chunks || 0).toLocaleString()} rows`
                      : (doc.pages > 0 ? `${doc.pages} pages` : '0 pages')}
                  </td>
                  <td className="py-3.5 px-4">{renderStatusBadge(doc.status)}</td>
                  <td className="py-3.5 px-4 text-slate-500 font-medium">
                    {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1">
                    <button
                      onClick={(e) => handleViewPdfClick(e, doc.id)}
                      disabled={viewingPdfId === doc.id}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer disabled:opacity-50"
                      title={isExcel ? "Download Excel File" : "View PDF Document"}
                    >
                      {viewingPdfId === doc.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                      ) : (
                        <ExternalLink className="w-4 h-4" />
                      )}
                    </button>
                    {doc.status === 'failed' && (
                      <button
                        onClick={() => onReprocessDocument(doc.id)}
                        className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                        title="Reprocess text extraction"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onViewDetails(doc)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteDocument(doc.id)}
                      disabled={deletingDocumentId === doc.id}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
                      title="Delete document"
                    >
                      {deletingDocumentId === doc.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Responsive View */}
      <div className="block md:hidden space-y-3">
        {documents.map((doc) => (
          <div key={doc.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 leading-tight truncate">{doc.title}</h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{doc.originalFileName || doc.fileName}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
              <span className="text-slate-500">{doc.department}</span>
              <span className="font-bold text-slate-800">{doc.pages > 0 ? `${doc.pages} pages` : '0 pages'}</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              {renderStatusBadge(doc.status)}

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  icon={viewingPdfId === doc.id ? Loader2 : ExternalLink}
                  loading={viewingPdfId === doc.id}
                  onClick={(e) => handleViewPdfClick(e, doc.id)}
                >
                  View PDF
                </Button>
                <button onClick={() => onViewDetails(doc)} className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 cursor-pointer">
                  <Eye className="w-4 h-4" />
                </button>
                <button onClick={() => onDeleteDocument(doc.id)} className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentTable;
