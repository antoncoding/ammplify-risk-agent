import { Agent } from '@mastra/core/agent';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { AgentRole, ChatRequest, ChatResponse, PoolData } from '@/types/ai';
import { PROMPTS } from '@/config/prompts';
import { calculateVolAndDriftFromRange, VolDriftInput } from '@/lib/tools/vol-drift-calculator';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const poolSelectionAgent = new Agent({
  model: openrouter('anthropic/claude-3-opus'),
  name: 'PoolSelectionAgent',
  instructions: PROMPTS[AgentRole.POOL_SELECTION],
});

const rangeAnalysisAgent = new Agent({
  model: openrouter('anthropic/claude-3-opus'),
  name: 'RangeAnalysisAgent',
  instructions: PROMPTS[AgentRole.RANGE_ANALYSIS],
  tools: {
    calculateVolAndDriftFromRange: {
      description: 'Calculate volatility and drift from price range',
      parameters: {
        type: 'object',
        properties: {
          lowerBound: { type: 'number' },
          upperBound: { type: 'number' },
          currentPrice: { type: 'number' },
          timeHorizon: { type: 'number' }
        },
        required: ['lowerBound', 'upperBound', 'currentPrice', 'timeHorizon']
      },
      execute: async (args: VolDriftInput) => {
        return await calculateVolAndDriftFromRange(args);
      }
    }
  }
});

export class OpenRouterClient {
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const { message, role, poolData } = request;
    
    try {
      let agent: Agent;
      let fullMessage = message;
      
      if (role === AgentRole.POOL_SELECTION) {
        agent = poolSelectionAgent;
        
        if (poolData) {
          const poolSummary = poolData.map(pool => 
            `Pool: ${pool.token0}/${pool.token1} (${pool.address})\n` +
            `- Volume 24h: $${(pool.volume24h / 1000000).toFixed(1)}M\n` +
            `- Fees 24h: $${(pool.fees24h / 1000).toFixed(1)}K\n` +
            `- Volatility: ${pool.volatility.toFixed(1)}%\n`
          ).join('\n');
          
          fullMessage = `${message}\n\nAvailable pools to rank:\n${poolSummary}`;
        }
      } else {
        agent = rangeAnalysisAgent;
      }
      
      const response = await agent.generate([
        {
          role: 'user',
          content: fullMessage,
        },
      ]);
      
      return {
        response: response.text || 'No response generated',
        role,
        toolCalls: response.toolCalls?.map(toolCall => ({
          id: toolCall.toolCallId,
          type: 'function' as const,
          function: {
            name: toolCall.toolName,
            arguments: JSON.stringify(toolCall.args)
          }
        })) || []
      };
    } catch (error) {
      console.error('OpenRouter client error:', error);
      throw new Error('Failed to get AI response');
    }
  }
}

export const openRouterClient = new OpenRouterClient();