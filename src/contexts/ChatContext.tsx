'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { chatService, ChatProvider } from '@/services/chatService';
import { PoolData } from '@/types/ai';
import { StructuredMessage, AgentAPIResponse, UIComponent } from '@/types/agent-responses';

type Message = StructuredMessage;

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
  context: 'pool-selection' | 'range-analysis';
  poolAddress?: string;
  isVisible: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
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
  // Pool data for pool selection
  poolData: PoolData[];
  loadingPools: boolean;
  refreshPools: () => Promise<void>;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [availableFunctions, setAvailableFunctions] = useState<ChatFunction[]>([]);
  const [poolData, setPoolData] = useState<PoolData[]>([]);
  const [loadingPools, setLoadingPools] = useState(false);
  const pathname = usePathname();

  // Clear messages when route changes to start fresh threads
  useEffect(() => {
    setMessages([]);
  }, [pathname]);

  // Determine context and poolAddress based on current route
  const getContextFromPath = () => {
    if (pathname === '/chat') {
      return { context: 'pool-selection' as const, poolAddress: undefined };
    } else if (pathname?.startsWith('/chat/')) {
      const poolAddress = pathname.split('/')[2];
      return { context: 'range-analysis' as const, poolAddress };
    }
    return { context: 'pool-selection' as const, poolAddress: undefined };
  };

  const { context, poolAddress } = getContextFromPath();

  // Show chat on chat pages, start collapsed by default
  useEffect(() => {
    const shouldShow = pathname === '/chat' || pathname?.startsWith('/chat/');
    setIsVisible(shouldShow);
    if (shouldShow) {
      setIsCollapsed(true);
    }
  }, [pathname]);

  // Load pool data for pool selection context - SIMPLIFIED
  useEffect(() => {
    if (context === 'pool-selection' && poolData.length === 0) {
      console.log('🔄 Loading pools for pool-selection context');
      setLoadingPools(true);
      const loadPools = async () => {
        try {
          console.log('📡 Fetching from /api/pools/all');
          const response = await fetch('/api/pools/all');
          if (response.ok) {
            const pools = await response.json();
            console.log('✅ Received and formatted pools:', pools);
            console.log('📊 Pool details:', pools.map((p: PoolData) => `${p.token0}/${p.token1}: Vol: $${p.volume24h.toLocaleString()}, Fees: $${p.fees24h.toLocaleString()}`));
            setPoolData(pools);
          }
        } catch (error) {
          console.error('💥 Failed to fetch pools - no fallback:', error);
          setPoolData([]);
        } finally {
          setLoadingPools(false);
          console.log('🏁 Pool loading completed');
        }
      };
      loadPools();
    }
  }, [context, poolData.length]);

  // Refresh pools function - SIMPLIFIED
  const refreshPools = useCallback(async () => {
    try {
      const response = await fetch('/api/pools/all');
      if (response.ok) {
        const pools = await response.json();
        setPoolData(pools);
      }
    } catch (error) {
      console.error('Failed to refresh pools:', error);
    }
  }, []);

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
  }, []);

  // LLM provider management
  const setChatProvider = useCallback((provider: ChatProvider) => {
    chatService.setProvider(provider);
  }, []);

  // Send message through structured agent system
  const sendMessage = useCallback(async (message: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

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

      const agentResponseData: AgentAPIResponse = await apiResponse.json();
      
      // Create assistant message with structured response support
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: agentResponseData.response,
        role: 'assistant',
        timestamp: new Date(),
        // New structured response format
        structuredResponse: agentResponseData.structuredData ? {
          text: agentResponseData.response,
          uiComponents: agentResponseData.structuredData && 'type' in agentResponseData.structuredData ? [agentResponseData.structuredData as unknown as UIComponent] : undefined
        } : undefined,
        // Legacy support for backward compatibility
        poolRanking: context === 'pool-selection' ? poolData : undefined,
        toolResults: agentResponseData.toolCalls
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
  }, [context, poolAddress, poolData]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    messages,
    setMessages,
    context,
    poolAddress,
    isVisible,
    setIsVisible,
    isCollapsed,
    setIsCollapsed,
    availableFunctions,
    registerFunction,
    unregisterFunction,
    executeFunction,
    clearChatHistory,
    setChatProvider,
    sendMessage,
    poolData,
    loadingPools,
    refreshPools
  }), [messages, setMessages, context, poolAddress, isVisible, setIsVisible, isCollapsed, setIsCollapsed, availableFunctions, registerFunction, unregisterFunction, executeFunction, clearChatHistory, setChatProvider, sendMessage, poolData, loadingPools, refreshPools]);

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