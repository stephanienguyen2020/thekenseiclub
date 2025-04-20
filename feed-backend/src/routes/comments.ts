import { Router } from 'express';
import { db } from '../db/database'; // import Kysely instance
import { z } from 'zod';

const router = Router();

// Validate input data
const commentSchema = z.object({
  content: z.string().min(1),
  post_id: z.coerce.bigint(),
  user_id: z.coerce.bigint(),
});

// POST /comments
router.post('/comments', async (req: any, res: any) => {
  const parsed = commentSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { content, post_id, user_id } = parsed.data;

  try {
    const inserted = await db
      .insertInto('comments')
      .values({
        content,
        post_id,
        user_id,
        created_at: new Date(),
      })
      .returningAll()
      .executeTakeFirst();

    return res.status(201).json(inserted);
  } catch (err) {
    console.error('Insert comment error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
