'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MessageSquare, Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { EMPATHY_MODES } from '@/constants/modes';
import { EmpathyMode } from '@/types/chat';

interface ChatSession {
  id: string;
  title: string;
  mode: EmpathyMode;
  message_count: number;
  user_message_count: number;
  created_at: string;
  updated_at: string;
}

const ChatSessionList = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSessions();

    // 새 세션이 생성되면 목록 새로고침
    const handleNewSession = () => {
      loadSessions();
    };

    window.addEventListener('chat-session-created', handleNewSession);
    return () => {
      window.removeEventListener('chat-session-created', handleNewSession);
    };
  }, []);

  const loadSessions = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return;
      }

      const response = await fetch('/api/chat-sessions', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      } else {
        console.error('[Chat Sessions] Failed to load sessions');
      }
    } catch (error) {
      console.error('[Chat Sessions] Error loading sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    router.push('/chat');
  };

  const handleSelectSession = (sessionId: string) => {
    router.push(`/chat/${sessionId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  const getCurrentSessionId = () => {
    if (pathname === '/chat') return null;
    const parts = pathname.split('/');
    return parts[parts.length - 1];
  };

  const currentSessionId = getCurrentSessionId();

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="font-medium">새 채팅</span>
        </button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 px-4">
            <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">아직 채팅이 없어요</p>
          </div>
        ) : (
          <div className="py-2">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => handleSelectSession(session.id)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-l-4 ${
                  currentSessionId === session.id
                    ? 'bg-orange-50 border-orange-500'
                    : 'border-transparent'
                }`}
              >
                <div className="flex items-start gap-2 mb-1">
                  <span className="text-lg flex-shrink-0">
                    {EMPATHY_MODES[session.mode]?.icon || '🤗'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-800 truncate">
                      {session.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {session.user_message_count}개 메시지
                      </span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs text-gray-500">
                        {formatDate(session.updated_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          총 {sessions.length}개의 대화
        </p>
      </div>
    </div>
  );
};

export default ChatSessionList;
