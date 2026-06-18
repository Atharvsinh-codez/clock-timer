import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const siteUrl = new URL("https://timex.athrix.me");
const authorName = "Atharvsinh Jadav";
const authorUrl = "https://athrix.me";
const xProfileUrl = "https://x.com/athrix_codes";
const siteTitle = "TimeX - Visual Clock, Timer, and Stopwatch";
const siteDescription =
  "TimeX is a clean visual clock, countdown timer, and stopwatch with a smooth progress bar, custom durations, and fullscreen focus mode.";
const ogImage = {
  url: "/OG-img-TimeX.jpg",
  width: 3840,
  height: 2560,
  alt: "TimeX visual clock, timer, and stopwatch interface",
};
const twitterImage = {
  url: "/twitter-image-TimeX.jpg",
  width: 1200,
  height: 600,
  alt: ogImage.alt,
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: siteTitle,
    template: "%s | TimeX",
  },
  description: siteDescription,
  applicationName: "TimeX",
  authors: [{ name: authorName, url: authorUrl }],
  creator: authorName,
  publisher: authorName,
  keywords: [
    "TimeX",
    "visual timer",
    "focus timer",
    "study timer",
    "countdown timer",
    "stopwatch",
    "clock",
    "productivity timer",
    "fullscreen timer",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "TimeX",
    title: siteTitle,
    description: siteDescription,
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    site: "@athrix_codes",
    creator: "@athrix_codes",
    images: [twitterImage],
  },
  other: {
    "author:portfolio": authorUrl,
    "author:x-profile": xProfileUrl,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    title: "TimeX",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overscroll-y-none">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
