import { NextRequest, NextResponse } from 'next/server';
import { RagService } from '@/services/RagService';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { text, metadata } = body;

        if (!text) {
            return NextResponse.json(
                { error: 'Text is required' },
                { status: 400 }
            );
        }

        const ragService = new RagService();
        await ragService.connect();

        await ragService.addDocument(text, metadata || {});
        await ragService.disconnect();

        return NextResponse.json({
            success: true,
            message: 'Document added successfully'
        });

    } catch (error) {
        console.error('Error adding document:', error);
        return NextResponse.json(
            { error: 'Failed to add document' },
            { status: 500 }
        );
    }
} 