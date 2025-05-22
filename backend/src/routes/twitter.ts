import { Router } from 'express';
import twitterService from '../services/twitterService';
import multer from 'multer';

const router = Router();
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 4 // Max 4 images (Twitter's limit)
  }
});

// Temporary storage for oauth tokens
const tempTokenStorage = new Map<string, string>();

// Get OAuth URL for Twitter login
router.get('/auth/url', async (req, res) => {
  try {
    const authData = await twitterService.getAuthUrl();
    
    // Store oauth_token_secret mapped to oauth_token
    tempTokenStorage.set(authData.oauth_token, authData.oauth_token_secret);
    
    // Only send the URL to client
    res.json({ url: authData.url });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
});

// Handle Twitter OAuth callback
router.get('/auth/callback', async (req, res) => {
  try {
    const { oauth_token, oauth_verifier } = req.query;
    
    if (!oauth_token || !oauth_verifier) {
      return res.status(400).json({ error: 'Missing required OAuth parameters' });
    }

    // Get the stored oauth_token_secret
    const oauth_token_secret = tempTokenStorage.get(oauth_token as string);
    if (!oauth_token_secret) {
      return res.status(400).json({ error: 'OAuth token expired or invalid' });
    }

    // Delete the token from storage
    tempTokenStorage.delete(oauth_token as string);

    const result = await twitterService.handleCallback(
      oauth_token as string,
      oauth_verifier as string,
      oauth_token_secret
    );

    res.json(result);
  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).json({ error: 'Failed to complete authentication' });
  }
});

// Post a tweet
router.post('/tweet', upload.array('images', 4), async (req, res) => {
  try {
    const { username, text } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!text) {
      return res.status(400).json({ error: 'Tweet text is required' });
    }

    if (!username) {
      return res.status(400).json({ error: 'Twitter username is required' });
    }

    // Convert uploaded files to buffers if they exist
    const imageBuffers = files?.length > 0 ? files.map(file => file.buffer) : undefined;

    const tweet = await twitterService.postTweet(username, text, imageBuffers);
    res.json(tweet);
  } catch (error) {
    res.status(500).json({ error: 'Failed to post tweet, ' + error });
  }
});

// Get Twitter account info
router.get('/account', async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ error: 'Twitter username is required' });
    }
    const account = await twitterService.getConnectedAccount(username as string);
    res.json(account);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get account info' });
  }
});

export default router;
