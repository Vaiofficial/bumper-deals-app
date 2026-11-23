import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SavedCartProvider } from "@/context/SavedCartContext";
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata: Metadata = {
  title: "DropVault | Real-Time Deal Intelligence & 90-Day Price Tracker",
  description: "Live Amazon India verified lightning drops, genuine 90-day lowest prices, and 80%+ discount price glitches.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DropVault",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAF9" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0F19" }
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased dark" suppressHydrationWarning>
      <head>
        <meta name="referrer" content="no-referrer" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body 
        className="min-h-full flex flex-col bg-stone-50 text-stone-900 dark:bg-[#0B0F19] dark:text-stone-100"
        suppressHydrationWarning
      >
        <ThemeProvider>
          <SavedCartProvider>
            {children}
          </SavedCartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
