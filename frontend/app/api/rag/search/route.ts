import { NextRequest, NextResponse } from 'next/server';
import { RagService } from '@/services/RagService';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { query, limit } = body;

        if (!query) {
            return NextResponse.json(
                { error: 'Query is required' },
                { status: 400 }
            );
        }

        const ragService = new RagService();
        await ragService.connect();

        const results = await ragService.searchSimilarDocuments(query, limit);
        await ragService.disconnect();

        return NextResponse.json({
            success: true,
            results
        });

    } catch (error) {
        console.error('Error searching documents:', error);
        return NextResponse.json(
            { error: 'Failed to search documents' },
            { status: 500 }
        );
    }
} 