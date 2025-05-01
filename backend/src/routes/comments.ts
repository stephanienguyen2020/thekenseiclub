import { Router } from "express";
import { db } from "../db/database"; // import Kysely instance
import { z } from "zod";

const router = Router();

// Validate input data
const commentSchema = z.object({
  content: z.string().min(1),
  postId: z.coerce.bigint(),
  userId: z.coerce.string(),
});

// POST /comments - Create a new comment
router.post("/comments", async (req: any, res: any) => {
  const parsed = commentSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { content, postId, userId } = parsed.data;

  try {
    const inserted = await db
      .insertInto("comments")
      .values({
        content,
        postId,
        userId,
        createdAt: new Date(),
      })
      .returningAll()
      .executeTakeFirst();

    // Get updated comment count
    const commentCount = await db
      .selectFrom("comments")
      .select(({ fn }) => fn.count("id").as("count"))
      .where("postId", "=", postId.toString())
      .executeTakeFirst();

    return res.status(201).json({
      comment: inserted,
      total_comments: Number(commentCount?.count || 0),
    });
  } catch (err) {
    console.error("Insert comment error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /comments/post/:postId - Get comments for a post with pagination
router.get("/comments/post/:postId", async (req: any, res: any) => {
  try {
    const postId = BigInt(req.params.postId);
    const page = parseInt(req.query.page || "1");
    const limit = parseInt(req.query.limit || "10");
    const offset = (page - 1) * limit;

    // Get comments with user info
    const comments = await db
      .selectFrom("comments as c")
      .leftJoin("users as u", "c.userId", "u.suiAddress")
      .select([
        "c.id",
        "c.content",
        "c.createdAt",
        "c.postId",
        "u.suiAddress as userId",
        "u.username",
        "u.profilePictureUrl",
      ])
      .where("c.postId", "=", postId.toString())
      .orderBy("c.createdAt", "desc")
      .limit(limit)
      .offset(offset)
      .execute();

    // Get total count for pagination
    const totalCount = await db
      .selectFrom("comments")
      .select(({ fn }) => fn.count("id").as("count"))
      .where("postId", "=", postId.toString())
      .executeTakeFirst();

    return res.status(200).json({
      data: comments,
      pagination: {
        total: Number(totalCount?.count || 0),
        page,
        limit,
        pages: Math.ceil(Number(totalCount?.count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// GET /comments/count/:postId - Get total comments count for a post
router.get("/comments/count/:postId", async (req: any, res: any) => {
  try {
    const postId = BigInt(req.params.postId);

    const commentCount = await db
      .selectFrom("comments")
      .select(({ fn }) => fn.count("id").as("count"))
      .where("postId", "=", postId.toString())
      .executeTakeFirst();

    return res.status(200).json({
      post_id: postId,
      total_comments: Number(commentCount?.count || 0),
    });
  } catch (error) {
    console.error("Error fetching comment count:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
