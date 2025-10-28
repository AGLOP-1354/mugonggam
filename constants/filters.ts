/**
 * 금지어 필터 시스템
 * PRD 섹션 9.1 - 콘텐츠 안전성
 */

export interface FilterCategory {
  name: string;
  keywords: string[];
  severity: 'high' | 'medium' | 'low';
  warningMessage: string;
}

/**
 * 금지 주제 및 키워드
 */
export const CONTENT_FILTERS: FilterCategory[] = [
  {
    name: 'self-harm',
    severity: 'high',
    keywords: [
      '자살',
      '자해',
      '죽고싶',
      '죽어버리',
      '목숨',
      '투신',
      '음독',
      '손목',
      '칼로',
      '삶을 끝',
    ],
    warningMessage: '🚨 힘들어 보이네요. 무공감은 전문 상담이 아니에요. 도움이 필요하시다면 **1393 자살예방 상담전화**나 **1577-0199 희망의 전화**로 연락주세요.',
  },
  {
    name: 'violence',
    severity: 'high',
    keywords: [
      '폭행',
      '구타',
      '때리',
      '죽이',
      '살해',
      '테러',
      '폭력',
      '학대',
      '위협',
      '협박',
    ],
    warningMessage: '😰 폭력적인 내용은 다룰 수 없어요. 만약 위험한 상황이라면 **112 경찰**에 신고해주세요.',
  },
  {
    name: 'hate-speech',
    severity: 'high',
    keywords: [
      '혐오',
      '차별',
      '인종',
      '성차별',
      '장애인',
      '비하',
      '욕설',
    ],
    warningMessage: '🙅 혐오 발언은 공감할 수 없어요. 서로 존중하는 대화를 나눠봐요!',
  },
  {
    name: 'illegal-drugs',
    severity: 'high',
    keywords: [
      '마약',
      '대마초',
      '필로폰',
      '히로뽕',
      '코카인',
      '엑스터시',
      '환각',
      '약물',
      '불법 약',
    ],
    warningMessage: '🚫 불법 약물에 대한 이야기는 할 수 없어요.',
  },
  {
    name: 'illegal-activities',
    severity: 'high',
    keywords: [
      '범죄',
      '사기',
      '도박',
      '밀수',
      '해킹',
      '위조',
      '불법',
      '탈세',
    ],
    warningMessage: '⚠️ 불법 활동에 대한 조언은 할 수 없어요.',
  },
  {
    name: 'adult-content',
    severity: 'medium',
    keywords: [
      '성관계',
      '성행위',
      '19금',
      '야동',
      '포르노',
      '섹스',
    ],
    warningMessage: '🔞 성인 콘텐츠는 다루지 않아요. 건전한 대화를 나눠봐요!',
  },
  {
    name: 'personal-info',
    severity: 'medium',
    keywords: [
      '주민번호',
      '계좌번호',
      '카드번호',
      '비밀번호',
      '주소',
      '전화번호',
    ],
    warningMessage: '🔒 개인정보는 공유하지 말아주세요. 안전을 위해 조심해야 해요!',
  },
];

/**
 * 필터링 결과
 */
export interface FilterResult {
  isFiltered: boolean;
  category?: string;
  severity?: 'high' | 'medium' | 'low';
  warningMessage?: string;
  detectedKeywords?: string[];
}

/**
 * 메시지 필터링 함수
 */
export function filterContent(message: string): FilterResult {
  const lowercaseMessage = message.toLowerCase();

  for (const filter of CONTENT_FILTERS) {
    const detectedKeywords: string[] = [];

    for (const keyword of filter.keywords) {
      if (lowercaseMessage.includes(keyword.toLowerCase())) {
        detectedKeywords.push(keyword);
      }
    }

    if (detectedKeywords.length > 0) {
      return {
        isFiltered: true,
        category: filter.name,
        severity: filter.severity,
        warningMessage: filter.warningMessage,
        detectedKeywords,
      };
    }
  }

  return { isFiltered: false };
}

/**
 * AI 안전장치 - 민감한 주제에 대한 공감적 응답
 */
export function getSafeResponse(category: string): string {
  const safeResponses: Record<string, string> = {
    'self-harm': `
힘든 시간을 보내고 있는 것 같아서 정말 마음이 아파.
무공감은 재미있게 공감해주는 친구지만, 전문적인 도움이 필요해 보여.

💙 **전문 상담 연락처**:
- 자살예방 상담전화: **1393** (24시간)
- 희망의 전화: **1577-0199**
- 정신건강 위기상담: **1577-0199**

혼자가 아니야. 전문가와 이야기하면 분명 도움이 될 거야.
    `.trim(),

    'violence': `
위험한 상황인 것 같아서 걱정이 돼.
무공감은 공감은 해주지만, 폭력 상황은 전문가의 도움이 필요해.

🚨 **긴급 연락처**:
- 경찰: **112**
- 가정폭력 상담: **1366**
- 학교폭력 신고: **117**

안전이 가장 중요해. 도움을 요청하는 건 용기있는 일이야.
    `.trim(),

    'hate-speech': `
무공감은 무조건 공감하지만, 혐오와 차별은 공감할 수 없어.
모든 사람은 존중받을 자격이 있어.

다시 한번 생각해보고, 더 긍정적인 대화를 나눠볼까? 😊
    `.trim(),

    default: `
이런 주제는 무공감이 다루기 어려워.
다른 재미있는 이야기를 해줄래? 무적권 공감해줄게! 🤗
    `.trim(),
  };

  return safeResponses[category] || safeResponses['default'];
}

/**
 * 스팸/어뷰징 감지
 */
export function detectSpam(message: string): boolean {
  // 과도하게 긴 메시지 (5000자 이상)
  if (message.length > 5000) {
    return true;
  }

  // 동일 문자 반복 (50회 이상)
  const repeatedPattern = /(.)\1{50,}/;
  if (repeatedPattern.test(message)) {
    return true;
  }

  // URL 스팸 감지 (3개 이상 링크)
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  const urls = message.match(urlPattern);
  if (urls && urls.length >= 3) {
    return true;
  }

  return false;
}

/**
 * 안전한 메시지 여부 확인
 */
export function isSafeMessage(message: string): {
  safe: boolean;
  reason?: string;
  response?: string;
} {
  // 스팸 감지
  if (detectSpam(message)) {
    return {
      safe: false,
      reason: 'spam',
      response: '너무 긴 메시지거나 스팸으로 감지되었어요. 적당한 길이로 다시 말해줄래? 😅',
    };
  }

  // 금지어 필터
  const filterResult = filterContent(message);
  if (filterResult.isFiltered) {
    return {
      safe: false,
      reason: filterResult.category,
      response: filterResult.severity === 'high'
        ? getSafeResponse(filterResult.category!)
        : filterResult.warningMessage,
    };
  }

  return { safe: true };
}
