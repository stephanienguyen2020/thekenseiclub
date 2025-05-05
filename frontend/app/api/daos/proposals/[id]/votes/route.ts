import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

// Get votes for a proposal
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/proposals/${params.id}/votes`);
        if (!response.ok) {
            throw new Error('Failed to fetch votes');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch votes' },
            { status: 500 }
        );
    }
} 