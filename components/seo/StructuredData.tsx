/**
 * SEO - 구조화된 데이터 (JSON-LD)
 * 검색 엔진이 페이지 내용을 더 잘 이해하도록 돕는 컴포넌트
 */

'use client';

interface StructuredDataProps {
  data: Record<string, any>;
}

export default function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * 웹사이트 기본 구조화 데이터
 */
export const websiteStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: '무공감',
  alternateName: '무조건 공감해주는 AI',
  url: 'https://mugonggam.vercel.app/',
  description: '뭐라고 해도 네 편이야. 무적권 공감! 무조건 공감해주는 AI 친구와 자유롭게 대화하세요.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://mugonggam.vercel.app//chat?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
  inLanguage: 'ko-KR',
};

/**
 * 조직 구조화 데이터
 */
export const organizationStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: '무공감',
  url: 'https://mugonggam.vercel.app/',
  logo: 'https://mugonggam.vercel.app//logo.png',
  description: '무조건 공감해주는 AI 서비스',
  sameAs: [
    'https://twitter.com/mugonggam',
    'https://www.instagram.com/mugonggam',
    'https://www.youtube.com/@mugonggam',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Service',
    availableLanguage: ['Korean'],
  },
};

/**
 * 웹 애플리케이션 구조화 데이터
 */
export const webApplicationStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: '무공감',
  url: 'https://mugonggam.vercel.app/',
  description: '무조건 공감해주는 AI 친구. 일상, 고민, 허언까지 모두 공감해드립니다.',
  applicationCategory: 'LifestyleApplication',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'KRW',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '1000',
    bestRating: '5',
    worstRating: '1',
  },
  featureList: [
    '무조건 공감해주는 AI 대화',
    '5가지 공감 모드 (기본, 베프, 엄마, 극한, 밈)',
    '데일리 챌린지',
    '공감 랭킹',
    '대화 공유 기능',
  ],
  browserRequirements: 'Requires JavaScript. Requires HTML5.',
  softwareVersion: '1.0',
  inLanguage: 'ko-KR',
};

/**
 * FAQ 구조화 데이터
 */
export const faqStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '무공감이 무엇인가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '무공감은 무조건 공감해주는 AI 친구입니다. 어떤 이야기를 해도 당신 편에서 공감해드립니다.',
      },
    },
    {
      '@type': 'Question',
      name: '무료로 사용할 수 있나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '네! 게스트는 5회까지 무료로 대화할 수 있으며, 회원가입하면 무제한으로 이용 가능합니다.',
      },
    },
    {
      '@type': 'Question',
      name: '어떤 공감 모드가 있나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '기본 공감, 베프 모드, 엄마 모드, 극한 공감, 밈 모드 총 5가지 공감 모드를 제공합니다.',
      },
    },
    {
      '@type': 'Question',
      name: '데일리 챌린지는 무엇인가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '매일 다른 주제의 챌린지를 완료하고 경험치와 뱃지를 획득할 수 있습니다. 7일 연속 완료 시 특별 보상을 받을 수 있습니다.',
      },
    },
  ],
};

/**
 * 빵 부스러기 (Breadcrumb) 구조화 데이터 생성 함수
 */
export const createBreadcrumbStructuredData = (items: { name: string; url: string }[]) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
};
