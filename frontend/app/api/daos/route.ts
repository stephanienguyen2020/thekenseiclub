import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

// Create a new proposal
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const response = await fetch(`${BACKEND_URL}/api/proposals`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error('Failed to create proposal');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to create proposal' },
            { status: 500 }
        );
    }
}

// Get all proposals
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const wallet = searchParams.get('wallet');

        let url = `${BACKEND_URL}/api/proposals`;
        if (wallet) {
            url = `${BACKEND_URL}/api/proposals/wallet/${wallet}`;
        }

        const response = await fetch(url);
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