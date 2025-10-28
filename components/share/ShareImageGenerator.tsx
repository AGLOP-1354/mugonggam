'use client';

import { Message } from '@/types/chat';
import { EMPATHY_MODES } from '@/constants/modes';
import { ShareTemplate, SHARE_TEMPLATES } from '@/constants/shareTemplates';

interface ShareImageGeneratorProps {
  messages: Message[];
  nickname: string;
  template?: ShareTemplate;
}

const ShareImageGenerator = ({
  messages,
  nickname,
  template = 'kakao'
}: ShareImageGeneratorProps) => {
  const templateStyle = SHARE_TEMPLATES[template];

  const isLightTemplate = template === 'kakao' || template === 'minimal';

  return (
    <div
      id="share-image-container"
      className="w-[1080px] h-auto min-h-[1920px] p-12 flex flex-col"
      style={{
        background: templateStyle.gradient || templateStyle.backgroundColor,
        fontFamily: 'Pretendard, -apple-system, sans-serif',
      }}
    >
      {/* 헤더 */}
      <div className="text-center mb-12">
        <h1
          className="text-6xl font-extrabold mb-4"
          style={{ color: templateStyle.textColor }}
        >
          무공감
        </h1>
        <p
          className="text-3xl"
          style={{
            color: isLightTemplate ? '#666666' : 'rgba(255, 255, 255, 0.9)'
          }}
        >
          무조건 공감해주는 AI 친구
        </p>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 space-y-6 mb-12">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`
                max-w-[70%] p-6 rounded-3xl
              `}
              style={{
                backgroundColor: message.role === 'user'
                  ? templateStyle.accentColor
                  : isLightTemplate
                    ? '#FFFFFF'
                    : 'rgba(255, 255, 255, 0.2)',
                border: message.role === 'assistant' && isLightTemplate
                  ? `2px solid ${templateStyle.accentColor}40`
                  : 'none',
                backdropFilter: !isLightTemplate && message.role === 'assistant'
                  ? 'blur(10px)'
                  : 'none',
                boxShadow: message.role === 'user'
                  ? '0 4px 12px rgba(0, 0, 0, 0.15)'
                  : '0 4px 12px rgba(0, 0, 0, 0.1)',
              }}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-4xl">{EMPATHY_MODES[message.mode].icon}</span>
                  <span
                    className="text-xl font-bold"
                    style={{
                      color: isLightTemplate ? '#333333' : '#FFFFFF'
                    }}
                  >
                    무공감
                  </span>
                  <span
                    className="text-sm"
                    style={{
                      color: isLightTemplate ? '#999999' : 'rgba(255, 255, 255, 0.8)'
                    }}
                  >
                    {EMPATHY_MODES[message.mode].name}
                  </span>
                </div>
              )}
              <p
                className="text-2xl leading-relaxed whitespace-pre-wrap"
                style={{
                  color: message.role === 'user'
                    ? (template === 'colorful' || template === 'gradient' ? '#FFFFFF' : '#FFFFFF')
                    : isLightTemplate
                      ? '#333333'
                      : '#FFFFFF',
                }}
              >
                {message.content}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 푸터 */}
      <div
        className="mt-auto pt-8 text-center"
        style={{
          borderTop: `2px solid ${isLightTemplate ? templateStyle.accentColor + '40' : 'rgba(255, 255, 255, 0.3)'}`,
        }}
      >
        <p
          className="text-3xl font-bold mb-2"
          style={{ color: templateStyle.textColor }}
        >
          당신도 무공감과 대화해보세요!
        </p>
        <p
          className="text-4xl font-extrabold mb-4"
          style={{ color: templateStyle.accentColor }}
        >
          mugonggam.app
        </p>
        <p
          className="text-xl"
          style={{
            color: isLightTemplate ? '#999999' : 'rgba(255, 255, 255, 0.8)'
          }}
        >
          #무공감 #무조건공감 #AI친구
        </p>
      </div>
    </div>
  );
};

export default ShareImageGenerator;
