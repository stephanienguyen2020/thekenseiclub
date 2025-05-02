import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(
    request: Request,
    { params }: { params: { tokenAddress: string } }
) {
    try {
        const tokenAddress = params.tokenAddress;
        const response = await fetch(`${BACKEND_URL}/api/dao/proposals/token/${tokenAddress}`);

        if (!response.ok) {
            throw new Error('Failed to fetch proposals');
        }

        const data = await response.json();
        return NextResponse.json({ data });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch proposals' },
            { status: 500 }
        );
    }
} 