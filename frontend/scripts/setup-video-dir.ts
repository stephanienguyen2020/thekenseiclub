import fs from 'fs';
import path from 'path';

const publicDir = path.join(process.cwd(), 'public');
const videosDir = path.join(publicDir, 'videos');

// Create public directory if it doesn't exist
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// Create videos directory if it doesn't exist
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir);
}

console.log('Video directory setup complete!'); 