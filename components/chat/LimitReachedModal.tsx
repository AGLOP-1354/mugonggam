'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Confetti from 'react-confetti';

import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/ui/Button';

const LimitReachedModal = () => {
  const isOpen = useUIStore(state => state.isLimitReachedModalOpen);
  const closeLimitReachedModal = useUIStore(state => state.closeLimitReachedModal);
  const openShareModal = useUIStore(state => state.openShareModal);
  const router = useRouter();
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    
    if (typeof window !== 'undefined') {
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const handleSignup = () => {
    closeLimitReachedModal();
    router.push('/auth/register');
  };

  const handleShare = () => {
    closeLimitReachedModal();
    openShareModal();
  };

  if (!isOpen) return null;

  return (
    <>
      <Confetti
        width={windowSize.width}
        height={windowSize.height}
        recycle={false}
        numberOfPieces={200}
      />

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
          onClick={closeLimitReachedModal}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="text-8xl mb-6"
            >
              🎉
            </motion.div>

            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              즐거운 대화였어요!
            </h2>

            <p className="text-lg text-gray-600 mb-8">
              5번의 대화를 모두 마쳤어요.<br />
              더 많은 대화를 원하시나요?
            </p>

            <div className="space-y-3">
              <Button
                onClick={handleSignup}
                size="lg"
                className="w-full"
              >
                회원가입하고 계속 대화하기
              </Button>

              <Button
                onClick={handleShare}
                variant="outline"
                size="lg"
                className="w-full"
              >
                대화 내용 공유하기
              </Button>

              <button
                onClick={closeLimitReachedModal}
                className="text-sm text-gray-500 underline w-full block hover:text-gray-700"
              >
                닫기
              </button>
            </div>

            <div className="mt-8 p-4 bg-orange-50 rounded-2xl">
              <p className="text-sm text-gray-700 font-medium mb-2">
                회원가입하면?
              </p>
              <ul className="text-sm text-gray-600 space-y-1 text-left">
                <li>✅ 무제한 대화</li>
                <li>✅ 5가지 공감 모드</li>
                <li>✅ 레벨 시스템</li>
                <li>✅ 대화 저장</li>
              </ul>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default LimitReachedModal;
