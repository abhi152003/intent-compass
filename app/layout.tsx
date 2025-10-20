import "./buffer-polyfill";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/contexts/Web3Provider";
import { NexusProviderWrapper } from "@/components/NexusProviderWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IntentCompass - Visual Cross-Chain Intent Composer",
  description: "Design, simulate, and execute cross-chain DeFi flows with a visual canvas interface.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Web3Provider>
          <NexusProviderWrapper>
            {children}
          </NexusProviderWrapper>
        </Web3Provider>
      </body>
    </html>
  );
}
