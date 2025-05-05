import express from "express";
import { db } from "../db/database";

const router = express.Router();

router.post("/users", async (req: any, res: any) => {
  try {
    const { username, suiAddress, profilePictureUrl } = req.body;

    // Validate required fields
    if (!username || !suiAddress) {
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
        profilePictureUrl:
          profilePictureUrl ??
          "https://teal-characteristic-echidna-176.mypinata.cloud/ipfs/bafybeigyz5u6d4crnmfsxnlelhadkmausippqr3ezpw5gcwi4yldlofc2a",
      })
      .returningAll()
      .executeTakeFirst();

    return res.status(201).json(result);
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/users/:suiAddress", async (req: any, res: any) => {
  try {
    const { suiAddress } = req.params;
    const { username, profilePictureUrl, email } = req.body;

    // Validate that at least one field is being updated
    if (!username && !profilePictureUrl && !email) {
      return res.status(400).json({
        message: "No update fields provided.",
      });
    }

    // Check if the user exists
    const existingUser = await db
      .selectFrom("users")
      .where("suiAddress", "=", suiAddress)
      .executeTakeFirst();

    if (!existingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Build the update object with only the fields that are provided
    const updateData: any = {};
    if (username) updateData.username = username;
    if (profilePictureUrl) updateData.profilePictureUrl = profilePictureUrl;
    if (email) updateData.email = email;

    // Update the user
    const result = await db
      .updateTable("users")
      .set(updateData)
      .where("suiAddress", "=", suiAddress)
      .returningAll()
      .executeTakeFirst();

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Get user by suiAddress
router.get("/users/:suiAddress", async (req: any, res: any) => {
  try {
    const { suiAddress } = req.params;
    console.log("Fetching user with address:", suiAddress);
    const query = db
      .selectFrom("users as u")
      .selectAll()
      .where("suiAddress", "=", suiAddress)
      .compile();

    console.log("Query executed:", query);
    const user = await db
      .selectFrom("users as u")
      .selectAll()
      .where("suiAddress", "=", suiAddress)
      .executeTakeFirst();
    console.log("User data fetched successfully:", user);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
