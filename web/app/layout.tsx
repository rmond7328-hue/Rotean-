import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rotean — Your life, intelligently managed",
  description:
    "Rotean understands your time, responsibilities, goals and surroundings, then helps you decide and act on what to do next.",
  applicationName: "Rotean",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#F7F5EF",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
