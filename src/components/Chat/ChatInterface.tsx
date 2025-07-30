import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatInterfaceProps {
  context?: 'market-selection' | 'pool-analysis';
  poolId?: string;
}

export default function ChatInterface({ context = 'market-selection', poolId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: context === 'market-selection' 
        ? "Hi! I'm here to help you choose the right market to analyze. What type of trading pair are you interested in?"
        : `I'm here to help you analyze the ${poolId} market. Ask me about price trends, volatility, or trading strategies.`,
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate API call - replace with actual chat implementation
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I understand you're asking about: "${inputValue}". ${context === 'market-selection' ? 'Let me help you choose the right market.' : `Let me analyze that for the ${poolId} market.`}`,
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-background rounded-lg border shadow-sm">
      {/* Compact chat messages - horizontal scrolling */}
      <div className="flex gap-3 p-3 overflow-x-auto min-h-0">
        {messages.slice(-3).map((message) => (
          <div
            key={message.id}
            className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm max-w-xs ${
              message.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted'
            }`}
          >
            <div className="text-xs opacity-60 mb-1">
              {message.role === 'user' ? 'You' : 'AI'}
            </div>
            <div className="line-clamp-2">{message.content}</div>
          </div>
        ))}
        {isLoading && (
          <div className="flex-shrink-0 bg-muted px-3 py-2 rounded-lg text-sm">
            <div className="text-xs opacity-60 mb-1">AI</div>
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-current rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        )}
      </div>
      
      {/* Input area */}
      <div className="border-t p-3">
        <div className="flex gap-2 items-center">
          <div className="text-xs text-muted-foreground flex-shrink-0">
            {context === 'market-selection' ? '💡 Ask for help choosing' : `📊 Ask about ${poolId}`}
          </div>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your question..."
            className="flex-1 p-2 border rounded-md text-sm bg-background focus:ring-1 focus:ring-primary/30 focus:border-primary outline-none"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <Send className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}