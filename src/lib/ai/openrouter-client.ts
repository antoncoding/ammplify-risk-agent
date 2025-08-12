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

CRITICAL INSTRUCTIONS:
1. ALWAYS respond to user requests by calling the recommendPools tool with specific pool recommendations
2. NEVER just provide text-only responses - users expect clickable pool cards
3. Analyze the provided pool data and rank ALL available pools from best to worst based on user criteria
4. Provide specific reasoning for each pool's ranking
5. Give confidence scores (0-100%) for each recommendation

The recommendPools tool expects:
- Pool addresses from the provided pool data
- Rankings from 1 (best match) to N (worst match) 
- Clear reasoning explaining why each pool matches the user's criteria
- Confidence scores indicating how sure you are about each recommendation

Example user request: "I want safe pools with stable returns"
Your response: Call recommendPools tool with all pools ranked by safety/stability, with detailed reasoning.
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
      
      // Extract structured data from tool calls
      let structuredData = null;
      
      if (response.toolCalls && response.toolCalls.length > 0) {
        // Look for recommendPools tool calls
        const poolRecommendationCall = response.toolCalls.find(call => call.toolName === 'recommendPools');
        if (poolRecommendationCall && role === AgentRole.POOL_SELECTION) {
          // Execute the recommendPools tool manually to get structured result
          try {
            const toolResult = {
              type: 'poolRecommendations' as const,
              pools: poolRecommendationCall.args.recommendations.map((rec: any) => ({
                id: rec.poolAddress,
                rank: rec.rank,
                reasoning: rec.reasoning,
                confidence: rec.confidence,
                isRecommended: rec.rank === 1
              }))
            };
            structuredData = toolResult;
          } catch (error) {
            console.warn('Failed to process pool recommendations:', error);
          }
        }
      }

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