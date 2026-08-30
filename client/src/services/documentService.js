import api from './api';

// Helper to safely parse API error response
const parseApiError = async (error, fallbackMessage) => {
  if (error.response?.data) {
    if (error.response.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        const json = JSON.parse(text);
        return json.message || fallbackMessage;
      } catch (e) {
        return fallbackMessage;
      }
    }
    return error.response.data.message || fallbackMessage;
  }
  return error.message || fallbackMessage;
};

export const documentService = {
  // Get all documents with pagination and filtering
  async getDocuments(params = {}) {
    try {
      const response = await api.get('/documents', { params });
      return response.data;
    } catch (error) {
      const message = await parseApiError(error, 'Failed to fetch documents');
      throw new Error(message);
    }
  },

  // Upload new document (PDF, XLS, XLSX)
  async uploadDocument(arg1, arg2, arg3) {
    try {
      let formData;
      let onUploadProgress;

      if (arg1 instanceof FormData) {
        formData = arg1;
        onUploadProgress = arg2;
      } else {
        const metadata = arg1 || {};
        const file = arg2;
        onUploadProgress = arg3;

        formData = new FormData();
        if (file) {
          formData.append('file', file);
        }
        Object.keys(metadata).forEach((key) => {
          if (metadata[key] !== undefined && metadata[key] !== null) {
            formData.append(key, metadata[key]);
          }
        });
      }

      const response = await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (onUploadProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onUploadProgress(percent);
          }
        }
      });
      return response.data.document;
    } catch (error) {
      const message = await parseApiError(error, 'Failed to upload document');
      throw new Error(message);
    }
  },

  // Get single document by ID
  async getDocumentById(id) {
    try {
      const response = await api.get(`/documents/${id}`);
      return response.data.document;
    } catch (error) {
      const message = await parseApiError(error, 'Failed to fetch document details');
      throw new Error(message);
    }
  },

  // Get extracted pages for a document
  async getDocumentPages(id, params = {}) {
    try {
      const response = await api.get(`/documents/${id}/pages`, { params });
      return response.data;
    } catch (error) {
      const message = await parseApiError(error, 'Failed to fetch document pages');
      throw new Error(message);
    }
  },

  // Get text chunks for a document
  async getDocumentChunks(id, params = {}) {
    try {
      const response = await api.get(`/documents/${id}/chunks`, { params });
      return response.data;
    } catch (error) {
      const message = await parseApiError(error, 'Failed to fetch document chunks');
      throw new Error(message);
    }
  },

  // Trigger text/data extraction phase
  async extractDocument(id) {
    try {
      const response = await api.post(`/documents/${id}/extract`);
      return response.data;
    } catch (error) {
      const message = await parseApiError(error, 'Failed to extract text/data from document');
      throw new Error(message);
    }
  },

  // Trigger chunk creation phase
  async createChunks(id) {
    try {
      const response = await api.post(`/documents/${id}/chunk`);
      return response.data;
    } catch (error) {
      const message = await parseApiError(error, 'Failed to create chunks for document');
      throw new Error(message);
    }
  },

  // Trigger manual vector embedding generation
  async startDocumentEmbedding(id, force = false) {
    try {
      const response = await api.post(`/documents/${id}/embed?force=${force}`);
      return response.data;
    } catch (error) {
      const message = await parseApiError(error, 'Failed to start embedding generation');
      throw new Error(message);
    }
  },

  // Trigger full pipeline processing (Extract -> Chunk -> Embed)
  async processFullDocument(id) {
    try {
      const response = await api.post(`/documents/${id}/process-all`);
      return response.data;
    } catch (error) {
      const message = await parseApiError(error, 'Failed to start document processing pipeline');
      throw new Error(message);
    }
  },

  // Get embedding progress status
  async getEmbeddingStatus(id) {
    try {
      const response = await api.get(`/documents/${id}/embedding-status`);
      return response.data;
    } catch (error) {
      const message = await parseApiError(error, 'Failed to fetch embedding status');
      throw new Error(message);
    }
  },

  // Reprocess text extraction & chunking
  async reprocessDocument(id) {
    try {
      const response = await api.post(`/documents/${id}/reprocess`);
      return response.data;
    } catch (error) {
      const message = await parseApiError(error, 'Failed to reprocess document');
      throw new Error(message);
    }
  },

  // Replace existing document file (PDF, XLS, XLSX)
  async replaceDocumentFile(id, fileOrFormData, onUploadProgress) {
    try {
      let formData;
      if (fileOrFormData instanceof FormData) {
        formData = fileOrFormData;
      } else {
        formData = new FormData();
        if (fileOrFormData) {
          formData.append('file', fileOrFormData);
        }
      }

      const response = await api.put(`/documents/${id}/file`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (onUploadProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onUploadProgress(percent);
          }
        }
      });
      return response.data;
    } catch (error) {
      const message = await parseApiError(error, 'Failed to replace document file');
      throw new Error(message);
    }
  },

  // Delete document
  async deleteDocument(id) {
    try {
      const response = await api.delete(`/documents/${id}`);
      return response.data;
    } catch (error) {
      const message = await parseApiError(error, 'Failed to delete document');
      throw new Error(message);
    }
  },

  async viewDocumentPdf(id, pageNumber = null) {
    try {
      const response = await api.get(`/documents/${id}/file`, {
        responseType: 'blob'
      });

      const contentType = response.headers['content-type'] || '';
      const contentDisposition = response.headers['content-disposition'] || '';

      let filename = 'College_Knowledge_Base.xlsx';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^";]+)"?/);
        if (match && match[1]) filename = decodeURIComponent(match[1]);
      }

      const isExcel =
        filename.endsWith('.xlsx') ||
        filename.endsWith('.xls') ||
        contentType.includes('spreadsheet') ||
        contentType.includes('excel');

      const mimeType = isExcel
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : (contentType || 'application/pdf');

      const blob = new Blob([response.data], { type: mimeType });
      const fileUrl = URL.createObjectURL(blob);

      if (isExcel) {
        // Trigger direct browser open/download of Excel file
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = filename || 'College_Knowledge_Base.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return fileUrl;
      }

      if (pageNumber && pageNumber > 0) {
        return `${fileUrl}#page=${pageNumber}`;
      }
      return fileUrl;
    } catch (error) {
      const message = await parseApiError(error, 'Source document is no longer available.');
      throw new Error(message);
    }
  },

  // Get authenticated PDF stream URL
  getFileUrl(id) {
    return `/api/documents/${id}/file`;
  },

  // Get Admin Dashboard Overview stats
  async getDashboardStats() {
    try {
      const response = await api.get('/admin/dashboard');
      return response.data.stats;
    } catch (error) {
      console.error('[DocumentService] getDashboardStats error:', error.message);
      return {
        totalDocuments: 0,
        uploadedDocuments: 0,
        processedDocuments: 0,
        processingDocuments: 0,
        failedDocuments: 0,
        totalUsers: 0,
        totalQuestions: 0,
        totalChunks: 0
      };
    }
  }
};
