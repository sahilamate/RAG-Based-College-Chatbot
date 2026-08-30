import React, { useState } from 'react';
import { UploadCloud, FileText, X, AlertCircle, Loader2 } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import { useToast } from '../../hooks/useToast';

const CATEGORIES = [
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

const DEPARTMENTS = [
  'All Departments',
  'General College',
  'Computer Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electronics & Comm.'
];

const UploadDropzone = ({ onUploadStart, isSubmitting = false, uploadProgress = 0 }) => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('All Departments');
  const [category, setCategory] = useState('Academics');
  const [academicYear, setAcademicYear] = useState('2026');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const { addToast } = useToast();

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    // 1. Extension validation (.pdf, .xls, .xlsx)
    const ext = selectedFile.name.toLowerCase().slice(selectedFile.name.lastIndexOf('.'));
    const isAllowedExt = ['.pdf', '.xls', '.xlsx'].includes(ext);

    if (!isAllowedExt) {
      const msg = 'Invalid file type. Supported files: PDF, XLS, XLSX.';
      addToast(msg, 'error');
      setErrors((prev) => ({ ...prev, file: msg }));
      return;
    }

    // 2. File size validation (<= 25 MB)
    if (selectedFile.size > 25 * 1024 * 1024) {
      const msg = 'File is too large. The maximum allowed file size is 25 MB.';
      addToast(msg, 'error');
      setErrors((prev) => ({ ...prev, file: msg }));
      return;
    }

    setFile(selectedFile);
    setErrors((prev) => ({ ...prev, file: '' }));

    if (!title) {
      setTitle(selectedFile.name.replace(/\.(pdf|xlsx|xls)$/i, '').replace(/_/g, ' '));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!file) newErrors.file = 'Please select a document file (PDF, XLS, XLSX) to upload.';
    if (!title || !title.trim()) newErrors.title = 'Document title is required.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onUploadStart(
      {
        title: title.trim(),
        department,
        category,
        academicYear: academicYear.trim(),
        description: description.trim()
      },
      file
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl">
      <div>
        <h3 className="text-xl font-black text-slate-900">Upload Documents</h3>
        <p className="text-xs text-slate-500 mt-1">
          Select a PDF or Excel document (regulations, fee structure, contacts, schedules) to add to the knowledge base.
        </p>
      </div>

      {/* Drag & Drop Zone */}
      {!file ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleFileDrop}
          className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all duration-200 cursor-pointer ${
            isDragging
              ? 'border-indigo-600 bg-indigo-50/70 scale-[1.01]'
              : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
            <UploadCloud className="w-8 h-8" />
          </div>
          <p className="text-sm font-bold text-slate-800">Drag & drop your file here</p>
          <p className="text-xs text-slate-500 font-semibold mt-1">Supported: PDF, XLS, XLSX</p>
          <p className="text-[11px] font-semibold text-slate-400 mt-2">Maximum file size: 25 MB</p>

          <label className="mt-4 inline-block">
            <input
              type="file"
              accept=".pdf,.xls,.xlsx,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              onChange={handleFileSelect}
              disabled={isSubmitting}
              className="hidden"
            />
            <span className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 inline-flex items-center gap-2 cursor-pointer transition-colors">
              Choose Document
            </span>
          </label>
        </div>
      ) : (
        /* Selected File Card */
        <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{file.name}</p>
                <p className="text-[11px] font-medium text-slate-500">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for upload
                </p>
              </div>
            </div>
            {!isSubmitting && (
              <button
                type="button"
                onClick={() => setFile(null)}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Remove file"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Real Upload Progress Bar */}
          {isSubmitting && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  Uploading...
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-indigo-100 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}

      {errors.file && <p className="text-xs text-rose-600 font-medium">{errors.file}</p>}

      {/* Metadata Inputs */}
      <div className="space-y-4 pt-2 border-t border-slate-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Document Metadata
        </h4>

        <Input
          label="Document Title"
          placeholder="e.g. Academic Calendar 2026"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          disabled={isSubmitting}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Input
          label="Academic Year"
          placeholder="2026"
          value={academicYear}
          onChange={(e) => setAcademicYear(e.target.value)}
          disabled={isSubmitting}
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            rows={3}
            placeholder="Academic calendar information for the 2026 academic year..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          fullWidth
          size="lg"
          loading={isSubmitting}
          disabled={isSubmitting || !file}
        >
          {isSubmitting ? `Uploading (${uploadProgress}%)` : 'Upload Document'}
        </Button>
      </div>
    </form>
  );
};

export default UploadDropzone;
