import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderToString } from "react-dom/server";
import type { LinkRecord } from "../lib/db.js";

vi.mock("./links.js", () => ({
  getLinks: vi.fn(),
}));

import Home from "./page.js";
import { getLinks } from "./links.js";

const mockedGetLinks = vi.mocked(getLinks);

function makeLinkRecord(overrides: Partial<LinkRecord> = {}): LinkRecord {
  return {
    id: 1,
    url: "https://example.com/article",
    title: "Example Article",
    summary: "A summary of the article.",
    channelId: "C100",
    channelName: "general",
    messageTs: "100.000",
    slackUserId: "U1",
    createdAt: "2026-03-15 10:30:00",
    ...overrides,
  };
}

describe("Home page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render empty state when no links exist", () => {
    mockedGetLinks.mockReturnValue([]);
    const html = renderToString(<Home />);
    expect(html).toContain("No links yet");
    expect(html).toContain("Share a link in a connected Slack channel to get started");
  });

  it("should render a list of links with title, URL, summary, date, and channel name", () => {
    mockedGetLinks.mockReturnValue([
      makeLinkRecord({
        id: 2,
        url: "https://example.com/second",
        title: "Second Article",
        summary: "Second summary.",
        channelName: "random",
        createdAt: "2026-03-16 14:00:00",
      }),
      makeLinkRecord({
        id: 1,
        url: "https://example.com/first",
        title: "First Article",
        summary: "First summary.",
        channelName: "general",
        createdAt: "2026-03-15 10:30:00",
      }),
    ]);

    const html = renderToString(<Home />);

    // Titles
    expect(html).toContain("Second Article");
    expect(html).toContain("First Article");

    // URLs
    expect(html).toContain("https://example.com/second");
    expect(html).toContain("https://example.com/first");

    // Summaries
    expect(html).toContain("Second summary.");
    expect(html).toContain("First summary.");

    // Channel names
    expect(html).toContain("random");
    expect(html).toContain("general");

    // Should NOT show empty state
    expect(html).not.toContain("No links yet");
  });

  it("should render error state when getLinks throws", () => {
    mockedGetLinks.mockImplementation(() => {
      throw new Error("DB connection failed");
    });
    const html = renderToString(<Home />);
    expect(html).toContain("Something went wrong");
    expect(html).toContain("Please refresh");
  });

  it("should render dates for each link", () => {
    mockedGetLinks.mockReturnValue([
      makeLinkRecord({ createdAt: "2026-03-15 10:30:00" }),
    ]);
    const html = renderToString(<Home />);
    // Should contain some date representation of March 15, 2026
    expect(html).toMatch(/Mar.*15.*2026|2026.*03.*15|March.*15/);
  });
});
