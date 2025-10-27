# Backend 개발 명세서: 무공감

## 📋 문서 정보
- **프로젝트명**: 무공감 Backend
- **버전**: 1.0
- **기술 스택**: Supabase (PostgreSQL + Auth + Storage)
- **플랫폼**: 웹 서비스
- **핵심 전략**: 비회원 즉시 체험 → 회원 전환
- **작성일**: 2025년 10월 27일

---

## 1. 기술 스택

### 1.1 Supabase
- **Database**: PostgreSQL** (데이터 저장)
- **Authentication**: Supabase Auth (회원 인증)
- **Storage**: Supabase Storage (이미지 저장)
- **Realtime**: 선택적 (실시간 랭킹)
- **Edge Functions**: 선택적 (서버리스 함수)

### 1.2 외부 API
- **OpenAI API**: GPT-4o-mini (AI 응답 생성)
- **Kakao OAuth**: 카카오 로그인
- **Google OAuth**: 구글 로그인

---

## 2. 데이터베이스 스키마

### 2.1 테이블 개요

```sql
-- 사용자 테이블
users
├── id (UUID, PK)
├── email (TEXT)
├── nickname (TEXT, NOT NULL)
├── role (TEXT) -- 'guest' | 'member'
├── provider (TEXT) -- 'kakao' | 'google' | 'email' | null (guest)
├── level (INT)
├── experience (INT)
├── total_chats (INT)
├── total_shares (INT)
├── current_streak (INT)
├── last_login_at (TIMESTAMP)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

-- 채팅 세션 테이블
chat_sessions
├── id (UUID, PK)
├── user_id (UUID, FK -> users.id)
├── title (TEXT)
├── mode (TEXT) -- 공감 모드
├── message_count (INT)
├── is_shared (BOOLEAN)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

-- 메시지 테이블
messages
├── id (UUID, PK)
├── session_id (UUID, FK -> chat_sessions.id)
├── role (TEXT) -- 'user' | 'assistant'
├── content (TEXT)
├── mode (TEXT)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

-- 공유 테이블
shares
├── id (UUID, PK)
├── user_id (UUID, FK -> users.id, nullable for guest)
├── session_id (UUID, FK -> chat_sessions.id)
├── share_url (TEXT)
├── image_url (TEXT)
├── platform (TEXT) -- 'instagram' | 'tiktok' | 'kakao' | etc
├── share_count (INT)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

-- 랭킹 테이블
rankings
├── id (UUID, PK)
├── date (DATE)
├── content (TEXT) -- 대화 내용 요약
├── share_count (INT)
├── session_id (UUID, FK -> chat_sessions.id)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

-- 리워드 테이블
rewards
├── id (UUID, PK)
├── user_id (UUID, FK -> users.id)
├── reward_type (TEXT) -- 'invite' | 'challenge' | 'streak'
├── reward_data (JSONB)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

### 2.2 상세 스키마 정의

#### 2.2.1 users 테이블
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  nickname TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'guest' CHECK (role IN ('guest', 'member')),
  provider TEXT CHECK (provider IN ('kakao', 'google', 'email')),
  
  -- 게임화 필드
  level INT DEFAULT 1,
  experience INT DEFAULT 0,
  total_chats INT DEFAULT 0,
  total_shares INT DEFAULT 0,
  current_streak INT DEFAULT 0,
  
  -- 메타데이터
  last_login_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_level ON users(level);
```

#### 2.2.2 chat_sessions 테이블
```sql
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  mode TEXT NOT NULL DEFAULT 'default',
  message_count INT DEFAULT 0,
  is_shared BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_created_at ON chat_sessions(created_at DESC);
```

#### 2.2.3 messages 테이블
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  mode TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

