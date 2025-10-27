'use client';

import { Message } from '@/types/chat';
import { EMPATHY_MODES } from '@/constants/modes';

interface ShareImageGeneratorProps {
  messages: Message[];
  nickname: string;
}

const ShareImageGenerator = ({ messages }: ShareImageGeneratorProps) => {
  return (
    <div
      id="share-image-container"
      className="w-[1080px] h-auto min-h-[1920px] bg-gradient-to-b from-orange-50 to-yellow-50 p-12 flex flex-col"
      style={{ fontFamily: 'Pretendard, -apple-system, sans-serif' }}
    >
      <div className="text-center mb-12">
        <h1 className="text-6xl font-extrabold text-gray-800 mb-4">
          무공감
        </h1>
        <p className="text-3xl text-gray-600">
          무조건 공감해주는 AI 친구
        </p>
      </div>

      <div className="flex-1 space-y-6 mb-12">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`
                max-w-[70%] p-6 rounded-3xl
                ${message.role === 'user'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white border-2 border-orange-200'
                }
              `}
              style={{
                boxShadow: message.role === 'user'
                  ? '0 4px 12px rgba(255, 140, 66, 0.3)'
                  : '0 4px 12px rgba(255, 140, 66, 0.15)'
              }}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-4xl">{EMPATHY_MODES[message.mode].icon}</span>
                  <span className="text-xl font-bold text-gray-800">
                    무공감
                  </span>
                  <span className="text-sm text-gray-500">
                    {EMPATHY_MODES[message.mode].name}
                  </span>
                </div>
              )}
              <p className={`text-2xl leading-relaxed whitespace-pre-wrap ${
                message.role === 'user' ? 'text-white' : 'text-gray-800'
              }`}>
                {message.content}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto border-t-2 border-orange-200 pt-8 text-center">
        <p className="text-3xl font-bold text-gray-700 mb-2">
          당신도 무공감과 대화해보세요!
        </p>
        <p className="text-4xl font-extrabold text-orange-600 mb-4">
          mugonggam.app
        </p>
        <p className="text-xl text-gray-500">
          #무공감 #무조건공감 #AI친구 #공감챗봇
        </p>
      </div>
    </div>
  );
};

export default ShareImageGenerator;
