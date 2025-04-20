import express, {Request, Response} from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {db} from "../db/database";

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req: any, file: any, cb: any) {
    cb(null, uploadDir);
  },
  filename: function (req: any, file: any, cb: any) {
    const postId = req.body.postId;
    // if (!postId) {
    //   return cb(new Error("Missing postId"), "");
    // }

    // Get original file extension
    const ext = path.extname(file.originalname);
    // Create filename with postId and original filename
    const filename = `${postId}-${file.originalname}`;
    cb(null, filename);
  }
});

// File filter to accept only jpg, jpeg, png
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
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
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

/**
 * Upload an image associated with a post
 * @route POST /images
 * @param {Request} req - Express request object with postId in body and file in files
 * @param {Response} res - Express response object
 * @returns {Response} 201 on success with image details, error status on failure
 */
router.post('/images', upload.single('file'), async (req: any, res: any) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded or file type not supported" });
    }

    const postId = req.body.postId;

    // Validate postId
    if (!postId) {
      // Remove the uploaded file if postId is missing
      if (req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ error: "Missing required parameter: postId" });
    }

    // Calculate the full path of the uploaded image
    const imagePath = path.join(uploadDir, req.file.filename);

    // Store image information in database
    const result = await db.insertInto('images')
      .values({
        imageName: req.file.filename,
        postId: postId,
        imagePath: imagePath
      })
      .returning(['imageName', 'postId', 'imagePath'])
      .executeTakeFirst();

    return res.status(201).json({
      message: "Image uploaded successfully",
      image: result
    });
  } catch (error) {
    console.error("Error uploading image:", error);

    // Clean up file if it was uploaded
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      error: "Failed to upload image",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * Get an image by its name
 * @route GET /images/:imageName
 * @param {Request} req - Express request object with imageName in params
 * @param {Response} res - Express response object
 * @returns {Response} 200 on success with image file, error status on failure
 */
router.get('/images/:imageName', async (req: any, res: any) => {
  try {
    const { imageName } = req.params;

    // Find the image in the database
    const image = await db.selectFrom('images')
      .where('imageName', '=', imageName)
      .select(['imageName', 'postId', 'imagePath'])
      .executeTakeFirst();

    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    // Check if the file exists
    if (!fs.existsSync(image.imagePath)) {
      return res.status(404).json({ error: "Image file not found on server" });
    }

    // Determine the content type based on file extension
    const ext = path.extname(image.imageName).toLowerCase();
    let contentType = 'application/octet-stream'; // Default content type

    if (ext === '.jpg' || ext === '.jpeg') {
      contentType = 'image/jpeg';
    } else if (ext === '.png') {
      contentType = 'image/png';
    }

    // Set the content type and send the file
    res.setHeader('Content-Type', contentType);
    res.sendFile(image.imagePath);

  } catch (error) {
    console.error("Error retrieving image:", error);
    return res.status(500).json({
      error: "Failed to retrieve image",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;
