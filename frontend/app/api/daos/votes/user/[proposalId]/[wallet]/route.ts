import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ proposalId: string; wallet: string }> }
) {
    try {
        const { proposalId, wallet } = await params;
        const response = await fetch(`${BACKEND_URL}/api/proposals/${proposalId}/votes/user/${wallet}`);
        if (!response.ok) {
            if (response.status === 404) {
                return NextResponse.json({ error: 'Vote not found' }, { status: 404 });
            }
            throw new Error('Failed to fetch user vote');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch user vote' },
            { status: 500 }
        );
    }
} 