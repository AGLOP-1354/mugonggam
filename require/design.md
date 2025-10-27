# 디자인 가이드: 무공감

## 📋 문서 정보
- **프로젝트명**: 무공감 (無共感)
- **버전**: 1.0
- **작성일**: 2025년 10월 27일
- **기반**: PRD 문서

---

## 1. 디자인 원칙

### 1.1 핵심 원칙
1. **초간단**: 3초 안에 이해 가능
   - 복잡한 메뉴 금지
   - 명확한 CTA 버튼
   - 핵심 기능만 노출

2. **친근함**: 부담 없고 가벼운 느낌
   - 부드러운 곡선
   - 따뜻한 색상
   - 편안한 간격

3. **재미**: 곳곳에 유머 요소
   - 이모지 자유로운 사용
   - 유쾌한 애니메이션
   - 예상치 못한 반응

4. **공유 최적화**: 예쁜 스크린샷 = 자랑하고 싶은 UI
   - 인스타 스토리 타이틀
   - 미리보기 화면 예쁘게
   - 공유 이미지 자동 생성

### 1.2 톤앤매너
- **친근하고 정다운**: "야" "너" 같은 반말 톤
- **과장된 공감**: 유머러스한 반응
- **따뜻한 응원**: 진심어린 공감
- **즉각적인 반응**: 타이핑 애니메이션

---

## 2. 디자인 토큰

### 2.1 색상 (Color System)

#### Primary Colors
```css
/* 주요 색상 - 공감의 온기 */
--color-primary-50: #FFF5F0;
--color-primary-100: #FFE8D6;
--color-primary-200: #FFD4B3;
--color-primary-300: #FFB380;
--color-primary-400: #FF8C42;  /* Primary */
--color-primary-500: #FF7A2E;
--color-primary-600: #FF6600;
--color-primary-700: #E55A00;
--color-primary-800: #CC4E00;
--color-primary-900: #993B00;
```

#### Secondary Colors (밝은 옐로우 - 긍정 에너지)
```css
--color-secondary-50: #FFFDF5;
--color-secondary-100: #FFF9E6;
--color-secondary-200: #FFF1B8;
--color-secondary-300: #FFE88A;
--color-secondary-400: #FFD93D;  /* Secondary */
--color-secondary-500: #FFD319;
--color-secondary-600: #F4C100;
--color-secondary-700: #D4A900;
--color-secondary-800: #B49000;
--color-secondary-900: #947700;
```

#### Background Colors
```css
/* 배경색 - 부드러운 아이보리 */
--color-bg-primary: #FFF8F0;      /* 메인 배경 */
--color-bg-secondary: #FFFFFF;   /* 카드 배경 */
--color-bg-tertiary: #FAF5ED;    /* 구분선 배경 */
--color-bg-overlay: rgba(0, 0, 0, 0.5);  /* 모달 오버레이 */
```

#### Text Colors
```css
/* 텍스트 색상 */
--color-text-primary: #333333;     /* 기본 텍스트 */
--color-text-secondary: #666666;   /* 보조 텍스트 */
--color-text-tertiary: #999999;    /* 부제 텍스트 */
--color-text-inverse: #FFFFFF;     /* 반전 텍스트 */
--color-text-link: #FF8C42;        /* 링크 */
--color-text-error: #FF4444;       /* 에러 */
```

#### Accent Colors (핫핑크 - 강조 요소)
```css
--color-accent-pink: #FF6B9D;      /* 핫핑크 */
--color-accent-blue: #4A90E2;      /* 아차아차 블루 */
--color-accent-green: #52C9A6;     /* 성공 그린 */
--color-accent-purple: #A78BFA;    /* 밈 퍼플 */
```

