import { getLinks } from "./links.js";
import type { LinkRecord } from "../lib/db.js";

function formatDate(dateStr: string): string {
  const date = new Date(dateStr.replace(" ", "T") + "Z");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function LinkEntry({ link }: { link: LinkRecord }) {
  return (
    <article className="group py-7 border-b border-rule last:border-b-0">
      <div className="flex items-baseline justify-between gap-4 mb-2">
        <h2 className="font-display text-xl font-bold text-ink leading-tight group-hover:text-mango-700 transition-colors">
          {link.title}
        </h2>
        <time
          dateTime={link.createdAt}
          className="text-sm text-ink-muted whitespace-nowrap font-mono tabular-nums"
        >
          {formatDate(link.createdAt)}
        </time>
      </div>

      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block text-sm text-mango-600 hover:text-mango-800 underline decoration-mango-300 underline-offset-2 hover:decoration-mango-500 transition-colors mb-3 break-all"
      >
        {link.url}
      </a>

      <p className="text-ink-light leading-relaxed text-base">
        {link.summary}
      </p>

      <span className="inline-block mt-3 text-xs text-ink-muted font-medium tracking-wide uppercase">
        #{link.channelName}
      </span>
    </article>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-24">
      <div className="text-6xl mb-6">🥭</div>
      <p className="font-display text-2xl text-ink-light italic mb-2">
        No links yet.
      </p>
      <p className="text-ink-muted text-base">
        Share a link in a connected Slack channel to get started.
      </p>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="text-center py-24">
      <div className="text-5xl mb-6">⚠️</div>
      <p className="font-display text-2xl text-ink-light mb-2">
        Something went wrong.
      </p>
      <p className="text-ink-muted text-base">Please refresh.</p>
    </div>
  );
}

export default function Home() {
  let links: LinkRecord[];
  try {
    links = getLinks();
  } catch {
    return (
      <main className="max-w-2xl mx-auto px-6 py-12">
        <Header />
        <ErrorState />
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <Header />
      {links.length === 0 ? (
        <EmptyState />
      ) : (
        <section>
          {links.map((link) => (
            <LinkEntry key={link.id} link={link} />
          ))}
        </section>
      )}
    </main>
  );
}

function Header() {
  return (
    <header className="mb-10 pb-6 border-b-2 border-mango-400">
      <h1 className="font-display text-4xl font-black text-ink tracking-tight">
        Super<span className="text-mango-500">mango</span>
      </h1>
      <p className="text-ink-muted text-sm mt-1 tracking-wide uppercase">
        Link summaries from Slack
      </p>
    </header>
  );
}
