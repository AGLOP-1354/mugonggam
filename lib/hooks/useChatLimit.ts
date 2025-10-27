import { useState, useEffect } from 'react';
import { guestStorage } from '@/lib/localStorage';
import { useUserStore } from '@/store/userStore';
import { useUIStore } from '@/store/uiStore';

interface UseChatLimitReturn {
  currentCount: number;
  maxCount: number;
  remainingCount: number;
  canChat: boolean;
  hasReachedLimit: boolean;
  incrementChat: () => void;
  resetCount: () => void;
}

export function useChatLimit(): UseChatLimitReturn {
  const [currentCount, setCurrentCount] = useState(0);
  const user = useUserStore(state => state.user);
  const openSignupModal = useUIStore(state => state.openSignupModal);

  const isGuest = !user || user.role === 'guest';
  const maxCount = isGuest ? 5 : Infinity;
  const remainingCount = maxCount - currentCount;
  const canChat = remainingCount > 0;
  const hasReachedLimit = currentCount >= maxCount;

  useEffect(() => {
    if (isGuest) {
      setCurrentCount(guestStorage.getChatCount());
    } else {
      // 회원은 제한 없음
      setCurrentCount(0);
    }
  }, [user, isGuest]);

  const incrementChat = () => {
    if (isGuest) {
      const newCount = guestStorage.incrementChatCount();
      setCurrentCount(newCount);

      // 5회 도달 시 회원가입 모달 표시
      if (newCount >= 5) {
        setTimeout(() => {
          openSignupModal();
        }, 1500); // 응답 애니메이션 후
      }
    }
  };

  const resetCount = () => {
    if (isGuest) {
      guestStorage.resetChatCount();
      setCurrentCount(0);
    }
  };

  return {
    currentCount,
    maxCount,
    remainingCount,
    canChat,
    hasReachedLimit,
    incrementChat,
    resetCount
  };
}
