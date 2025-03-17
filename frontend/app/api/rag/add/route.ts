import { NextRequest, NextResponse } from 'next/server';
import { RagService } from '@/services/RagService';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const metadata = formData.get('metadata');
        const text = formData.get('text');
        const collection = formData.get('collection') as string | null;
        console.log('I am here');
        const ragService = new RagService();
        await ragService.connect();
        console.log('file', file);
        console.log('metadata', metadata);
        console.log('text', text);
        console.log('collection', collection);
        // if (file) {
        //     console.log('file', file);
        //     // Handle file upload
        //     const buffer = Buffer.from(await file.arrayBuffer());
        //     await ragService.addDocument(
        //         buffer, 
        //         metadata ? JSON.parse(metadata as string) : {}, 
        //         file.name,
        //         collection || undefined
        //     );
        // } else if (text) {
        //     // Handle text input
        //     await ragService.addDocument(
        //         text as string,
        //         metadata ? JSON.parse(metadata as string) : {},
        //         undefined,
        //         collection || undefined
        //     );
        // } else {
        //     return NextResponse.json(
        //         { error: 'Either file or text is required' },
        //         { status: 400 }
        //     );
        // }

        await ragService.disconnect();

        return NextResponse.json({
            success: true,
            message: 'Document added successfully',
            collection: collection || 'documents'
        });

    } catch (error: any) {
        console.error('Error adding document:', error);
        return NextResponse.json(
            { 
                error: 'Failed to add document',
                message: error.message 
            },
            { status: 500 }
        );
    }
} 