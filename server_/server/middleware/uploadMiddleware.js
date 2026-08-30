import multer from 'multer';
import path from 'path';
import fs from 'fs';

const getUploadDir = () => {
  const dir = process.env.UPLOAD_DIR || 'uploads/documents';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

// Storage Configuration with filename sanitization
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, getUploadDir());
  },
  filename(req, file, cb) {
    const uniquePrefix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const sanitizedOriginalName = file.originalname
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .toLowerCase();
    cb(null, `${uniquePrefix}-${sanitizedOriginalName}`);
  }
});

// File filter checking BOTH MIME-type and file extension
const allowedExtensions = ['.pdf', '.xls', '.xlsx'];
const allowedMimes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/msexcel',
  'application/x-dos_ms_excel',
  'application/xls',
  'application/x-xls',
  'application/octet-stream'
];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isAllowedExt = allowedExtensions.includes(ext);
  const isAllowedMime = allowedMimes.includes(file.mimetype) || !file.mimetype;

  if (isAllowedExt && isAllowedMime) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type. Supported files: PDF, XLS, XLSX.');
    error.statusCode = 400;
    cb(error, false);
  }
};

const maxFileSize = parseInt(process.env.MAX_FILE_SIZE, 10) || 25 * 1024 * 1024; // 25 MB default (26214400 bytes)

const upload = multer({
  storage,
  limits: { fileSize: maxFileSize },
  fileFilter
});

export default upload;
