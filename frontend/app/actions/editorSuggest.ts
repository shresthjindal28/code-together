"use server";

import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function suggestContinuation(contextText: string) {
  const prompt = `
You are helping continue a collaborative document.

Context (last part of the doc):
"""${contextText.slice(-1500)}"""

Write the next 1–2 sentences ONLY. No intro like "Sure" etc.
`;

    const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: prompt }],
  });

  return response.choices?.[0]?.message?.content || "";
}
