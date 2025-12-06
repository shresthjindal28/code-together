"use server";

import OpenAI from "openai";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function getSuggestion(input: string) {
  const [command, text] = input.split(":::");

  const prompt = `
Perform task: ${command}
Text:
${text}
`;

  const res = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: "Short precise rewriting assistant" },
      { role: "user", content: prompt },
    ],
    max_tokens: 150,
  });

  return res.choices?.[0]?.message?.content || "";
}
