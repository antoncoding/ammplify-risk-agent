import { NextRequest, NextResponse } from 'next/server';
import { calculateVolAndDriftFromRange, VolDriftInput } from '@/lib/tools/vol-drift-calculator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as VolDriftInput;
    const { currentPrice, minPrice, maxPrice, timeframeDays } = body;
    
    if (!currentPrice || !minPrice || !maxPrice || !timeframeDays) {
      return NextResponse.json({ 
        error: 'currentPrice, minPrice, maxPrice, and timeframeDays are required' 
      }, { status: 400 });
    }

    if (minPrice >= maxPrice) {
      return NextResponse.json({ 
        error: 'minPrice must be less than maxPrice' 
      }, { status: 400 });
    }

    if (currentPrice < minPrice || currentPrice > maxPrice) {
      return NextResponse.json({ 
        error: 'currentPrice must be between minPrice and maxPrice' 
      }, { status: 400 });
    }

    const result = await calculateVolAndDriftFromRange(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Vol/drift calculation error:', error);
    return NextResponse.json({ error: 'Calculation failed' }, { status: 500 });
  }
}