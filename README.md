# 무공감 (無共感) 🤗

**무조건 공감해주는 AI 친구** - 뭐라고 해도 네 편이야. 무적권 공감!

바이럴 확산을 목표로 하는 엔터테인먼트형 AI 챗봇 웹 서비스입니다.

## 📋 프로젝트 개요

- **컨셉**: 유병재의 "무공해(무조건 공감해)" 밈을 웹 기반 AI 서비스로 구현
- **핵심 전략**: 비회원 즉시 체험 (5회 무료) → 회원가입 유도
- **목표**: 4주 내 50만 명 방문자 확보

## 🛠 기술 스택

### Core
- **Next.js 16** - App Router
- **TypeScript** - 타입 안정성
- **Tailwind CSS 4** - 스타일링

### UI/UX
- **shadcn/ui** - 디자인 시스템 (커스터마이징 가능)
- **Framer Motion** - 애니메이션
- **React Hot Toast** - 토스트 알림
- **Lucide React** - 아이콘

### State Management
- **Zustand** - 전역 상태 관리 (persist 포함)

### AI
- **Upstage Solar Pro** - AI 공감 응답 생성

## 🚀 시작하기

### 1. 환경 설정

`.env.local` 파일에 필요한 환경변수를 설정하세요:

```env
# Solar API (AI 응답 생성)
SOLAR_API_KEY=your_solar_api_key_here

# Supabase (구글/카카오 로그인)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3333
```

**Solar API 키 발급:**
1. [Upstage Console](https://console.upstage.ai/) 접속
2. 회원가입 및 로그인
3. API Keys 메뉴에서 새 API 키 생성

**Supabase 설정:**
1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 새 프로젝트 생성
3. Settings > API에서 `URL`과 `anon public` 키 복사
4. Authentication > Providers에서 Google, Kakao 활성화
   - Redirect URLs: `http://localhost:3333/auth/callback`

### 2. 의존성 설치

```bash
npm install
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 열어 확인하세요.

## 🎯 핵심 기능

### 1. 비회원 5회 제한 시스템
- **즉시 체험**: 가입 없이 바로 대화 시작
- **5회 무료**: LocalStorage 기반 대화 횟수 제한
- **FOMO 유발**: 5회 후 회원가입 모달 표시
- **회원 전환**: 비회원 → 회원 시 대화 기록 유지

### 2. 다양한 공감 모드
- **기본 모드** (비회원/회원 모두): 유병재 스타일 무조건 공감
- **절친 모드** (회원 전용): "ㅋㅋㅋ 진짜? 대박이네ㅋㅋ"
- **엄마 모드** (회원 전용): "아이고 우리 아가... 힘들었겠다"
- **애인 모드** (회원 전용, Lv.3+): 달달한 애인처럼 다정하게 공감
- **밈 모드** (회원 전용, Lv.5+): 최신 밈과 짤로만 반응

### 3. 레벨 시스템 (회원 전용)
- 대화 횟수에 따라 레벨 상승
- 레벨별 새로운 모드 해금
- 경험치 획득: 메시지 1pt, 공유 5pt

## 🎨 디자인 시스템

### 컬러 팔레트
- **Primary**: #FF8C42 (따뜻한 오렌지)
- **Secondary**: #FFD93D (밝은 옐로우)
- **Accent**: #FF6B9D (핫핑크)
- **Background**: #FFF8F0 (부드러운 아이보리)

## 📝 다음 단계

- [x] Solar Pro API 연동 완료
- [x] 소셜 로그인 구현 (구글, 카카오) ✨
- [x] 공유 이미지 생성 기능 ✨
- [x] 모드 선택 UI ✨
- [ ] Supabase 데이터베이스 연동 (대화 저장)
- [ ] PWA 매니페스트 추가
- [ ] 레벨업 애니메이션

## ⚡ Solar Pro API 특징

이 프로젝트는 **Upstage Solar Pro** 모델을 사용합니다:

- **고품질 한국어 지원**: 한국어 특화 LLM
- **비용 효율적**: OpenAI 대비 저렴한 가격
- **빠른 응답 속도**: 실시간 대화에 최적화
- **OpenAI 호환**: 유사한 API 구조로 쉬운 전환

---

**무적권 공감! 💪**
