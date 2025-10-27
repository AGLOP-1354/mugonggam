import { create } from 'zustand';

interface UIState {
  // 모달 상태
  isModeSelectorOpen: boolean;
  isShareModalOpen: boolean;
  isSignupModalOpen: boolean;
  isSignupPromptOpen: boolean;
  isLimitReachedModalOpen: boolean;

  // 애니메이션
  showConfetti: boolean;
  showLevelUpModal: boolean;

  // 액션
  openModeSelector: () => void;
  closeModeSelector: () => void;
  openShareModal: () => void;
  closeShareModal: () => void;
  openSignupModal: () => void;
  closeSignupModal: () => void;
  openSignupPrompt: () => void;
  closeSignupPrompt: () => void;
  openLimitReachedModal: () => void;
  closeLimitReachedModal: () => void;
  triggerConfetti: () => void;
  showLevelUp: () => void;
  hideLevelUp: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isModeSelectorOpen: false,
  isShareModalOpen: false,
  isSignupModalOpen: false,
  isSignupPromptOpen: false,
  isLimitReachedModalOpen: false,
  showConfetti: false,
  showLevelUpModal: false,

  openModeSelector: () => set({ isModeSelectorOpen: true }),
  closeModeSelector: () => set({ isModeSelectorOpen: false }),
  openShareModal: () => set({ isShareModalOpen: true }),
  closeShareModal: () => set({ isShareModalOpen: false }),
  openSignupModal: () => set({ isSignupModalOpen: true }),
  closeSignupModal: () => set({ isSignupModalOpen: false }),
  openSignupPrompt: () => set({ isSignupPromptOpen: true }),
  closeSignupPrompt: () => set({ isSignupPromptOpen: false }),
  openLimitReachedModal: () => set({ isLimitReachedModalOpen: true }),
  closeLimitReachedModal: () => set({ isLimitReachedModalOpen: false }),
  triggerConfetti: () => {
    set({ showConfetti: true });
    setTimeout(() => set({ showConfetti: false }), 5000);
  },
  showLevelUp: () => set({ showLevelUpModal: true }),
  hideLevelUp: () => set({ showLevelUpModal: false })
}));
