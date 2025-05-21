import "dotenv/config";
import express, { Request, Response } from "express";
import multer from "multer";
import { PinataSDK } from "pinata";
import { db } from "../db/database";
import { fileService } from "../services/fileService";

const router = express.Router();
console.log("gateway", process.env.GATEWAY_URL);

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.GATEWAY_URL,
});

// Use memory storage instead of disk storage to avoid creating temporary files
const storage = multer.memoryStorage();

// File filter to accept only jpg, jpeg, png
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = ["image/jpeg", "image/png"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpg, .jpeg and .png files are allowed"));
  }
};

// Initialize multer upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 5MB limit
  },
});

/**
 * Upload an image associated with a post
 * @route POST /images
 * @param {Request} req - Express request object with file in files
 * @param {Response} res - Express response object
 * @returns {Response} 201 on success with image details, error status on failure
 */
router.post("/images", upload.single("file"), async (req: any, res: any) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res
        .status(400)
        .json({ error: "No file uploaded or file type not supported" });
    }

    const userId = req.body.userId;
    const imageType = req.body.type || "post"; // Default to 'post', can be 'post', 'profile', or 'coin'

    // Use the buffer directly from multer's memory storage
    const fileBuffer = req.file.buffer;

    const options = {
      metadata: {
        name: req.file.originalname,
        keyvalues: {
          type: imageType,
          userId: userId || "",
        },
      },
    };

    const file = new File([fileBuffer], req.file.originalname, {
      type: req.file.mimetype,
    });

    // Upload to Pinata using the upload.file method
    const pinataResult = await pinata.upload.public.file(file, options);

    // No need to clean up temporary files when using memory storage

    if (!pinataResult.cid) {
      return res.status(500).json({ error: "Failed to upload to Pinata" });
    }

    // Generate the gateway URL for the uploaded file
    const gatewayUrl = `https://${process.env.GATEWAY_URL}/ipfs/${pinataResult.cid}`;

    // Store image information in database without requiring postId
    const result = await db
      .insertInto("images")
      .values({
        imageName: req.file.originalname,
        imagePath: gatewayUrl,
      })
      .returning(["imageName", "imagePath"])
      .executeTakeFirst();

    return res.status(201).json({
      message: "Image uploaded successfully",
      image: {
        ...result,
        cid: pinataResult.cid,
        gatewayUrl,
      },
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return res.status(500).json({
      error: "Failed to upload image",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Get an image by its name
 * @route GET /images/:imageName
 * @param {Request} req - Express request object with imageName in params
 * @param {Response} res - Express response object
 * @returns {Response} 302 redirect to Pinata gateway URL
 */
router.get("/images/:imageName", async (req: any, res: any) => {
  try {
    const { imageName } = req.params;

    // Find the image in the database
    const image = await db
      .selectFrom("images")
      .where("imageName", "=", imageName)
      .select(["imageName", "imagePath"])
      .executeTakeFirst();

    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    // Check if the imagePath is a valid URL (should be a Pinata gateway URL)
    if (!image.imagePath || !image.imagePath.startsWith("http")) {
      return res.status(404).json({ error: "Image URL not found or invalid" });
    }

    // Redirect to the Pinata gateway URL
    return res.redirect(image.imagePath);
  } catch (error) {
    console.error("Error retrieving image:", error);
    return res.status(500).json({
      error: "Failed to retrieve image",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Upload an image to Walrus storage
 * @route POST /images/walrus
 * @param {Request} req - Express request object with file in files
 * @param {Response} res - Express response object
 * @returns {Response} 201 on success with blobId, error status on failure
 */
router.post(
  "/images/walrus",
  upload.single("file"),
  async (req: any, res: any) => {
    try {
      // Check if file was uploaded
      if (!req.file) {
        return res
          .status(400)
          .json({ error: "No file uploaded or file type not supported" });
      }

      // Use the buffer directly from multer's memory storage
      const fileBuffer = req.file.buffer;

      const { blobId }: any = await fileService.writeWalrusBlob(fileBuffer);

      return res.status(201).json({
        message: "Image uploaded successfully to Walrus",
        blobId,
      });
    } catch (error) {
      console.error("Error uploading image to Walrus:", error);
      return res.status(500).json({
        error: "Failed to upload image to Walrus",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

/**
 * Get image from Walrus by its blobId
 * @route GET /images/walrus/info/:blobId
 * @param {Request} req - Express request object with blobId in params
 * @param {Response} res - Express response object
 * @returns {Response} 200 with image data
 */
router.get(
  "/images/walrus/info/:blobId",
  async (req: Request, res: Response) => {
    try {
      const { blobId } = req.params;
      const buffer = await fileService.getWalrusBuffer(blobId);
      // Set appropriate content type (assuming image/jpeg, but could be determined dynamically)
      res.setHeader("Content-Type", "image/jpeg");
      res.setHeader("Content-Length", buffer.length);

      // Send the image data
      return res.status(200).send(buffer);
    } catch (error) {
      console.error("Error retrieving image from Walrus:", error);
      return res.status(500).json({
        error: "Failed to retrieve image from Walrus",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

export default router;
