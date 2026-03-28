import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock @google/genai before importing summarizer
const { mockGenerateContent } = vi.hoisted(() => {
  const mockGenerateContent = vi.fn();
  return { mockGenerateContent };
});

vi.mock("@google/genai", () => ({
  GoogleGenAI: class {
    models = { generateContent: mockGenerateContent };
  },
}));

import { summarize } from "./summarizer.js";

const SHORT_TEXT = "A short article about cats being cute.";
const LONG_TEXT = "A ".repeat(2000) + "very long article about the history of computing.";

beforeEach(() => {
  vi.mocked(mockGenerateContent).mockReset();
});

describe("summarize", () => {
  it("returns a summary for short content", async () => {
    vi.mocked(mockGenerateContent).mockResolvedValue({
      text: "Cats are cute.",
    });

    const result = await summarize(SHORT_TEXT);
    expect(result).toEqual({ ok: true, summary: "Cats are cute." });
  });

  it("returns a summary for long content", async () => {
    vi.mocked(mockGenerateContent).mockResolvedValue({
      text: "A comprehensive history of computing from early mechanical devices to modern supercomputers.",
    });

    const result = await summarize(LONG_TEXT);
    expect(result).toEqual({
      ok: true,
      summary:
        "A comprehensive history of computing from early mechanical devices to modern supercomputers.",
    });
  });

  it("passes different system instructions based on content length", async () => {
    vi.mocked(mockGenerateContent).mockResolvedValue({ text: "Summary." });

    await summarize(SHORT_TEXT);
    const shortCall = vi.mocked(mockGenerateContent).mock.calls[0][0];

    vi.mocked(mockGenerateContent).mockReset();
    vi.mocked(mockGenerateContent).mockResolvedValue({ text: "Summary." });

    await summarize(LONG_TEXT);
    const longCall = vi.mocked(mockGenerateContent).mock.calls[0][0];

    // Short content should request 1-2 sentences, long should request 4-5
    expect(shortCall.config.systemInstruction).toContain("1-2 sentences");
    expect(longCall.config.systemInstruction).toContain("4-5 sentences");
  });

  it("strips URLs from the summary", async () => {
    vi.mocked(mockGenerateContent).mockResolvedValue({
      text: "Check out https://example.com for more info. Great article.",
    });

    const result = await summarize(SHORT_TEXT);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.summary).not.toMatch(/https?:\/\//);
    }
  });

  it("retries once on failure then succeeds", async () => {
    vi.mocked(mockGenerateContent)
      .mockRejectedValueOnce(new Error("API error"))
      .mockResolvedValueOnce({ text: "Recovered summary." });

    const result = await summarize(SHORT_TEXT);
    expect(result).toEqual({ ok: true, summary: "Recovered summary." });
    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
  });

  it("returns error after retry is exhausted", async () => {
    vi.mocked(mockGenerateContent)
      .mockRejectedValueOnce(new Error("API error"))
      .mockRejectedValueOnce(new Error("API error again"));

    const result = await summarize(SHORT_TEXT);
    expect(result).toEqual({ ok: false, error: "API error again" });
    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
  });

  it("returns error when response has no text", async () => {
    vi.mocked(mockGenerateContent).mockResolvedValue({ text: "" });

    const result = await summarize(SHORT_TEXT);
    expect(result).toEqual({ ok: false, error: "Empty response from Gemini" });
  });

  it("returns error when response text is null/undefined", async () => {
    vi.mocked(mockGenerateContent).mockResolvedValue({ text: null });

    const result = await summarize(SHORT_TEXT);
    expect(result).toEqual({ ok: false, error: "Empty response from Gemini" });
  });

  it("uses the correct model", async () => {
    vi.mocked(mockGenerateContent).mockResolvedValue({ text: "Summary." });

    await summarize(SHORT_TEXT);
    const call = vi.mocked(mockGenerateContent).mock.calls[0][0];
    expect(call.model).toBe("gemini-3-flash-preview");
  });
});
