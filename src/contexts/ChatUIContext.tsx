'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';

// Separate context for UI state and visibility
type ChatUIContextType = {
  isVisible: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  context: 'pool-selection' | 'range-analysis';
  poolAddress?: string;
};

const ChatUIContext = createContext<ChatUIContextType | undefined>(undefined);

type ChatUIProviderProps = {
  children: React.ReactNode;
};

export function ChatUIProvider({ children }: ChatUIProviderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const pathname = usePathname();

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

  const contextValue = useMemo(() => ({
    isVisible,
    setIsVisible,
    isCollapsed,
    setIsCollapsed,
    context,
    poolAddress,
  }), [isVisible, setIsVisible, isCollapsed, setIsCollapsed, context, poolAddress]);

  return (
    <ChatUIContext.Provider value={contextValue}>
      {children}
    </ChatUIContext.Provider>
  );
}

export function useChatUI() {
  const context = useContext(ChatUIContext);
  if (context === undefined) {
    throw new Error('useChatUI must be used within a ChatUIProvider');
  }
  return context;
}