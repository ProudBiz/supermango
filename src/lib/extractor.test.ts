import { describe, it, expect, vi, beforeEach } from "vitest";
import { extractContent } from "./extractor.js";

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

function htmlPage(title: string, body: string): string {
  return `<!DOCTYPE html><html><head><title>${title}</title></head><body>${body}</body></html>`;
}

function okResponse(html: string): Response {
  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}

describe("extractContent", () => {
  it("extracts title and text from valid HTML", async () => {
    const html = htmlPage(
      "Test Article",
      "<article><h1>Test Article</h1><p>This is the main content of the article. It has enough text to be considered readable content by the parser. The article discusses important topics that are relevant to the reader.</p></article>",
    );
    mockFetch.mockResolvedValueOnce(okResponse(html));

    const result = await extractContent("https://example.com/article");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.title).toBe("Test Article");
      expect(result.textContent).toContain("main content");
    }
  });

  it("returns error for non-200 status codes", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response("Forbidden", { status: 403 }),
    );

    const result = await extractContent("https://example.com/private");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("403");
    }
  });

  it("returns error for 500 status", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response("Server Error", { status: 500 }),
    );

    const result = await extractContent("https://example.com/broken");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("500");
    }
  });

  it("returns error on fetch timeout", async () => {
    mockFetch.mockImplementationOnce(
      () => Promise.reject(new DOMException("The operation was aborted.", "AbortError")),
    );

    const result = await extractContent("https://example.com/slow");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/timeout|aborted/i);
    }
  });

  it("returns error for empty HTML content", async () => {
    mockFetch.mockResolvedValueOnce(okResponse(""));

    const result = await extractContent("https://example.com/empty");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/empty|extract/i);
    }
  });

  it("returns error for unparseable content (no article)", async () => {
    const html = "<html><head></head><body></body></html>";
    mockFetch.mockResolvedValueOnce(okResponse(html));

    const result = await extractContent("https://example.com/nav-only");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/extract/i);
    }
  });

  it("returns error on network failure", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const result = await extractContent("https://example.com/down");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("Network error");
    }
  });

  it("respects configurable timeout", async () => {
    mockFetch.mockImplementationOnce((_url: string, init?: RequestInit) => {
      // Verify AbortSignal is passed
      expect(init?.signal).toBeDefined();
      return Promise.reject(new DOMException("The operation was aborted.", "AbortError"));
    });

    const result = await extractContent("https://example.com/slow", {
      timeoutMs: 5000,
    });

    expect(result.ok).toBe(false);
  });
});
