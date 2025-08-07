'use client';

import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { chatService, ChatProvider } from '@/services/chatService';
import { AgentAPIResponse } from '@/types/agent-responses';
import { PoolData } from '@/types/ai';
import { useChatMessages } from './ChatMessagesContext';
import { useChatUI } from './ChatUIContext';

// Separate context for chat service operations
type ChatServiceContextType = {
  setChatProvider: (provider: ChatProvider) => void;
  sendMessage: (message: string) => Promise<void>;
};

const ChatServiceContext = createContext<ChatServiceContextType | undefined>(undefined);

type ChatServiceProviderProps = {
  children: React.ReactNode;
  poolData: PoolData[];
};

export function ChatServiceProvider({ children, poolData }: ChatServiceProviderProps) {
  const { addMessage } = useChatMessages();
  const { context, poolAddress } = useChatUI();

  const setChatProvider = useCallback((provider: ChatProvider) => {
    chatService.setProvider(provider);
  }, []);

  // Send message through structured agent system
  const sendMessage = useCallback(async (message: string) => {
    const userMessage = {
      id: Date.now().toString(),
      content: message,
      role: 'user' as const,
      timestamp: new Date()
    };

    addMessage(userMessage);

    try {
      let apiResponse: Response;

      if (context === 'pool-selection') {
        // Use pool selection agent
        apiResponse = await fetch('/api/agents/pool-selection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, poolData })
        });
      } else {
        // Use range analysis agent
        apiResponse = await fetch('/api/agents/range-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, context: { poolAddress } })
        });
      }
      
      if (!apiResponse.ok) {
        throw new Error(`Agent API error: ${apiResponse.status}`);
      }

      const agentResponseData = await apiResponse.json() as AgentAPIResponse;
      
      // Create assistant message with structured response support
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        content: agentResponseData.response,
        role: 'assistant' as const,
        timestamp: new Date(),
        // New structured response format
        structuredResponse: agentResponseData.structuredData ? {
          text: agentResponseData.response,
          uiComponents: agentResponseData.structuredData && 'type' in agentResponseData.structuredData 
            ? [agentResponseData.structuredData as any] 
            : undefined
        } : undefined,
        // Legacy support for backward compatibility
        poolRanking: context === 'pool-selection' ? poolData : undefined,
        toolResults: agentResponseData.toolCalls
      };

      addMessage(assistantMessage);
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Add error message
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error processing your message. Please try again.',
        role: 'assistant' as const,
        timestamp: new Date()
      };

      addMessage(errorMessage);
    }
  }, [context, poolAddress, poolData, addMessage]);

  const contextValue = useMemo(() => ({
    setChatProvider,
    sendMessage,
  }), [setChatProvider, sendMessage]);

  return (
    <ChatServiceContext.Provider value={contextValue}>
      {children}
    </ChatServiceContext.Provider>
  );
}

export function useChatService() {
  const context = useContext(ChatServiceContext);
  if (context === undefined) {
    throw new Error('useChatService must be used within a ChatServiceProvider');
  }
  return context;
}