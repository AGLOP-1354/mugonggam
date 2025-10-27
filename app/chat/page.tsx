'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Share2, Settings2 } from 'lucide-react';

import { useChatStore } from '@/store/chatStore';
import { useUserStore } from '@/store/userStore';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import TypingIndicator from '@/components/chat/TypingIndicator';
import ChatCounter from '@/components/chat/ChatCounter';
import LimitReachedModal from '@/components/chat/LimitReachedModal';
import ModeSelector from '@/components/chat/ModeSelector';
import ShareModal from '@/components/share/ShareModal';
import SignupPrompt from '@/components/auth/SignupPrompt';
import { useChatLimit } from '@/lib/hooks/useChatLimit';
import { useUIStore } from '@/store/uiStore';
import { EMPATHY_MODES } from '@/constants/modes';


const ChatPage = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { currentSession, isLoading, currentMode, addMessage, setLoading } = useChatStore();
  const { user } = useUserStore();
  const { openModeSelector, openShareModal } = useUIStore();
  const {
    currentCount,
    maxCount,
    canChat,
    hasReachedLimit,
    incrementChat
  } = useChatLimit();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading || !canChat) return;

    addMessage({
      role: 'user',
      content,
      mode: currentMode
    });

    incrementChat();

    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          mode: currentMode,
          history: currentSession?.messages.slice(-5) || []
        })
      });

      const data = await response.json();

      addMessage({
        role: 'assistant',
        content: data.response,
        mode: currentMode
      });

    } catch (error) {
      console.error('Chat error:', error);
      addMessage({
        role: 'assistant',
        content: '앗! 잠시 문제가 생겼어요. 다시 한번 말씀해주시겠어요? 무적권 공감!',
        mode: currentMode
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <div className="flex flex-col h-screen bg-gradient-to-b from-orange-50 to-yellow-50">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-lg text-gray-800">무공감</h1>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {user?.nickname || '게스트'}
                {user?.role === 'member' && user.level && ` · Lv.${user.level}`}
              </span>
              <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
                {EMPATHY_MODES[currentMode].icon} {EMPATHY_MODES[currentMode].name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              onClick={openModeSelector}
              title="공감 모드 변경"
            >
              <Settings2 className="w-5 h-5 text-gray-600" />
            </button>
            <button
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              onClick={openShareModal}
              title="대화 공유"
              disabled={!currentSession?.messages.length}
            >
              <Share2 className={`w-5 h-5 ${currentSession?.messages.length ? 'text-gray-600' : 'text-gray-300'}`} />
            </button>
          </div>
        </header>

        {user?.role === 'guest' && (
          <ChatCounter
            currentCount={currentCount}
            maxCount={maxCount}
          />
        )}

        <SignupPrompt />

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {!currentSession?.messages.length && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">🤗</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                무엇이든 말해봐!
              </h2>
              <p className="text-gray-600">
                무적권 공감해줄게
              </p>
              {user?.role === 'guest' && (
                <p className="text-sm text-gray-500 mt-4">
                  비회원은 5회까지 대화 가능해요
                </p>
              )}
            </motion.div>
          )}

          {currentSession?.messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              // isLatest={index === currentSession.messages.length - 1}
            />
          ))}

          {isLoading && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>

        <ChatInput
          onSend={handleSendMessage}
          disabled={isLoading || !canChat}
          placeholder={
            hasReachedLimit
              ? '5회 대화 완료! 회원가입하면 계속 대화할 수 있어요'
              : `무엇을 공감시켜줄까? (${currentCount}/${maxCount})`
          }
        />
      </div>

      <LimitReachedModal />
      <ModeSelector />
      <ShareModal />
    </>
  );
};

export default ChatPage;
