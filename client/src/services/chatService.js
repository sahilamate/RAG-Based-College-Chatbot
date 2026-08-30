import api from './api';

export const chatService = {
  // Send user message to CollegeAI RAG Chatbot
  async sendMessage(message, conversationId = null, department = 'All') {
    try {
      const response = await api.post('/chat', {
        message,
        conversationId,
        department
      });
      return response.data;
    } catch (error) {
      const messageText = error.response?.data?.message || 'Failed to send message to CollegeAI';
      throw new Error(messageText);
    }
  },

  // Get user's conversation history list
  async getChatHistory() {
    try {
      const response = await api.get('/chat/history');
      return response.data.conversations || [];
    } catch (error) {
      console.error('[ChatService] getChatHistory error:', error.message);
      return [];
    }
  },

  // Alias for getChatHistory
  async getConversations() {
    return this.getChatHistory();
  },

  // Get conversation details & message log
  async getConversationDetails(conversationId) {
    try {
      const response = await api.get(`/chat/${conversationId}`);
      return response.data.conversation;
    } catch (error) {
      const messageText = error.response?.data?.message || 'Failed to load conversation';
      throw new Error(messageText);
    }
  },

  // Delete conversation
  async deleteConversation(conversationId) {
    try {
      const response = await api.delete(`/chat/${conversationId}`);
      return response.data;
    } catch (error) {
      const messageText = error.response?.data?.message || 'Failed to delete conversation';
      throw new Error(messageText);
    }
  },

  // Submit feedback on a message
  async submitFeedback(conversationId, messageId, feedback) {
    try {
      const response = await api.post(`/chat/${conversationId}/feedback`, {
        messageId,
        feedback
      });
      return response.data;
    } catch (error) {
      console.error('[ChatService] submitFeedback error:', error.message);
      throw error;
    }
  }
};
