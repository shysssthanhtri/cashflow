import "./globals.css";

import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Geist_Mono, Instrument_Sans } from "next/font/google";
import { Suspense } from "react";

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cashflow",
  description: "Family money tracker",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${instrumentSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Suspense
          fallback={
            <div
              aria-busy="true"
              className="mx-auto mt-24 h-8 w-48 animate-pulse rounded-lg bg-muted"
            />
          }
        >
          {children}
        </Suspense>
        <SpeedInsights />
      </body>
    </html>
  );
}
