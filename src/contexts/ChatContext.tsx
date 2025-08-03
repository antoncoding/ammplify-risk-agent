'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { chatService, ChatProvider, LLMChatProvider } from '@/services/chatService';

type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
};

// Function invocation types for chat-controlled actions
export type ChatFunction = {
  name: string;
  description: string;
  parameters: Record<string, any>;
  execute: (params: Record<string, any>) => void | Promise<void>;
};

type ChatContextType = {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  context: 'market-selection' | 'pool-analysis';
  poolAddress?: string;
  isVisible: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
  // Function invocation system for chat
  availableFunctions: ChatFunction[];
  registerFunction: (func: ChatFunction) => void;
  unregisterFunction: (name: string) => void;
  executeFunction: (name: string, params: Record<string, any>) => Promise<void>;
  // Chat history management
  clearChatHistory: () => void;
  // LLM provider management
  setChatProvider: (provider: ChatProvider) => void;
  sendMessage: (message: string) => Promise<void>;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [availableFunctions, setAvailableFunctions] = useState<ChatFunction[]>([]);
  const pathname = usePathname();

  // Load messages from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('ammplify-chat-messages');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
      } catch (error) {
        console.error('Failed to load chat messages from localStorage:', error);
      }
    }
  }, []);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('ammplify-chat-messages', JSON.stringify(messages));
    }
  }, [messages]);

  // Determine context and poolAddress based on current route
  const getContextFromPath = () => {
    if (pathname === '/chat') {
      return { context: 'market-selection' as const, poolAddress: undefined };
    } else if (pathname?.startsWith('/chat/')) {
      const poolAddress = pathname.split('/')[2];
      return { context: 'pool-analysis' as const, poolAddress };
    }
    return { context: 'market-selection' as const, poolAddress: undefined };
  };

  const { context, poolAddress } = getContextFromPath();

  // Show chat only on chat-related pages
  useEffect(() => {
    setIsVisible(pathname === '/chat' || pathname?.startsWith('/chat/'));
  }, [pathname]);

  // Function management - memoize to prevent recreation on every render
  const registerFunction = useCallback((func: ChatFunction) => {
    setAvailableFunctions(prev => {
      const filtered = prev.filter(f => f.name !== func.name);
      return [...filtered, func];
    });
  }, []);

  const unregisterFunction = useCallback((name: string) => {
    setAvailableFunctions(prev => prev.filter(f => f.name !== name));
  }, []);

  const executeFunction = useCallback(async (name: string, params: Record<string, any>) => {
    const func = availableFunctions.find(f => f.name === name);
    if (func) {
      await func.execute(params);
    } else {
      console.warn(`Function ${name} not found`);
    }
  }, [availableFunctions]);

  // Clear chat history
  const clearChatHistory = useCallback(() => {
    setMessages([]);
    localStorage.removeItem('ammplify-chat-messages');
  }, []);

  // LLM provider management
  const setChatProvider = useCallback((provider: ChatProvider) => {
    chatService.setProvider(provider);
  }, []);

  // Send message through chat service
  const sendMessage = useCallback(async (message: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const chatContext = {
        type: context,
        poolAddress,
        availableFunctions: availableFunctions.map(f => f.name),
        userHistory: messages
      };

      const response = await chatService.sendMessage(message, chatContext);
      
      // Execute any function calls
      if (response.functionCalls) {
        for (const funcCall of response.functionCalls) {
          await executeFunction(funcCall.name, funcCall.parameters);
        }
      }

      // Add assistant response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.content,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error processing your message. Please try again.',
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    }
  }, [context, poolAddress, availableFunctions, messages, executeFunction]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    messages,
    setMessages,
    context,
    poolAddress,
    isVisible,
    setIsVisible,
    availableFunctions,
    registerFunction,
    unregisterFunction,
    executeFunction,
    clearChatHistory,
    setChatProvider,
    sendMessage
  }), [messages, setMessages, context, poolAddress, isVisible, setIsVisible, availableFunctions, registerFunction, unregisterFunction, executeFunction, clearChatHistory, setChatProvider, sendMessage]);

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}