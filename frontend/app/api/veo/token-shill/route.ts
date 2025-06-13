import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Initialize the Google Gemini AI client
const ai = new GoogleGenAI({
  apiKey: process.env.VEO_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    // Get the tweet text from the request
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Tweet text is required' },
        { status: 400 }
      );
    }

    if (!process.env.VEO_API_KEY) {
      return NextResponse.json(
        { error: 'VEO API key not configured' },
        { status: 500 }
      );
    }

    // Generate the video
    const enhancedPrompt = `Create a viral-style crypto meme video that's pure degen energy. Include meme-worthy visual elements that represent: ${text}. Style: High-energy meme aesthetics with vaporwave colors, glitch effects, and comic-style explosions. Make it feel like a TikTok-worthy crypto trend video that captures the fun, FOMO, and excitement of degen culture. No text or people, but go wild with meme symbolism and internet culture references. Keep it fast-paced and hypnotic like those viral crypto edits.`;

    console.log('Starting video generation with prompt:', enhancedPrompt);

    let operation = await ai.models.generateVideos({
      model: 'veo-2.0-generate-001',
      prompt: enhancedPrompt,
      config: {
        numberOfVideos: 1,
        aspectRatio: '16:9',
        personGeneration: 'dont_allow',
        durationSeconds: 5,
      },
    });

    let attempts = 0;
    const maxAttempts = 30;
    while (!operation.done && attempts < maxAttempts) {
      console.log(`Waiting for video generation... Attempt ${attempts + 1}/${maxAttempts}`);
      await new Promise((resolve) => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({
        operation: operation,
      });
      attempts++;
    }

    if (attempts >= maxAttempts) {
      throw new Error('Video generation timed out after 5 minutes');
    }

    if (!operation.response?.generatedVideos?.length) {
      throw new Error('No videos were generated');
    }

    const generatedVideo = operation.response.generatedVideos[0];
    if (!generatedVideo?.video?.uri) {
      throw new Error('Generated video URI is missing');
    }

    console.log('Video generated successfully, downloading...');

    const response = await fetch(
      `${generatedVideo.video.uri}&key=${process.env.VEO_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to download generated video: ${response.statusText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    // Return the video buffer directly in the response
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': 'inline; filename="generated-video.mp4"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error: any) {
    console.error('Error generating video:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate video' },
      { status: 500 }
    );
  }
}