#### Chat Bubble Colors
```css
/* AI 말풍선 색상 */
--color-chat-ai-bg: #FFFFFF;
--color-chat-ai-border: #FFE8D6;
--color-chat-ai-shadow: rgba(255, 140, 66, 0.15);

/* 사용자 말풍선 색상 */
--color-chat-user-bg: #FF8C42;
--color-chat-user-text: #FFFFFF;
--color-chat-user-shadow: rgba(255, 140, 66, 0.3);
```

#### Status Colors
```css
/* 상태 색상 */
--color-status-success: #52C9A6;
--color-status-warning: #FFD93D;
--color-status-error: #FF6B9D;
--color-status-info: #4A90E2;
```

### 2.2 타이포그래피 (Typography)

#### Font Family
```css
/* 한글 폰트 */
--font-kr: 'Pretendard', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;

/* 영문 폰트 */
--font-en: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;

/* 코드 폰트 */
--font-code: 'Fira Code', 'SF Mono', Monaco, 'Courier New', monospace;
```

#### Font Sizes
```css
/* Desktop */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem; /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;     /* 48px */

/* Mobile (기본적으로 0.8배) */
@media (max-width: 768px) {
  --text-scale: 0.9;
}
```

#### Font Weights
```css
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
```

#### Line Heights
```css
--line-height-tight: 1.2;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;
--line-height-loose: 2;
```

#### Heading Styles
```css
/* H1 - 페이지 타이틀 */
.heading-1 {
  font-size: var(--text-5xl);
  font-weight: var(--font-extrabold);
  line-height: var(--line-height-tight);
  letter-spacing: -0.02em;
}

/* H2 - 섹션 타이틀 */
.heading-2 {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  line-height: var(--line-height-tight);
}

/* H3 - 서브 섹션 */
.heading-3 {
  font-size: var(--text-3xl);
  font-weight: var(--font-semibold);
  line-height: var(--line-height-normal);
}

/* Body - 본문 */
.body {
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  line-height: var(--line-height-relaxed);
}

/* Caption - 설명 */
.caption {
  font-size: var(--text-sm);
  font-weight: var(--font-normal);
  line-height: var(--line-height-normal);
  color: var(--color-text-secondary);
}
```

### 2.3 간격 (Spacing)

#### Spacing Scale
```css
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

#### Semantic Spacing
```css
--space-card: var(--space-4);      /* 카드 내부 간격 */
--space-section: var(--space-16);  /* 섹션 간 간격 */
--space-element: var(--space-2);   /* 요소 간 작은 간격 */
--space-container: var(--space-8); /* 컨테이너 패딩 */
```

### 2.4 Border Radius

```css
/* Border Radius */
--radius-none: 0;
--radius-sm: 0.25rem;    /* 4px */
--radius-base: 0.5rem;   /* 8px */
--radius-md: 0.75rem;    /* 12px */
--radius-lg: 1rem;       /* 16px */
--radius-xl: 1.5rem;     /* 24px */
--radius-2xl: 2rem;      /* 32px */
--radius-full: 9999px;   /* 완전히 둥글게 */

/* 적용 예시 */
--radius-button: var(--radius-lg);
--radius-card: var(--radius-xl);
--radius-input: var(--radius-md);
--radius-badge: var(--radius-full);
--radius-avatar: var(--radius-full);
--radius-chat-bubble: var(--radius-lg);
```

### 2.5 그림자 (Shadows)

```css
/* Shadows */
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
--shadow-base: 0 2px 6px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
--shadow-xl: 0 12px 40px rgba(0, 0, 0, 0.15);

/* Colored Shadows */
--shadow-primary: 0 4px 12px rgba(255, 140, 66, 0.25);
--shadow-secondary: 0 4px 12px rgba(255, 217, 61, 0.25);
--shadow-accent: 0 4px 12px rgba(255, 107, 157, 0.25);

/* 적용 예시 */
--shadow-button: var(--shadow-sm);
--shadow-card: var(--shadow-base);
--shadow-modal: var(--shadow-xl);
--shadow-chat: var(--shadow-primary);
```

### 2.6 애니메이션 (Animations)

#### Duration
```css
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 350ms;
--duration-slower: 500ms;
```

#### Easing
```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

