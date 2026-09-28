import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Navagraha | Meta Mudhaleedu",
  description: "Plan the nine Navagraha temples around opening hours, travel time and your pace.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
