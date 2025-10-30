import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CookiesProvider } from "next-client-cookies/server";
import { ThemeProvider } from "@/ui/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "react-loading-skeleton/dist/skeleton.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EduChain",
  description: "EduChain - Empowering Education through Blockchain",
  category: "education",
  keywords: [
    "EduChain",
    "Education",
    "Blockchain",
    "Decentralized Learning",
    "Digital Credentials",
    "Smart Contracts",
    "E-Learning",
    "Online Education",
    "Education Technology",
    "Learning Management System",
  ],
  metadataBase: new URL(
    "https://edu-chain-fit-1045-high-distinction.vercel.app"
  ),
  openGraph: {
    title: "EduChain",
    description: "EduChain - Empowering Education through Blockchain",
    url: "https://edu-chain-fit-1045-high-distinction.vercel.app",
    siteName: "EduChain",
    images: [
      {
        url: "https://edu-chain-fit-1045-high-distinction.vercel.app/logo.png",
        width: 1200,
        height: 630,
        alt: "EduChain Open Graph Image",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EduChain",
    description: "EduChain - Empowering Education through Blockchain",
    images: [
      "https://edu-chain-fit-1045-high-distinction.vercel.app/EduChain.png",
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <CookiesProvider>{children}</CookiesProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
