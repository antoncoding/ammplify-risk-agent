// Chat service interface for pluggable LLM backends

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
}

export interface ChatContext {
  type: 'market-selection' | 'pool-analysis';
  poolAddress?: string;
  availableFunctions: string[];
  userHistory: ChatMessage[];
}

export interface FunctionCall {
  name: string;
  parameters: Record<string, any>;
}

export interface ChatResponse {
  content: string;
  functionCalls?: FunctionCall[];
}

// Abstract interface for chat providers
export interface ChatProvider {
  sendMessage(
    message: string, 
    context: ChatContext
  ): Promise<ChatResponse>;
}

// Mock implementation for development/fallback
export class MockChatProvider implements ChatProvider {
  async sendMessage(message: string, context: ChatContext): Promise<ChatResponse> {
    // Simple mock responses - replace with actual LLM
    const input = message.toLowerCase();
    
    // Basic function detection for demo purposes
    if (input.includes('change') && (input.includes('period') || input.includes('lookback'))) {
      const functionCalls: FunctionCall[] = [];
      
      if (input.includes('1 week')) {
        functionCalls.push({ name: 'changeLookbackPeriod', parameters: { period: '1 week' } });
      } else if (input.includes('1 month')) {
        functionCalls.push({ name: 'changeLookbackPeriod', parameters: { period: '1 month' } });
      } else if (input.includes('3 months')) {
        functionCalls.push({ name: 'changeLookbackPeriod', parameters: { period: '3 months' } });
      }
      
      if (functionCalls.length > 0) {
        return {
          content: 'I\'ll change the lookback period for you.',
          functionCalls
        };
      }
    }
    
    if (input.includes('refresh')) {
      return {
        content: 'I\'ll refresh the data for you.',
        functionCalls: [{ name: 'refreshData', parameters: {} }]
      };
    }
    
    // Default responses based on context
    if (context.type === 'market-selection') {
      return {
        content: 'I can help you choose the right liquidity pool. What are you looking for?'
      };
    } else {
      return {
        content: `I can help you analyze this pool. Available functions: ${context.availableFunctions.join(', ')}`
      };
    }
  }
}

// OpenAI/Claude provider placeholder
export class LLMChatProvider implements ChatProvider {
  constructor(
    private apiKey: string,
    private model: string = 'gpt-4',
    private baseUrl?: string
  ) {}

  async sendMessage(message: string, context: ChatContext): Promise<ChatResponse> {
    // This would be replaced with actual LLM API calls
    const systemPrompt = this.buildSystemPrompt(context);
    const messages = [
      { role: 'system', content: systemPrompt },
      ...context.userHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    try {
      // Placeholder for actual API call
      // const response = await fetch(`${this.baseUrl}/chat/completions`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${this.apiKey}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     model: this.model,
      //     messages,
      //     functions: this.buildFunctionDefinitions(context.availableFunctions)
      //   })
      // });

      // For now, fall back to mock
      const mockProvider = new MockChatProvider();
      return await mockProvider.sendMessage(message, context);
    } catch (error) {
      console.error('LLM API call failed:', error);
      throw new Error('Failed to get response from LLM');
    }
  }

  private buildSystemPrompt(context: ChatContext): string {
    const basePrompt = `You are Ammplify Agent, an AI assistant specialized in DeFi liquidity provision and AMM pool analysis.`;
    
    if (context.type === 'market-selection') {
      return `${basePrompt}

You're helping users choose the right liquidity pool. Available pools: ETH/USDC, BTC/USDC, SOL/USDC.
Guide users based on their risk tolerance, tokens they hold, and investment goals.
Keep responses concise and helpful.`;
    } else {
      return `${basePrompt}

You're analyzing pool ${context.poolAddress}. You can call functions to:
- Change lookback periods for data analysis
- Refresh chart data
- Zoom charts and highlight price levels
- Add annotations

Available functions: ${context.availableFunctions.join(', ')}
When users ask for actions, use the appropriate function calls.`;
    }
  }

  private buildFunctionDefinitions(availableFunctions: string[]) {
    // This would return OpenAI function definitions based on available functions
    return availableFunctions.map(name => ({
      name,
      description: `Execute ${name} function`,  // You'd have more detailed descriptions
      parameters: { type: 'object', properties: {} }  // Define based on actual function schemas
    }));
  }
}

// Chat service singleton
class ChatService {
  private provider: ChatProvider;

  constructor() {
    // Default to mock provider - can be switched at runtime
    this.provider = new MockChatProvider();
  }

  setProvider(provider: ChatProvider) {
    this.provider = provider;
  }

  async sendMessage(message: string, context: ChatContext): Promise<ChatResponse> {
    return this.provider.sendMessage(message, context);
  }
}

export const chatService = new ChatService();