'use client';

import { motion } from 'framer-motion';

import { useUIStore } from '@/store/uiStore';
import { useUserStore } from '@/store/userStore';
import { useChatLimit } from '@/lib/hooks/useChatLimit';

const SignupPrompt = () => {
  const user = useUserStore(state => state.user);
  const { openSignupModal } = useUIStore();
  const { currentCount } = useChatLimit();

  if (user?.role !== 'guest' || currentCount < 3) {
    return null;
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-gradient-to-r from-primary to-secondary text-white p-4 rounded-2xl shadow-lg mx-4 mb-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-lg mb-1">
            더 많이 대화하고 싶나요? 💬
          </p>
          <p className="text-sm opacity-90">
            회원가입하면 무제한 대화 가능!
          </p>
        </div>
        <button
          onClick={openSignupModal}
          className="px-6 py-2 bg-white text-primary rounded-full font-bold hover:scale-105 active:scale-95 transition-transform whitespace-nowrap ml-4"
        >
          회원가입
        </button>
      </div>
    </motion.div>
  );
};

export default SignupPrompt;
