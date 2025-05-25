import { NextRequest, NextResponse } from 'next/server';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
export async function GET(
    request: NextRequest,
    //{ params }: { params: { coingeckoID: string } }
    context: { params: { coingeckoID: string } }
) {
    //const { coingeckoID } = params;
    const { coingeckoID } = await context.params;
    if (!coingeckoID) {
        return NextResponse.json({ error: 'CoinGecko ID is required' }, { status: 400 });
    }

    try {
        const backendUrl = `${BACKEND_URL}/api/non-native-token/tokens/${coingeckoID}`;
        const response = await fetch(backendUrl);

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json({ error: 'Failed to fetch token from backend', details: errorData }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching token by ID:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
