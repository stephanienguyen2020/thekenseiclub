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

export default router;
