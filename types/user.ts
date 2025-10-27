import { EmpathyMode } from './chat';

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
