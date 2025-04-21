import express from 'express';
import {db} from "../db/database";
import { z } from 'zod';

const router = express.Router();

// Validate input data for post creation
const postSchema = z.object({
  content: z.string().min(1),
  user_id: z.coerce.bigint(),
  media_urls: z.array(z.string()).optional(),
  coin_id: z.string().optional(),
});

// POST /posts - Create a new post
router.post('/posts', async (req: any, res: any) => {
  try {
    const parsed = postSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const { content, user_id, media_urls, coin_id } = parsed.data;

    // Insert post
    const result = await db
      .insertInto('posts')
      .values({
        content,
        created_at: new Date(),
        user_id,
        media_urls: media_urls ?? null,
        coin_id: coin_id ?? null,
      })
      .returningAll()
      .executeTakeFirst();

    return res.status(201).json(result);
  } catch (error) {
    console.error('Error creating post:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /posts - List all posts with pagination
router.get('/posts', async (req: any, res: any) => {
  try {
    const page = parseInt(req.query.page || '1');
    const limit = parseInt(req.query.limit || '10');
    const offset = (page - 1) * limit;

    // Get posts with user info, like counts, and comment counts
    const posts = await db
      .selectFrom('posts as p')
      .leftJoin('users as u', 'p.user_id', 'u.id')
      .leftJoin('coins as c', 'p.coin_id', 'c.id')
      .select([
        'p.id',
        'p.content',
        'p.media_urls',
        'p.created_at',
        'p.coin_id',
        'u.id as user_id',
        'u.username',
        'u.profile_picture_url',
        'c.name as coin_name',
        'c.symbol as coin_symbol',
        'c.imageUrl as coin_image_url',
      ])
      .select(({ selectFrom }) => [
        selectFrom('likes')
          .select(({ fn }) => fn.count('id').as('likes_count'))
          .whereRef('post_id', '=', 'p.id')
          .as('likes_count'),
        selectFrom('comments')
          .select(({ fn }) => fn.count('id').as('comments_count'))
          .whereRef('post_id', '=', 'p.id')
          .as('comments_count'),
      ])
      .orderBy('p.created_at', 'desc')
      .limit(limit)
      .offset(offset)
      .execute();

    // Get total count for pagination
    const totalCount = await db
      .selectFrom('posts')
      .select(({ fn }) => fn.count('id').as('count'))
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
    console.error('Error fetching posts:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
