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

  // const response = await fetch(
  //   "https://inference.nebulablock.com/v1/chat/completions",
  //   {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //       Authorization: `Bearer ${process.env.NEXT_PUBLIC_NEBULA_API_KEY}`,
  //     },
  //     body: JSON.stringify({
  //       messages: [
  //         {
  //           role: "user",
  //           content: token_gen_prompt,
  //         },
  //       ],
  //       model: "meta-llama/Llama-3.1-8B-Instruct",
  //       max_tokens: null,
  //       temperature: 1,
  //       top_p: 0.9,
  //       stream: false,
  //     }),
  //   }
  // );
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
