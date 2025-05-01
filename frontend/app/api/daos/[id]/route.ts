import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

// Get a specific proposal
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const response = await fetch(`${BACKEND_URL}/api/proposals/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch proposal');
        }

        const data = await response.json();
        return NextResponse.json({ data });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch proposal' },
            { status: 500 }
        );
    }
} 