import express from "express";
import { db } from "../db/database";
import { z } from "zod";

const router = express.Router();

// Validate input data for post creation
const postSchema = z.object({
  content: z.string().min(1),
  userId: z.coerce.string(),
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
    console.log("Parsed data:", parsed.data);

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
    const startDate = req.query.startDate;
    const limit = parseInt(req.query.limit || "10");
    const coinId = req.query.coinId;
    const userId = req.query.userId;
    const tribe = req.query.tribe;

    console.log("Tribe:", tribe);

    // Build query for posts with user info, like counts, and comment counts
    let postsQuery = db
      .selectFrom("posts as p")
      .leftJoin("users as u", "p.userId", "u.suiAddress")
      .leftJoin("coins as c", "p.coinId", "c.id")
      .leftJoin("coinTribes as ct", "c.id", "ct.coinId")
      .select([
        "p.id",
        "p.content",
        "p.mediaUrls",
        "p.createdAt",
        "p.coinId",
        "u.suiAddress as userId",
        "u.username",
        "u.profilePictureUrl",
        "c.name as coinName",
        "c.symbol as coinSymbol",
        "c.logo as coinImageUrl",
        "ct.tribe as coinTribe",
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
        selectFrom("reTweets")
          .select(({ fn }) => fn.count("id").as("reTweetsCount"))
          .whereRef("postId", "=", "p.id")
          .as("reTweetsCount"),
        selectFrom("savePosts")
          .select(({ fn }) => fn.count("id").as("savePostsCount"))
          .whereRef("postId", "=", "p.id")
          .as("savePostsCount"),
      ]);

    // Filter by coinId if provided
    if (coinId) {
      postsQuery = postsQuery.where("p.coinId", "=", coinId);
    }

    if (userId) {
      postsQuery = postsQuery.where("p.userId", "=", userId);
    }

    // Filter by tribe if provided
    if (tribe) {
      postsQuery = postsQuery.where("ct.tribe", "=", tribe);
    }

    // Execute the query with ordering, limit and offset
    const posts = await postsQuery
      .where("p.createdAt", "<=", startDate || new Date())
      .orderBy("p.createdAt", "desc")
      .limit(limit)
      .execute();

    console.log("Posts:", posts);

    // Transform the data to match the required format
    const transformedPosts = posts.map((post) => ({
      id: post.id.toString(),
      user: {
        id: post.userId,
        name: post.username,
        handle: post.username, // Using username as handle since there's no separate handle field
        avatar: post.profilePictureUrl,
      },
      token: post.coinId
        ? {
            id: post.coinId,
            name: post.coinName,
            symbol: post.coinSymbol,
            logo: post.coinImageUrl,
            tribe: post.coinTribe,
          }
        : undefined,
      content: post.content,
      image:
        post.mediaUrls && post.mediaUrls.length > 0
          ? post.mediaUrls[0]
          : undefined,
      timestamp: post.createdAt.toISOString(),
      likes: Number(post.likesCount || 0),
      comments: Number(post.commentsCount || 0),
      // Default values for fields that can be ignored
      boosts: Number(post.reTweetsCount || 0),
      signalScore: 0,
      isLiked: false,
      isBoosted: false,
      views: 0,
    }));
    return res.status(200).json({
      data: transformedPosts,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
