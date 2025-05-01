import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

export const connectMongoDB = async () => {
    if (!MONGODB_URI) {
        throw new Error('MONGODB_URI is not defined in the environment variables');
    }
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}; 