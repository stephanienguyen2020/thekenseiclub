import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { input, type } = await req.json()

    // First, generate token details using GPT-4
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a creative meme token generator. Generate engaging and funny token details based on the input. Return JSON format with name, symbol, and description.",
        },
        {
          role: "user",
          content: `Generate a meme token based on this ${type === "tweet" ? "tweet" : "idea"}: ${input}`,
        },
      ],
      response_format: { type: "json_object" },
    })

    const tokenDetails = JSON.parse(completion.choices[0].message.content)

    // Then, generate an image using DALL-E
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Create a fun, meme-worthy crypto token logo for ${tokenDetails.name} (${tokenDetails.symbol}). The image should be creative, memorable, and relate to: ${tokenDetails.description}`,
      n: 1,
      size: "1024x1024",
    })

    return NextResponse.json({
      ...tokenDetails,
      imageUrl: imageResponse.data[0].url,
    })
  } catch (error) {
    console.error("Generate token error:", error)
    return NextResponse.json({ error: "Failed to generate token details" }, { status: 500 })
  }
}

