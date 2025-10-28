'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { Share2, Settings2, Trophy } from 'lucide-react';

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
import ChallengeCard from '@/components/challenge/ChallengeCard';
import { useChatLimit } from '@/lib/hooks/useChatLimit';
import { useUIStore } from '@/store/uiStore';
import { EMPATHY_MODES } from '@/constants/modes';
import { supabase } from '@/lib/supabase';
import ChatSessionList from '@/components/chat/ChatSessionList';


const ChatSessionPage = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const { currentSession, isLoading, currentMode, addMessage, setLoading, dbSessionId, setDbSessionId, loadSessionFromDB } = useChatStore();
  const { user } = useUserStore();
  const { openModeSelector, openShareModal } = useUIStore();
  const {
    currentCount,
    maxCount,
    canChat,
    hasReachedLimit,
    incrementChat
  } = useChatLimit();
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  useEffect(() => {
    // Supabase 세션 확인 및 동기화
    const checkAndSyncSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session && (!user || user.role === 'guest')) {
          // Supabase 세션이 있지만 userStore가 없거나 게스트인 경우 DB에서 가져오기
          try {
            const response = await fetch('/api/users/me', {
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
              },
            });

            if (response.ok) {
              const data = await response.json();

              // DB 필드명을 프론트엔드 형식으로 변환
              const userData = {
                id: data.user.id,
                nickname: data.user.nickname,
                role: 'member' as const,
                level: data.user.level,
                experience: data.user.experience,
                totalChats: data.user.total_chats,
                totalShares: data.user.total_shares,
                unlockedModes: ['default', 'bestie', 'mom'] as ('default' | 'bestie' | 'mom' | 'extreme' | 'meme')[],
                currentStreak: data.user.current_streak,
                achievements: [],
                createdAt: new Date(data.user.created_at),
              };

              const { initMemberFromDB } = useUserStore.getState();
              initMemberFromDB(userData);
            }
          } catch (error) {
            console.error('Failed to fetch user data:', error);
          }
        } else if (!session && !user) {
          // Supabase 세션도 없고 userStore도 없으면 랜딩페이지로
          router.push('/');
        }
      } catch (error) {
        console.error('Session sync error:', error);
      }
    };

    checkAndSyncSession();

    // 사용자가 없으면 랜딩페이지로 리다이렉트
    if (!user) {
      const timer = setTimeout(() => {
        router.push('/');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [user, router]);

  // 특정 채팅 세션 로드
  useEffect(() => {
    const loadChatSession = async () => {
      if (!user) return;

      // 게스트 유저는 sessionId 기반 라우팅 사용 안함
      if (user.role === 'guest') {
        router.push('/chat');
        return;
      }

      // 로그인 유저인 경우 DB에서 특정 세션 로드
      if (user.role === 'member') {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            setIsLoadingHistory(false);
            return;
          }

          const response = await fetch(`/api/chat-sessions/${sessionId}`, {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.session && data.session.messages.length > 0) {
              loadSessionFromDB(data.session, sessionId);
            } else {
              // 세션이 없으면 새 채팅으로 이동
              router.push('/chat');
            }
          } else if (response.status === 404) {
            router.push('/chat');
          } else {
            console.error('[Chat Session] Failed to load:', response.statusText);
          }
        } catch (error) {
          console.error('[Chat Session] Error loading session:', error);
        } finally {
          setIsLoadingHistory(false);
        }
      }
    };

    loadChatSession();
  }, [user, sessionId, loadSessionFromDB, router]);

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
      // 로그인 유저인 경우 인증 토큰 가져오기
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (user?.role === 'member') {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: content,
          mode: currentMode,
          history: currentSession?.messages.slice(-5) || [],
          sessionId: sessionId // 현재 세션 ID 전송
        })
      });

      const data = await response.json();

      // DB 저장 상태 확인 및 로깅
      if (user?.role === 'member') {
        if (data.dbSaved) {
          if (data.sessionId) {
            setDbSessionId(data.sessionId);
          }
          window.dispatchEvent(new Event('chat-session-created'));
        } else {
        }
      }

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
      <div className="flex h-screen">
        {/* LNB - 로그인 유저만 표시 (게스트는 이 페이지 접근 불가) */}
        {user?.role === 'member' && <ChatSessionList />}

        {/* 메인 채팅 영역 */}
        <div className="flex-1 flex flex-col bg-gradient-to-b from-orange-50 to-yellow-50">
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
              onClick={() => router.push('/ranking')}
              title="오늘의 공감 랭킹"
            >
              <Trophy className="w-5 h-5 text-yellow-600" />
            </button>
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
          {/* 데일리 챌린지 카드 */}
          {!isLoadingHistory && <ChallengeCard />}

          {isLoadingHistory ? (
            <div className="text-center py-12">
              <div className="text-2xl mb-4">🤗</div>
              <p className="text-gray-600">채팅 기록을 불러오는 중...</p>
            </div>
          ) : !currentSession?.messages.length ? (
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
          ) : null}

          {currentSession?.messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
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
      </div>
    </>
  );
};

export default ChatSessionPage;
