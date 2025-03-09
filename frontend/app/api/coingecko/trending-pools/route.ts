import { NextResponse } from 'next/server';
import { CoingeckoService, TrendingPoolsParams } from '@/services/CoingeckoService';

export async function GET(request: Request) {
  try {
    // Get URL object from the request
    const url = new URL(request.url);
    
    // Extract all query parameters
    const params: TrendingPoolsParams = {
      network: url.searchParams.get('network') || undefined,
      include: url.searchParams.get('include') || undefined,
      page: url.searchParams.get('page') ? parseInt(url.searchParams.get('page')!) : undefined,
      duration: url.searchParams.get('duration') || undefined
    };

    console.log('Fetching trending pools with params:', params);

    const data = await CoingeckoService.getTrendingPools(params);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching trending pools:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch trending pools',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
} 