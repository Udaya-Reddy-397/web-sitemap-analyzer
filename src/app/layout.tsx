import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Website Sitemap Analyzer | BashCraft Task",
  description:
    "Professional website crawler that discovers pages, detects broken links, and generates structured sitemaps.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
