# Frontend 개발 명세서: 무공감 (웹 버전)

## 📋 문서 정보
- **프로젝트명**: 무공감 Frontend
- **버전**: 1.0
- **기술 스택**: Next.js 14, TypeScript, Tailwind CSS
- **플랫폼**: 웹 (PWA 지원)
- **핵심 전략**: 비회원 5회 제한 → 회원 전환 유도
- **작성일**: 2025년 10월 27일

---

## 1. 기술 스택 및 환경 설정

### 1.1 Core Dependencies
```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "typescript": "^5.3.0",
    "tailwindcss": "^3.4.0",
    "openai": "^4.20.0",
    "zustand": "^4.4.0",
    "react-hot-toast": "^2.4.1",
    "framer-motion": "^11.0.0",
    "html-to-image": "^1.11.11",
    "date-fns": "^3.0.0",
    "react-confetti": "^6.1.0",
    "supabase-js": "^2.39.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/react": "^18.3.0",
    "@types/qrcode": "^1.5.5",
    "eslint": "^8.56.0",
    "eslint-config-next": "^14.2.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}
```

### 1.2 프로젝트 구조
```
mugonggam/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # 랜딩/온보딩 페이지
│   ├── chat/
│   │   └── page.tsx                # 메인 채팅 (비회원 5회 제한)
│   ├── ranking/
│   │   └── page.tsx                # 오늘의 공감 랭킹
│   ├── profile/
│   │   └── page.tsx                # 프로필/레벨
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx           # 로그인 (카카오, 구글)
│   │   └── register/
│   │       └── page.tsx           # 회원가입
│   └── api/
│       ├── chat/
│       │   └── route.ts           # OpenAI API
│       ├── share/
│       │   └── route.ts           # 공유 이미지 생성
│       └── ranking/
│           └── route.ts           # 랭킹 데이터
├── components/
│   ├── chat/
│   │   ├── ChatMessage.tsx        # 메시지 버블
│   │   ├── ChatInput.tsx          # 입력창
│   │   ├── TypingIndicator.tsx    # 타이핑 애니메이션
│   │   ├── ChatCounter.tsx        # 대화 카운터 (1/5)
│   │   ├── LimitReachedModal.tsx  # 5회 제한 종료 모달
│   │   └── ModeSelector.tsx       # 모드 선택 (회원 전용)
│   ├── share/
│   │   ├── ShareButton.tsx        # 공유 버튼
│   │   ├── ShareImageGenerator.tsx # 이미지 생성
│   │   └── ShareModal.tsx          # 공유 모달
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   └── Toast.tsx
│   └── onboarding/
│       ├── OnboardingSlide.tsx    # 온보딩 슬라이드
│       └── GuestCounter.tsx        # 비회원 대화 카운터
│   ├── auth/
│   │   ├── LoginModal.tsx          # 로그인 모달
│   │   └── SignupPrompt.tsx        # 회원가입 유도 배너
│   └── landing/
│       ├── Hero.tsx                # 히어로 섹션
│       └── CTA.tsx                 # CTA 버튼
├── lib/
│   ├── openai.ts                   # OpenAI 설정
│   ├── prompts.ts                   # AI 프롬프트
│   ├── utils.ts                    # 유틸 함수
│   ├── localStorage.ts              # LocalStorage 관리
│   └── hooks/
│       └── useChatLimit.ts         # 5회 제한 훅
├── store/
│   ├── chatStore.ts                # 채팅 상태
│   ├── userStore.ts                # 유저 상태 (회원/비회원)
│   └── uiStore.ts                  # UI 상태
├── types/
│   ├── chat.ts
│   ├── user.ts
│   └── index.ts
└── constants/
    ├── modes.ts                     # 공감 모드 정의
    ├── challenges.ts                # 챌린지 데이터
    └── config.ts                    # 설정값 (5회 제한 등)
```

---

## 2. 핵심 기능: 비회원 5회 제한 시스템

### 2.1 전략 개요
**목적**: 즉시 체험 → FOMO 유발 → 회원가입 전환

