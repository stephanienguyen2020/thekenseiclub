import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

// Create a new proposal
export async function POST(request: Request) {
    try {
        const receivedFormData = await request.formData();
        const title = receivedFormData.get('title') as string;
        const description = receivedFormData.get('description') as string;

        const optionsString = receivedFormData.get('options') as string;
        const createdBy = receivedFormData.get('createdBy') as string;
        const tokenAddress = receivedFormData.get('tokenAddress') as string;
        const startDate = receivedFormData.get('startDate') as string;
        const endDate = receivedFormData.get('endDate') as string;
        const tag = receivedFormData.get('tag') as string;
        const image = receivedFormData.get('image') as File;
        
        console.log("Received form data:", {
            title,
            description,
            optionsString,
            createdBy,
            tokenAddress,
            startDate,
            endDate,
            tag,
            image
        });
        
        if (!title || !description || !optionsString || !createdBy || !tokenAddress || 
            !startDate || !endDate || !tag || !image) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Create a new FormData to send to the backend
        const backendFormData = new FormData();
        backendFormData.append('title', title);
        backendFormData.append('description', description);
        // The backend route expects options as a JSON string: JSON.parse(req.body.options)
        // optionsString is already the string from the client, so append it directly.
        // If options were parsed into an array, they would need to be stringified again here.
        backendFormData.append('options', optionsString);
        backendFormData.append('createdBy', createdBy);
        backendFormData.append('tokenAddress', tokenAddress);
        backendFormData.append('startDate', startDate);
        backendFormData.append('endDate', endDate);
        backendFormData.append('tag', tag);
        backendFormData.append('image', image, image.name);

        const response = await fetch(`${BACKEND_URL}/api/proposals`, {
            method: 'POST',
            // No 'Content-Type' header; fetch sets it for FormData
            body: backendFormData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Failed to create proposal, unknown backend error' }));
            console.error('Backend error:', errorData);
            throw new Error(errorData.details || errorData.error || 'Failed to create proposal');
        }

        const data = await response.json();
        return NextResponse.json({ data });
    } catch (error: any) {
        console.error('Error in POST /api/daos/route.ts:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create proposal' },
            { status: 500 }
        );
    }
}

// Get all proposals
export async function GET(req: Request) {
    console.log("GET request received");
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