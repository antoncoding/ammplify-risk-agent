'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatContextType {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  context: 'market-selection' | 'pool-analysis';
  poolId?: string;
  isVisible: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const pathname = usePathname();

  // Determine context and poolId based on current route
  const getContextFromPath = () => {
    if (pathname === '/chat') {
      return { context: 'market-selection' as const, poolId: undefined };
    } else if (pathname?.startsWith('/chat/')) {
      const poolId = pathname.split('/')[2];
      return { context: 'pool-analysis' as const, poolId };
    }
    return { context: 'market-selection' as const, poolId: undefined };
  };

  const { context, poolId } = getContextFromPath();

  // Show chat only on chat-related pages
  useEffect(() => {
    setIsVisible(pathname === '/chat' || pathname?.startsWith('/chat/'));
  }, [pathname]);

  return (
    <ChatContext.Provider value={{
      messages,
      setMessages,
      context,
      poolId,
      isVisible,
      setIsVisible
    }}>
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