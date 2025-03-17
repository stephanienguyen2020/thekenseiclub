import OpenAI from 'openai';
import { MongoClient, Collection } from 'mongodb';
import dotenv from 'dotenv';
import * as pdfParse from 'pdf-parse';

dotenv.config();

interface Document {
    text: string;
    embedding: number[];
    metadata: Record<string, any>;
    createdAt: Date;
}

interface TextChunk {
    text: string;
    pageNumber: number;
}

export class RagService {
    private openai: OpenAI;
    private mongoClient: MongoClient;
    private readonly MONGODB_URI: string;
    private readonly MONGODB_DB_NAME = 'ragDatabase';
    private readonly DEFAULT_COLLECTION = 'documents';
    private readonly CHUNK_SIZE = 1000;

    constructor() {
        // Initialize OpenAI
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        // Initialize MongoDB
        this.MONGODB_URI = process.env.NEXT_PUBLIC_MONGODB_URI || 'mongodb://localhost:27017/ragDatabase';
        this.mongoClient = new MongoClient(this.MONGODB_URI);
    }

    // Get collection by name
    private getCollection(collectionName?: string): Collection<Document> {
        return this.mongoClient
            .db(this.MONGODB_DB_NAME)
            .collection(collectionName || this.DEFAULT_COLLECTION);
    }

    // Helper function to chunk text into smaller pieces
    private chunkText(text: string, pageNumber: number): TextChunk[] {
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        const chunks: TextChunk[] = [];
        let currentChunk = '';

        for (const sentence of sentences) {
            if (currentChunk.length + sentence.length <= this.CHUNK_SIZE) {
                currentChunk += (currentChunk ? ' ' : '') + sentence.trim();
            } else {
                if (currentChunk) {
                    chunks.push({ text: currentChunk.trim(), pageNumber });
                }
                currentChunk = sentence.trim();
            }
        }

        if (currentChunk) {
            chunks.push({ text: currentChunk.trim(), pageNumber });
        }

        return chunks;
    }

    // Helper function to process PDF content
    private async processPDF(file: Buffer): Promise<TextChunk[]> {
        try {
            // Process PDF directly from buffer
            const data = await pdfParse.default(file);
            
            if (!data || !data.text) {
                throw new Error('Failed to extract text from PDF');
            }

            // Split text into pages using PDF's natural page breaks
            const pages = data.text.split(/\f/); // Form feed character as page separator
            let allChunks: TextChunk[] = [];

            pages.forEach((pageContent: string, pageNumber: number) => {
                // Skip empty pages
                if (!pageContent.trim()) return;

                // Clean up the text content
                const cleanContent = pageContent
                    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                    .replace(/\[object Object\]/g, '') // Remove any [object Object] artifacts
                    .trim();

                if (!cleanContent) return;

                const pageChunks = this.chunkText(cleanContent, pageNumber + 1);
                allChunks = allChunks.concat(pageChunks);
            });

            if (allChunks.length === 0) {
                throw new Error('No text content found in PDF');
            }

            return allChunks;
        } catch (error) {
            console.error('Error processing PDF:', error);
            if (error instanceof Error) {
                throw new Error(`PDF processing failed: ${error.message}`);
            }
            throw new Error('PDF processing failed with unknown error');
        }
    }

    // Helper function to process file content and split into chunks
    async processFileContent(file: Buffer, fileName: string): Promise<TextChunk[]> {
        try {
            if (!file || file.length === 0) {
                throw new Error('Empty file buffer received');
            }

            const fileExtension = fileName.split('.').pop()?.toLowerCase();
            if (!fileExtension) {
                throw new Error('File extension not found');
            }

            switch (fileExtension) {
                case 'pdf':
                    return await this.processPDF(file);
                
                case 'txt':
                    const text = file.toString('utf-8');
                    if (!text.trim()) {
                        throw new Error('Empty text file');
                    }
                    // Split text into pages (using double newlines as page breaks)
                    const pages = text.split('\n\n');
                    let allChunks: TextChunk[] = [];

                    pages.forEach((pageContent, pageNumber) => {
                        if (!pageContent.trim()) return; // Skip empty pages
                        const pageChunks = this.chunkText(pageContent.trim(), pageNumber + 1);
                        allChunks = allChunks.concat(pageChunks);
                    });

                    if (allChunks.length === 0) {
                        throw new Error('No content found in text file');
                    }
                    return allChunks;

                case 'doc':
                case 'docx':
                    throw new Error('Word document processing not implemented yet');

                default:
                    throw new Error(`Unsupported file type: ${fileExtension}`);
            }
        } catch (error) {
            console.error('Error processing file:', error);
            if (error instanceof Error) {
                throw new Error(`File processing failed: ${error.message}`);
            }
            throw new Error('File processing failed with unknown error');
        }
    }

