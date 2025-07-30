'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, ChevronDown, Bot } from 'lucide-react';
import { useChatContext } from '@/contexts/ChatContext';

type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
};

export default function PersistentChatFooter() {
  const { messages, setMessages, context, poolAddress, isVisible, availableFunctions, executeFunction } = useChatContext();
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [height, setHeight] = useState(320);
  const [isDragging, setIsDragging] = useState(false);
  
  const resizeRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    return "Ask anything";
  };

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

    // Enhanced chat logic with function detection and execution
    await new Promise(resolve => {
      setTimeout(() => {
        void (async () => {
          let responseContent = '';
          
          // Simple function detection - in a real implementation, this would be handled by an AI model
          const input = inputValue.toLowerCase();
          
          if (input.includes('change') && (input.includes('period') || input.includes('lookback'))) {
            try {
              // Example: detect period change request
              if (input.includes('1 week')) {
                await executeFunction('changeLookbackPeriod', { period: '1 week' });
                responseContent = 'Changed the lookback period to 1 week. The chart and data will update accordingly.';
              } else if (input.includes('1 month')) {
                await executeFunction('changeLookbackPeriod', { period: '1 month' });
                responseContent = 'Changed the lookback period to 1 month. The chart and data will update accordingly.';
              } else if (input.includes('3 months')) {
                await executeFunction('changeLookbackPeriod', { period: '3 months' });
                responseContent = 'Changed the lookback period to 3 months. The chart and data will update accordingly.';
              } else {
                responseContent = 'I can change the lookback period to: 1 week, 2 weeks, 1 month, 2 months, or 3 months. Please specify which period you\'d like.';
              }
            } catch (error) {
              console.error('Function execution failed:', error);
              responseContent = 'Sorry, I encountered an error while changing the lookback period.';
            }
          } else if (input.includes('refresh')) {
            try {
              await executeFunction('refreshData', {});
              responseContent = 'Data refreshed! All charts and metrics have been updated with the latest information.';
            } catch (error) {
              console.error('Function execution failed:', error);
              responseContent = 'Sorry, I encountered an error while refreshing the data.';
            }
          } else {
            responseContent = `I understand you're asking about: "${inputValue}". ${
              context === 'market-selection' 
                ? 'Let me help you choose the right market for your analysis.' 
                : `Let me analyze that for the ${poolAddress} market and provide you with insights.`
            }
            
            Available functions: ${availableFunctions.map(f => f.name).join(', ')}`;
          }

          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: responseContent,
            role: 'assistant',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, assistantMessage]);
          setIsLoading(false);
          resolve(undefined);
        })();
      }, 1000);
    });
  };

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
        <div className="w-full px-6 py-4">
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
        <div className="flex items-center justify-between px-6 py-3 bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleCollapsed}
              className="p-1.5 hover:bg-muted rounded-lg transition-colors"
              title="Minimize chat"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-muted-foreground font-zen">
                {getGreeting()}
              </p>
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

        {/* Input Area */}
        <div className="border-t px-6 py-4">
          <div className="flex gap-3 items-center">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 p-3 border rounded-lg resize-none bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-zen"
              rows={1}
              style={{
                minHeight: '44px',
                maxHeight: '120px',
                height: 'auto'
              }}
              disabled={isLoading}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
              }}
            />
            <button
              onClick={handleSendClick}
              disabled={!inputValue.trim() || isLoading}
              className="p-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              style={{ height: '44px' }}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}