import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, GuestUser, MemberUser } from '@/types/user';
import { EmpathyMode } from '@/types/chat';
import { APP_CONFIG } from '@/constants/config';
import { guestStorage } from '@/lib/localStorage';

interface UserState {
  user: User | null;

  // 액션
  initGuest: (nickname: string) => void;
  initMember: (nickname: string) => void;
  initMemberFromDB: (userData: MemberUser) => void;
  addExperience: (amount: number) => void;
  incrementChatCount: () => void;
  incrementShareCount: () => void;
  unlockMode: (mode: EmpathyMode) => void;
  signupFromGuest: (memberData: Partial<MemberUser>) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,

      initGuest: (nickname) => {
        const guestUser: GuestUser = {
          id: `guest-${Date.now()}`,
          nickname: nickname || '게스트',
          role: 'guest',
          chatCount: guestStorage.getChatCount(),
          lastUsedAt: new Date(),
          createdAt: new Date()
        };

        guestStorage.setGuestNickname(nickname);
        set({ user: guestUser });
      },

      initMember: (nickname) => {
        const memberUser: MemberUser = {
          id: `member-${Date.now()}`,
          nickname,
          role: 'member',
          level: 1,
          experience: 0,
          totalChats: 0,
          totalShares: 0,
          unlockedModes: ['default', 'bestie', 'mom'],
          currentStreak: 0,
          achievements: [],
          createdAt: new Date()
        };

        set({ user: memberUser });
      },

      initMemberFromDB: (userData) => {
        const memberUser: MemberUser = {
          id: userData.id,
          nickname: userData.nickname,
          role: 'member',
          level: userData.level || 1,
          experience: userData.experience || 0,
          totalChats: userData.totalChats || 0,
          totalShares: userData.totalShares || 0,
          unlockedModes: userData.unlockedModes || ['default', 'bestie', 'mom'],
          currentStreak: userData.currentStreak || 0,
          achievements: userData.achievements || [],
          createdAt: userData.createdAt || new Date()
        };

        set({ user: memberUser });
      },

      signupFromGuest: (memberData) => {
        const currentUser = get().user;
        if (currentUser?.role !== 'guest') return;

        const memberUser: MemberUser = {
          id: `member-${Date.now()}`,
          nickname: currentUser.nickname,
          role: 'member',
          level: 1,
          experience: 0,
          totalChats: currentUser.chatCount, // 비회원 대화 기록 이전
          totalShares: 0,
          unlockedModes: ['default', 'bestie', 'mom'],
          currentStreak: 0,
          achievements: [],
          createdAt: new Date(),
          ...memberData
        };

        guestStorage.resetChatCount(); // 비회원 카운트 초기화
        set({ user: memberUser });
      },

      logout: () => {
        set({ user: null });
        guestStorage.resetChatCount();
      },

      addExperience: (amount) => {
        const user = get().user;
        if (!user || user.role !== 'member') return;

        const memberUser = user as MemberUser;
        const newExp = memberUser.experience + amount;
        const currentLevelInfo = APP_CONFIG.levels.find(l => l.level === memberUser.level);
        const nextLevelInfo = APP_CONFIG.levels.find(l => l.level === memberUser.level + 1);

        let newLevel = memberUser.level;
        if (nextLevelInfo && newExp >= nextLevelInfo.requiredExp) {
          newLevel = memberUser.level + 1;
        }

        set({
          user: {
            ...memberUser,
            experience: newExp,
            level: newLevel
          }
        });
      },

      incrementChatCount: () => {
        const user = get().user;
        if (!user) return;

        if (user.role === 'guest') {
          const newCount = Math.min(user.chatCount + 1, 5);
          set({
            user: {
              ...user,
              chatCount: newCount
            }
          });
        } else if (user.role === 'member') {
          const memberUser = user as MemberUser;
          set({
            user: {
              ...memberUser,
              totalChats: memberUser.totalChats + 1
            }
          });

          get().addExperience(APP_CONFIG.exp.perMessage);
        }
      },

      incrementShareCount: () => {
        const user = get().user;
        if (!user || user.role !== 'member') return;

        const memberUser = user as MemberUser;
        set({
          user: {
            ...memberUser,
            totalShares: memberUser.totalShares + 1
          }
        });

        get().addExperience(APP_CONFIG.exp.perShare);
      },

      unlockMode: (mode) => {
        const user = get().user;
        if (!user || user.role !== 'member') return;

        const memberUser = user as MemberUser;
        if (memberUser.unlockedModes.includes(mode)) return;

        set({
          user: {
            ...memberUser,
            unlockedModes: [...memberUser.unlockedModes, mode]
          }
        });
      }
    }),
    {
      name: 'user-storage'
    }
  )
);
