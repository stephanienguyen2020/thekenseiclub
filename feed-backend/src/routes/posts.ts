import express from 'express';
import {db} from "../db/database";

const router = express.Router();

router.post('/', async (req: any, res: any) => {
  try {
    const { content, user_id, media_urls } = req.body;

    // Validate
    if (!content || !user_id) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Insert post
    const result = await db
      .insertInto('')
      .values({
        content,
        created_at: new Date(),
        user_id: BigInt(user_id),
        media_urls: media_urls ?? null,
      })
      .returningAll()
      .executeTakeFirst();

    return res.status(201).json(result);
  } catch (error) {
    console.error('Error creating post:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
