import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EchoPrint AI — Анализатор уникальности устройства",
  description: "Образовательный AI-инструмент для анализа fingerprint браузера. Узнайте, насколько ваше устройство уникально в интернете и получите рекомендации по приватности.",
  keywords: ["fingerprint", "browser fingerprint", "privacy", "анонимность", "browser security", "webgl", "canvas fingerprint", "device profiling", "цифровой отпечаток"],
  authors: [{ name: "EchoPrint AI Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "EchoPrint AI — Анализатор уникальности устройства",
    description: "Узнайте, насколько ваше устройство уникально в интернете. Полностью приватный анализ в браузере.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EchoPrint AI",
    description: "Анализатор уникальности и реалистичности браузера",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#7c3aed" />
        <meta name="color-scheme" content="light dark" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
