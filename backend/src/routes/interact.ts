import { Router } from "express";
import { db } from "../db/database"; // import Kysely instance
import { z } from "zod";

const router = Router();

const likeSchema = z.object({
  postId: z.coerce.bigint(),
  userId: z.coerce.string(),
  isLike: z.boolean(),
});

// POST /likes - Create or remove a like
router.post("/likes", async (req: any, res: any) => {
  const parsed = likeSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { postId, userId, isLike: is_like } = parsed.data;

  try {
    // Check if user already liked the post (optional logic)
    if (is_like) {
      const existingLike = await db
        .selectFrom("likes")
        .selectAll()
        .where("postId", "=", postId.toString())
        .where("userId", "=", userId.toString())
        .executeTakeFirst();

      if (existingLike) {
        return res.status(409).json({ error: "Already liked" });
      }

      // Insert new like
      const inserted = await db
        .insertInto("likes")
        .values({
          postId,
          userId,
          createdAt: new Date(),
        })
        .returningAll()
        .executeTakeFirst();

      // Get updated like count
      const likeCount = await db
        .selectFrom("likes")
        .select(({ fn }) => fn.count("id").as("count"))
        .where("postId", "=", postId.toString())
        .executeTakeFirst();

      return res.status(201).json({
        like: inserted,
        total_likes: Number(likeCount?.count || 0),
      });
    } else {
      // Remove like
      const deleted = await db
        .deleteFrom("likes")
        .where("postId", "=", postId.toString())
        .where("userId", "=", userId.toString())
        .executeTakeFirst();

      if (deleted.numDeletedRows === 0n) {
        return res.status(404).json({ error: "Like not found" });
      }

      // Get updated like count
      const likeCount = await db
        .selectFrom("likes")
        .select(({ fn }) => fn.count("id").as("count"))
        .where("postId", "=", postId.toString())
        .executeTakeFirst();

      return res.status(200).json({
        message: "Like removed",
        total_likes: Number(likeCount?.count || 0),
      });
    }
  } catch (err) {
    console.error("Insert like error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /likes/post/:postId - Get total likes for a post
router.get("/likes/post/:postId", async (req: any, res: any) => {
  try {
    const postId = BigInt(req.params.postId);

    const likeCount = await db
      .selectFrom("likes")
      .select(({ fn }) => fn.count("id").as("count"))
      .where("postId", "=", postId.toString())
      .executeTakeFirst();

    return res.status(200).json({
      post_id: req.params.postId,
      total_likes: Number(likeCount?.count || 0),
    });
  } catch (error) {
    console.error("Error fetching like count:", error);
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
        .json({message: "postId and userId are required"});
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
    return res.status(500).json({message: "Internal server error"});
  }
});

router.get("/posts/isBoosted", async (req: any, res: any) => {
  try {
    const postId = req.query.postId;
    const userId = req.query.userId;

    if (!postId || !userId) {
      return res
        .status(400)
        .json({message: "postId and userId are required"});
    }

    // Convert to bigint for database query
    const postIdBigInt = postId;
    const userIdBigInt = userId;

    // Check if the user has retweeted the post
    const boost = await db
      .selectFrom("reTweets")
      .where("postId", "=", postIdBigInt)
      .where("userId", "=", userIdBigInt)
      .executeTakeFirst();

    return res.status(200).json({
      isBoosted: !!boost,
    });
  } catch (error) {
    console.error("Error checking boosted status:", error);
    return res.status(500).json({message: "Internal server error"});
  }
});

router.get("/posts/isSaved", async (req: any, res: any) => {
  try {
    const postId = req.query.postId;
    const userId = req.query.userId;

    if (!postId || !userId) {
      return res
        .status(400)
        .json({message: "postId and userId are required"});
    }

    // Convert to bigint for database query
    const postIdBigInt = postId;
    const userIdBigInt = userId;

    // Check if the user has saved the post
    const save = await db
      .selectFrom("savePosts")
      .where("postId", "=", postIdBigInt)
      .where("userId", "=", userIdBigInt)
      .executeTakeFirst();

    return res.status(200).json({
      isSaved: !!save,
    });
  } catch (error) {
    console.error("Error checking save status:", error);
    return res.status(500).json({message: "Internal server error"});
  }
});

// GET /posts/retweet/:postId - Get total retweets for a post
router.get("/posts/retweet/:postId", async (req: any, res: any) => {
  try {
    const postId = BigInt(req.params.postId);

    const retweetCount = await db
      .selectFrom("reTweets")
      .select(({ fn }) => fn.count("id").as("count"))
      .where("postId", "=", postId.toString())
      .executeTakeFirst();

    return res.status(200).json({
      post_id: req.params.postId,
      total_retweets: Number(retweetCount?.count || 0),
    });
  } catch (error) {
    console.error("Error fetching retweet count:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// GET /posts/save/:postId - Get total saves for a post
router.get("/posts/save/:postId", async (req: any, res: any) => {
  try {
    const postId = BigInt(req.params.postId);

    const saveCount = await db
      .selectFrom("savePosts")
      .select(({ fn }) => fn.count("id").as("count"))
      .where("postId", "=", postId.toString())
      .executeTakeFirst();

    return res.status(200).json({
      post_id: req.params.postId,
      total_saves: Number(saveCount?.count || 0),
    });
  } catch (error) {
    console.error("Error fetching save count:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/posts/reTweet", async (req: any, res: any) => {
  try {
    const {postId, userId, isReTweet} = req.body

    if (!postId || !userId || isReTweet === undefined) {
      return res
        .status(400)
        .json({message: "postId, userId, and isReTweet are required"});
    }

    // Convert to bigint for database query
    const postIdBigInt = postId;
    const userIdBigInt = userId;

    if (isReTweet) {
      // Check if the user has already retweeted the post
      const existingReTweet = await db
        .selectFrom("reTweets")
        .where("postId", "=", postIdBigInt)
        .where("userId", "=", userIdBigInt)
        .executeTakeFirst();

      if (existingReTweet) {
        return res.status(409).json({ error: "Already retweeted" });
      }

      // If not, insert a new reTweet
      const inserted = await db
        .insertInto("reTweets")
        .values({
          postId: postIdBigInt,
          userId: userIdBigInt,
          createdAt: new Date(),
        })
        .returningAll()
        .executeTakeFirst();

      // Get updated retweet count
      const reTweetCount = await db
        .selectFrom("reTweets")
        .select(({ fn }) => fn.count("id").as("count"))
        .where("postId", "=", postIdBigInt)
        .executeTakeFirst();

      return res.status(201).json({
        reTweet: inserted,
        total_retweets: Number(reTweetCount?.count || 0),
      });
    } else {
      // Remove retweet
      const deleted = await db
        .deleteFrom("reTweets")
        .where("postId", "=", postIdBigInt)
        .where("userId", "=", userIdBigInt)
        .executeTakeFirst();

      if (deleted.numDeletedRows === 0n) {
        return res.status(404).json({ error: "Retweet not found" });
      }

      // Get updated retweet count
      const reTweetCount = await db
        .selectFrom("reTweets")
        .select(({ fn }) => fn.count("id").as("count"))
        .where("postId", "=", postIdBigInt)
        .executeTakeFirst();

      return res.status(200).json({
        message: "Retweet removed",
        total_retweets: Number(reTweetCount?.count || 0),
      });
    }
  } catch (error) {
    console.error("Error handling retweet:", error);
    return res.status(500).json({message: "Internal server error"});
  }
});

router.post("/posts/save", async (req: any, res: any) => {
  try {
    const {postId, userId, isSave} = req.body

    if (!postId || !userId || isSave === undefined) {
      return res
        .status(400)
        .json({message: "postId, userId, and isSave are required"});
    }

    // Convert to bigint for database query
    const postIdBigInt = postId;
    const userIdBigInt = userId;

    if (isSave) {
      // Check if the user has already saved the post
      const existingSave = await db
        .selectFrom("savePosts")
        .where("postId", "=", postIdBigInt)
        .where("userId", "=", userIdBigInt)
        .executeTakeFirst();

      if (existingSave) {
        return res.status(409).json({ error: "Already saved" });
      }

      // If not, insert a new save
      const inserted = await db
        .insertInto("savePosts")
        .values({
          postId: postIdBigInt,
          userId: userIdBigInt,
          createdAt: new Date(),
        })
        .returningAll()
        .executeTakeFirst();

      // Get updated save count
      const saveCount = await db
        .selectFrom("savePosts")
        .select(({ fn }) => fn.count("id").as("count"))
        .where("postId", "=", postIdBigInt)
        .executeTakeFirst();

      return res.status(201).json({
        save: inserted,
        total_saves: Number(saveCount?.count || 0),
      });
    } else {
      // Remove save
      const deleted = await db
        .deleteFrom("savePosts")
        .where("postId", "=", postIdBigInt)
        .where("userId", "=", userIdBigInt)
        .executeTakeFirst();

      if (deleted.numDeletedRows === 0n) {
        return res.status(404).json({ error: "Save not found" });
      }

      // Get updated save count
      const saveCount = await db
        .selectFrom("savePosts")
        .select(({ fn }) => fn.count("id").as("count"))
        .where("postId", "=", postIdBigInt)
        .executeTakeFirst();

      return res.status(200).json({
        message: "Save removed",
        total_saves: Number(saveCount?.count || 0),
      });
    }
  } catch (error) {
    console.error("Error handling save:", error);
    return res.status(500).json({message: "Internal server error"});
  }
})

export default router;