**특징**:
- 비회원: 즉시 대화 시작, 최대 5회, 기본 모드만, 공유 가능
- 회원: 무제한 대화, 모든 모드, 레벨 시스템, 대화 저장

### 2.2 types/user.ts (비회원 추가)
```typescript
export interface User {
  id: string;
  nickname: string;
  level: number;
  experience: number;
  totalChats: number;
  totalShares: number;
  createdAt: Date;
  unlockedModes: EmpathyMode[];
  currentStreak: number;
  achievements: Achievement[];
  isGuest: boolean;  // 비회원 여부
}

export interface GuestUser {
  nickname: string;
  chatCount: number;  // 대화 횟수 (0~5)
  lastUsedAt: Date;
}

// 사용자 타입 유니언
export type UserType = User | GuestUser | null;
```

### 2.3 constants/config.ts (5회 제한 설정)
```typescript
export const APP_CONFIG = {
  name: '무공감',
  description: '무조건 공감해주는 AI 친구',
  url: 'https://mugonggam.app',
  
  // 비회원 제한
  guest: {
    maxChats: 5,           // 최대 대화 횟수
    allowedMode: 'default', // 허용된 모드
    storageKey: 'guest-chat-count' // LocalStorage 키
  },
  
  // 레벨 시스템
  levels: [
    { level: 1, name: '새싹', requiredExp: 0, unlocks: ['기본 모드', '절친 모드', '엄마 모드'] },
    { level: 2, name: '친구', requiredExp: 10, unlocks: [] },
    { level: 3, name: '절친', requiredExp: 30, unlocks: ['애인 모드'] },
    { level: 4, name: '단짝', requiredExp: 50, unlocks: [] },
    { level: 5, name: '영혼의 동반자', requiredExp: 100, unlocks: ['밈 모드'] }
  ],
  
  // 경험치
  exp: {
    perMessage: 1,
    perShare: 5,
    perChallenge: 10,
    perInvite: 20
  },
  
  // UI 설정
  ui: {
    maxMessagesDisplay: 50,
    typingDelay: 1000,
    messageAnimationDuration: 300
  },
  
  // 공유 설정
  share: {
    watermarkText: '무공감',
    imageWidth: 1080,
    imageHeight: 1920
  }
};

export const COLOR_SCHEME = {
  primary: '#FF8C42',
  secondary: '#FFD93D',
  background: '#FFF8F0',
  text: '#333333',
  accent: '#FF6B9D',
  
  gradients: {
    primary: 'linear-gradient(135deg, #FF8C42 0%, #FFD93D 100%)',
    warm: 'linear-gradient(135deg, #FF6B9D 0%, #FF8C42 100%)',
    cool: 'linear-gradient(135deg, #FFD93D 0%, #FFF8F0 100%)'
  }
};
```

### 2.4 lib/localStorage.ts
```typescript
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
```

### 2.5 lib/hooks/useChatLimit.ts
```typescript
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
  
  const isGuest = !user || user.isGuest;
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
```

---

## 3. 타입 정의

### 3.1 types/chat.ts
```typescript
export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  mode: EmpathyMode;
}

export type EmpathyMode = 
  | 'default'      // 기본 모드 (비회원/회원 모두)
  | 'bestie'       // 절친 모드 (회원 전용)
  | 'mom'          // 엄마 모드 (회원 전용)
  | 'extreme'      // 애인 모드 (회원 전용, Lv.3+)
  | 'meme';        // 밈 모드 (회원 전용, Lv.5+)

export interface ChatSession {
  id: string;
  messages: Message[];
  currentMode: EmpathyMode;
  createdAt: Date;
  lastUpdatedAt: Date;
  isGuest?: boolean; // 비회원 세션 여부
}

export interface ShareImageOptions {
  messages: Message[];
  backgroundColor: string;
  style: 'kakao' | 'minimal' | 'colorful';
}
```

