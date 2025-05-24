import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET(request: Request) {
  try {
    // Get wallet address from query params
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/twitter/account?walletAddress=${walletAddress}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get Twitter account status');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    
    return NextResponse.json(
      { error: 'Failed to get Twitter account status' },
      { status: 500 }
    );
  }
}
