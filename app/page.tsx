'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/Button';
import Hero from '@/components/landing/Hero';
import About from '@/components/landing/About';
import YouTubeSection from '@/components/landing/YouTubeSection';
import Footer from '@/components/landing/Footer';
import { useUserStore } from '@/store/userStore';

export default function LandingPage() {
  const router = useRouter();
  const initGuest = useUserStore(state => state.initGuest);

  const handleStartAsGuest = () => {
    initGuest('게스트');
    router.push('/chat');
  };

  const handleSignup = () => {
    router.push('/auth/register');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-yellow-50">
      <Hero />

      <About />

      <YouTubeSection />

      <div className="max-w-md mx-auto px-6 py-12">
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
      </div>

      <Footer />
    </div>
  );
}
