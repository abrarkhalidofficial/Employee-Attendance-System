import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TimeTrack - Employee Time & Leave Tracker",
  description:
    "Comprehensive employee time tracking and leave management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <ConvexClientProvider>
          <SessionProvider>
            {children}
            <Analytics />
          </SessionProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
