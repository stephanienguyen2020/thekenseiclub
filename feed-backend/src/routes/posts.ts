import express from "express";
import { db } from "../db/database";
import { z } from "zod";

const router = express.Router();

// Validate input data for post creation
const postSchema = z.object({
  content: z.string().min(1),
  userId: z.coerce.bigint(),
  mediaUrls: z.array(z.string()).optional(),
  coinId: z.string().optional(),
});

// POST /posts - Create a new post
router.post("/posts", async (req: any, res: any) => {
  try {
    const parsed = postSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const { content, userId, mediaUrls, coinId } = parsed.data;

    // Insert post
    const result = await db
      .insertInto("posts")
      .values({
        content,
        createdAt: new Date(),
        userId,
        mediaUrls: mediaUrls ?? null,
        coinId: coinId ?? null,
      })
      .returningAll()
      .executeTakeFirst();

    return res.status(201).json(result);
  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// GET /posts - List all posts with pagination
router.get("/posts", async (req: any, res: any) => {
  try {
    const page = parseInt(req.query.page || "1");
    const limit = parseInt(req.query.limit || "10");
    const offset = (page - 1) * limit;

    // Get posts with user info, like counts, and comment counts
    const posts = await db
      .selectFrom("posts as p")
      .leftJoin("users as u", "p.userId", "u.id")
      .leftJoin("coins as c", "p.coinId", "c.id")
      .select([
        "p.id",
        "p.content",
        "p.mediaUrls",
        "p.createdAt",
        "p.coinId",
        "u.id as userId",
        "u.username",
        "u.profilePictureUrl",
        "c.name as coinName",
        "c.symbol as coinSymbol",
        "c.imageUrl as coinImageUrl",
      ])
      .select(({ selectFrom }) => [
        selectFrom("likes")
          .select(({ fn }) => fn.count("id").as("likesCount"))
          .whereRef("postId", "=", "p.id")
          .as("likesCount"),
        selectFrom("comments")
          .select(({ fn }) => fn.count("id").as("commentsCount"))
          .whereRef("postId", "=", "p.id")
          .as("commentsCount"),
      ])
      .orderBy("p.createdAt", "desc")
      .limit(limit)
      .offset(offset)
      .execute();

    // Get total count for pagination
    const totalCount = await db
      .selectFrom("posts")
      .select(({ fn }) => fn.count("id").as("count"))
      .executeTakeFirst();

    return res.status(200).json({
      data: posts,
      pagination: {
        total: Number(totalCount?.count || 0),
        page,
        limit,
        pages: Math.ceil(Number(totalCount?.count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
