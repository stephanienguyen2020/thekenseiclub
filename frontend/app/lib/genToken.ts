export async function generateTokenConcept(input: string, openai: any) {
  const token_gen_prompt = `Generate a creative token concept based on this input: "${input}".
  Return ONLY a JSON object with the following fields:
  {
    "name": "A creative name for the token (max 32 chars) with no spaces", 
    "symbol": "A 3-6 character ticker symbol in caps",
    "description": "A compelling 2-3 sentence description of the token's purpose and vision",
    "image_description": "A description of the image that will be generated for the token",
    }
  Do not include any other text or explanation.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "user",
        content: token_gen_prompt,
      },
    ],
  });
  console.log("response", response);
  const content = response.choices[0].message?.content;
  if (!content) {
    throw new Error("No content received from OpenAI");
  }
  // Parse the JSON response
  const completion = JSON.parse(content);
  return completion;
}
