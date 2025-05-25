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
    const { walletAddress } = req.query;
    
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    const authData = await twitterService.getAuthUrl();
    
    // Store oauth_token_secret and wallet address mapped to oauth_token
    tempTokenStorage.set(authData.oauth_token, JSON.stringify({
      oauth_token_secret: authData.oauth_token_secret,
      walletAddress,
    }));
    
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
      return res.redirect(`${process.env.FRONTEND_URL}/dashboard/settings?error=Missing required OAuth parameters`);
    }

    // Get the stored data
    const storedData = tempTokenStorage.get(oauth_token as string);
    if (!storedData) {
      return res.redirect(`${process.env.FRONTEND_URL}/dashboard/settings?error=OAuth token expired or invalid`);
    }
    console.log(storedData);
    
    const { oauth_token_secret, walletAddress } = JSON.parse(storedData);

    // Delete the token from storage
    tempTokenStorage.delete(oauth_token as string);

    const result = await twitterService.handleCallback(
      oauth_token as string,
      oauth_verifier as string,
      oauth_token_secret,
      walletAddress
    );

    // Redirect back to frontend settings page with success
    res.redirect(`${process.env.FRONTEND_URL}/dashboard/settings?twitter=connected&username=${result.username}`);
  } catch (error) {
    console.error('Callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/dashboard/settings?error=Failed to complete authentication`);
  }
});

// Post a tweet
router.post('/tweet', upload.array('images', 4), async (req, res) => {
  try {
    const { walletAddress, text } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!text) {
      return res.status(400).json({ error: 'Tweet text is required' });
    }

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    // Convert uploaded files to buffers if they exist
    const imageBuffers = files?.length > 0 ? files.map(file => file.buffer) : undefined;

    const tweet = await twitterService.postTweet(walletAddress, text, imageBuffers);
    res.json(tweet);
  } catch (error) {
    res.status(500).json({ error: 'Failed to post tweet, ' + error });
  }
});

// Get Twitter account info
router.get('/account', async (req, res) => {
  try {
    const { walletAddress } = req.query;
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }
    const account = await twitterService.getConnectedAccount(walletAddress as string);
    res.json(account);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get account info' });
  }
});

export default router;