    async connect(): Promise<void> {
        try {
            await this.mongoClient.connect();
            console.log('Connected to MongoDB');
        } catch (error) {
            console.error('Failed to connect to MongoDB:', error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        await this.mongoClient.close();
    }

    async addDocument(
        textOrFile: string | Buffer,
        metadata: Record<string, any> = {},
        fileName?: string,
        collectionName?: string
    ): Promise<void> {
        try {
            let chunks: TextChunk[];
            const collection = this.getCollection(collectionName);

            // Ensure vector index exists for the collection
            await collection.createIndex({ embedding: 1 });

            if (Buffer.isBuffer(textOrFile)) {
                if (!fileName) {
                    throw new Error('Filename is required for file processing');
                }
                console.log('textOrFile', textOrFile.length);
                // Process file content
                chunks = await this.processFileContent(textOrFile, fileName);
            } else if (typeof textOrFile === 'string') {
                if (!textOrFile.trim()) {
                    throw new Error('Empty text input');
                }
                // Process single text input
                chunks = this.chunkText(textOrFile, 1);
            } else {
                throw new Error('Invalid input type: must be string or Buffer');
            }

            if (chunks.length === 0) {
                throw new Error('No content chunks generated');
            }
            // Process each chunk
            for (const chunk of chunks) {
                if (!chunk.text.trim()) {
                    console.warn('Skipping empty chunk');
                    continue;
                }
                console.log('chunk.text', chunk.text);
                // Generate embedding using OpenAI
                const response = await this.openai.embeddings.create({
                    model: "text-embedding-ada-002",
                    input: chunk.text,
                });

                const embedding = response.data[0].embedding;

                // Store document with embedding in MongoDB
                await collection.insertOne({
                    text: chunk.text,
                    embedding,
                    metadata: {
                        ...metadata,
                        pageNumber: chunk.pageNumber,
                        fileName: fileName || 'text_input'
                    },
                    createdAt: new Date(),
                });
            }
        } catch (error) {
            console.error('Failed to add document:', error);
            if (error instanceof Error) {
                throw new Error(`Document processing failed: ${error.message}`);
            }
            throw new Error('Document processing failed with unknown error');
        }
    }

    async searchSimilarDocuments(
        query: string, 
        limit: number = 5,
        collectionName?: string
    ): Promise<Array<{ text: string; metadata: Record<string, any>; similarity: number }>> {
        try {
            const collection = this.getCollection(collectionName);

            // Generate embedding for the query
            const response = await this.openai.embeddings.create({
                model: "text-embedding-ada-002",
                input: query,
            });

            const queryEmbedding = response.data[0].embedding;

            // Perform vector similarity search using Atlas
            const similarDocuments = await collection
                .aggregate([
                    {
                        "$vectorSearch": {
                            "index": "vector_index", 
                            "path": "embedding",
                            "queryVector": queryEmbedding,
                            "numCandidates": limit * 10,
                            "limit": limit
                        }
                    },
                    {
                        $project: {
                            text: 1,
                            metadata: 1,
                            similarity: { $meta: "vectorSearchScore" },
                            _id: 0
                        }
                    }
                ])
                .toArray();

            return similarDocuments.map(doc => ({
                text: doc.text,
                metadata: doc.metadata,
                similarity: doc.similarity
            }));
        } catch (error) {
            console.error('Failed to search documents:', error);
            throw error;
        }
    }
}
