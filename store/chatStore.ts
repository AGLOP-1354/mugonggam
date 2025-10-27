import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { Message, EmpathyMode, ChatSession } from '@/types/chat';

import { useUserStore } from './userStore';

interface ChatState {
  currentSession: ChatSession | null;
  isLoading: boolean;
  currentMode: EmpathyMode;

  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  setLoading: (loading: boolean) => void;
  changeMode: (mode: EmpathyMode) => void;
  clearChat: () => void;
  createNewSession: () => void;
  canUseMode: (mode: EmpathyMode) => boolean;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => {
      const getUser = () => useUserStore.getState().user;

      return {
        currentSession: null,
        isLoading: false,
        currentMode: 'default',

        addMessage: (message) => {
          const newMessage: Message = {
            ...message,
            id: crypto.randomUUID(),
            timestamp: new Date()
          };

          set((state) => ({
            currentSession: state.currentSession
              ? {
                  ...state.currentSession,
                  messages: [...state.currentSession.messages, newMessage],
                  lastUpdatedAt: new Date()
                }
              : {
                  id: crypto.randomUUID(),
                  messages: [newMessage],
                  currentMode: state.currentMode,
                  createdAt: new Date(),
                  lastUpdatedAt: new Date(),
                  isGuest: getUser()?.role === 'guest'
                }
          }));

          // 사용자 대화 횟수 증가
          useUserStore.getState().incrementChatCount();
        },

        setLoading: (loading) => set({ isLoading: loading }),

        changeMode: (mode) => {
          // 비회원은 기본 모드만 가능
          if (getUser()?.role === 'guest' && mode !== 'default') {
            return;
          }
          set({ currentMode: mode });
        },

        canUseMode: (mode: EmpathyMode) => {
          const user = getUser();
          if (user?.role !== 'member') {
            return mode === 'default';
          }

          const memberUser = user;
          return memberUser.unlockedModes.includes(mode);
        },

        clearChat: () => set({ currentSession: null }),

        createNewSession: () => {
          const user = getUser();
          set({
            currentSession: {
              id: crypto.randomUUID(),
              messages: [],
              currentMode: get().currentMode,
              createdAt: new Date(),
              lastUpdatedAt: new Date(),
              isGuest: user?.role === 'guest'
            }
          });
        }
      };
    },
    {
      name: 'chat-storage'
    }
  )
);