#### Animation Presets
```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide Up */
@keyframes slideUp {
  from { 
    transform: translateY(10px);
    opacity: 0;
  }
  to { 
    transform: translateY(0);
    opacity: 1;
  }
}

/* Bounce (이모지 떠다님) */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Pulse (레벨업 축하) */
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* 타이핑 애니메이션 (커서 깜빡임) */
@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
```

### 2.7 브레이크포인트 (Breakpoints)

```css
/* Breakpoints */
--breakpoint-xs: 320px;   /* 작은 모바일 */
--breakpoint-sm: 640px;   /* 모바일 */
--breakpoint-md: 768px;   /* 태블릿 */
--breakpoint-lg: 1024px;  /* 데스크탑 */
--breakpoint-xl: 1280px;  /* 큰 데스크탑 */
--breakpoint-2xl: 1536px; /* 매우 큰 화면 */

/* 사용 예시 */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

### 2.8 Z-Index Layers

```css
--z-base: 0;
--z-dropdown: 100;
--z-sticky: 200;
--z-overlay: 500;
--z-modal: 1000;
--z-tooltip: 2000;
```

---

## 3. 컴포넌트 스타일 가이드

### 3.1 버튼 (Buttons)

#### Primary Button (주요 CTA)
```css
.button-primary {
  background: var(--color-primary-400);
  color: var(--color-text-inverse);
  padding: var(--space-4) var(--space-6);
  border-radius: var(--radius-button);
  font-weight: var(--font-semibold);
  font-size: var(--text-base);
  box-shadow: var(--shadow-primary);
  transition: all var(--duration-normal) var(--ease-out);
}

.button-primary:hover {
  background: var(--color-primary-500);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.button-primary:active {
  transform: translateY(0);
}
```

#### Secondary Button
```css
.button-secondary {
  background: var(--color-secondary-400);
  color: var(--color-text-primary);
  border: none;
  /* ... */
}
```

#### Ghost Button
```css
.button-ghost {
  background: transparent;
  color: var(--color-primary-400);
  border: 1px solid var(--color-primary-400);
  /* ... */
}
```

#### Button Sizes
```css
.button-sm {
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
}

.button-lg {
  padding: var(--space-6) var(--space-8);
  font-size: var(--text-lg);
}
```

### 3.2 입력 필드 (Input Fields)

```css
.input {
  background: var(--color-bg-secondary);
  border: 2px solid var(--color-primary-200);
  border-radius: var(--radius-input);
  padding: var(--space-4) var(--space-5);
  font-size: var(--text-base);
  transition: all var(--duration-normal) var(--ease-out);
  width: 100%;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary-400);
  box-shadow: 0 0 0 3px rgba(255, 140, 66, 0.1);
}

.input::placeholder {
  color: var(--color-text-tertiary);
}
```

### 3.3 카드 (Cards)

```css
.card {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-card);
  padding: var(--space-6);
  box-shadow: var(--shadow-card);
  transition: all var(--duration-normal) var(--ease-out);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}
```

### 3.4 모달 (Modal)

```css
.modal-overlay {
  background: var(--color-bg-overlay);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn var(--duration-normal) var(--ease-out);
}

.modal-content {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  max-width: 500px;
  width: 90%;
  box-shadow: var(--shadow-modal);
  animation: slideUp var(--duration-normal) var(--ease-out);
}
```

### 3.5 토스트 (Toast/알림)

```css
.toast {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--space-4) var(--space-6);
  box-shadow: var(--shadow-lg);
  border-left: 4px solid var(--color-primary-400);
  animation: slideUp var(--duration-normal) var(--ease-bounce);
}

.toast-success {
  border-left-color: var(--color-accent-green);
}

