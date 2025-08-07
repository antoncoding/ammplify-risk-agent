'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { StructuredMessage } from '@/types/agent-responses';

// Separate context for chat messages and core message operations
type ChatMessagesContextType = {
  messages: StructuredMessage[];
  setMessages: React.Dispatch<React.SetStateAction<StructuredMessage[]>>;
  addMessage: (message: StructuredMessage) => void;
  clearMessages: () => void;
};

const ChatMessagesContext = createContext<ChatMessagesContextType | undefined>(undefined);

type ChatMessagesProviderProps = {
  children: React.ReactNode;
};

export function ChatMessagesProvider({ children }: ChatMessagesProviderProps) {
  const [messages, setMessages] = useState<StructuredMessage[]>([]);

  const addMessage = useCallback((message: StructuredMessage) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const contextValue = useMemo(() => ({
    messages,
    setMessages,
    addMessage,
    clearMessages,
  }), [messages, setMessages, addMessage, clearMessages]);

  return (
    <ChatMessagesContext.Provider value={contextValue}>
      {children}
    </ChatMessagesContext.Provider>
  );
}

export function useChatMessages() {
  const context = useContext(ChatMessagesContext);
  if (context === undefined) {
    throw new Error('useChatMessages must be used within a ChatMessagesProvider');
  }
  return context;
}