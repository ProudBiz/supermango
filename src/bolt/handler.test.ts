import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleMessage, extractUrls, type SlackClient, type Deps } from "./handler.js";

// --- extractUrls ---

describe("extractUrls", () => {
  it("extracts a single URL from message text", () => {
    expect(extractUrls("check this out https://example.com/article")).toEqual([
      "https://example.com/article",
    ]);
  });

  it("extracts multiple URLs from message text", () => {
    expect(
      extractUrls("read https://a.com and https://b.com/page"),
    ).toEqual(["https://a.com", "https://b.com/page"]);
  });

  it("returns empty array when no URLs present", () => {
    expect(extractUrls("no links here")).toEqual([]);
  });

  it("extracts URLs wrapped in Slack angle-bracket format", () => {
    expect(extractUrls("look at <https://example.com/foo>")).toEqual([
      "https://example.com/foo",
    ]);
  });

  it("handles Slack URLs with display text", () => {
    expect(extractUrls("<https://example.com|example.com>")).toEqual([
      "https://example.com",
    ]);
  });

  it("ignores non-http URLs", () => {
    expect(extractUrls("mailto:foo@bar.com ftp://files.com")).toEqual([]);
  });
});

// --- handleMessage ---

function makeDeps(overrides: Partial<Deps> = {}): Deps {
  return {
    findLinkByUrl: vi.fn().mockReturnValue(null),
    saveLink: vi.fn(),
    extractContent: vi.fn().mockResolvedValue({
      ok: true,
      title: "Test Title",
      textContent: "Some extracted content for summarization.",
    }),
    summarize: vi.fn().mockResolvedValue({
      ok: true,
      summary: "A concise summary.",
    }),
    ...overrides,
  };
}

function makeClient(): SlackClient {
  return {
    reactions: {
      add: vi.fn().mockResolvedValue({}),
      remove: vi.fn().mockResolvedValue({}),
    },
    chat: {
      postMessage: vi.fn().mockResolvedValue({}),
    },
  };
}