### 3.2 types/user.ts
```typescript
export type UserRole = 'guest' | 'member';

export interface BaseUser {
  id: string;
  nickname: string;
  role: UserRole;
  createdAt: Date;
}

export interface GuestUser extends BaseUser {
  role: 'guest';
  chatCount: number;  // 0~5
  lastUsedAt: Date;
}

export interface MemberUser extends BaseUser {
  role: 'member';
  level: number;
  experience: number;
  totalChats: number;
  totalShares: number;
  unlockedModes: EmpathyMode[];
  currentStreak: number;
  achievements: Achievement[];
}

export type User = GuestUser | MemberUser;

export interface Achievement {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  unlockedAt: Date;
}

export interface LevelInfo {
  level: number;
  name: string;
  requiredExp: number;
  unlocks: string[];
}
```

---

## 4. Store (상태 관리)

### 4.1 store/userStore.ts (비회원 지원 추가)
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, GuestUser, MemberUser, Achievement } from '@/types/user';
import { EmpathyMode } from '@/types/chat';
import { APP_CONFIG } from '@/constants/config';
import { guestStorage } from '@/lib/localStorage';

interface UserState {
  user: User | null;
  
  // 액션
  initGuest: (nickname: string) => void;
  initMember: (nickname: string) => void;
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
```

### 4.2 store/chatStore.ts
```typescript
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
```

### 4.3 store/uiStore.ts
```typescript
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
```

---

## 5. 컴포넌트 명세

### 5.1 app/page.tsx (랜딩 페이지)
```typescript
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import Hero from '@/components/landing/Hero';
import { useUserStore } from '@/store/userStore';

export default function LandingPage() {
  const router = useRouter();
  const initGuest = useUserStore(state => state.initGuest);
  
  const handleStartAsGuest = () => {
    initGuest('게스트');
    router.push('/chat');
  };
  
  const handleSignup = () => {
    router.push('/auth/register');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-yellow-50">
      <Hero />
      
      <div className="max-w-md mx-auto px-6 pb-12">
        <div className="space-y-4">
          <Button 
            onClick={handleStartAsGuest}
            size="lg"
            className="w-full"
          >
            바로 시작하기 (비회원, 5회 무료)
          </Button>
            
            <Button 
            onClick={handleSignup}
            variant="outline"
              size="lg"
              className="w-full"
            >
            회원가입하고 무제한 대화하기
            </Button>
            
          <div className="text-center text-sm text-gray-600 mt-6">
            <p>🤗 처음이신가요? 비회원으로 먼저 체험해보세요</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 5.2 app/chat/page.tsx (메인 채팅 - 5회 제한)
```typescript
'use client';

import { useEffect, useRef } from 'react';
import { useChatStore } from '@/store/chatStore';
import { useUserStore } from '@/store/userStore';
import { useUIStore } from '@/store/uiStore';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import TypingIndicator from '@/components/chat/TypingIndicator';
import ChatCounter from '@/components/chat/ChatCounter';
import LimitReachedModal from '@/components/chat/LimitReachedModal';
import { ShareButton } from '@/components/share/ShareButton';
import { useChatLimit } from '@/lib/hooks/useChatLimit';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function ChatPage() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { currentSession, isLoading, currentMode, addMessage, setLoading } = useChatStore();
  const { user, incrementChatCount } = useUserStore();
  const { isModeSelectorOpen, showConfetti } = useUIStore();
  const { 
    currentCount, 
    maxCount, 
    canChat, 
    hasReachedLimit, 
    incrementChat 
  } = useChatLimit();
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);
  
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading || !canChat) return;
    
    // 사용자 메시지 추가
    addMessage({
      role: 'user',
      content,
      mode: currentMode
    });
    
    // 비회원 카운트 증가
    incrementChat();
    
    setLoading(true);
    
    try {
      // AI 응답 요청
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          mode: currentMode,
          history: currentSession?.messages.slice(-5) || []
        })
      });
      
      const data = await response.json();
      
      // AI 응답 추가
      addMessage({
        role: 'assistant',
        content: data.response,
        mode: currentMode
      });
      
    } catch (error) {
      console.error('Chat error:', error);
      addMessage({
        role: 'assistant',
        content: '앗! 잠시 문제가 생겼어요. 다시 한번 말씀해주시겠어요? 무적권 공감!',
        mode: currentMode
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <div className="flex flex-col h-screen bg-gradient-to-b from-orange-50 to-yellow-50">
        {/* 헤더 */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
              <h1 className="font-bold text-lg text-gray-800">무공감</h1>
            <span className="text-xs text-gray-500">
              {user?.nickname || '게스트'}
              {user?.role === 'member' && ` · Lv.${(user as any).level}`}
            </span>
          </div>
          
          <ShareButton />
        </header>
        
        {/* 대화 카운터 (비회원만) */}
        {user?.role === 'guest' && (
          <ChatCounter 
            currentCount={currentCount} 
            maxCount={maxCount} 
          />
        )}
        
        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {!currentSession?.messages.length && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">🤗</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                무엇이든 말해봐!
              </h2>
              <p className="text-gray-600">
                무적권 공감해줄게
              </p>
            </motion.div>
          )}
          
          {currentSession?.messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              message={message}
              isLatest={index === currentSession.messages.length - 1}
            />
          ))}
          
          {isLoading && <TypingIndicator />}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* 입력 영역 */}
        <ChatInput 
          onSend={handleSendMessage} 
          disabled={isLoading || !canChat}
          placeholder={
            hasReachedLimit 
              ? '5회 대화 완료! 회원가입하면 계속 대화할 수 있어요' 
              : `무엇을 공감시켜줄까? (${currentCount}/${maxCount})`
          }
        />
      </div>
      
      {/* 5회 제한 도달 모달 */}
      {hasReachedLimit && <LimitReachedModal />}
    </>
  );
}
```

### 5.3 components/chat/ChatCounter.tsx
```typescript
'use client';

import { motion } from 'framer-motion';

interface ChatCounterProps {
  currentCount: number;
  maxCount: number;
}

export default function ChatCounter({ currentCount, maxCount }: ChatCounterProps) {
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
        <span className={`text-sm font-bold ${
          isNearLimit ? 'text-orange-500' : 'text-gray-500'
        }`}>
          {currentCount}/{maxCount}
        </span>
            </div>
      
      {/* 프로그레스 바 */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3 }}
          className={`h-full rounded-full ${
            isNearLimit ? 'bg-orange-500' : 'bg-gradient-to-r from-orange-400 to-yellow-400'
          }`}
        />
      </div>
      
      {/* 3회 후 회원가입 유도 */}
      {currentCount >= 3 && currentCount < maxCount && (
        <div className="mt-2 text-xs text-center text-orange-500">
          💡 더 많은 대화를 원하시나요? 회원가입하면 무제한 대화 가능!
          </div>
        )}
    </motion.div>
  );
}
```

### 5.4 components/chat/LimitReachedModal.tsx
```typescript
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store/uiStore';
import { useUserStore } from '@/store/userStore';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import Confetti from 'react-confetti';

export default function LimitReachedModal() {
  const { closeLimitReachedModal } = useUIStore();
  const signupFromGuest = useUserStore(state => state.signupFromGuest);
  const router = useRouter();
  const { width, height } = useWindowSize();
  
  const handleSignup = () => {
    closeLimitReachedModal();
    router.push('/auth/register');
  };
  
  const handleShare = () => {
    closeLimitReachedModal();
    useUIStore.getState().openShareModal();
  };
  
  return (
    <>
      <Confetti width={width} height={height} />
      
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
            {/* 이모지 */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="text-8xl mb-6"
            >
              🎉
            </motion.div>
            
            {/* 타이틀 */}
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              즐거운 대화였어요!
            </h2>
            
            <p className="text-lg text-gray-600 mb-8">
              5번의 대화를 모두 마쳤어요.<br />
              더 많은 대화를 원하시나요?
            </p>
            
            {/* CTA 버튼 */}
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
                className="text-sm text-gray-500 underline w-full block"
              >
                닫기
              </button>
        </div>
        
            {/* 혜택 안내 */}
            <div className="mt-8 p-4 bg-orange-50 rounded-2xl">
              <p className="text-sm text-gray-700 font-medium mb-2">
                회원가입하면?
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
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
}

function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    setSize({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return size;
}
```

### 5.5 components/chat/ChatInput.tsx (5회 제한 반영)
```typescript
'use client';

import { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message);
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);
  
  return (
    <form onSubmit={handleSubmit} className="bg-white border-t border-gray-200 p-4">
      <div className="flex gap-2 items-end">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || '무엇이든 말해봐...'}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none px-4 py-3 rounded-full border-2 border-gray-200 focus:border-orange-500 outline-none max-h-32 disabled:bg-gray-100 disabled:text-gray-500"
        />
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </form>
  );
}
```

### 5.6 components/auth/SignupPrompt.tsx (회원가입 유도 배너)
```typescript
'use client';

import { motion } from 'framer-motion';
import { useUIStore } from '@/store/uiStore';
import { useUserStore } from '@/store/userStore';
import { useChatLimit } from '@/lib/hooks/useChatLimit';

export default function SignupPrompt() {
  const user = useUserStore(state => state.user);
  const { openSignupModal } = useUIStore();
  const { currentCount } = useChatLimit();
  
  // 비회원이고 3회 이상일 때만 표시
  if (user?.role !== 'guest' || currentCount < 3) {
    return null;
  }
  
  return (
      <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white p-4 rounded-2xl shadow-lg"
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
          className="px-6 py-2 bg-white text-orange-500 rounded-full font-bold hover:scale-105 transition-transform"
      >
          회원가입
      </button>
    </div>
    </motion.div>
  );
}
```

---

## 6. API Routes

### 6.1 app/api/chat/route.ts
```typescript
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { EMPATHY_MODES } from '@/constants/modes';
import { EmpathyMode, Message } from '@/types/chat';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

export async function POST(request: NextRequest) {
  try {
    const { message, mode, history } = await request.json();
    
    const modeConfig = EMPATHY_MODES[mode as EmpathyMode];
    
    // 대화 히스토리 포맷팅
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: modeConfig.systemPrompt
      },
      ...history.map((msg: Message) => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ];
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.9,
      max_tokens: 500
    });
    
    const response = completion.choices[0].message.content;
    
    return NextResponse.json({ response });
    
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: 'AI 응답 생성 실패' },
      { status: 500 }
    );
  }
}
```

---

## 7. Tailwind 설정

### tailwind.config.ts
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF8C42',
        secondary: '#FFD93D',
        background: '#FFF8F0',
        accent: '#FF6B9D',
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
      }
    },
  },
  plugins: [],
};

