import express from 'express';
import {db} from "../db/database";

const router = express.Router();

router.post('/users', async (req: any, res: any) => {
  try {
    const { username, sui_address, profile_picture_url } = req.body;

    // Validate required fields
    if (!username || !sui_address || !profile_picture_url) {
      return res.status(400).json({ message: 'Missing required fields. Username, sui_address, and profile_picture_url are required.' });
    }

    // Insert user
    const result = await db
      .insertInto('users')
      .values({
        username,
        sui_address,
        profile_picture_url,
      })
      .returningAll()
      .executeTakeFirst();

    return res.status(201).json(result);
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;