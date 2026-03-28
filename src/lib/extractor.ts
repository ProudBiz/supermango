import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom";

export type ExtractResult =
  | { ok: true; title: string; textContent: string }
  | { ok: false; error: string };

export interface ExtractOptions {
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 10_000;

export async function extractContent(
  url: string,
  options?: ExtractOptions,
): Promise<ExtractResult> {
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  let response: Response;
  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SupermangoBot/1.0)",
      },
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return { ok: false, error: `Request timeout after ${timeoutMs}ms` };
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Fetch failed",
    };
  }

  if (!response.ok) {
    return { ok: false, error: `HTTP ${response.status}` };
  }

  const html = await response.text();
  if (!html.trim()) {
    return { ok: false, error: "Empty response body" };
  }

  const { document } = parseHTML(html);
  const article = new Readability(document as unknown as Document).parse();

  if (!article || !article.textContent?.trim()) {
    return { ok: false, error: "Could not extract readable content" };
  }

  return {
    ok: true,
    title: article.title || "Untitled",
    textContent: article.textContent.trim(),
  };
}
