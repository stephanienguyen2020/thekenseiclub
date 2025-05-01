import express from "express";
import { db } from "../db/database";

const router = express.Router();

router.post("/users", async (req: any, res: any) => {
  try {
    const { username, suiAddress, profilePictureUrl } = req.body;

    // Validate required fields
    if (!username || !suiAddress || !profilePictureUrl) {
      return res.status(400).json({
        message:
          "Missing required fields. Username, suiAddress, and profilePictureUrl are required.",
      });
    }

    // Check if user already exists with the provided suiAddress
    const existingUser = await db
      .selectFrom("users")
      .where("suiAddress", "=", suiAddress)
      .executeTakeFirst();

    // If user already exists, return a 200 response with just a message
    if (existingUser) {
      return res.status(200).json({
        message: "User already exists",
      });
    }

    // Insert user if they don't exist
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