export default config;
```

---

## 8. 환경 변수

### .env.local
```
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 9. 개발 우선순위

### Phase 1: MVP (Week 1)
1. ✅ 랜딩 페이지 (비회원 시작)
2. ✅ 비회원 5회 제한 시스템
3. ✅ 메인 채팅 인터페이스
4. ✅ OpenAI API 연동
5. ✅ 5회 도달 모달
6. ✅ 회원가입 유도 UI

### Phase 2: 회원 기능 (Week 2)
1. ✅ 회원가입 플로우
2. ✅ 모드 선택 (회원 전용)
3. ✅ 레벨 시스템
4. ✅ 경험치 시스템
5. ✅ 공유 이미지 생성

### Phase 3: 추가 기능 (Week 3+)
1. 오늘의 공감 랭킹
2. 데일리 챌린지
3. 친구 초대
4. 밈 생성기

---

## 10. 핵심 구현 사항

### 10.1 비회원 플로우
1. 랜딩 → "바로 시작하기" 클릭
2. LocalStorage에 카운트 저장
3. 1~5회 대화 가능
4. 3회 후 회원가입 유도 표시
5. 5회 완료 시 모달 팝업
6. 회원가입 또는 공유 선택

### 10.2 회원 전환
- 비회원 → 회원가입 시:
  - 대화 기록 유지
  - 카운트 초기화
  - 모든 모드 해금 (Lv.1 기준)
  - 레벨 시스템 시작

### 10.3 UX 최적화
- 즉시 체험 가능하도록 진입 장벽 최소화
- FOMO 유발: 5회 후 갑자기 끊김
- 명확한 가치 제안: "회원가입하면..."
- 공유 기능: 바이럴 확산
