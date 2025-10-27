'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { initMember, signupFromGuest, user } = useUserStore();

  useEffect(() => {
    // OAuth 콜백 후 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // 이미 로그인된 경우
        const nickname = session.user.user_metadata.full_name ||
                        session.user.user_metadata.name ||
                        session.user.email?.split('@')[0] ||
                        '사용자';

        if (user?.role === 'guest') {
          signupFromGuest({ nickname });
        } else {
          initMember(nickname);
        }

        toast.success('로그인 성공! 🎉');
        router.push('/chat');
      }
    });

    // 인증 상태 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const nickname = session.user.user_metadata.full_name ||
                        session.user.user_metadata.name ||
                        session.user.email?.split('@')[0] ||
                        '사용자';

        if (user?.role === 'guest') {
          signupFromGuest({ nickname });
        } else {
          initMember(nickname);
        }

        toast.success('로그인 성공! 🎉');
        router.push('/chat');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, initMember, signupFromGuest, user]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('구글 로그인 실패');
      setIsLoading(false);
    }
  };

  const handleKakaoLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Kakao login error:', error);
      toast.error('카카오 로그인 실패');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-yellow-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
      >
        {/* 로고 */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🤗</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">무공감</h1>
          <p className="text-gray-600">무조건 공감해주는 AI 친구</p>
        </div>

        {/* 소셜 로그인 */}
        <div className="space-y-3">
          {/* 구글 로그인 */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {isLoading ? '로그인 중...' : '구글로 시작하기'}
          </button>

          {/* 카카오 로그인 */}
          <button
            onClick={handleKakaoLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-medium text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#FEE500' }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3C6.5 3 2 6.58 2 11c0 2.95 2.05 5.53 5.13 6.86-.2.77-.77 2.88-.89 3.33 0 0-.05.16.08.22.13.06.29.04.29.04.38-.05 4.42-2.93 5.13-3.45.42.06.85.09 1.26.09 5.5 0 10-3.58 10-8S17.5 3 12 3z"/>
            </svg>
            {isLoading ? '로그인 중...' : '카카오로 시작하기'}
          </button>
        </div>

        {/* 혜택 안내 */}
        <div className="mt-8 p-4 bg-orange-50 rounded-2xl">
          <p className="text-sm text-gray-700 font-medium mb-2">
            회원가입하면?
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>✅ 무제한 대화</li>
            <li>✅ 5가지 공감 모드</li>
            <li>✅ 레벨 시스템</li>
            <li>✅ 대화 저장</li>
          </ul>
        </div>

        {/* 뒤로가기 */}
        <button
          onClick={() => router.back()}
          className="w-full text-sm text-gray-500 underline mt-6 hover:text-gray-700"
        >
          뒤로가기
        </button>
      </motion.div>
    </div>
  );
}
