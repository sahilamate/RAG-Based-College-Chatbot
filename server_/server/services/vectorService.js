/**
 * Vector Database Service Placeholder (Pinecone / MongoDB Vector Search)
 */
export const searchSimilarChunks = async (queryEmbedding, topK = 3) => {
  return [
    {
      documentId: 'doc_demo',
      fileName: 'College_Policy.pdf',
      pageNumber: 1,
      relevanceScore: 0.94,
      snippet: 'Matched relevance snippet from vector index.'
    }
  ];
};
