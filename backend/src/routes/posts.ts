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

    // Build query for posts with user info, like counts, and comment counts
    let postsQuery = db
      .selectFrom("posts as p")
      .leftJoin("users as u", "p.userId", "u.suiAddress")
      .leftJoin("coins as c", "p.coinId", "c.id")
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
      ]);

    // Filter by coinId if provided
    if (coinId) {
      postsQuery = postsQuery.where("p.coinId", "=", coinId);
    }

    if (userId) {
      postsQuery = postsQuery.where("p.userId", "=", userId);
    }

    // Execute the query with ordering, limit and offset
    const posts = await postsQuery
      .where("p.createdAt", "<=", startDate || new Date())
      .orderBy("p.createdAt", "desc")
      .limit(limit)
      .execute();

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
      boosts: 0,
      signalScore: 0,
      isLiked: false,
      isBoosted: false,
      views: 0,
    }));

    let reTweetsQuery = db
      .selectFrom("reTweets as r")
      .leftJoin("posts as p", "r.postId", "p.id")
      .leftJoin("users as u", "r.userId", "u.suiAddress")
      .leftJoin("coins as c", "p.coinId", "c.id")
      .select([
        "r.id",
        "r.createdAt",
        "p.id as postId",
        'p.coinId as coinId',
        "p.content",
        "p.mediaUrls",
        "r.createdAt",
        "u.suiAddress as userId",
        "u.username",
        "u.profilePictureUrl",
        "c.name as coinName",
        "c.symbol as coinSymbol",
        "c.logo as coinImageUrl",
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
      .where("r.userId", "=", userId)
      .where("r.createdAt", "<=", startDate || new Date())
      .orderBy("r.createdAt", "desc")
      .limit(limit);

    if (coinId) {
      reTweetsQuery = reTweetsQuery.where("p.coinId", "=", coinId);
    }

    const reTweets = await reTweetsQuery.execute();

    const transformedRetweetPosts = reTweets.map((post) => ({
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
      boosts: 0,
      signalScore: 0,
      isLiked: false,
      isBoosted: false,
      isRetweet: true,
      views: 0,
    }));


    let savePostsQuery = db
      .selectFrom("savePosts as s")
      .leftJoin("posts as p", "s.postId", "p.id")
      .leftJoin("users as u", "s.userId", "u.suiAddress")
      .leftJoin("coins as c", "p.coinId", "c.id")
      .select([
        "s.id",
        "s.createdAt",
        "p.id as postId",
        'p.coinId as coinId',
        "p.content",
        "p.mediaUrls",
        "s.createdAt",
        "u.suiAddress as userId",
        "u.username",
        "u.profilePictureUrl",
        "c.name as coinName",
        "c.symbol as coinSymbol",
        "c.logo as coinImageUrl",
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
      .where("s.userId", "=", userId)
      .where("s.createdAt", "<=", startDate || new Date())
      .orderBy("s.createdAt", "desc")
      .limit(limit);

    if (coinId) {
      savePostsQuery = savePostsQuery.where("p.coinId", "=", coinId);
    }

    const savePosts = await savePostsQuery.execute();
    const transformedSavePosts = savePosts.map((post) => ({
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
      boosts: 0,
      signalScore: 0,
      isLiked: false,
      isBoosted: false,
      isRetweet: false,
      isSavePosts: true,
      views: 0,
    }));

    const postResponses = [...transformedPosts, ...transformedRetweetPosts, ...transformedSavePosts];
    const sortedPosts = postResponses.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return res.status(200).json({
      data: sortedPosts.slice(0, limit),
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// GET /posts/isLiked - Check if a post is liked by a user
router.get("/posts/isLiked", async (req: any, res: any) => {
  try {
    const postId = req.query.postId;
    const userId = req.query.userId;

    if (!postId || !userId) {
      return res
        .status(400)
        .json({ message: "postId and userId are required" });
    }

    // Convert to bigint for database query
    const postIdBigInt = postId;
    const userIdBigInt = userId;

    // Check if the user has liked the post
    const like = await db
      .selectFrom("likes")
      .where("postId", "=", postIdBigInt)
      .where("userId", "=", userIdBigInt)
      .executeTakeFirst();

    return res.status(200).json({
      isLiked: !!like,
    });
  } catch (error) {
    console.error("Error checking like status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/posts/reTweet", async (req: any, res: any) => {
  try {
    const postId = req.query.postId;
    const userId = req.query.userId;

    if (!postId || !userId) {
      return res
        .status(400)
        .json({ message: "postId and userId are required" });
    }

    // Convert to bigint for database query
    const postIdBigInt = postId;
    const userIdBigInt = userId;

    // Check if the user has reTweet the post
    const reTweet = await db
      .selectFrom("reTweets")
      .where("postId", "=", postIdBigInt)
      .where("userId", "=", userIdBigInt)
      .executeTakeFirst();

    if (reTweet) {
      return res.status(200).json({
        isReTweeted: true,
      });
    }

    // If not, insert a new reTweet
    await db
      .insertInto("reTweets")
      .values({
        postId: postIdBigInt,
        userId: userIdBigInt,
        createdAt: new Date(),
      })
      .execute();

    return res.status(201);
  } catch (error) {
    console.error("Error checking like status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("posts/save", async (req: any, res: any) => {
  try {
    const postId = req.query.postId;
    const userId = req.query.userId;

    if (!postId || !userId) {
      return res
        .status(400)
        .json({ message: "postId and userId are required" });
    }

    // Convert to bigint for database query
    const postIdBigInt = postId;
    const userIdBigInt = userId;

    // Check if the user has saved the post
    const savePost = await db
      .selectFrom("savePosts")
      .where("postId", "=", postIdBigInt)
      .where("userId", "=", userIdBigInt)
      .executeTakeFirst();

    if (savePost) {
      return res.status(200).json({
        isSaved: true,
      });
    }

    // If not, insert a new savePost
    await db
      .insertInto("savePosts")
      .values({
        postId: postIdBigInt,
        userId: userIdBigInt,
        createdAt: new Date(),
      })
      .execute();

    return res.status(201);
  } catch (error) {
    console.error("Error checking like status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
})

export default router;
