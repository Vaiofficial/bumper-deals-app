import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SavedCartProvider } from "@/context/SavedCartContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Analytics } from "@vercel/analytics/next";

const APP_URL = "https://bumper-deals-app.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "DropVault | Live Amazon India Deals, Discount Offers, Coupons & Price Drop Tracker",
    template: "%s | DropVault Deals",
  },
  description: "Discover verified Amazon India deals today, 80%+ price glitch loot drops, discount coupons, and lightning offers. Track 90-day price history to verify genuine lowest prices before shopping.",
  applicationName: "DropVault",
  authors: [{ name: "DropVault Intelligence Team" }],
  generator: "Next.js",
  keywords: [
    "Amazon deals",
    "Amazon offers today",
    "Amazon India discounts",
    "online shopping offers",
    "discount coupons",
    "Amazon promo codes",
    "price drop alert",
    "loot deals",
    "price glitch deals",
    "lightning deals Amazon",
    "80% off deals",
    "lowest price tracker",
    "shopping deals India",
    "bank discount offers",
    "best electronics deals",
    "mobile phone discounts",
    "Amazon coupon code",
    "price history tracker India",
    "DropVault deals"
  ],
  alternates: {
    canonical: APP_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
    title: "DropVault | Live Amazon India Deals, Discount Offers & 90-Day Price Tracker",
    description: "Discover verified Amazon India deals today, 80%+ price glitch loot drops, discount coupons, and lightning offers. Track 90-day price history to verify genuine lowest prices.",
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
    title: "DropVault | Live Amazon India Deals, Discount Offers & 90-Day Price Tracker",
    description: "Discover verified Amazon India deals today, 80%+ price glitch loot drops, discount coupons, and lightning offers.",
    images: ["/og-image.png"],
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "DropVault",
  alternateName: ["DropVault Deals", "Bumper Deals", "DropVault India"],
  url: APP_URL,
  description: "Live Amazon India verified lightning drops, discount offers, coupons, and 90-day price tracker.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${APP_URL}/?search={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  }
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "DropVault",
  url: APP_URL,
  logo: `${APP_URL}/icon-512.png`,
  sameAs: [
    "https://twitter.com",
    "https://t.me"
  ]
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Where can I find the best Amazon India deals, coupons, and discount offers?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "DropVault scans over 2,000 Amazon India products across electronics, fashion, home, and daily essentials hourly, curating verified price drops, coupons, and lightning offers in real time."
      }
    },
    {
      "@type": "Question",
      name: "How does DropVault detect Amazon price glitches and 80%+ discount drops?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Our deal intelligence engine monitors price changes against historical MSRP and previous 90-day pricing patterns. When genuine seller errors or deep price drops occur, they are instantly spotlighted under the 80%+ Glitch filter."
      }
    },
    {
      "@type": "Question",
      name: "How does the 90-day price history tracker verify real discounts?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Every deal on DropVault features an interactive 90-day price graph. You can inspect the lowest, highest, and median prices over 30, 60, and 90 days to confirm the item is truly at its all-time lowest price before buying."
      }
    },
    {
      "@type": "Question",
      name: "Can I combine bank discounts, exchange offers, and coupons on Amazon?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! DropVault tracks instant bank card discounts (HDFC, ICICI, SBI, Axis), Amazon check-box coupons, and exchange offers to calculate your effective lowest final price."
      }
    }
  ]
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
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('bumper-theme');if(t==='dark'){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}`,
          }}
        />
        <meta name="referrer" content="no-referrer" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        {/* Schema.org Structured Data for Search Engines */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
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
        <Analytics />
      </body>
    </html>
  );
}