.toast-error {
  border-left-color: var(--color-status-error);
}
```

---

## 4. 화면별 디자인

### 4.1 랜딩 페이지 (홈)

```css
.landing-hero {
  background: linear-gradient(135deg, var(--color-primary-400) 0%, var(--color-secondary-400) 100%);
  padding: var(--space-24) var(--space-8);
  text-align: center;
  color: var(--color-text-inverse);
}

.landing-cta {
  margin-top: var(--space-8);
  /* 큰 Primary Button */
}
```

### 4.2 대화 화면

```css
.chat-container {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--space-4);
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-primary);
}

.chat-header {
  background: var(--color-bg-secondary);
  padding: var(--space-4) var(--space-6);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-6) 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.chat-input-area {
  background: var(--color-bg-secondary);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  display: flex;
  gap: var(--space-4);
}
```

### 4.3 말풍선 (Chat Bubbles)

#### AI 말풍선 (왼쪽 정렬)
```css
.chat-bubble-ai {
  align-self: flex-start;
  background: var(--color-chat-ai-bg);
  border: 1px solid var(--color-chat-ai-border);
  border-radius: var(--radius-chat-bubble);
  padding: var(--space-4) var(--space-5);
  max-width: 70%;
  box-shadow: var(--shadow-chat);
  position: relative;
}

.chat-bubble-ai::before {
  content: '🤖';
  position: absolute;
  left: -16px;
  top: 50%;
  transform: translateY(-50%);
}
```

#### 사용자 말풍선 (오른쪽 정렬)
```css
.chat-bubble-user {
  align-self: flex-end;
  background: var(--color-chat-user-bg);
  color: var(--color-chat-user-text);
  border-radius: var(--radius-chat-bubble);
  padding: var(--space-4) var(--space-5);
  max-width: 70%;
  box-shadow: var(--shadow-chat);
}
```

### 4.4 대화 카운터

```css
.chat-counter {
  background: var(--color-primary-400);
  color: var(--color-text-inverse);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  position: fixed;
  top: var(--space-4);
  right: var(--space-4);
  z-index: var(--z-sticky);
}

/* 5번 접근 시 경고 색상 */
.chat-counter.warning {
  background: var(--color-status-warning);
  animation: pulse var(--duration-slow) ease-in-out;
}
```

### 4.5 공유 모달

```css
.share-modal {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  max-width: 600px;
}

.share-image-preview {
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}

.share-social-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
  margin-top: var(--space-6);
}
```

### 4.6 5회 제한 종료 모달

```css
.limit-modal {
  text-align: center;
}

.limit-emoji {
  font-size: 4rem;
  animation: bounce 1s ease-in-out infinite;
}

.limit-title {
  color: var(--color-primary-400);
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  margin-top: var(--space-4);
}
```

---

## 5. 반응형 디자인

### 5.1 모바일 우선 (Mobile First)

```css
/* Base (모바일) */
.container {
  padding: var(--space-4);
  max-width: 100%;
}

/* 태블릿 */
@media (min-width: 768px) {
  .container {
    padding: var(--space-6);
    max-width: 768px;
  }
}

/* 데스크탑 */
@media (min-width: 1024px) {
  .container {
    padding: var(--space-8);
    max-width: 1024px;
  }
}
```

### 5.2 모바일 특화 디자인

```css
/* 모바일에서 큰 버튼 */
@media (max-width: 640px) {
  .chat-input {
    font-size: 16px; /* iOS 줌 방지 */
  }
  
  .button-primary {
    padding: var(--space-5) var(--space-8);
    font-size: var(--text-lg);
  }
}
```

### 5.3 PWA 설치 유도

```css
.pwa-install-banner {
  background: linear-gradient(135deg, var(--color-primary-400), var(--color-secondary-400));
  color: var(--color-text-inverse);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  bottom: var(--space-4);
  left: var(--space-4);
  right: var(--space-4);
  z-index: var(--z-sticky);
  animation: slideUp var(--duration-normal) var(--ease-bounce);
}
```

---

## 6. 접근성 (Accessibility)

### 6.1 색상 대비

```css
/* WCAG AA 기준 충족 */
--contrast-text-on-primary: 4.5:1;
--contrast-text-on-bg: 4.5:1;
--contrast-focus-indicator: 3:1;
```

### 6.2 포커스 스타일

```css
:focus-visible {
  outline: 3px solid var(--color-primary-400);
  outline-offset: 2px;
}
```

### 6.3 스크린 리더

```html
<!-- 의미있는 버튼 -->
<button aria-label="대화 시작">
  지금 바로 시작
