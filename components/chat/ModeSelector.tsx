'use client';

import { X, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useUIStore } from '@/store/uiStore';
import { useChatStore } from '@/store/chatStore';
import { useUserStore } from '@/store/userStore';
import { EMPATHY_MODES, MODE_LEVEL_REQUIREMENTS } from '@/constants/modes';
import { EmpathyMode } from '@/types/chat';
import { Button } from '@/components/ui/Button';

const ModeSelector = () => {
  const { isModeSelectorOpen, closeModeSelector, openSignupModal } = useUIStore();
  const { currentMode, changeMode } = useChatStore();
  const { user } = useUserStore();

  const handleModeSelect = (mode: EmpathyMode) => {
    if (user?.role === 'guest' && mode !== 'default') {
      closeModeSelector();
      openSignupModal();
      return;
    }

    if (user?.role === 'member') {
      const memberUser = user;
      const requiredLevel = MODE_LEVEL_REQUIREMENTS[mode];

      if (memberUser.level < requiredLevel) {
        return;
      }
    }

    changeMode(mode);
    closeModeSelector();
  };

  const isModeUnlocked = (mode: EmpathyMode): boolean => {
    if (user?.role === 'guest') {
      return mode === 'default';
    }

    if (user?.role === 'member') {
      const memberUser = user;
      const requiredLevel = MODE_LEVEL_REQUIREMENTS[mode];
      return memberUser.level >= requiredLevel;
    }

    return false;
  };

  if (!isModeSelectorOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
        onClick={closeModeSelector}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9 }}
          className="bg-white rounded-3xl p-6 max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              어떤 공감을 원해?
            </h2>
            <button
              onClick={closeModeSelector}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="space-y-3">
            {Object.values(EMPATHY_MODES).map((mode) => {
              const isUnlocked = isModeUnlocked(mode.id);
              const isSelected = currentMode === mode.id;
              const requiredLevel = MODE_LEVEL_REQUIREMENTS[mode.id];

              return (
                <motion.button
                  key={mode.id}
                  onClick={() => handleModeSelect(mode.id)}
                  disabled={!isUnlocked}
                  whileHover={isUnlocked ? { scale: 1.02 } : undefined}
                  whileTap={isUnlocked ? { scale: 0.98 } : undefined}
                  className={`
                    w-full p-4 rounded-2xl border-2 transition-all text-left
                    ${isSelected
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 bg-white hover:border-orange-300'
                    }
                    ${!isUnlocked && 'opacity-50 cursor-not-allowed'}
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{mode.icon}</span>
                        <h3 className="font-bold text-gray-800">
                          {mode.name}
                        </h3>
                        {!isUnlocked && (
                          <Lock className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {mode.description}
                      </p>
                      {!isUnlocked && (
                        <p className="text-xs text-orange-500 mt-2">
                          Lv.{requiredLevel}부터 사용 가능
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <div className="ml-3">
                        <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {user?.role === 'guest' && (
            <div className="mt-6 p-4 bg-orange-50 rounded-2xl">
              <p className="text-sm text-gray-700 font-medium mb-2">
                💡 더 다양한 공감을 원하시나요?
              </p>
              <p className="text-xs text-gray-600 mb-3">
                회원가입하면 5가지 모드를 모두 사용할 수 있어요!
              </p>
              <Button
                onClick={() => {
                  closeModeSelector();
                  openSignupModal();
                }}
                size="sm"
                className="w-full"
              >
                회원가입하고 모든 모드 사용하기
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ModeSelector;
