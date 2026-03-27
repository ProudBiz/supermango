import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Supermango",
  description: "Multi-agent orchestration system",
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
