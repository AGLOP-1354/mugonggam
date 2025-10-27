'use client';

import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';

interface ChatCounterProps {
  currentCount: number;
  maxCount: number;
}

const ChatCounter = ({ currentCount, maxCount }: ChatCounterProps) => {
  const percentage = (currentCount / maxCount) * 100;
  const isNearLimit = currentCount >= 3;

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white border-b border-gray-200 px-4 py-3"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          대화 횟수
        </span>
        <span className={cn(
          'text-sm font-bold',
          isNearLimit ? 'text-primary' : 'text-gray-500'
        )}>
          {currentCount}/{maxCount}
        </span>
      </div>

      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3 }}
          className={cn(
            'h-full rounded-full',
            isNearLimit ? 'bg-primary' : 'bg-gradient-to-r from-primary to-secondary'
          )}
        />
      </div>

      {currentCount >= 3 && currentCount < maxCount && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-xs text-center text-primary"
        >
          💡 더 많은 대화를 원하시나요? 회원가입하면 무제한 대화 가능!
        </motion.div>
      )}
    </motion.div>
  );
};

export default ChatCounter;
