import { NextResponse } from 'next/server';
import { CoingeckoService } from '@/services/CoingeckoService';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const network = searchParams.get('network') || 'sonic';
  const poolAddress = searchParams.get('pool_address');
  const timeframe = searchParams.get('timeframe') || 'hour';
  const aggregate = parseInt(searchParams.get('aggregate') || '1');
  const limit = parseInt(searchParams.get('limit') || '100');
  const currency = searchParams.get('currency') || 'usd';
  const token = searchParams.get('token') || 'base';

  if (!poolAddress || !network) {
    return NextResponse.json({ error: 'pool_address and network are required' }, { status: 400 });
  }

  try {
    const data = await CoingeckoService.getOHLCV(
      network,
      poolAddress,
      timeframe,
      aggregate,
      limit,
      currency,
      token
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching OHLCV data:', error);
    return NextResponse.json({ error: 'Failed to fetch OHLCV data' }, { status: 500 });
  }
} 