#### 2.2.4 shares 테이블
```sql
CREATE TABLE shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  share_url TEXT,
  image_url TEXT,
  platform TEXT,
  share_count INT DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_shares_user_id ON shares(user_id);
CREATE INDEX idx_shares_session_id ON shares(session_id);
CREATE INDEX idx_shares_created_at ON shares(created_at DESC);
```

#### 2.2.5 rankings 테이블
```sql
CREATE TABLE rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  content TEXT NOT NULL,
  share_count INT DEFAULT 0,
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rankings_date ON rankings(date DESC);
CREATE INDEX idx_rankings_share_count ON rankings(share_count DESC);
CREATE UNIQUE INDEX idx_rankings_date_content ON rankings(date, content);
```

#### 2.2.6 rewards 테이블
```sql
CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reward_type TEXT NOT NULL,
  reward_data JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rewards_user_id ON rewards(user_id);
```

---

## 3. Row Level Security (RLS) 정책

### 3.1 users 테이블 RLS
```sql
-- RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 자신의 정보 조회 가능
CREATE POLICY "Users can view own profile"
  ON users
  FOR SELECT
  USING (auth.uid()::text = id::text OR auth.role() = 'service_role');

-- 모든 사용자가 자신의 정보 수정 가능
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  USING (auth.uid()::text = id::text);

-- 신규 사용자 생성 허용
CREATE POLICY "Anyone can insert users"
  ON users
  FOR INSERT
  WITH CHECK (true);
```

### 3.2 chat_sessions 테이블 RLS
```sql
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- 자신의 세션만 조회 가능
CREATE POLICY "Users can view own sessions"
  ON chat_sessions
  FOR SELECT
  USING (
    auth.uid()::text = user_id::text OR
    auth.role() = 'service_role'
  );

-- 자신의 세션만 생성/수정 가능
CREATE POLICY "Users can manage own sessions"
  ON chat_sessions
  FOR ALL
  USING (
    auth.uid()::text = user_id::text OR
    auth.role() = 'service_role'
  );
```

### 3.3 messages 테이블 RLS
```sql
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 자신의 세션의 메시지만 조회 가능
CREATE POLICY "Users can view own messages"
  ON messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = messages.session_id
      AND chat_sessions.user_id::text = auth.uid()::text
    ) OR auth.role() = 'service_role'
  );

-- 서비스 역할만 메시지 생성 가능 (API를 통해서만)
CREATE POLICY "Service role can insert messages"
  ON messages
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');
```

### 3.4 shares 테이블 RLS
```sql
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 조회 가능 (바이럴을 위해)
CREATE POLICY "Anyone can view shares"
  ON shares
  FOR SELECT
  USING (true);

-- 자신의 공유만 생성 가능
CREATE POLICY "Users can create own shares"
  ON shares
  FOR INSERT
  WITH CHECK (
    user_id IS NULL OR
    user_id::text = auth.uid()::text OR
    auth.role() = 'service_role'
  );
```

### 3.5 rankings 테이블 RLS
```sql
ALTER TABLE rankings ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 조회 가능
CREATE POLICY "Anyone can view rankings"
  ON rankings
  FOR SELECT
  USING (true);

-- 서비스 역할만 생성/수정 가능
CREATE POLICY "Service role manages rankings"
  ON rankings
  FOR ALL
  USING (auth.role() = 'service_role');
```

---

## 4. 트리거 및 함수

### 4.1 updated_at 자동 업데이트 트리거
```sql
-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 각 테이블에 트리거 적용
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shares_updated_at
  BEFORE UPDATE ON shares
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rankings_updated_at
  BEFORE UPDATE ON rankings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 4.2 메시지 카운트 자동 증가 트리거
```sql
CREATE OR REPLACE FUNCTION increment_message_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_sessions
  SET message_count = message_count + 1,
      updated_at = NOW()
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_message_insert
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION increment_message_count();
```

### 4.3 레벨업 체크 함수
```sql
CREATE OR REPLACE FUNCTION check_level_up()
RETURNS TRIGGER AS $$
DECLARE
  next_level INT;
  required_exp INT;
