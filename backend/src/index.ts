import cors from "cors";
import express from "express";
import path from "path";
import { connectMongoDB } from "./db/mongodb";
import { setupListeners } from "./indexer/event-indexer";
import balanceRouter from "./routes/balance";
import coinRouter from "./routes/coin";
import commentRouter from "./routes/comments";
import daoRouter from "./routes/dao";
import imageRouter from "./routes/image";
import likesRouter from "./routes/interact";
import nonNativeTokenRouter from "./routes/nonNativeToken";
import ohlcvRouter from "./routes/ohlcv";
import portfolioRouter from "./routes/portfolio";
import postRouter from "./routes/posts";
import userRouter from "./routes/user";
import { scheduledTasks } from "./scheduledTasks";
// import './indexer/cron';

// Get port from environment variable or use default
export const port = parseInt(process.env.PORT || "3000", 10);

// Initialize Express app
export const app = express();

// CORS configuration
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? ["https://your-frontend-domain.com"]
      : ["http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Setup blockchain event listeners
setupListeners();

// Connect to MongoDB
connectMongoDB();

// Middleware
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "../public")));

// Initialize scheduled tasks
scheduledTasks.start();

// Root endpoint
app.get("/", (req, res) => {
  res.send(
    'Feed Backend API - See documentation at <a href="/docs">API Documentation</a>'
  );
});

// Documentation endpoint
app.get("/docs", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/docs.html"));
});

// Register API routes
app.use(ohlcvRouter);
app.use(coinRouter);
app.use(imageRouter);
app.use(postRouter);
app.use(commentRouter);
app.use(likesRouter);
app.use(userRouter);
app.use("/api", daoRouter);
app.use("/api", balanceRouter);
app.use("/api/non-native-token", nonNativeTokenRouter);
app.use("/api", portfolioRouter);

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
      error: "Internal Server Error",
      message: process.env.NODE_ENV === "production" ? undefined : err.message,
    });
  }
);

// Start server
app.listen(port, async () => {
  console.log(`Server is running at http://localhost:${port}`);
  console.log(`API Documentation available at http://localhost:${port}/docs`);
});
