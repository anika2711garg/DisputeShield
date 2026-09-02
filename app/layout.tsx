import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Toaster } from "sonner";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: {
    default: "DisputeShield — AI chargeback investigation",
    template: "%s · DisputeShield",
  },
  description:
    "DisputeShield investigates Razorpay payment disputes, assembles merchant evidence and recommends the safest response — while keeping every financial decision human-approved.",
  icons: { icon: "/favicon.svg", apple: "/brand-logo.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          {children}
          <Toaster theme="system" position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
