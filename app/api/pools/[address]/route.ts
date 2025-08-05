import { NextRequest, NextResponse } from 'next/server';
import { getPoolMetrics, getCurrentPrice } from '@/lib/data/pool-fetchers';

export async function GET(req: NextRequest, { params }: { params: { address: string } }) {
  try {
    const { address } = params;
    
    if (!address) {
      return NextResponse.json({ error: 'Pool address is required' }, { status: 400 });
    }

    const [metrics, currentPrice] = await Promise.all([
      getPoolMetrics(address),
      getCurrentPrice(address)
    ]);

    return NextResponse.json({
      ...metrics,
      currentPrice
    });
  } catch (error) {
    console.error('Failed to fetch pool data:', error);
    return NextResponse.json({ error: 'Failed to fetch pool data' }, { status: 500 });
  }
}