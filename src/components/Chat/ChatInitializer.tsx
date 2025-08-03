'use client';

import { useChatConfig } from '@/hooks/useChatConfig';

// Component to initialize chat configuration
export default function ChatInitializer() {
  useChatConfig();
  return null; // This component doesn't render anything
}