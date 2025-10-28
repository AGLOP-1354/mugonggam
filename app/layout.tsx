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
  metadataBase: new URL('https://mugonggam.vercel.app/'),
  title: {
    default: "무공감 - 무조건 공감해주는 AI 친구",
    template: "%s | 무공감"
  },
  description: "뭐라고 해도 네 편이야. 무적권 공감! 무조건 공감해주는 AI 친구와 자유롭게 대화하세요. 일상, 고민, 허언까지 모두 공감해드립니다.",
  keywords: [
    '무공감',
    '무조건공감',
    'AI친구',
    'AI챗봇',
    '공감챗봇',
    '감정공유',
    '고민상담',
    '무조건공감AI',
    '유병재',
    'chatgpt',
    '무공해',
    '온라인상담',
    '감정케어',
    'AI대화',
    '무료챗봇'
  ],
  authors: [{ name: '무공감' }],
  creator: '무공감',
  publisher: '무공감',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://mugonggam.vercel.app/',
    siteName: '무공감',
    title: '무공감 - 무조건 공감해주는 AI 친구',
    description: '뭐라고 해도 네 편이야. 무적권 공감! 무조건 공감해주는 AI와 자유롭게 대화하세요.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '무공감 - 무조건 공감해주는 AI',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '무공감 - 무조건 공감해주는 AI 친구',
    description: '뭐라고 해도 네 편이야. 무적권 공감!',
    images: ['/og-image.png'],
    creator: '@mugonggam',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  verification: {
    google: 'google-site-verification-code', // Google Search Console에서 받은 코드로 교체
  },
  alternates: {
    canonical: 'https://mugonggam.vercel.app/',
  },
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
