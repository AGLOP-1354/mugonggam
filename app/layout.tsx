import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ToastProvider } from "@/components/ui/Toast";
import SignupModal from "@/components/auth/SignupModal";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "무공감 - 무조건 공감해주는 AI",
  description: "뭐라고 해도 네 편이야. 무적권 공감!",
  keywords: ['유병재', 'chatgpt', '무공감', '공감', 'ai', '무공해']
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <ToastProvider />
        <SignupModal />
      </body>
    </html>
  );
}
