import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadDropzone from '../../components/documents/UploadDropzone';
import { documentService } from '../../services/documentService';
import { useToast } from '../../hooks/useToast';
import Button from '../../components/common/Button';
import { ArrowLeft, CheckCircle2, FileText, Calendar, Building2, Tag } from 'lucide-react';

const UploadDocument = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedDoc, setUploadedDoc] = useState(null);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleUploadStart = async (metadata, file) => {
    setIsSubmitting(true);
    setUploadProgress(0);
    try {
      const doc = await documentService.uploadDocument(metadata, file, (progress) => {
        setUploadProgress(progress);
      });
      setUploadedDoc(doc);
      addToast('✓ Document uploaded successfully!');
    } catch (err) {
      addToast(err.message || 'Upload failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/documents')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Documents
        </button>
      </div>

      {!uploadedDoc ? (
        <UploadDropzone
          onUploadStart={handleUploadStart}
          isSubmitting={isSubmitting}
          uploadProgress={uploadProgress}
        />
      ) : (
        /* Upload Success Summary Card */
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6 max-w-xl mx-auto animate-scale-up">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Status: Uploaded
            </span>
            <h3 className="text-xl font-black text-slate-900 mt-2">{uploadedDoc.title}</h3>
            <p className="text-xs text-slate-500 font-mono mt-1">{uploadedDoc.originalFileName}</p>
          </div>

          {/* Metadata Summary Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs text-left bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Department</span>
              <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                {uploadedDoc.department}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Category</span>
              <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-[11px] inline-block mt-0.5">
                {uploadedDoc.category}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">File Size</span>
              <span className="font-semibold text-slate-700 mt-0.5 block">
                {(uploadedDoc.fileSize / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Academic Year</span>
              <span className="font-semibold text-slate-700 mt-0.5 block">
                {uploadedDoc.academicYear || '2026'}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed bg-indigo-50/60 p-3 rounded-xl border border-indigo-200/80 text-indigo-900 text-left">
            <strong>Note:</strong> Document uploaded successfully. Text/Data extraction and vector embedding generation are starting in the background.
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setUploadedDoc(null);
                setUploadProgress(0);
              }}
            >
              Upload Another Document
            </Button>
            <Button variant="primary" onClick={() => navigate('/admin/documents')}>
              View All Documents
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadDocument;
