import { NextResponse } from 'next/server';
import { CoingeckoService } from '@/services/CoingeckoService';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const network = searchParams.get('network') || 'sonic';
  const tokenAddress = searchParams.get('token_address');

  if (!tokenAddress) {
    return NextResponse.json({ error: 'token_address is required' }, { status: 400 });
  }

  try {
    const data = await CoingeckoService.getToken(tokenAddress, network);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching token:', error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
} 