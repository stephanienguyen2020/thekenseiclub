import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/proposals/${params.id}/image`);
    
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.error || 'Failed to fetch proposal image' },
        { status: response.status }
      );
    }

    // Get the image buffer from the response
    const imageBuffer = await response.arrayBuffer();
    
    // Create a new response with the image buffer
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': imageBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('Error fetching proposal image:', error);
    return NextResponse.json(
      { error: 'Failed to fetch proposal image' },
      { status: 500 }
    );
  }
}
