import { TwitterApi } from 'twitter-api-v2';
import Twitter from '../models/Twitter';

class TwitterService {
  private appKey: string;
  private appSecret: string;
  private callbackUrl: string;

  constructor() {
    this.appKey = process.env.TWITTER_APP_KEY || '';
    this.appSecret = process.env.TWITTER_APP_SECRET || '';
    this.callbackUrl = process.env.TWITTER_CALLBACK_URL || '';

    if (!this.appKey || !this.appSecret || !this.callbackUrl) {
      throw new Error('Twitter credentials not properly configured');
    }
  }

  private getClient(accessToken?: string, accessSecret?: string) {
    if (accessToken && accessSecret) {
      return new TwitterApi({
        appKey: this.appKey,
        appSecret: this.appSecret,
        accessToken: accessToken,
        accessSecret: accessSecret,
      });
    }
    return new TwitterApi({
      appKey: this.appKey,
      appSecret: this.appSecret
    });
  }

  async getAuthUrl() {
    const client = this.getClient();
    const authLink = await client.generateAuthLink(this.callbackUrl);
    
    return { 
      url: authLink.url,
      oauth_token: authLink.oauth_token,
      oauth_token_secret: authLink.oauth_token_secret
    };
  }

  async handleCallback(oauth_token: string, oauth_verifier: string, oauth_token_secret: string, walletAddress: string) {
    try {
      // Create client with temporary tokens
      const client = this.getClient(oauth_token, oauth_token_secret);
      
      // Get permanent tokens
      const { accessToken, accessSecret, client: loggedClient } = await client.login(oauth_verifier);
      
      // Get user info
      const { data: userObject } = await loggedClient.v2.me();
      
      // Save tokens
      await Twitter.findOneAndUpdate(
        { walletAddress },
        {
          accessToken: accessToken,
          accessSecret: accessSecret,
          username: userObject.username,
          walletAddress: walletAddress
        },
        { upsert: true }
      );

      return { username: userObject.username };
    } catch (error) {
      console.error('Callback error:', error);
      throw new Error('Failed to process Twitter callback');
    }
  }

  async postTweet(walletAddress: string, text: string, images?: Buffer[], video?: Buffer) {
    try {
      const twitterAccount = await Twitter.findOne({ walletAddress });
      if (!twitterAccount) {
        throw new Error('Twitter account not connected');
      }

      const client = this.getClient(twitterAccount.accessToken, twitterAccount.accessSecret);

      let mediaIds: string[] = [];

      // Handle video upload if present
      if (video) {
        console.log("Uploading video");
        const videoMediaId = await client.v1.uploadMedia(video, { 
          type: 'longmp4',
          mimeType: 'video/mp4',
          target: 'tweet'
        });
        mediaIds.push(videoMediaId);
      }
      // Handle image uploads if present and no video
      else if (images && images.length > 0) {
        console.log("Uploading images", images.length);
        
        // Upload images using v1
        const uploadedMediaIds = await Promise.all(
          images.slice(0, 4).map(image => 
            client.v1.uploadMedia(image, { mimeType: "image/jpeg" })
          )
        );
        mediaIds = uploadedMediaIds;
      }

      // Convert mediaIds array to properly typed tuple based on length
      let typedMediaIds: [string] | [string, string] | [string, string, string] | [string, string, string, string];
      switch (mediaIds.length) {
        case 1:
          typedMediaIds = [mediaIds[0]];
          break;
        case 2:
          typedMediaIds = [mediaIds[0], mediaIds[1]];
          break;
        case 3:
          typedMediaIds = [mediaIds[0], mediaIds[1], mediaIds[2]];
          break;
        case 4:
          typedMediaIds = [mediaIds[0], mediaIds[1], mediaIds[2], mediaIds[3]];
          break;
        default:
          typedMediaIds = [mediaIds[0]];
      }

      console.log("Posting tweet with media");
      // Post tweet using v2
      return await client.v2.tweet({
        text,
        media: mediaIds.length > 0 ? { media_ids: typedMediaIds } : undefined
      });
    } catch (error: any) {
      if (error?.code === 401) {
        throw new Error('Twitter authentication expired, ' + error);
      }
      throw error;
    }
  }

  async getConnectedAccount(walletAddress: string) {
    try {
      console.log("Checking Twitter connection for wallet:", walletAddress);
      
      const account = await Twitter.findOne({ walletAddress });
      
      if (!account) {
        console.log("No Twitter account found for wallet:", walletAddress);
        return {
          connected: false
        };
      }
      
      return {
        username: account.username,
        connected: true,
      };
    } catch (error) {
      console.error("Error getting Twitter account:", error);
      throw new Error('Failed to get Twitter account status');
    }
  }

  async extractFields(input: string) {
    const regex = /@creatcoin\s+\$(\w+)\(([^)]+)\)\s*\n([^\n]+)/i;
    const match = input.match(regex);

    if (!match) return null;

    return {
      token: match[1],
      tokenName: match[2],
      description: match[3]
    };
  }
}

export default new TwitterService();
