-- ============================================
-- Migration: Add Daily Challenge System
-- Created: 2025-10-28
-- Description: 데일리 챌린지 시스템을 위한 테이블 생성
-- ============================================

-- ============================================
-- 1. challenges 테이블 생성
-- ============================================
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'daily' CHECK (type IN ('daily', 'weekly', 'special')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  day_of_week INT CHECK (day_of_week >= 0 AND day_of_week <= 6),
  reward_experience INT DEFAULT 10,
  reward_badge TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  icon TEXT DEFAULT '🎯',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_challenges_type ON challenges(type);
CREATE INDEX IF NOT EXISTS idx_challenges_day_of_week ON challenges(day_of_week);
CREATE INDEX IF NOT EXISTS idx_challenges_is_active ON challenges(is_active);

-- ============================================
-- 2. user_challenges 테이블 생성
-- ============================================
CREATE TABLE IF NOT EXISTS user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  session_id UUID REFERENCES chat_sessions(id) ON DELETE SET NULL,
  completed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completion_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- 같은 날 같은 챌린지 중복 완료 방지
  UNIQUE(user_id, challenge_id, completion_date)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_user_challenges_user_id ON user_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_challenge_id ON user_challenges(challenge_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_completion_date ON user_challenges(completion_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_challenges_user_date ON user_challenges(user_id, completion_date DESC);

-- ============================================
-- 3. challenge_streaks 테이블 생성
-- ============================================
CREATE TABLE IF NOT EXISTS challenge_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  current_streak INT DEFAULT 0,
  max_streak INT DEFAULT 0,
  last_completed_date DATE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_challenge_streaks_user_id ON challenge_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_streaks_current_streak ON challenge_streaks(current_streak DESC);
CREATE INDEX IF NOT EXISTS idx_challenge_streaks_max_streak ON challenge_streaks(max_streak DESC);

-- ============================================
-- 4. RLS (Row Level Security) 정책
-- ============================================

-- challenges 테이블
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view challenges" ON challenges;
CREATE POLICY "Anyone can view challenges"
  ON challenges
  FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Service role manages challenges" ON challenges;
CREATE POLICY "Service role manages challenges"
  ON challenges
  FOR ALL
  USING (auth.role() = 'service_role');

-- user_challenges 테이블
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own challenge completions" ON user_challenges;
CREATE POLICY "Users can view own challenge completions"
  ON user_challenges
  FOR SELECT
  USING (
    auth.uid()::text = user_id::text OR
    auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS "Service role can insert challenge completions" ON user_challenges;
CREATE POLICY "Service role can insert challenge completions"
  ON user_challenges
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- challenge_streaks 테이블
ALTER TABLE challenge_streaks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own streak" ON challenge_streaks;
CREATE POLICY "Users can view own streak"
  ON challenge_streaks
  FOR SELECT
  USING (
    auth.uid()::text = user_id::text OR
    auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS "Service role manages streaks" ON challenge_streaks;
CREATE POLICY "Service role manages streaks"
  ON challenge_streaks
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- 5. 트리거 및 함수
-- ============================================

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_challenges_updated_at ON challenges;
CREATE TRIGGER update_challenges_updated_at
  BEFORE UPDATE ON challenges
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_challenges_updated_at ON user_challenges;
CREATE TRIGGER update_user_challenges_updated_at
  BEFORE UPDATE ON user_challenges
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_challenge_streaks_updated_at ON challenge_streaks;
CREATE TRIGGER update_challenge_streaks_updated_at
  BEFORE UPDATE ON challenge_streaks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 챌린지 연속 완료 업데이트 함수
CREATE OR REPLACE FUNCTION update_challenge_streak()
RETURNS TRIGGER AS $$
DECLARE
  streak_record RECORD;
  days_diff INT;
BEGIN
  -- 사용자의 현재 연속 기록 조회
  SELECT * INTO streak_record
  FROM challenge_streaks
  WHERE user_id = NEW.user_id;

  IF streak_record IS NULL THEN
    -- 연속 기록이 없으면 새로 생성
    INSERT INTO challenge_streaks (user_id, current_streak, max_streak, last_completed_date)
    VALUES (NEW.user_id, 1, 1, NEW.completion_date);
  ELSE
    -- 마지막 완료 날짜와의 차이 계산
    days_diff := NEW.completion_date - streak_record.last_completed_date;

    IF days_diff = 1 THEN
      -- 연속 완료 (하루 차이)
      UPDATE challenge_streaks
      SET
        current_streak = current_streak + 1,
        max_streak = GREATEST(max_streak, current_streak + 1),
        last_completed_date = NEW.completion_date,
        updated_at = NOW()
      WHERE user_id = NEW.user_id;
    ELSIF days_diff = 0 THEN
      -- 같은 날 추가 완료 (연속 기록 유지)
      UPDATE challenge_streaks
      SET last_completed_date = NEW.completion_date
      WHERE user_id = NEW.user_id;
    ELSE
      -- 연속 끊김 (2일 이상 차이)
      UPDATE challenge_streaks
      SET
        current_streak = 1,
        last_completed_date = NEW.completion_date,
        updated_at = NOW()
      WHERE user_id = NEW.user_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS after_challenge_completion ON user_challenges;
CREATE TRIGGER after_challenge_completion
  AFTER INSERT ON user_challenges
  FOR EACH ROW
  EXECUTE FUNCTION update_challenge_streak();

-- ============================================
-- 6. 초기 데이터 삽입 (요일별 챌린지)
-- ============================================
INSERT INTO challenges (type, title, description, day_of_week, reward_experience, reward_badge, icon, is_active)
VALUES
  -- 일요일 (0)
  ('daily', '일요일 밤 우울 공감받기', '일요일 저녁, 내일 걱정되는 마음을 무공감에게 털어놓아보세요', 0, 10, '일요병 극복', '😔', true),

  -- 월요일 (1)
  ('daily', '월요병 공감받기 챌린지', '힘든 월요일, 무공감이 무조건 편들어줄게요', 1, 10, '월요병 워리어', '😫', true),

  -- 화요일 (2)
  ('daily', '직장/학교 고민 공감받기', '직장이나 학교에서의 스트레스를 무공감과 나눠보세요', 2, 10, '고민 상담왕', '💼', true),

  -- 수요일 (3)
  ('daily', '허언 공감받기', '현실이든 상상이든, 무공감은 다 믿어줄게요!', 3, 10, '상상력 왕', '🤥', true),

  -- 목요일 (4)
  ('daily', '소비 공감받기', '충동구매도 OK! 무공감은 당신의 소비를 응원합니다', 4, 10, '소비왕', '💳', true),

  -- 금요일 (5)
  ('daily', '불금 계획 공감받기', '주말 계획을 자랑해보세요. 무공감이 응원할게요!', 5, 10, '불금 마스터', '🎉', true),

  -- 토요일 (6)
  ('daily', '주말 낭비 공감받기', '아무것도 안하고 쉬는 것도 생산적! 무공감이 공감해줄게요', 6, 10, '휴식왕', '🛌', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- 마이그레이션 완료
-- ============================================
-- SELECT '데일리 챌린지 시스템 마이그레이션 완료!' as status;
