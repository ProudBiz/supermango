import type { ExtractResult } from "../lib/extractor.js";
import type { SummarizeResult } from "../lib/summarizer.js";
import type { LinkRecord, SaveLinkInput } from "../lib/db.js";

export interface SlackClient {
  reactions: {
    add: (args: { name: string; channel: string; timestamp: string }) => Promise<unknown>;
    remove: (args: { name: string; channel: string; timestamp: string }) => Promise<unknown>;
  };
  chat: {
    postMessage: (args: { channel: string; thread_ts: string; text: string }) => Promise<unknown>;
  };
}

export interface Deps {
  findLinkByUrl: (url: string) => LinkRecord | null;
  saveLink: (input: SaveLinkInput) => void;
  extractContent: (url: string) => Promise<ExtractResult>;
  summarize: (text: string) => Promise<SummarizeResult>;
}

export interface MessageEvent {
  text?: string;
  channel: string;
  ts: string;
  user?: string;
  bot_id?: string;
  subtype?: string;
}

const SLACK_URL_RE = /<(https?:\/\/[^|>]+)(?:\|[^>]*)?>|(https?:\/\/\S+)/g;

export function extractUrls(text: string): string[] {
  const urls: string[] = [];
  let match: RegExpExecArray | null;
  SLACK_URL_RE.lastIndex = 0;
  while ((match = SLACK_URL_RE.exec(text)) !== null) {
    urls.push(match[1] ?? match[2]);
  }
  return urls;
}

export async function handleMessage(
  message: MessageEvent,
  client: SlackClient,
  deps: Deps,
): Promise<void> {
  if (message.bot_id || message.subtype) return;
  if (!message.text) return;

  const urls = extractUrls(message.text);
  if (urls.length === 0) return;

  const { channel, ts, user } = message;

  // Add hourglass reaction once for the message
  await client.reactions.add({
    name: "hourglass_flowing_sand",
    channel,
    timestamp: ts,
  });

  let allSucceeded = true;

  for (const url of urls) {
    // Check for duplicate
    const existing = deps.findLinkByUrl(url);
    if (existing) {
      await client.chat.postMessage({
        channel,
        thread_ts: ts,
        text: existing.summary,
      });
      continue;
    }

    // Extract content
    const extraction = await deps.extractContent(url);
    if (!extraction.ok) {
      allSucceeded = false;
      await client.chat.postMessage({
        channel,
        thread_ts: ts,
        text: `Couldn't summarize: ${extraction.error}`,
      });
      continue;
    }

    // Summarize
    const result = await deps.summarize(extraction.textContent);
    if (!result.ok) {
      allSucceeded = false;
      await client.chat.postMessage({
        channel,
        thread_ts: ts,
        text: `Couldn't summarize: ${result.error}`,
      });
      continue;
    }

    // Post summary in thread
    await client.chat.postMessage({
      channel,
      thread_ts: ts,
      text: result.summary,
    });

    // Save to DB
    deps.saveLink({
      url,
      title: extraction.title,
      summary: result.summary,
      channelId: channel,
      channelName: "",
      messageTs: ts,
      slackUserId: user ?? "",
    });
  }

  // Remove hourglass
  await client.reactions.remove({
    name: "hourglass_flowing_sand",
    channel,
    timestamp: ts,
  });

  // Add final reaction
  await client.reactions.add({
    name: allSucceeded ? "white_check_mark" : "x",
    channel,
    timestamp: ts,
  });
}
