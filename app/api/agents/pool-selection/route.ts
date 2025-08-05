import { NextRequest, NextResponse } from 'next/server';
import { openRouterClient } from '@/lib/ai/openrouter-client';
import { AgentRole, PoolData } from '@/types/ai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, poolData }: { message: string; poolData: PoolData[] } = body;
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!poolData || poolData.length === 0) {
      return NextResponse.json({ error: 'Pool data is required' }, { status: 400 });
    }

    const response = await openRouterClient.chat({
      message,
      role: AgentRole.POOL_SELECTION,
      poolData
    });
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Pool selection agent error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}