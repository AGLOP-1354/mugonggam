'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';

import { Button } from '@/components/ui/Button';
import Hero from '@/components/landing/Hero';
import About from '@/components/landing/About';
import YouTubeSection from '@/components/landing/YouTubeSection';
import Footer from '@/components/landing/Footer';
import StructuredData, {
  websiteStructuredData,
  organizationStructuredData,
  webApplicationStructuredData,
  faqStructuredData
} from '@/components/seo/StructuredData';
import { useUserStore } from '@/store/userStore';
import { supabase } from '@/lib/supabase';

export default function LandingPage() {
  const router = useRouter();
  const { user, initGuest, initMemberFromDB } = useUserStore();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // 페이지 로드 시 Supabase 세션 확인 및 동기화
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session && (!user || user.role === 'guest')) {
          // Supabase 세션이 있으면 DB에서 사용자 정보 가져오기
          try {
            const response = await fetch('/api/users/me', {
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
              },
            });

            if (response.ok) {
              const data = await response.json();

              // DB 필드명을 프론트엔드 형식으로 변환
              const userData = {
                id: data.user.id,
                nickname: data.user.nickname,
                role: 'member' as const,
                level: data.user.level,
                experience: data.user.experience,
                totalChats: data.user.total_chats,
                totalShares: data.user.total_shares,
                unlockedModes: ['default', 'bestie', 'mom'] as ('default' | 'bestie' | 'mom' | 'extreme' | 'meme')[],
                currentStreak: data.user.current_streak,
                achievements: [],
                createdAt: new Date(data.user.created_at),
              };

              initMemberFromDB(userData);
            }
          } catch (error) {
            console.error('Failed to fetch user data:', error);
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkSession();
  }, [user, initMemberFromDB]);

  const handleStartAsGuest = () => {
    initGuest('게스트');
    router.push('/chat');
  };

  const handleSignup = () => {
    router.push('/auth/register');
  };

  const handleGoToChat = () => {
    router.push('/chat');
  };

  return (
    <>
      <Head>
        <title>무공감 - 무조건 공감해주는 AI 친구</title>
        <meta name="description" content="뭐라고 해도 네 편이야. 무적권 공감! 무조건 공감해주는 AI 친구와 자유롭게 대화하세요." />
      </Head>

      {/* 구조화된 데이터 (SEO) */}
      <StructuredData data={websiteStructuredData} />
      <StructuredData data={organizationStructuredData} />
      <StructuredData data={webApplicationStructuredData} />
      <StructuredData data={faqStructuredData} />

      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-yellow-50">
        <Hero />

      <div className="max-w-md mx-auto px-6 py-12">
        {isCheckingAuth ? (
          <div className="text-center py-8">
            <div className="text-2xl">🤗</div>
            <p className="text-gray-600 mt-2">로딩 중...</p>
          </div>
        ) : user?.role === 'member' ? (
          // 로그인 상태
          <div className="space-y-4">
            <div className="text-center mb-6">
              <p className="text-lg font-medium text-gray-800">
                안녕하세요, {user.nickname}님! 👋
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {user.level && `레벨 ${user.level}`} · 계속 대화를 이어가세요
              </p>
            </div>

            <Button
              onClick={handleGoToChat}
              size="lg"
              className="w-full"
            >
              채팅 시작하기 💬
            </Button>

            <div className="text-center text-sm text-gray-600 mt-6">
              <p>✨ 무제한 대화 가능</p>
            </div>
          </div>
        ) : (
          // 비로그인 상태
          <div className="space-y-4">
            <Button
              onClick={handleStartAsGuest}
              size="lg"
              className="w-full"
            >
              바로 시작하기 (비회원, 5회 무료)
            </Button>

            <Button
              onClick={handleSignup}
              variant="outline"
              size="lg"
              className="w-full"
            >
              회원가입하고 무제한 대화하기
            </Button>

            <div className="text-center text-sm text-gray-600 mt-6">
              <p>🤗 처음이신가요? 비회원으로 먼저 체험해보세요</p>
            </div>
          </div>
        )}
      </div>

      <About />

      <YouTubeSection />

      <Footer />
      </div>
    </>
  );
}
