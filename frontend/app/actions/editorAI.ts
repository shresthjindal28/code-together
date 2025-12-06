"use server";

import OpenAI from "openai";
import { PDFDocument, StandardFonts } from "pdf-lib";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

async function callModel(system: string, user: string, maxTokens = 300) {
  const res = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    max_tokens: maxTokens,
    temperature: 0.3,
  });

  return res.choices?.[0]?.message?.content?.trim() || "";
}

export async function aiRewriteTone(
  content: string,
  tone: "neutral" | "formal" | "casual" | "friendly"
) {
  const sys = `You rewrite text preserving meaning but changing the tone to ${tone}. Return ONLY the rewritten text.`;
  return callModel(sys, content, 300);
}

export async function aiGrammarFix(content: string) {
  const sys =
    "You are a grammar correction assistant. Fix grammar, punctuation and clarity. Return ONLY the corrected text.";
  return callModel(sys, content, 300);
}

export async function aiSummarize(content: string) {
  const sys =
    "You summarize text into a concise, clear summary. Return a short bullet list summary.";
  return callModel(sys, content, 200);
}

export async function aiExplainSelection(selection: string, languageHint?: string) {
  const sys = `You explain code or text in simple terms. If it looks like code, explain as a senior developer. If not, explain as a teacher. Return a short explanation. Language hint: ${languageHint || "none"}.`;
  return callModel(sys, selection, 250);
}

export async function aiChatWithDoc(
  messages: { role: "user" | "assistant"; content: string }[],
  docContent: string
) {
  const sys = `
You are an AI assistant helping with a collaborative document.
You can reference the document content to answer questions, suggest edits, and explain things.
Keep responses short and actionable.
Document content:
"""${docContent.slice(0, 8000)}"""
`;
  const res = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: sys },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
    max_tokens: 350,
    temperature: 0.5,
  });

  return res.choices?.[0]?.message?.content?.trim() || "";
}

export async function exportDocToPdf(content: string) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;

  const wrappedText = content.replace(/\n/g, "\n");
  page.drawText(wrappedText, {
    x: 50,
    y: 780,
    size: fontSize,
    font,
    lineHeight: 14,
    maxWidth: 500,
  });

  const pdfBytes = await pdfDoc.save();
  const base64 = Buffer.from(pdfBytes).toString("base64");
  return base64;
}
