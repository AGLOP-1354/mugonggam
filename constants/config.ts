import { LevelInfo } from '@/types/user';

export const APP_CONFIG = {
  name: '무공감',
  description: '무조건 공감해주는 AI 친구',
  url: 'https://mugonggam.app',

  // 비회원 제한
  guest: {
    maxChats: 5,           // 최대 대화 횟수
    allowedMode: 'default' as const, // 허용된 모드
    storageKey: 'guest-chat-count' // LocalStorage 키
  },

  // 레벨 시스템
  levels: [
    { level: 1, name: '새싹', requiredExp: 0, unlocks: ['기본 모드', '절친 모드', '엄마 모드'] },
    { level: 2, name: '친구', requiredExp: 10, unlocks: [] },
    { level: 3, name: '절친', requiredExp: 30, unlocks: ['애인 모드'] },
    { level: 4, name: '단짝', requiredExp: 50, unlocks: [] },
    { level: 5, name: '영혼의 동반자', requiredExp: 100, unlocks: ['밈 모드'] }
  ] as LevelInfo[],

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
