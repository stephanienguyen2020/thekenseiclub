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

  async postTweet(username: string, text: string, images?: Buffer[]) {
    try {
      const twitterAccount = await Twitter.findOne({ username });
      if (!twitterAccount) {
        throw new Error('Twitter account not connected');
      }

      const client = this.getClient(twitterAccount.accessToken, twitterAccount.accessSecret);

      if (images && images.length > 0) {
        console.log("uploading images", images);
        
        // Upload images using v1
        const mediaIds = await Promise.all(
          images.slice(0, 4).map(image => 
            client.v1.uploadMedia(image, { mimeType: "image/jpeg" })
          )
        );

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

        console.log("posting tweet with media");
        // Post tweet using v2
        return await client.v2.tweet({
          text,
          media: { media_ids: typedMediaIds }
        });
      } else {
        // Post text-only tweet using v2
        return await client.v2.tweet({ text });
      }
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
}

export default new TwitterService();