BEGIN
  -- 다음 레벨 정보 조회
  SELECT level + 1, required_exp INTO next_level, required_exp
  FROM (
    VALUES
      (1, 0),
      (2, 10),
      (3, 30),
      (4, 50),
      (5, 100)
  ) AS levels(level, required_exp)
  WHERE level = NEW.level + 1;
  
  -- 경험치가 다음 레벨 요구량을 충족하면 레벨업
  IF NEW.experience >= required_exp THEN
    NEW.level := NEW.level + 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_user_experience_update
  BEFORE UPDATE ON users
  FOR EACH ROW
  WHEN (NEW.experience > OLD.experience)
  EXECUTE FUNCTION check_level_up();
```

---

## 5. API 엔드포인트 명세

### 5.1 인증 API

#### POST /auth/signup
**설명**: 회원가입
```typescript
Request:
{
  email: string;
  password: string; // 또는 social provider
  nickname: string;
}

Response:
{
  user: User;
  session: Session;
}

비즈니스 로직:
- Supabase Auth로 사용자 생성
- users 테이블에 레코드 생성 (role: 'member')
- 기본 모드 해금 ('default', 'bestie', 'mom')
```

#### POST /auth/login
**설명**: 로그인
```typescript
Request:
{
  email: string;
  password: string;
}

또는

{
  provider: 'kakao' | 'google';
  access_token: string;
}

Response:
{
  user: User;
  session: Session;
}
```

#### POST /auth/guest
**설명**: 비회원 생성 (LocalStorage만 사용, DB 저장 안함)
```typescript
Request:
{
  nickname: string;
}

Response:
{
  guest_id: string; // 임시 UUID
  status: 'ok';
}

비즈니스 로직:
- users 테이블에 레코드 생성 (role: 'guest', provider: null)
- LocalStorage에 저장
- 5회 제한 적용
```

### 5.2 채팅 API

#### POST /api/chat
**설명**: AI 응답 생성
```typescript
Request:
{
  message: string;
  mode: 'default' | 'bestie' | 'mom' | 'extreme' | 'meme';
  history: Message[]; // 최근 5개 메시지
  user_id?: string; // 비회원은 optional
  session_id?: string; // 기존 세션 재개
}

Response:
{
  response: string; // AI 응답
  session_id: string; // 새로 생성된 session_id
}

비즈니스 로직:
1. OpenAI API 호출 (프롬프트 포함)
2. chat_sessions 테이블에 세션 생성 (있으면 업데이트)
3. messages 테이블에 사용자/AI 메시지 저장
4. users.total_chats 증가
5. users.experience += 1 (회원만)
6. 레벨업 체크
```

#### GET /api/chat/sessions
**설명**: 채팅 세션 목록 조회 (회원만)
```typescript
Request:
{
  user_id: string;
  page?: number;
  limit?: number;
}

Response:
{
  sessions: ChatSession[];
  total: number;
}

비즈니스 로직:
- 사용자의 모든 세션 조회
- 최신순 정렬
- 페이징 처리
```

#### GET /api/chat/sessions/:sessionId
**설명**: 특정 세션 조회
```typescript
Request:
{
  session_id: string;
}

Response:
{
  session: ChatSession;
  messages: Message[];
}

비즈니스 로직:
- 세션 정보 + 메시지 전체 조회
- RLS로 권한 체크
```

#### DELETE /api/chat/sessions/:sessionId
**설명**: 채팅 세션 삭제
```typescript
Request:
{
  session_id: string;
}

Response:
{
  success: boolean;
}

비즈니스 로직:
- CASCADE로 메시지도 함께 삭제
```

### 5.3 공유 API

#### POST /api/share
**설명**: 대화 공유
```typescript
Request:
{
  session_id: string;
  platform?: 'instagram' | 'tiktok' | 'kakao';
  image_data?: string; // base64
}

