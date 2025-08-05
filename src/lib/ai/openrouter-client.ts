import { Agent } from '@mastra/core/agent';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { AgentRole, ChatRequest, ChatResponse, PoolData } from '@/types/ai';
import { AgentResponse, PoolRecommendationComponent } from '@/types/agent-responses';
import { PROMPTS } from '@/config/prompts';
import { calculateVolAndDriftFromRange, VolDriftInput } from '@/lib/tools/vol-drift-calculator';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const poolSelectionAgent = new Agent({
  model: openrouter('anthropic/claude-3-opus'),
  name: 'PoolSelectionAgent',
  instructions: PROMPTS[AgentRole.POOL_SELECTION] + `

IMPORTANT: When providing pool recommendations, you MUST use the recommendPools tool to return structured data. Always call this tool with your recommendations instead of just describing them in text.

The tool expects:
- An array of pool recommendations with pool addresses (IDs)
- Each recommendation should include rank (1=best), reasoning, and confidence (0-100)
- Always rank pools from best to worst (rank 1, 2, 3, etc.)
`,
  tools: {
    recommendPools: {
      description: 'Provide structured pool recommendations with rankings and reasoning',
      parameters: {
        type: 'object',
        properties: {
          recommendations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                poolAddress: { type: 'string', description: 'The pool contract address' },
                rank: { type: 'number', description: 'Ranking from 1 (best) to N (worst)' },
                reasoning: { type: 'string', description: 'Why this pool is recommended' },
                confidence: { type: 'number', minimum: 0, maximum: 100, description: 'Confidence score 0-100' }
              },
              required: ['poolAddress', 'rank', 'reasoning', 'confidence']
            }
          }
        },
        required: ['recommendations']
      },
      execute: async (args: any) => {
        // This tool just returns the structured data - it will be processed by the client
        return {
          type: 'poolRecommendations',
          pools: args.recommendations.map((rec: any) => ({
            id: rec.poolAddress,
            rank: rec.rank,
            reasoning: rec.reasoning,
            confidence: rec.confidence,
            isRecommended: rec.rank === 1
          }))
        };
      }
    }
  }
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
      
      // Extract structured data from tool calls - for now return null, will be implemented later
      let structuredData = null;
      // TODO: Extract structured data from Mastra agent tool calls
      // This will be properly implemented once we understand the Mastra response structure

      return {
        response: response.text || 'No response generated',
        role,
        structuredData,
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