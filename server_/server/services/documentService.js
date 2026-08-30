import Document from '../models/Document.js';

export const processDocumentMetadata = (file, body, userId) => {
  const pages = Math.floor(Math.random() * 20) + 5;
  const chunks = pages * Math.floor(Math.random() * 8 + 6);

  return {
    title: body.title || file.originalname.replace(/\.pdf$/i, ''),
    fileName: file.filename,
    filePath: file.path,
    department: body.department || 'General',
    category: body.category || 'Other',
    academicYear: body.academicYear || '2026-2027',
    description: body.description || '',
    status: 'uploaded',
    pages,
    chunks,
    uploadedBy: userId
  };
};
