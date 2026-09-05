import type { Metadata } from "next";
import { Caveat, IBM_Plex_Mono, Newsreader, Source_Sans_3 } from "next/font/google";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Toaster } from "sonner";
import "./globals.css";

const display = Newsreader({ subsets: ["latin"], variable: "--font-display", style: ["normal", "italic"] });
const body = Source_Sans_3({ subsets: ["latin"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400", "500"] });
const hand = Caveat({ subsets: ["latin"], variable: "--font-hand", weight: ["500", "600", "700"] });

export const metadata: Metadata = {
  title: {
    default: "DisputeShield — AI chargeback investigation",
    template: "%s · DisputeShield",
  },
  description:
    "DisputeShield investigates Razorpay payment disputes, assembles merchant evidence and recommends the safest response — while keeping every financial decision human-approved.",
  icons: { icon: "/favicon.svg", apple: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${display.variable} ${body.variable} ${mono.variable} ${hand.variable} antialiased`}>
        <ThemeProvider>
          {children}
          <Toaster theme="system" position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
