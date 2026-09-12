import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "Rotean — Your life, intelligently managed",
  description:
    "Rotean understands your time, responsibilities, goals and surroundings, then helps you decide and act on what to do next.",
  applicationName: "Rotean",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Rotean",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#F7F5EF",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
