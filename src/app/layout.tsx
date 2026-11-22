import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SavedCartProvider } from "@/context/SavedCartContext";
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata: Metadata = {
  title: "BumperDeals.in | Amazon India Deals & Price Glitches",
  description: "Live price drops and bumper deals tracker for Amazon India",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BumperDeals",
  },
};

export const viewport: Viewport = {
  themeColor: "#f59e0b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const saved = localStorage.getItem('bumper-theme');
                if (saved === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {
                document.documentElement.classList.add('dark');
              }
            `,
          }}
        />
      </head>
      <body 
        className="min-h-full flex flex-col bg-slate-950 text-slate-100"
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
