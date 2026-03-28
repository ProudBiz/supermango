import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Supermango — Link Summaries",
  description: "Links and summaries from Slack",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