Response:
{
  share_id: string;
  share_url: string;
  image_url: string;
}

비즈니스 로직:
1. html-to-image로 이미지 생성
2. Supabase Storage에 업로드
3. shares 테이블에 레코드 생성
4. users.total_shares 증가
5. users.experience += 5 (회원만)
6. chat_sessions.is_shared = true
```

#### GET /api/share/popular
**설명**: 인기 공유 목록
```typescript
Request:
{
  period: 'today' | 'week' | 'month';
  limit?: number;
}

Response:
{
  shares: Share[];
}

비즈니스 로직:
- 기간별 share_count 내림차순 조회
```

### 5.4 랭킹 API

#### GET /api/ranking
**설명**: 오늘의 공감 랭킹
```typescript
Request:
{
  date?: string; // YYYY-MM-DD, default: today
  limit?: number; // default: 10
}

Response:
{
  rankings: RankingItem[];
  date: string;
}

비즈니스 로직:
- rankings 테이블에서 date로 조회
- share_count 내림차순 정렬
- 자정에 자동 생성 (cron job)
```

#### POST /api/ranking/update
**설명**: 랭킹 업데이트 (배치 작업)
```typescript
Response:
{
  updated: number;
}

비즈니스 로직:
- 매일 자정 실행
- 전날 공유 순위 TOP 10 계산
- rankings 테이블에 저장
```

### 5.5 사용자 API

#### GET /api/user/profile
**설명**: 프로필 조회
```typescript
Request:
{
  user_id: string;
}

Response:
{
  user: User;
  achievements: Achievement[];
  unlocked_modes: EmpathyMode[];
}
```

#### PUT /api/user/profile
**설명**: 프로필 수정
```typescript
Request:
{
  nickname?: string;
}

Response:
{
  user: User;
}
```

---

## 6. 비즈니스 로직

### 6.1 비회원 5회 제한 로직

```typescript
// 서버 사이드 검증
export async function validateChatLimit(user: User): Promise<boolean> {
  if (user.role === 'member') {
    return true; // 회원은 제한 없음
  }
  
  // 비회원은 5회 제한
  const response = await supabase
    .from('chat_sessions')
    .select('message_count', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  // LocalStorage와 DB 동기화
  const totalMessages = response.data?.message_count || 0;
  return totalMessages < 5;
}
```

### 6.2 모드 사용 권한 검증

```typescript
export async function canUseMode(
  user: User, 
  mode: EmpathyMode
): Promise<boolean> {
  // 비회원은 기본 모드만
  if (user.role === 'guest') {
    return mode === 'default';
  }
  
  // 회원은 해금된 모드만
  const member = user as MemberUser;
  const levelConfig = LEVEL_CONFIG[mode];
  
  if (!member.unlocked_modes.includes(mode)) {
    return false;
  }
  
  // 레벨 체크
  return member.level >= levelConfig.required_level;
}
```

### 6.3 레벨업 처리

```typescript
export async function handleLevelUp(user_id: string) {
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', user_id)
    .single();
  
  if (!user) return;
  
  const nextLevel = APP_CONFIG.levels.find(
    l => l.level === user.level + 1
  );
  
  if (nextLevel && user.experience >= nextLevel.required_exp) {
    // 레벨업
    await supabase
      .from('users')
      .update({ 
        level: user.level + 1,
        unlocked_modes: [...user.unlocked_modes, ...nextLevel.unlocks]
      })
      .eq('id', user_id);
    
    // 알림 전송 (푸시/이메일)
    await sendLevelUpNotification(user_id, nextLevel);
  }
}
```

### 6.4 공유 이미지 생성

```typescript
export async function generateShareImage(
  session_id: string,
  messages: Message[]
): Promise<string> {
  // html-to-image로 이미지 생성
  const dataUrl = await toPng(containerRef, {
    quality: 1.0,
    pixelRatio: 2,
    width: 1080,
    height: 1920
  });
  
  // Supabase Storage에 업로드
  const { data, error } = await supabase
    .storage
    .from('share-images')
    .upload(`${session_id}/${Date.now()}.png`, dataUrl, {
      contentType: 'image/png'
    });
  
  if (error) throw error;
  
  // Public URL 반환
  const { data: { publicUrl } } = supabase
    .storage
    .from('share-images')
    .getPublicUrl(data.path);
  
  return publicUrl;
}
```

---

## 7. Supabase 설정

### 7.1 Storage Buckets 설정

```typescript
// share-images 버킷 생성
const buckets = [
  {
    name: 'share-images',
    public: true,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
  }
];
```

### 7.2 Storage 정책

```sql
-- 모든 사용자가 읽기 가능 (바이럴을 위해)
CREATE POLICY "Anyone can view share images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'share-images');

-- 인증된 사용자만 업로드 가능
CREATE POLICY "Authenticated users can upload"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'share-images' AND
  auth.role() = 'authenticated'
);

