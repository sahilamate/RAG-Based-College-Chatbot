import React, { useState } from 'react';
import { FileText, ExternalLink, BookmarkCheck, FileCode, FileSpreadsheet } from 'lucide-react';
import Modal from '../common/Modal';
import { documentService } from '../../services/documentService';

const SourceCard = ({ source }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [isOpeningPdf, setIsOpeningPdf] = useState(false);

  if (!source) return null;

  const isExcel = source.fileType === 'excel' || Boolean(source.sheetName) || /\.(xlsx|xls)$/i.test(source.fileName || source.originalFileName || '');

  const docName = source.documentName || source.documentTitle || source.fileName || source.originalFileName || (isExcel ? 'College_Knowledge_Base.xlsx' : 'College Document');
  
  const section = source.sheetName || source.section || source.sectionTitle || 'General Policy';
  const pageNum = source.page || source.pageNumber || (Array.isArray(source.pages) && source.pages[0]);
  
  const subHeading = isExcel
    ? `Sheet: ${source.sheetName || 'Data'} • Row ${source.rowNumber || 1}`
    : `${pageNum ? `Page ${pageNum}` : 'Page 1'} • ${section}`;

  const previewSnippet = source.snippet || source.content || (isExcel ? 'Retrieved structured row from Excel database.' : 'Retrieved knowledge chunk from official PDF documentation.');

  const handleOpenPdf = (e) => {
    if (e) e.stopPropagation();
    const docId = source.documentId || '6a93a845d6b59c3f18e6be3f';
    const token = localStorage.getItem('collegeai_jwt_token') || '';
    const host = window.location.hostname || 'localhost';
    const backendBase = `http://${host}:5000`;

    if (isExcel) {
      // Excel File: Trigger direct download
      const fileUrl = `${backendBase}/api/documents/${docId}/file?token=${token}`;
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = docName || 'College_Knowledge_Base.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // PDF File: Open directly in a BRAND NEW BROWSER TAB at exact page number
      const pageAnchor = pageNum ? `#page=${pageNum}` : '';
      const pdfUrl = `${backendBase}/api/documents/${docId}/file?token=${token}${pageAnchor}`;
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      <div
        onClick={() => setModalOpen(true)}
        className="group relative flex flex-col p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-indigo-300 cursor-pointer transition-all duration-200"
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8.5 h-8.5 rounded-xl ${isExcel ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'} flex items-center justify-center shrink-0 transition-colors shadow-2xs`}>
              {isExcel ? <FileSpreadsheet className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-extrabold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                {docName}
              </h4>
              <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                {subHeading}
              </p>
            </div>
          </div>
        </div>

        {previewSnippet && (
          <p className="text-[11px] text-slate-600 line-clamp-3 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3 leading-relaxed font-mono">
            {previewSnippet}
          </p>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] font-bold text-indigo-600">
          <button
            type="button"
            onClick={handleOpenPdf}
            disabled={isOpeningPdf}
            className="hover:underline inline-flex items-center gap-1.5 cursor-pointer bg-transparent border-0 p-0 text-indigo-600 font-bold disabled:opacity-50"
          >
            {isOpeningPdf ? (
              <span>Opening file...</span>
            ) : (
              <>
                <span>View Source Document</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Source Citation Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Source Citation: ${docName}`}
        maxWidth="max-w-xl"
      >
        <div className="space-y-4">
          <div className={`flex items-center justify-between p-3.5 rounded-2xl ${isExcel ? 'bg-emerald-50/80 border border-emerald-100' : 'bg-indigo-50/80 border border-indigo-100'}`}>
            <div className="flex items-center gap-2.5">
              <BookmarkCheck className={`w-5 h-5 ${isExcel ? 'text-emerald-600' : 'text-indigo-600'}`} />
              <div>
                <p className="text-xs font-bold text-slate-900">{docName}</p>
                <p className="text-[11px] text-slate-500 font-semibold">{subHeading}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-indigo-600" />
              {isExcel ? 'Retrieved Excel Row Record' : 'Retrieved Knowledge Chunk'}
            </h4>
            <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 text-xs font-mono leading-relaxed border border-slate-800 shadow-inner max-h-60 overflow-y-auto whitespace-pre-wrap">
              {source.content || source.snippet || 'Knowledge snippet extracted from official documentation.'}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleOpenPdf}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>{isExcel ? 'Download Excel File (.xlsx)' : 'Open PDF in New Tab'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SourceCard;
