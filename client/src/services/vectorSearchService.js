import api from './api';

export const vectorSearchService = {
  // Perform test query semantic vector search
  async testQuerySearch(query, options = {}) {
    try {
      const response = await api.post('/vector-search/test-query', {
        query,
        limit: options.limit || 5,
        minScore: options.minScore !== undefined ? options.minScore : 0.60,
        department: options.department || 'All',
        category: options.category || 'All',
        academicYear: options.academicYear || 'All'
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Vector search query failed';
      throw new Error(message);
    }
  },

  // Get vector search index health and readiness status
  async getVectorSearchHealth() {
    try {
      const response = await api.get('/vector-search/health');
      return response.data.vectorSearch;
    } catch (error) {
      console.error('[VectorSearchService] Health check error:', error.message);
      return {
        configured: false,
        readyDocuments: 0,
        totalEmbeddedChunks: 0
      };
    }
  }
};
