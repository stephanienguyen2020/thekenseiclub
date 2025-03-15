import OpenAI from 'openai';
import { MongoClient, Collection } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

interface Document {
    text: string;
    embedding: number[];
    metadata: Record<string, any>;
    createdAt: Date;
}

export class RagService {
    private openai: OpenAI;
    private mongoClient: MongoClient;
    private documentsCollection: Collection<Document>;
    private readonly MONGODB_URI: string;
    private readonly MONGODB_DB_NAME = 'ragDatabase';
    private readonly COLLECTION_NAME = 'documents';

    constructor() {
        // Initialize OpenAI
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        // Initialize MongoDB
        this.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ragDatabase';
        this.mongoClient = new MongoClient(this.MONGODB_URI);
        this.documentsCollection = this.mongoClient.db(this.MONGODB_DB_NAME).collection(this.COLLECTION_NAME);
    }

    async connect(): Promise<void> {
        try {
            await this.mongoClient.connect();
            console.log('Connected to MongoDB');
            // // Create vector index for similarity search
            // await this.documentsCollection.createIndex({ embedding: "2dsphere" });
            // For local testing, create a basic index on the embedding field
            await this.documentsCollection.createIndex({ embedding: 1 });
        } catch (error) {
            console.error('Failed to connect to MongoDB:', error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        await this.mongoClient.close();
    }

    async addDocument(text: string, metadata: Record<string, any> = {}): Promise<void> {
        try {
            // Generate embedding using OpenAI
            const response = await this.openai.embeddings.create({
                model: "text-embedding-ada-002",
                input: text,
            });

            const embedding = response.data[0].embedding;

            // Store document with embedding in MongoDB
            await this.documentsCollection.insertOne({
                text,
                embedding,
                metadata,
                createdAt: new Date(),
            });
        } catch (error) {
            console.error('Failed to add document:', error);
            throw error;
        }
    }

    async searchSimilarDocuments(
        query: string, 
        limit: number = 5
    ): Promise<Array<{ text: string; metadata: Record<string, any>; similarity: number }>> {
        try {
            // Generate embedding for the query
            const response = await this.openai.embeddings.create({
                model: "text-embedding-ada-002",
                input: query,
            });

            const queryEmbedding = response.data[0].embedding;

            // Perform vector similarity search using Atlas
            const similarDocuments = await this.documentsCollection
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