-- 작성자만 삭제 가능
CREATE POLICY "Users can delete own images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'share-images' AND
  (auth.uid()::text = owner)
);
```

### 7.3 환경 변수

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4o-mini

# OAuth (선택)
KAKAO_CLIENT_ID=your-kakao-client-id
GOOGLE_CLIENT_ID=your-google-client-id
```

---

## 8. 보안 및 최적화

### 8.1 비회원 처리 전략

**문제**: 비회원을 어떻게 식별할 것인가?

**해결책**:
1. **LocalStorage 우선**: 프론트엔드에서 즉시 체험
2. **익명 세션**: Supabase에서 익명 세션 생성
3. **IP 기반 제한**: 동일 IP에서 무한 생성 방지

```typescript
// 익명 세션 생성
export async function createAnonymousSession() {
  const { data, error } = await supabase.auth.signInAnonymously();
  return data.session;
}

// IP 기반 제한 (서버 사이드)
export async function checkIPLimit(ip: string): Promise<boolean> {
  const { count } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('ip_address', ip)
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
  
  return count < 10; // IP당 하루 10개 제한
}
```

### 8.2 Rate Limiting

```typescript
// OpenAI API 호출 제한
export async function checkRateLimit(user_id: string): Promise<boolean> {
  const { count } = await supabase
    .rpc('get_chat_count_today', { user_id });
  
  // 회원: 무제한
  // 비회원: 5회
  return count < (await isMember(user_id) ? Infinity : 5);
}

// RPC 함수
CREATE OR REPLACE FUNCTION get_chat_count_today(user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)
  FROM chat_sessions
  WHERE user_id = $1
    AND DATE(created_at) = CURRENT_DATE;
$$ LANGUAGE plpgsql;
```

### 8.3 데이터 최적화

```sql
-- 자동 파티셔닝 (대용량 데이터 대비)
CREATE TABLE messages_2025_01 (
  LIKE messages INCLUDING ALL
) INHERITS (messages);

-- 인덱스 최적화
CREATE INDEX CONCURRENTLY idx_messages_session_created 
ON messages(session_id, created_at DESC);
```

---

## 9. 배치 작업

### 9.1 매일 자정 랭킹 업데이트

```typescript
// Edge Function 또는 Cron Job
export async function updateDailyRanking() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const { data: topShares } = await supabase
    .from('shares')
    .select('*')
    .gte('created_at', yesterday.toISOString())
    .order('share_count', { ascending: false })
    .limit(10);
  
  for (const share of topShares) {
    await supabase
      .from('rankings')
      .insert({
        date: yesterday.toISOString().split('T')[0],
        content: share.content,
        share_count: share.share_count,
        session_id: share.session_id
      });
  }
}
```

### 9.2 일일 사용자 정리

