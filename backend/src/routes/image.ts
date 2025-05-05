import express, {Request, Response} from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {db} from "../db/database";
import {PinataSDK} from "pinata";
import "dotenv/config";
import {getWalrusClient, ACTIVE_NETWORK} from "../utils";
import {getFundedKeypair} from "../funded-keypair";

const router = express.Router();
console.log("gateway", process.env.GATEWAY_URL);

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.GATEWAY_URL,
});

// Create temporary uploads directory if it doesn't exist
const tempUploadDir = path.join(__dirname, "../../temp-uploads");
if (!fs.existsSync(tempUploadDir)) {
  fs.mkdirSync(tempUploadDir, {recursive: true});
}

// Configure multer storage for temporary storage
const storage = multer.diskStorage({
  destination: function (req: any, file: any, cb: any) {
    cb(null, tempUploadDir);
  },
  filename: function (req: any, file: any, cb: any) {
    // Create a unique filename to avoid collisions
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const filename = `${uniqueSuffix}${ext}`;
    cb(null, filename);
  },
});

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
    fileSize: 5 * 1024 * 1024, // 5MB limit
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
        .json({error: "No file uploaded or file type not supported"});
    }

    const userId = req.body.userId;
    const imageType = req.body.type || "post"; // Default to 'post', can be 'post', 'profile', or 'coin'

    // Read file into a buffer
    const fileBuffer = fs.readFileSync(req.file.path);

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

    // Clean up temporary file after upload
    if (req.file.path) {
      fs.unlinkSync(req.file.path);
    }

    if (!pinataResult.cid) {
      return res.status(500).json({error: "Failed to upload to Pinata"});
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
    const {imageName} = req.params;

    // Find the image in the database
    const image = await db
      .selectFrom("images")
      .where("imageName", "=", imageName)
      .select(["imageName", "imagePath"])
      .executeTakeFirst();

    if (!image) {
      return res.status(404).json({error: "Image not found"});
    }

    // Check if the imagePath is a valid URL (should be a Pinata gateway URL)
    if (!image.imagePath || !image.imagePath.startsWith("http")) {
      return res.status(404).json({error: "Image URL not found or invalid"});
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
 * Get image information by its name
 * @route GET /images/info/:imageName
 * @param {Request} req - Express request object with imageName in params
 * @param {Response} res - Express response object
 * @returns {Response} 200 with image information
 */
router.get("/images/info/:imageName", async (req: any, res: any) => {
  try {
    const {imageName} = req.params;

    // Find the image in the database
    const image = await db
      .selectFrom("images")
      .where("imageName", "=", imageName)
      .select(["imageName", "imagePath"])
      .executeTakeFirst();

    if (!image) {
      return res.status(404).json({error: "Image not found"});
    }

    return res.status(200).json({
      image,
    });
  } catch (error) {
    console.error("Error retrieving image info:", error);
    return res.status(500).json({
      error: "Failed to retrieve image information",
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
router.post("/images/walrus", upload.single("file"), async (req: any, res: any) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res
        .status(400)
        .json({error: "No file uploaded or file type not supported"});
    }

    // Read file into a buffer
    const fileBuffer = fs.readFileSync(req.file.path);

    // Get Walrus client
    const walrusClient = getWalrusClient(ACTIVE_NETWORK);

    const keypair = await getFundedKeypair();

    // Upload to Walrus
    const { blobId } = await walrusClient.writeBlob({
      blob: fileBuffer,
      deletable: false,
      epochs: 3,
      signer: keypair,
    });

    console.log("blobId", blobId);

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
})

/**
 * Get image from Walrus by its blobId
 * @route GET /images/walrus/info/:blobId
 * @param {Request} req - Express request object with blobId in params
 * @param {Response} res - Express response object
 * @returns {Response} 200 with image data
 */
router.get("/images/walrus/info/:blobId", async (req: Request, res: Response) => {
  try {
    const { blobId } = req.params;
    const walrusClient = getWalrusClient(ACTIVE_NETWORK);

    // Retrieve blob data
    const blobBytes = await walrusClient.readBlob({ blobId });

    // Convert to Blob object
    const blob = new Blob([new Uint8Array(blobBytes)]);

    // Convert blob to buffer for response
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Set appropriate content type (assuming image/jpeg, but could be determined dynamically)
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Length', buffer.length);

    // Send the image data
    return res.status(200).send(buffer);
  } catch (error) {
    console.error("Error retrieving image from Walrus:", error);
    return res.status(500).json({
      error: "Failed to retrieve image from Walrus",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
