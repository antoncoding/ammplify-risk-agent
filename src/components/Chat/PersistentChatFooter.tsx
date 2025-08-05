'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, ChevronDown, Bot, Trash2 } from 'lucide-react';
import { useChatContext } from '@/contexts/ChatContext';
import { PoolData } from '@/types/ai';
import PoolRecommendationCards from './PoolRecommendationCards';
import GenerativeUI, { GenerativeUIComponent } from './GenerativeUI';

type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  poolRanking?: PoolData[];
  toolResults?: any;
};

export default function PersistentChatFooter() {
  const { messages, context, poolAddress, isVisible, isCollapsed, setIsCollapsed, clearChatHistory, sendMessage, poolData, loadingPools } = useChatContext();
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [height, setHeight] = useState(320);
  const [isDragging, setIsDragging] = useState(false);
  const [generativeUI, setGenerativeUI] = useState<GenerativeUIComponent | null>(null);
  
  const resizeRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  console.log('poolData', poolData);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Generate smart suggestions based on context and available data
  useEffect(() => {
    if (context === 'pool-selection' && poolData.length > 0 && messages.length === 0) {
      // Show initial pool-related suggestions when no conversation has started
      const suggestions: GenerativeUIComponent = {
        type: 'buttonList',
        title: 'Quick suggestions:',
        actions: [
          {
            id: 'low-risk',
            label: 'Show me low-risk pools',
            action: () => {
              setInputValue('I want low-risk pools with stable returns');
              setTimeout(() => void handleSendMessage(), 100);
            },
            variant: 'primary'
          },
          {
            id: 'high-volume',
            label: 'High volume pools',
            action: () => {
              setInputValue('Show me pools with the highest trading volume');
              setTimeout(() => void handleSendMessage(), 100);
            }
          },
          {
            id: 'eth-pairs',
            label: 'ETH trading pairs',
            action: () => {
              setInputValue('I want to see ETH trading pairs');
              setTimeout(() => void handleSendMessage(), 100);
            }
          },
          {
            id: 'low-fees',
            label: 'Lowest fee options',
            action: () => {
              setInputValue('Find pools with the lowest fees');
              setTimeout(() => void handleSendMessage(), 100);
            }
          }
        ]
      };
      setGenerativeUI(suggestions);
    } else if (context === 'range-analysis') {
      // Different suggestions for range analysis
      const suggestions: GenerativeUIComponent = {
        type: 'buttonList',
        title: 'Price analysis options:',
        actions: [
          {
            id: 'conservative',
            label: 'Conservative range (±10%)',
            action: () => {
              setInputValue('What would be a conservative price range with ±10% movement?');
              setTimeout(() => void handleSendMessage(), 100);
            },
            variant: 'primary'
          },
          {
            id: 'moderate',
            label: 'Moderate range (±25%)',
            action: () => {
              setInputValue('Show me a moderate price range with ±25% movement');
              setTimeout(() => void handleSendMessage(), 100);
            }
          },
          {
            id: 'aggressive',
            label: 'Wide range (±50%)',
            action: () => {
              setInputValue('What about a wide price range with ±50% movement?');
              setTimeout(() => void handleSendMessage(), 100);
            }
          }
        ]
      };
      setGenerativeUI(suggestions);
    } else {
      setGenerativeUI(null);
    }
  }, [context, poolData, messages]);

  // Handle resize drag
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newHeight = window.innerHeight - e.clientY;
      const minHeight = 180;
      const maxHeight = window.innerHeight * 0.7;
      
      setHeight(Math.min(Math.max(newHeight, minHeight), maxHeight));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const getGreeting = () => {
    if (context === 'pool-selection') {
      return "🤖 Tell me which tokens you're interested in and your risk preferences - I'll recommend the best liquidity pools!";
    } else {
      return "Let's analyze this pool. What price range do you think is reasonable for the future?";
    }
  };

  const getPlaceholder = () => {
    if (context === 'pool-selection') {
      return "E.g., I want ETH/USDC with low fees, or show me WBTC pairs with high volume...";
    } else {
      return "Ask me about this pool or describe your price expectations...";
    }
  };

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;
    
    // Check if we have pool data for pool selection context
    if (context === 'pool-selection' && (!poolData || poolData.length === 0)) {
      console.error('No pool data available for ranking');
      return;
    }
    
    const messageToSend = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      await sendMessage(messageToSend);
      // Clear suggestions after sending a message
      setGenerativeUI(null);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, context, poolData, sendMessage]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleToggleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleCollapsed();
    }
  };

  const handleSendClick = () => {
    void handleSendMessage();
  };

  if (!isVisible) {
    return null;
  }

  if (isCollapsed) {
    return (
      <div 
        className="fixed bottom-0 right-0 left-0 z-50 bg-background/95 backdrop-blur-sm border-t transition-all duration-300 ease-in-out cursor-pointer hover:bg-muted/20"
        onClick={toggleCollapsed}
        onKeyPress={handleToggleKeyPress}
        tabIndex={0}
        role="button"
        aria-label="Expand chat"
      >
        <div className="w-full max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-center">
            <Bot className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed bottom-0 right-0 left-0 z-50 bg-background/95 backdrop-blur-sm border-t shadow-lg transition-all duration-300 ease-in-out"
      style={{ height: `${height}px` }}
    >
      {/* Resize handle */}
      <div
        ref={resizeRef}
        className="h-1 bg-border hover:bg-primary/20 cursor-ns-resize transition-colors"
        onMouseDown={() => setIsDragging(true)}
      />
      
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-muted/30">
          <div className="w-full max-w-4xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <Bot className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <button
                    onClick={clearChatHistory}
                    className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                    title="Clear chat history"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
                <button
                  onClick={toggleCollapsed}
                  className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                  title="Minimize chat"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto"
        >
          <div className="w-full max-w-4xl mx-auto px-6 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <p className="text-muted-foreground font-zen">
                {getGreeting()}
              </p>
              
              {context === 'pool-selection' && loadingPools && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <span className="ml-2">Loading pool data...</span>
                </div>
              )}
              
              {context === 'pool-selection' && !loadingPools && poolData.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Ready to analyze {poolData.length} pools
                </p>
              )}
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="text-sm font-zen">{message.content}</div>
                    
                    {/* Display pool recommendations for pool selection messages */}
                    {message.role === 'assistant' && message.poolRanking && context === 'pool-selection' && (
                      <PoolRecommendationCards pools={message.poolRanking} />
                    )}
                    
                    {/* Display tool results for range analysis messages */}
                    {message.role === 'assistant' && message.toolResults && context === 'range-analysis' && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-2">📊 Analysis Results</h4>
                        <pre className="text-xs text-blue-700 overflow-auto">
                          {JSON.stringify(message.toolResults, null, 2)}
                        </pre>
                      </div>
                    )}
                    
                    <div className="text-xs opacity-60 mt-1 font-zen">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
          </div>
        </div>

        {/* Generative UI Suggestions Area */}
        {generativeUI && (
          <div className="border-t bg-muted/20">
            <div className="w-full max-w-4xl mx-auto px-6 py-4">
              <GenerativeUI component={generativeUI} />
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t">
          <div className="w-full max-w-4xl mx-auto px-6 py-4">
            <div className="flex gap-3 items-center">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={getPlaceholder()}
              className="flex-1 p-3 border rounded-lg resize-none bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-zen placeholder:text-muted-foreground/60"
              rows={1}
              style={{
                minHeight: '44px',
                maxHeight: '120px',
                height: 'auto'
              }}
              disabled={isLoading || (context === 'pool-selection' && loadingPools)}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
              }}
            />
            <button
              onClick={handleSendClick}
              disabled={!inputValue.trim() || isLoading || (context === 'pool-selection' && loadingPools)}
              className="p-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              style={{ height: '44px' }}
            >
              <Send className="h-4 w-4" />
            </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}