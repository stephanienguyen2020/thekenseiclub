import express from 'express';
import path from 'path';
import {setupListeners} from "./indexer/event-indexer";
import ohlcvRouter from "./routes/ohlcv";
import coinRouter from "./routes/coin";
// import './indexer/cron';

// Get port from environment variable or use default
export const port = parseInt(process.env.PORT || '3000', 10);

// Initialize Express app
export const app = express();

// Setup blockchain event listeners
setupListeners();

// Middleware
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Root endpoint
app.get('/', (req, res) => {
    res.send('Feed Backend API - See documentation at <a href="/docs">API Documentation</a>');
});

// Documentation endpoint
app.get('/docs', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/docs.html'));
});

// Register API routes
app.use(ohlcvRouter);
app.use(coinRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production' ? undefined : err.message
    });
});

// Start server
app.listen(port, async () => {
    console.log(`Server is running at http://localhost:${port}`);
    console.log(`API Documentation available at http://localhost:${port}/docs`);
});
