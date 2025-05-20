import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const platform = searchParams.get('platform');

    try {
        let backendUrl = `${BACKEND_URL}/api/non-native-token/tokens?page=${page}&limit=${limit}`;
        if (platform) {
            backendUrl += `&platform=${platform}`;
        }

        const response = await fetch(backendUrl);

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json({ error: 'Failed to fetch token list from backend', details: errorData }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching token list:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
