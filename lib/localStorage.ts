const STORAGE_KEYS = {
  guestChatCount: 'guest-chat-count',
  guestNickname: 'guest-nickname',
  lastUsedAt: 'guest-last-used'
};

export const guestStorage = {
  getChatCount: (): number => {
    if (typeof window === 'undefined') return 0;
    const count = localStorage.getItem(STORAGE_KEYS.guestChatCount);
    return count ? parseInt(count, 10) : 0;
  },

  incrementChatCount: (): number => {
    if (typeof window === 'undefined') return 0;
    const currentCount = guestStorage.getChatCount();
    const newCount = Math.min(currentCount + 1, 5);
    localStorage.setItem(STORAGE_KEYS.guestChatCount, newCount.toString());
    return newCount;
  },

  resetChatCount: () => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.guestChatCount, '0');
  },

  getGuestNickname: (): string => {
    if (typeof window === 'undefined') return '게스트';
    return localStorage.getItem(STORAGE_KEYS.guestNickname) || '게스트';
  },

  setGuestNickname: (nickname: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.guestNickname, nickname);
  },

  hasReachedLimit: (): boolean => {
    return guestStorage.getChatCount() >= 5;
  },

  canChat: (): boolean => {
    return guestStorage.getChatCount() < 5;
  }
};
