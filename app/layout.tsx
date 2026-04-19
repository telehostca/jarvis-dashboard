import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jarvis — Autonomous Monitoring for your Stack",
  description:
    "Get WhatsApp alerts when your apps are degrading. AI agent that polls your /jarvis/health endpoints and reports problems before your users notice.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
