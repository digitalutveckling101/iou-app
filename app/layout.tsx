import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "IOU - Skulder & Lån",
  description: "Håll koll på dina skulder och lån",
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'IOU',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#7c3aed',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="sv">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
