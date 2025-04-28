import express from "express";
import { db } from "../db/database";

const router = express.Router();

router.post("/users", async (req: any, res: any) => {
  try {
    const { username, suiAddress, profilePictureUrl } = req.body;

    // Validate required fields
    if (!username || !suiAddress || !profilePictureUrl) {
      return res
        .status(400)
        .json({
          message:
            "Missing required fields. Username, suiAddress, and profilePictureUrl are required.",
        });
    }

    // Insert user
    const result = await db
      .insertInto("users")
      .values({
        username,
        suiAddress,
        profilePictureUrl,
      })
      .returningAll()
      .executeTakeFirst();

    return res.status(201).json(result);
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
