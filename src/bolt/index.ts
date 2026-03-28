import "dotenv/config";
import { App } from "@slack/bolt";
import { initDb, findLinkByUrl, saveLink } from "../lib/db.js";
import { extractContent } from "../lib/extractor.js";
import { summarize } from "../lib/summarizer.js";
import { handleMessage, type SlackClient, type Deps } from "./handler.js";

const DB_PATH = process.env.DB_PATH ?? "supermango.db";

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

const db = initDb(DB_PATH);

const deps: Deps = {
  findLinkByUrl: (url) => findLinkByUrl(db, url),
  saveLink: (input) => saveLink(db, input),
  extractContent,
  summarize,
};

app.message(async ({ message, client }) => {
  const msg = message as unknown as Record<string, unknown>;
  await handleMessage(
    {
      text: msg.text as string | undefined,
      channel: msg.channel as string,
      ts: msg.ts as string,
      user: msg.user as string | undefined,
      bot_id: msg.bot_id as string | undefined,
      subtype: msg.subtype as string | undefined,
    },
    client as unknown as SlackClient,
    deps,
  );
});

(async () => {
  await app.start();
  console.log("Bolt app started");
})();
