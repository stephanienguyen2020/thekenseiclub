import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const text = formData.get('text');
    const username = formData.get('username');
    const images = formData.getAll('images');

    if (!text || !username) {
      return NextResponse.json(
        { error: 'Text and username are required' },
        { status: 400 }
      );
    }

    // Create a new FormData instance for the backend request
    const backendFormData = new FormData();
    backendFormData.append('text', text as string);
    backendFormData.append('username', username as string);

    // Append images if they exist
    images.forEach((image) => {
      if (image instanceof File) {
        backendFormData.append('images', image);
      }
    });

    const response = await fetch(`${BACKEND_URL}/api/twitter/tweet`, {
      method: 'POST',
      body: backendFormData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to post tweet');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to post tweet' },
      { status: 500 }
    );
  }
}
