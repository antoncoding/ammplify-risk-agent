import { useEffect } from 'react';
import { useChatContext } from '@/contexts/ChatContext';
import { LLMChatProvider, MockChatProvider } from '@/services/chatService';

// Configuration hook for setting up chat providers
export function useChatConfig() {
  const { setChatProvider } = useChatContext();

  // Initialize chat provider based on environment or config
  useEffect(() => {
    const initializeChatProvider = () => {
      // Check for API key in environment
      const openaiApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
      const claudeApiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
      
      if (openaiApiKey) {
        // Use OpenAI
        const provider = new LLMChatProvider(
          openaiApiKey,
          'gpt-4',
          'https://api.openai.com/v1'
        );
        setChatProvider(provider);
      } else if (claudeApiKey) {
        // Use Claude (Anthropic)
        const provider = new LLMChatProvider(
          claudeApiKey,
          'claude-3-sonnet-20240229',
          'https://api.anthropic.com/v1'
        );
        setChatProvider(provider);
      } else {
        // Fallback to mock provider when no API keys are configured
        const provider = new MockChatProvider();
        setChatProvider(provider);
      }
    };

    initializeChatProvider();
  }, [setChatProvider]);
}

// Utility function to manually switch providers at runtime
export function useChatProviderSwitcher() {
  const { setChatProvider } = useChatContext();
  
  const switchToChatProvider = (provider: 'openai' | 'claude' | 'mock', apiKey?: string) => {
  
  switch (provider) {
    case 'openai':
      if (!apiKey) throw new Error('OpenAI API key required');
      setChatProvider(new LLMChatProvider(apiKey, 'gpt-4', 'https://api.openai.com/v1'));
      break;
    case 'claude':
      if (!apiKey) throw new Error('Claude API key required');
      setChatProvider(new LLMChatProvider(apiKey, 'claude-3-sonnet-20240229', 'https://api.anthropic.com/v1'));
      break;
    case 'mock':
      setChatProvider(new MockChatProvider());
      break;
  }
  };
  
  return { switchToChatProvider };
}