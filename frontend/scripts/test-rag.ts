import { RagService } from '../services/RagService';

async function testRag() {
    const rag = new RagService();
    
    try {
        // Connect to MongoDB
        await rag.connect();
        console.log('Connected successfully');

        // Add a test document
        await rag.addDocument(
            'OpenAI is a leading AI research company',
            { source: 'test', category: 'AI' }
        );
        console.log('Added test document');

        // Search for similar documents
        const results = await rag.searchSimilarDocuments('AI research companies');
        console.log('Search results:', JSON.stringify(results, null, 2));

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await rag.disconnect();
    }
}

testRag(); 