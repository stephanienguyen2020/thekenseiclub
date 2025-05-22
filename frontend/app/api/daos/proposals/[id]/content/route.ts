import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/proposals/${params.id}/content`);
    
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.error || 'Failed to fetch proposal content' },
        { status: response.status }
      );
    }

    const content = await response.json();
    return NextResponse.json(content);
  } catch (error) {
    console.error('Error fetching proposal content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch proposal content' },
      { status: 500 }
    );
  }
}
