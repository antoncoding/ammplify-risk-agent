import { AgentRole, ChatRequest, ChatResponse, ToolCall, PoolData } from '@/types/ai';
import { PROMPTS } from '@/config/prompts';
import { calculateVolAndDriftTool, calculateVolAndDriftFromRange, VolDriftInput } from '@/lib/tools/vol-drift-calculator';

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_call_id?: string;
  tool_calls?: ToolCall[];
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string | null;
      tool_calls?: ToolCall[];
    };
  }>;
}

export class OpenRouterClient {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
  private defaultModel: string;

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    this.defaultModel = process.env.DEFAULT_MODEL || 'anthropic/claude-3-sonnet';
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const { message, role, context, poolData } = request;
    
    let systemPrompt = PROMPTS[role];
    
    // For pool selection agent, include pool data in the system prompt
    if (role === AgentRole.POOL_SELECTION && poolData) {
      const poolSummary = poolData.map(pool => 
        `Pool: ${pool.token0}/${pool.token1} (${pool.address})\n` +
        `- TVL: $${(pool.tvl / 1000000).toFixed(1)}M\n` +
        `- Volume 24h: $${(pool.volume24h / 1000000).toFixed(1)}M\n` +
        `- APY: ${pool.apy}%\n` +
        `- Volatility: ${pool.volatility}%\n`
      ).join('\n');
      
      systemPrompt += `\n\nAvailable pools to rank:\n${poolSummary}`;
    }
    
    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ];

    const tools = this.getToolsForRole(role);

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
          'X-Title': 'Ammplify Risk Agent'
        },
        body: JSON.stringify({
          model: this.defaultModel,
          messages,
          tools: tools.length > 0 ? tools : undefined,
          tool_choice: tools.length > 0 ? 'auto' : undefined,
          temperature: 0.7,
          max_tokens: 1500
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data: OpenRouterResponse = await response.json();
      const choice = data.choices[0];
      
      let responseText = choice?.message?.content || '';
      let toolCalls = choice?.message?.tool_calls || [];
      
      // Execute tool calls if present
      if (toolCalls.length > 0) {
        const toolResults = await this.executeToolCalls(toolCalls);
        
        // Add tool results to conversation and get final response
        const followUpMessages: OpenRouterMessage[] = [
          ...messages,
          { role: 'assistant', content: responseText, tool_calls: toolCalls },
          ...toolResults.map(result => ({
            role: 'tool' as const,
            content: JSON.stringify(result.result),
            tool_call_id: result.id
          }))
        ];
        
        const followUpResponse = await fetch(this.baseUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
            'X-Title': 'Ammplify Risk Agent'
          },
          body: JSON.stringify({
            model: this.defaultModel,
            messages: followUpMessages,
            temperature: 0.7,
            max_tokens: 1500
          })
        });
        
        if (followUpResponse.ok) {
          const followUpData: OpenRouterResponse = await followUpResponse.json();
          responseText = followUpData.choices[0]?.message?.content || responseText;
        }
      }
      
      return {
        response: responseText || 'No response generated',
        role,
        toolCalls
      };
    } catch (error) {
      console.error('OpenRouter client error:', error);
      throw new Error('Failed to get AI response');
    }
  }

  private getToolsForRole(role: AgentRole) {
    if (role === AgentRole.RANGE_ANALYSIS) {
      return [calculateVolAndDriftTool];
    }
    return [];
  }

  private async executeToolCalls(toolCalls: ToolCall[]) {
    const results = [];
    
    for (const toolCall of toolCalls) {
      try {
        const { name, arguments: args } = toolCall.function;
        const parsedArgs = JSON.parse(args);
        
        let result;
        if (name === 'calculateVolAndDriftFromRange') {
          result = await calculateVolAndDriftFromRange(parsedArgs as VolDriftInput);
        } else {
          throw new Error(`Unknown tool: ${name}`);
        }
        
        results.push({
          id: toolCall.id,
          result
        });
      } catch (error) {
        console.error(`Tool execution error for ${toolCall.function.name}:`, error);
        results.push({
          id: toolCall.id,
          result: { error: 'Tool execution failed' }
        });
      }
    }
    
    return results;
  }
}

export const openRouterClient = new OpenRouterClient();