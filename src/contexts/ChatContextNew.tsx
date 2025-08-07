'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { PoolData } from '@/types/ai';
import { ChatMessagesProvider, useChatMessages } from './ChatMessagesContext';
import { ChatUIProvider, useChatUI } from './ChatUIContext';
import { ChatServiceProvider, useChatService } from './ChatServiceContext';

// Function invocation types for chat-controlled actions
export type ChatFunction = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (params: Record<string, unknown>) => void | Promise<void>;
};

// Combined context type for backwards compatibility
type ChatContextType = {
  // From ChatMessagesContext
  messages: ReturnType<typeof useChatMessages>['messages'];
  setMessages: ReturnType<typeof useChatMessages>['setMessages'];
  clearChatHistory: () => void;

  // From ChatUIContext  
  context: ReturnType<typeof useChatUI>['context'];
  poolAddress?: ReturnType<typeof useChatUI>['poolAddress'];
  isVisible: ReturnType<typeof useChatUI>['isVisible'];
  setIsVisible: ReturnType<typeof useChatUI>['setIsVisible'];
  isCollapsed: ReturnType<typeof useChatUI>['isCollapsed'];
  setIsCollapsed: ReturnType<typeof useChatUI>['setIsCollapsed'];

  // From ChatServiceContext
  setChatProvider: ReturnType<typeof useChatService>['setChatProvider'];
  sendMessage: ReturnType<typeof useChatService>['sendMessage'];

  // Function invocation system (simplified for now)
  availableFunctions: ChatFunction[];
  registerFunction: (func: ChatFunction) => void;
  unregisterFunction: (name: string) => void;
  executeFunction: (name: string, params: Record<string, unknown>) => Promise<void>;

  // Pool data management
  poolData: PoolData[];
  loadingPools: boolean;
  refreshPools: () => Promise<void>;
};

// Internal component that uses all the hooks
function ChatContextImpl({ children }: { children: React.ReactNode }) {
  const messagesContext = useChatMessages();
  const uiContext = useChatUI();
  const serviceContext = useChatService();
  
  // Function management (keeping this here for now)
  const [availableFunctions, setAvailableFunctions] = useState<ChatFunction[]>([]);
  
  // Pool data management
  const [poolData, setPoolData] = useState<PoolData[]>([]);
  const [loadingPools, setLoadingPools] = useState(false);
  const pathname = usePathname();

  // Clear messages when route changes
  useEffect(() => {
    messagesContext.clearMessages();
  }, [pathname, messagesContext]);

  // Load pool data for pool selection context
  useEffect(() => {
    if (uiContext.context === 'pool-selection' && poolData.length === 0) {
      setLoadingPools(true);
      const loadPools = async () => {
        try {
          const response = await fetch('/api/pools/all');
          if (response.ok) {
            const pools = await response.json() as PoolData[];
            setPoolData(pools);
          }
        } catch (error) {
          console.error('Failed to fetch pools:', error);
          setPoolData([]);
        } finally {
          setLoadingPools(false);
        }
      };
      void loadPools();
    }
  }, [uiContext.context, poolData.length]);

  // Function management
  const registerFunction = useCallback((func: ChatFunction) => {
    setAvailableFunctions(prev => {
      const filtered = prev.filter(f => f.name !== func.name);
      return [...filtered, func];
    });
  }, []);

  const unregisterFunction = useCallback((name: string) => {
    setAvailableFunctions(prev => prev.filter(f => f.name !== name));
  }, []);

  const executeFunction = useCallback(async (name: string, params: Record<string, unknown>) => {
    const func = availableFunctions.find(f => f.name === name);
    if (func) {
      await func.execute(params);
    } else {
      console.warn(`Function ${name} not found`);
    }
  }, [availableFunctions]);

  const refreshPools = useCallback(async () => {
    try {
      const response = await fetch('/api/pools/all');
      if (response.ok) {
        const pools = await response.json() as PoolData[];
        setPoolData(pools);
      }
    } catch (error) {
      console.error('Failed to refresh pools:', error);
    }
  }, []);

  const contextValue: ChatContextType = useMemo(() => ({
    // Messages
    messages: messagesContext.messages,
    setMessages: messagesContext.setMessages,
    clearChatHistory: messagesContext.clearMessages,

    // UI
    context: uiContext.context,
    poolAddress: uiContext.poolAddress,
    isVisible: uiContext.isVisible,
    setIsVisible: uiContext.setIsVisible,
    isCollapsed: uiContext.isCollapsed,
    setIsCollapsed: uiContext.setIsCollapsed,

    // Service
    setChatProvider: serviceContext.setChatProvider,
    sendMessage: serviceContext.sendMessage,

    // Functions
    availableFunctions,
    registerFunction,
    unregisterFunction,
    executeFunction,

    // Pool data
    poolData,
    loadingPools,
    refreshPools,
  }), [
    messagesContext,
    uiContext,
    serviceContext,
    availableFunctions,
    registerFunction,
    unregisterFunction,
    executeFunction,
    poolData,
    loadingPools,
    refreshPools,
  ]);

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
}

const ChatContext = React.createContext<ChatContextType | undefined>(undefined);

// New provider that combines all the smaller contexts
export function ChatProvider({ children }: { children: React.ReactNode }) {
  return (
    <ChatMessagesProvider>
      <ChatUIProvider>
        <ChatServiceProvider poolData={[]}>
          <ChatContextImpl>
            {children}
          </ChatContextImpl>
        </ChatServiceProvider>
      </ChatUIProvider>
    </ChatMessagesProvider>
  );
}

export function useChatContext() {
  const context = React.useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}