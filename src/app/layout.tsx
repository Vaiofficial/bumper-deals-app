import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SavedCartProvider } from "@/context/SavedCartContext";
import { ThemeProvider } from "@/context/ThemeContext";

const APP_URL = "https://bumper-deals-app.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: "DropVault | Real-Time Deal Intelligence & 90-Day Price Tracker",
  description: "Live Amazon India verified lightning drops, genuine 90-day lowest prices, and 80%+ discount price glitches.",
  applicationName: "DropVault",
  keywords: ["Amazon Deals", "Price Drop", "Loot Deals", "Discounts", "Amazon India", "DropVault", "Price Tracker", "Lightning Deals"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DropVault",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: APP_URL,
    siteName: "DropVault",
    title: "DropVault | Real-Time Deal Intelligence & 90-Day Price Tracker",
    description: "Live Amazon India verified lightning drops, genuine 90-day lowest prices, and 80%+ discount price glitches.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DropVault — Real-Time Deal Intelligence Platform",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DropVault | Real-Time Deal Intelligence & 90-Day Price Tracker",
    description: "Live Amazon India verified lightning drops, genuine 90-day lowest prices, and 80%+ discount price glitches.",
    images: ["/og-image.png"],
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