describe("handleMessage", () => {
  let client: SlackClient;
  let deps: Deps;

  beforeEach(() => {
    client = makeClient();
    deps = makeDeps();
  });

  it("ignores messages from bot users", async () => {
    await handleMessage(
      {
        text: "https://example.com",
        channel: "C123",
        ts: "1234.5678",
        user: "U999",
        bot_id: "B123",
      },
      client,
      deps,
    );

    expect(client.reactions.add).not.toHaveBeenCalled();
    expect(deps.extractContent).not.toHaveBeenCalled();
  });

  it("ignores messages with subtype (e.g. bot_message)", async () => {
    await handleMessage(
      {
        text: "https://example.com",
        channel: "C123",
        ts: "1234.5678",
        user: "U999",
        subtype: "bot_message",
      },
      client,
      deps,
    );

    expect(client.reactions.add).not.toHaveBeenCalled();
  });

  it("ignores messages with no URLs", async () => {
    await handleMessage(
      {
        text: "just chatting",
        channel: "C123",
        ts: "1234.5678",
        user: "U999",
      },
      client,
      deps,
    );

    expect(client.reactions.add).not.toHaveBeenCalled();
  });

  it("processes a single URL end-to-end", async () => {
    await handleMessage(
      {
        text: "check <https://example.com/article>",
        channel: "C123",
        ts: "1234.5678",
        user: "U999",
      },
      client,
      deps,
    );

    // Adds hourglass reaction
    expect(client.reactions.add).toHaveBeenCalledWith({
      name: "hourglass_flowing_sand",
      channel: "C123",
      timestamp: "1234.5678",
    });

    // Checks for duplicate
    expect(deps.findLinkByUrl).toHaveBeenCalledWith("https://example.com/article");

    // Extracts content
    expect(deps.extractContent).toHaveBeenCalledWith("https://example.com/article");

    // Summarizes
    expect(deps.summarize).toHaveBeenCalledWith("Some extracted content for summarization.");

    // Posts thread reply
    expect(client.chat.postMessage).toHaveBeenCalledWith({
      channel: "C123",
      thread_ts: "1234.5678",
      text: "A concise summary.",
    });

    // Removes hourglass reaction
    expect(client.reactions.remove).toHaveBeenCalledWith({
      name: "hourglass_flowing_sand",
      channel: "C123",
      timestamp: "1234.5678",
    });

    // Adds check reaction
    expect(client.reactions.add).toHaveBeenCalledWith({
      name: "white_check_mark",
      channel: "C123",
      timestamp: "1234.5678",
    });

    // Saves to DB
    expect(deps.saveLink).toHaveBeenCalledWith({
      url: "https://example.com/article",
      title: "Test Title",
      summary: "A concise summary.",
      channelId: "C123",
      channelName: "",
      messageTs: "1234.5678",
      slackUserId: "U999",
    });
  });

  it("returns cached summary for duplicate URLs", async () => {
    const cachedDeps = makeDeps({
      findLinkByUrl: vi.fn().mockReturnValue({
        id: 1,
        url: "https://example.com",
        title: "Cached Title",
        summary: "Cached summary.",
        channelId: "C000",
        channelName: "general",
        messageTs: "0000.0000",
        slackUserId: "U000",
        createdAt: "2026-01-01T00:00:00Z",
      }),
    });

    await handleMessage(
      {
        text: "<https://example.com>",
        channel: "C123",
        ts: "1234.5678",
        user: "U999",
      },
      client,
      cachedDeps,
    );

    // Should NOT extract or summarize
    expect(cachedDeps.extractContent).not.toHaveBeenCalled();
    expect(cachedDeps.summarize).not.toHaveBeenCalled();

    // Should post cached summary
    expect(client.chat.postMessage).toHaveBeenCalledWith({
      channel: "C123",
      thread_ts: "1234.5678",
      text: "Cached summary.",
    });

    // Should still swap to check mark
    expect(client.reactions.add).toHaveBeenCalledWith({
      name: "white_check_mark",
      channel: "C123",
      timestamp: "1234.5678",
    });

    // Should NOT save again
    expect(cachedDeps.saveLink).not.toHaveBeenCalled();
  });

  it("handles extraction failure with ❌ and error message", async () => {
    const failDeps = makeDeps({
      extractContent: vi.fn().mockResolvedValue({
        ok: false,
        error: "HTTP 403",
      }),
    });

    await handleMessage(
      {
        text: "<https://blocked.com>",
        channel: "C123",
        ts: "1234.5678",
        user: "U999",
      },
      client,
      failDeps,
    );

    // Swaps to X
    expect(client.reactions.add).toHaveBeenCalledWith({
      name: "x",
      channel: "C123",
      timestamp: "1234.5678",
    });

    // Posts error in thread
    expect(client.chat.postMessage).toHaveBeenCalledWith({
      channel: "C123",
      thread_ts: "1234.5678",
      text: "Couldn't summarize: HTTP 403",
    });

    // Should NOT save or summarize
    expect(failDeps.summarize).not.toHaveBeenCalled();
    expect(failDeps.saveLink).not.toHaveBeenCalled();
  });

  it("handles summarization failure with ❌ and error message", async () => {
    const failDeps = makeDeps({
      summarize: vi.fn().mockResolvedValue({
        ok: false,
        error: "Gemini API rate limited",
      }),
    });

    await handleMessage(
      {
        text: "<https://example.com>",
        channel: "C123",
        ts: "1234.5678",
        user: "U999",
      },
      client,
      failDeps,
    );

    // Swaps to X
    expect(client.reactions.add).toHaveBeenCalledWith({
      name: "x",
      channel: "C123",
      timestamp: "1234.5678",
    });

    // Posts error in thread
    expect(client.chat.postMessage).toHaveBeenCalledWith({
      channel: "C123",
      thread_ts: "1234.5678",
      text: "Couldn't summarize: Gemini API rate limited",
    });

    expect(failDeps.saveLink).not.toHaveBeenCalled();
  });

  it("handles multiple URLs with separate replies", async () => {
    await handleMessage(
      {
        text: "<https://a.com> and <https://b.com>",
        channel: "C123",
        ts: "1234.5678",
        user: "U999",
      },
      client,
      deps,
    );

    // Two extraction calls
    expect(deps.extractContent).toHaveBeenCalledTimes(2);
    expect(deps.extractContent).toHaveBeenCalledWith("https://a.com");
    expect(deps.extractContent).toHaveBeenCalledWith("https://b.com");

    // Two summarize calls
    expect(deps.summarize).toHaveBeenCalledTimes(2);

    // Two thread replies
    expect(client.chat.postMessage).toHaveBeenCalledTimes(2);

    // Two saves
    expect(deps.saveLink).toHaveBeenCalledTimes(2);
  });

  it("handles mixed success and failure for multiple URLs", async () => {
    const mixedDeps = makeDeps({
      extractContent: vi
        .fn()
        .mockResolvedValueOnce({ ok: true, title: "Good", textContent: "Content" })
        .mockResolvedValueOnce({ ok: false, error: "HTTP 500" }),
    });

    await handleMessage(
      {
        text: "<https://good.com> <https://bad.com>",
        channel: "C123",
        ts: "1234.5678",
        user: "U999",
      },
      client,
      mixedDeps,
    );

    // One success reply + one error reply
    expect(client.chat.postMessage).toHaveBeenCalledTimes(2);

    // One save (only the successful one)
    expect(mixedDeps.saveLink).toHaveBeenCalledTimes(1);
  });

  it("ignores messages with undefined text", async () => {
    await handleMessage(
      {
        text: undefined as unknown as string,
        channel: "C123",
        ts: "1234.5678",
        user: "U999",
      },
      client,
      deps,
    );

    expect(client.reactions.add).not.toHaveBeenCalled();
  });
});