```typescript
// 30일 미접속 사용자 삭제 (GDPR 준수)
export async function cleanupInactiveUsers() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 30);
  
  await supabase
    .from('users')
    .delete()
    .eq('role', 'guest')
    .lt('last_login_at', cutoffDate.toISOString());
}
```

---

## 10. 모니터링 및 분석

### 10.1 핵심 메트릭

```sql
-- 일일 활성 사용자 (DAU)
SELECT COUNT(DISTINCT user_id)
FROM chat_sessions
WHERE DATE(created_at) = CURRENT_DATE;

-- 비회원 → 회원 전환율
WITH guest_total AS (
  SELECT COUNT(*) as total
  FROM users
  WHERE role = 'guest'
  AND created_at >= CURRENT_DATE - INTERVAL '7 days'
),
member_converted AS (
  SELECT COUNT(*) as converted
  FROM users
  WHERE role = 'member'
  AND created_at >= CURRENT_DATE - INTERVAL '7 days'
)
SELECT 
  (SELECT converted FROM member_converted)::float / 
  (SELECT total FROM guest_total)::float * 100 as conversion_rate;

-- 평균 대화 횟수
SELECT AVG(message_count)
FROM chat_sessions
WHERE created_at >= CURRENT_DATE;

-- 공유율
SELECT 
  COUNT(*) FILTER (WHERE is_shared = true)::float / 
  COUNT(*)::float * 100 as share_rate
FROM chat_sessions
WHERE created_at >= CURRENT_DATE;
```

### 10.2 에러 로깅

```typescript
// Supabase에서 로그 모니터링
export async function logError(
  error: Error, 
  context: Record<string, any>
) {
  await supabase
    .from('error_logs')
    .insert({
      message: error.message,
      stack: error.stack,
      context,
      created_at: new Date().toISOString()
    });
}
```

---

## 11. 개발 체크리스트

### Phase 1: MVP (Week 1)
- [ ] Supabase 프로젝트 생성
- [ ] 데이터베이스 스키마 구현
- [ ] RLS 정책 적용
- [ ] 회원/비회원 인증 시스템
- [ ] OpenAI API 연동
- [ ] 기본 채팅 기능

### Phase 2: 비회원 제한 (Week 1-2)
- [ ] LocalStorage + Supabase 동기화
- [ ] 5회 제한 검증 로직
- [ ] 비회원 세션 관리
- [ ] 회원가입 전환 플로우

### Phase 3: 회원 기능 (Week 2)
- [ ] 모드 해금 로직
- [ ] 레벨 시스템
- [ ] 경험치 시스템
- [ ] 프로필 관리

### Phase 4: 공유 기능 (Week 2-3)
- [ ] 공유 이미지 생성
- [ ] Supabase Storage 업로드
- [ ] SNS 공유 링크

### Phase 5: 추가 기능 (Week 3+)
- [ ] 랭킹 시스템
- [ ] 데일리 챌린지
- [ ] 친구 초대
- [ ] 밈 생성기

---

## 12. 성능 최적화

### 12.1 데이터베이스 인덱스

```sql
-- 자주 조회되는 쿼리를 위한 인덱스
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_chat_sessions_user_created ON chat_sessions(user_id, created_at DESC);
CREATE INDEX idx_messages_session_created ON messages(session_id, created_at);
CREATE INDEX idx_shares_count ON shares(share_count DESC);
```

### 12.2 캐싱 전략

```typescript
// Redis 또는 Supabase Realtime 활용
export async function getCachedRanking() {
  const cacheKey = `ranking:${getTodayDate()}`;
  
  // Redis에서 조회 시도
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  // DB에서 조회
  const ranking = await fetchRankingFromDB();
  
  // 캐시에 저장 (1시간)
  await redis.setex(cacheKey, 3600, JSON.stringify(ranking));
  
  return ranking;
}
```

---

이제 Backend 개발을 시작할 수 있습니다! 🚀

