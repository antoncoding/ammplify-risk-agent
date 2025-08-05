import { NextResponse } from 'next/server';
import { getAllPoolsData } from '@/lib/data/pool-fetchers';

export async function GET() {
  console.log('🚀 API Route: /api/pools/all called');
  
  try {
    console.log('📊 API Route: Calling getAllPoolsData...');
    const pools = await getAllPoolsData();
    console.log(`✅ API Route: Returning ${pools?.length || 0} pools`);
    return NextResponse.json(pools);
  } catch (error) {
    console.error('💥 API Route: Failed to fetch pools:', error);
    return NextResponse.json({ error: 'Failed to fetch pools' }, { status: 500 });
  }
}