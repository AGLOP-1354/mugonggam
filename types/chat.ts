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
