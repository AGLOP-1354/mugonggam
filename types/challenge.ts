/**
 * 데일리 챌린지 시스템 타입 정의
 * PRD 섹션 4.3 - 데일리 챌린지
 */

export type ChallengeType = 'daily' | 'weekly' | 'special';

export interface Challenge {
  id: string;
  type: ChallengeType;
  title: string;
  description: string;
  day_of_week?: number; // 0-6 (일요일-토요일)
  reward_experience: number;
  reward_badge?: string;
  is_active: boolean;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface UserChallenge {
  id: string;
  user_id: string;
  challenge_id: string;
  session_id?: string;
  completed_at: string;
  completion_date: string;
  created_at: string;
  updated_at: string;
}

export interface ChallengeStreak {
  id: string;
  user_id: string;
  current_streak: number;
  max_streak: number;
  last_completed_date?: string;
  created_at: string;
  updated_at: string;
}

export interface TodayChallengeResponse {
  challenge: Challenge;
  is_completed: boolean;
  completed_at?: string;
  streak: {
    current: number;
    max: number;
    last_completed_date?: string;
  };
}

export interface CompleteChallengeRequest {
  challenge_id: string;
  session_id?: string;
}

export interface CompleteChallengeResponse {
  success: boolean;
  reward_experience: number;
  reward_badge?: string;
  new_streak: number;
  is_streak_milestone: boolean; // 7일 연속 완료 등
  message: string;
}
