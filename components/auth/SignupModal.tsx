'use client';

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/ui/Button';

const SignupModal = () => {
  const { isSignupModalOpen, closeSignupModal } = useUIStore();
  const router = useRouter();

  if (!isSignupModalOpen) return null;

  const handleSignup = () => {
    closeSignupModal();
    router.push('/auth/register');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
        onClick={closeSignupModal}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9 }}
          className="bg-white rounded-3xl p-8 max-w-md w-full text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-6xl mb-4">
            🔒
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            회원 전용 기능이에요
          </h2>

          <p className="text-gray-600 mb-8">
            회원가입하면 더 많은 기능을 사용할 수 있어요!
          </p>

          <div className="bg-orange-50 rounded-2xl p-6 mb-8 text-left">
            <p className="font-semibold text-gray-800 mb-4">
              회원가입하면?
            </p>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">✅</span>
                <span><strong>무제한 대화</strong> - 5회 제한 없이 무한으로!</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">✅</span>
                <span><strong>5가지 공감 모드</strong> - 기본/절친/엄마/애인/밈</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">✅</span>
                <span><strong>레벨 시스템</strong> - 대화할수록 성장해요</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">✅</span>
                <span><strong>대화 저장</strong> - 언제든 다시 볼 수 있어요</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleSignup}
              size="lg"
              className="w-full"
            >
              회원가입하기
            </Button>
            <button
              onClick={closeSignupModal}
              className="text-sm text-gray-500 underline w-full block hover:text-gray-700"
            >
              나중에 하기
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SignupModal;