</button>

<!-- 대화 카운터 -->
<div aria-live="polite" aria-atomic="true">
  대화 3/5
</div>
```

---

## 7. 이모지 사용 가이드

### 7.1 시그니처 이모지
- 🤖 AI 캐릭터
- 💬 대화
- 💪 공감
- 🎉 축하
- 🔥 핫
- 😭 슬픔 공감
- 🎯 목표

### 7.2 모드별 이모지
- 😎 기본모드
- 🤗 절친모드
- 👩 엄마모드
- 🔥 과몰입모드
- 🎭 밈모드

### 7.3 애니메이션 적용 이모지
```css
.floating-emoji {
  position: absolute;
  animation: bounce 2s ease-in-out infinite;
  font-size: 2rem;
  pointer-events: none;
}
```

---

## 8. 아이콘 스타일

### 8.1 사용 라이브러리
- **Heroicons** (Outline 스타일 우선)
- **Lucide React** (일관성)

### 8.2 크기
```css
.icon-sm { width: 16px; height: 16px; }
.icon-base { width: 24px; height: 24px; }
.icon-lg { width: 32px; height: 32px; }
.icon-xl { width: 48px; height: 48px; }
```

---

## 9. 공유 이미지 템플릿

### 9.1 이미지 규격
- **인스타 스토리**: 1080x1920 (세로)
- **인스타 피드**: 1080x1080 (정사각형)
- **카톡/카드**: 1080x1350 (카드형)
- **티크톡**: 1080x1920

### 9.2 색상 템플릿
```javascript
const bgGradients = [
  'linear-gradient(135deg, #FF8C42, #FFD93D)',
  'linear-gradient(135deg, #FF6B9D, #A78BFA)',
  'linear-gradient(135deg, #4A90E2, #52C9A6)',
  'linear-gradient(135deg, #FFF8F0, #FFE8D6)',
];
```

### 9.3 워터마크
- 하단 중앙
- 약 20% 투명도
- "무공감" + URL

---

## 10. 다크모드 (선택)

```css
/* 미래 확장 가능 */
@media (prefers-color-scheme: dark) {
  --color-bg-primary: #1A1A1A;
  --color-bg-secondary: #2D2D2D;
  /* ... */
}
```

---

## 11. 임포트 및 사용법

### 11.1 Tailwind CSS 설정

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFF5F0',
          400: '#FF8C42',
          // ...
        },
      },
      spacing: {
        // ...
      },
    },
  },
}
```

### 11.2 CSS Variables 사용

```css
/* globals.css */
:root {
  --color-primary-400: #FF8C42;
  /* 모든 토큰 정의 */
}

/* 컴포넌트에서 사용 */
.button {
  background: var(--color-primary-400);
}
```

---

## 12. 체크리스트

- [ ] 모든 색상 대비 WCAG AA 충족
- [ ] 모바일/태블릿/데스크탑 반응형 테스트
- [ ] 접근성 (키보드 네비게이션, 스크린 리더)
- [ ] 공유 이미지 최적화
- [ ] 로딩 상태 애니메이션
- [ ] 에러 상태 디자인
- [ ] 빈 상태 (Empty State) 디자인
- [ ] PWA 매니페스트 아이콘
- [ ] 파비콘 세트

