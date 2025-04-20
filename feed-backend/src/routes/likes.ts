import { Router } from 'express';
import { db } from '../db/database'; // import Kysely instance
import { z } from 'zod';

const router = Router();

const likeSchema = z.object({
  post_id: z.coerce.bigint(),
  user_id: z.coerce.bigint(),
  is_like: z.boolean(),
});

router.post('/likes', async (req: any, res: any) => {
  const parsed = likeSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { post_id, user_id, is_like } = parsed.data;

  try {
    // Check if user already liked the post (optional logic)
    if (is_like) {
      const existingLike = await db
        .selectFrom('likes')
        .selectAll()
        .where('post_id', '=', post_id)
        .where('user_id', '=', user_id)
        .executeTakeFirst();

      if (existingLike) {
        return res.status(409).json({error: 'Already liked'});
      }

      // Insert new like
      const inserted = await db
        .insertInto('likes')
        .values({
          post_id,
          user_id,
          created_at: new Date(),
        })
        .returningAll()
        .executeTakeFirst();

      return res.status(201).json(inserted);
    } else {
      // Remove like
      const deleted = await db
        .deleteFrom('likes')
        .where('post_id', '=', post_id)
        .where('user_id', '=', user_id)
        .executeTakeFirst();

      if (deleted.numDeletedRows === 0n) {
        return res.status(404).json({ error: 'Like not found' });
      }

      return res.status(200).json({ message: 'Like removed' });
    }
  } catch (err) {
    console.error('Insert like error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
