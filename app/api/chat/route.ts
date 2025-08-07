import { NextRequest, NextResponse } from 'next/server';
import { openRouterClient } from '@/lib/ai/openrouter-client';
import { AgentRole, ChatRequest } from '@/types/ai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as ChatRequest;
    const { message, role, context } = body;
    
    if (!message || !role) {
      return NextResponse.json({ error: 'Message and role are required' }, { status: 400 });
    }

    if (!Object.values(AgentRole).includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const response = await openRouterClient.chat({ message, role, context: context as Record<string, unknown> });
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}