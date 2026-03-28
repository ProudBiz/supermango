import { GoogleGenAI } from "@google/genai";

export type SummarizeResult =
  | { ok: true; summary: string }
  | { ok: false; error: string };

const MODEL = "gemini-3-flash-preview";
const SHORT_CONTENT_THRESHOLD = 1000;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? "" });

function buildSystemInstruction(textLength: number): string {
  const sentenceGuidance =
    textLength <= SHORT_CONTENT_THRESHOLD
      ? "Summarize in 1-2 sentences."
      : "Summarize in 4-5 sentences.";

  return [
    "You are a concise summarizer.",
    sentenceGuidance,
    "Never include URLs or links in the summary.",
    "Output only the summary text, nothing else.",
  ].join(" ");
}

function stripUrls(text: string): string {
  return text.replace(/https?:\/\/\S+/g, "").replace(/\s{2,}/g, " ").trim();
}

export async function summarize(text: string): Promise<SummarizeResult> {
  const systemInstruction = buildSystemInstruction(text.length);
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: text,
        config: {
          systemInstruction,
        },
      });

      const summary = response.text;
      if (!summary) {
        return { ok: false, error: "Empty response from Gemini" };
      }

      return { ok: true, summary: stripUrls(summary) };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  return { ok: false, error: lastError?.message ?? "Unknown error" };
}
