export interface RankingItem {
  id: string;
  date: string;
  content: string;
  share_count: number;
  session_id: string;
  created_at: string;
  updated_at: string;
}

export interface Share {
  id: string;
  user_id: string | null;
  session_id: string;
  share_url: string | null;
  image_url: string | null;
  platform: string | null;
  share_count: number;
  created_at: string;
  updated_at: string;
}

export interface RankingResponse {
  rankings: RankingItem[];
  date: string;
  total: number;
}

export type RankingPeriod = 'today' | 'week' | 'month';
