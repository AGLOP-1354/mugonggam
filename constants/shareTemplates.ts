/**
 * 공유 이미지 템플릿 정의
 * PRD 섹션 11.3 - 공유 이미지 템플릿
 */

export type ShareTemplate = 'kakao' | 'minimal' | 'colorful' | 'gradient';

export interface TemplateStyle {
  id: ShareTemplate;
  name: string;
  description: string;
  icon: string;
  backgroundColor: string;
  gradient?: string;
  textColor: string;
  accentColor: string;
}

export const SHARE_TEMPLATES: Record<ShareTemplate, TemplateStyle> = {
  kakao: {
    id: 'kakao',
    name: '카카오톡',
    description: '친근한 카톡 스타일',
    icon: '💬',
    backgroundColor: '#FFF8F0',
    gradient: 'linear-gradient(135deg, #FFF8F0 0%, #FFE8D6 100%)',
    textColor: '#333333',
    accentColor: '#FF8C42',
  },
  minimal: {
    id: 'minimal',
    name: '미니멀',
    description: '깔끔한 화이트 스타일',
    icon: '⚪',
    backgroundColor: '#FFFFFF',
    gradient: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%)',
    textColor: '#1A1A1A',
    accentColor: '#FF8C42',
  },
  colorful: {
    id: 'colorful',
    name: '컬러풀',
    description: '화려한 그라데이션',
    icon: '🎨',
    backgroundColor: '#FF6B9D',
    gradient: 'linear-gradient(135deg, #FF6B9D 0%, #FFA06B 50%, #FFD93D 100%)',
    textColor: '#FFFFFF',
    accentColor: '#FFFFFF',
  },
  gradient: {
    id: 'gradient',
    name: '그라데이션',
    description: '부드러운 퍼플 톤',
    icon: '🌈',
    backgroundColor: '#A78BFA',
    gradient: 'linear-gradient(135deg, #A78BFA 0%, #EC4899 100%)',
    textColor: '#FFFFFF',
    accentColor: '#FFD93D',
  },
};

/**
 * 인스타그램 스토리 사이즈
 */
export const INSTAGRAM_STORY_SIZE = {
  width: 1080,
  height: 1920,
};

/**
 * 틱톡 사이즈
 */
export const TIKTOK_SIZE = {
  width: 1080,
  height: 1920,
};

/**
 * 정사각형 (인스타 피드)
 */
export const INSTAGRAM_FEED_SIZE = {
  width: 1080,
  height: 1080,
};
