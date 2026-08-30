import api from './api';

export const ragService = {
  // Execute RAG Retrieval Pipeline for a user question
  async retrieveContext(query, options = {}) {
    try {
      const response = await api.post('/rag/retrieve', {
        query,
        minScore: options.minScore !== undefined ? options.minScore : 0.70,
        retrievalLimit: options.retrievalLimit || 8,
        department: options.department || 'All',
        category: options.category || 'All',
        academicYear: options.academicYear || 'All'
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to retrieve RAG context';
      throw new Error(message);
    }
  }
};
