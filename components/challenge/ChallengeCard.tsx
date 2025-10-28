'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Calendar, Award, Flame } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/userStore';
import { useChatStore } from '@/store/chatStore';
import { TodayChallengeResponse } from '@/types/challenge';
import { Button } from '@/components/ui/Button';

const ChallengeCard = () => {
  const { user } = useUserStore();
  const { dbSessionId } = useChatStore();
  const [challengeData, setChallengeData] = useState<TodayChallengeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetchTodayChallenge();
  }, [user]);

  const fetchTodayChallenge = async () => {
    setIsLoading(true);
    try {
      const headers: Record<string, string> = {};

      if (user?.role === 'member') {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
      }

      const response = await fetch('/api/challenges', { headers });

      if (!response.ok) {
        throw new Error('Failed to fetch challenge');
      }

      const data: TodayChallengeResponse = await response.json();
      setChallengeData(data);
    } catch (error) {
      console.error('Error fetching challenge:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteChallenge = async () => {
    if (!user || user.role !== 'member') {
      toast.error('회원만 챌린지를 완료할 수 있습니다');
      return;
    }

    if (!challengeData || challengeData.is_completed) {
      return;
    }

    setIsCompleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        toast.error('로그인이 필요합니다');
        return;
      }

      const response = await fetch('/api/challenges/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          challenge_id: challengeData.challenge.id,
          session_id: dbSessionId || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || '챌린지 완료에 실패했습니다');
        return;
      }

      const result = await response.json();

      // 성공 토스트
      if (result.is_streak_milestone) {
        toast.success(result.message, { duration: 5000 });
      } else {
        toast.success(result.message);
      }

      // 사용자 경험치 업데이트
      if (user.role === 'member') {
        useUserStore.getState().addExperience(result.reward_experience);
      }

      // 챌린지 데이터 새로고침
      await fetchTodayChallenge();

    } catch (error) {
      console.error('Error completing challenge:', error);
      toast.error('챌린지 완료 중 오류가 발생했습니다');
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading || !challengeData) {
    return (
      <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-4 border-2 border-orange-200">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-orange-200 rounded w-3/4"></div>
          <div className="h-3 bg-orange-100 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const { challenge, is_completed, streak } = challengeData;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl border-2 border-orange-200 overflow-hidden"
    >
      {/* 헤더 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-orange-100/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="text-3xl">{challenge.icon}</div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-800">{challenge.title}</h3>
              {is_completed && (
                <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                  완료 ✓
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">경험치 +{challenge.reward_experience}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* 연속 기록 */}
          {streak.current > 0 && (
            <div className="flex items-center gap-1 text-orange-600">
              <Flame className="w-4 h-4" />
              <span className="text-sm font-bold">{streak.current}일</span>
            </div>
          )}

          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </div>
      </button>

      {/* 확장된 내용 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t border-orange-200">
              {/* 설명 */}
              <p className="text-sm text-gray-700 pt-4">
                {challenge.description}
              </p>

              {/* 연속 기록 통계 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl p-3 border border-orange-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-xs text-gray-600">현재 연속</span>
                  </div>
                  <p className="text-xl font-bold text-gray-800">{streak.current}일</p>
                </div>
                <div className="bg-white rounded-xl p-3 border border-orange-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs text-gray-600">최고 기록</span>
                  </div>
                  <p className="text-xl font-bold text-gray-800">{streak.max}일</p>
                </div>
              </div>

              {/* 완료 버튼 */}
              {user?.role === 'member' && !is_completed && (
                <Button
                  onClick={handleCompleteChallenge}
                  disabled={isCompleting}
                  size="default"
                  className="w-full"
                >
                  {isCompleting ? '완료 중...' : '챌린지 완료하기'}
                </Button>
              )}

              {user?.role === 'member' && is_completed && (
                <div className="text-center py-2 text-green-600 font-medium">
                  ✅ 오늘의 챌린지를 완료했습니다!
                </div>
              )}

              {user?.role === 'guest' && (
                <div className="text-center py-2 text-sm text-gray-600">
                  회원가입하고 챌린지에 도전해보세요!
                </div>
              )}

              {/* 보상 정보 */}
              {challenge.reward_badge && streak.current > 0 && streak.current % 7 === 6 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-4 h-4 text-yellow-600" />
                    <span className="text-xs font-medium text-yellow-800">내일 달성 가능!</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    내일 완료하면 "{challenge.reward_badge}" 뱃지를 획득합니다!
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ChallengeCard;
