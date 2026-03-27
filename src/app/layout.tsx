import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Supermango Todo",
  description: "A todo app built with Next.js, SQLite, and Drizzle ORM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
