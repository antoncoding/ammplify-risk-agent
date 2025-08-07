import { NextRequest, NextResponse } from 'next/server';
import { openRouterClient } from '@/lib/ai/openrouter-client';
import { AgentRole } from '@/types/ai';

export async function POST(req: NextRequest) {
  try {
    type RequestBody = {
      message: string;
      context?: unknown;
    };
    const body = await req.json() as RequestBody;
    const { message, context } = body;
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const response = await openRouterClient.chat({
      message,
      role: AgentRole.RANGE_ANALYSIS,
      context
    });
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Range analysis agent error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}