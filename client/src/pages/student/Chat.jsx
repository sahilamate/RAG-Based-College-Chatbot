import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import ChatWindow from '../../components/chat/ChatWindow';
import { chatService } from '../../services/chatService';

const Chat = () => {
  const { activeConversationId, setActiveConversationId } = useOutletContext();
  const [currentConversation, setCurrentConversation] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchConversation = async () => {
      if (activeConversationId) {
        try {
          const conv = await chatService.getConversationDetails(activeConversationId);
          if (isMounted && conv) {
            setCurrentConversation(conv);
          }
        } catch (err) {
          console.error('[Chat] Fetch conversation error:', err.message);
        }
      } else {
        if (isMounted) {
          setCurrentConversation(null);
        }
      }
    };
    fetchConversation();
    return () => {
      isMounted = false;
    };
  }, [activeConversationId]);

  const handleSendMessage = async (text, departmentFilter) => {
    if (!text || !text.trim() || isTyping) return;

    const trimmedText = text.trim();
    let convId = activeConversationId;

    // Snappy temporary user message display
    const tempUserMsg = {
      id: `temp_user_${Date.now()}`,
      role: 'user',
      content: trimmedText,
      createdAt: new Date().toISOString()
    };

    setCurrentConversation((prev) => ({
      id: prev?.id || convId || 'temp',
      title: prev?.title || trimmedText.slice(0, 30),
      messages: [...(prev?.messages || []), tempUserMsg]
    }));

    setIsTyping(true);

    try {
      const response = await chatService.sendMessage(trimmedText, convId, departmentFilter);
      
      if (response.conversationId) {
        if (response.conversationId !== activeConversationId) {
          setActiveConversationId(response.conversationId);
        }
        const updatedConv = await chatService.getConversationDetails(response.conversationId);
        setCurrentConversation(updatedConv);
      }
    } catch (err) {
      console.error('[Chat] Send message error:', err.message);
      // Append temporary error message
      const tempErrorMsg = {
        id: `temp_err_${Date.now()}`,
        role: 'assistant',
        content: err.message || 'Sorry, I couldn\'t process your question right now. Please try again.',
        hasContext: false,
        sources: [],
        createdAt: new Date().toISOString()
      };

      setCurrentConversation((prev) => ({
        ...prev,
        messages: [...(prev?.messages || []), tempErrorMsg]
      }));
    } finally {
      setIsTyping(false);
    }
  };

  const handleFeedback = async (messageId, feedbackType) => {
    if (!activeConversationId || !messageId) return;
    try {
      await chatService.submitFeedback(activeConversationId, messageId, feedbackType);
    } catch (err) {
      console.error('[Chat] Submit feedback error:', err.message);
    }
  };

  return (
    <div className="h-full">
      <ChatWindow
        conversation={currentConversation}
        onSendMessage={handleSendMessage}
        onFeedback={handleFeedback}
        isTyping={isTyping}
      />
    </div>
  );
};

export default Chat;
