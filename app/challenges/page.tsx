'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trophy, Flame, Calendar, Award } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/userStore';
import { TodayChallengeResponse } from '@/types/challenge';
import ChallengeCard from '@/components/challenge/ChallengeCard';

interface ChallengeHistory {
  id: string;
  challenge_id: string;
  completed_at: string;
  completion_date: string;
  challenge_title: string;
  challenge_icon: string;
  reward_experience: number;
}

const ChallengePage = () => {
  const router = useRouter();
  const { user } = useUserStore();
  const [challengeData, setChallengeData] = useState<TodayChallengeResponse | null>(null);
  const [history, setHistory] = useState<ChallengeHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    fetchChallengeData();
    if (user.role === 'member') {
      fetchChallengeHistory();
    } else {
      setIsLoadingHistory(false);
    }
  }, [user]);

  const fetchChallengeData = async () => {
    try {
      const headers: Record<string, string> = {};

      if (user?.role === 'member') {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
      }

      const response = await fetch('/api/challenges', { headers });

      if (response.ok) {
        const data: TodayChallengeResponse = await response.json();
        setChallengeData(data);
      }
    } catch (error) {
      console.error('Error fetching challenge:', error);
    }
  };

  const fetchChallengeHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setIsLoadingHistory(false);
        return;
      }

      // 최근 30일 챌린지 완료 기록 조회
      const response = await fetch('/api/challenges/history', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Error fetching challenge history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  if (!user) {
    return null;
  }

  const streak = challengeData?.streak || { current: 0, max: 0 };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-yellow-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="font-bold text-lg text-gray-800">데일리 챌린지</h1>
      </header>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* 오늘의 챌린지 */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4">오늘의 챌린지</h2>
          <ChallengeCard />
        </section>

        {/* 연속 기록 통계 */}
        {user.role === 'member' && (
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4">나의 기록</h2>
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-6 border-2 border-orange-200"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <Flame className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">현재 연속</p>
                    <p className="text-3xl font-bold text-gray-800">{streak.current}일</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {streak.current > 0 ? '연속 기록을 이어가고 있어요!' : '챌린지를 완료하고 기록을 시작하세요!'}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-6 border-2 border-yellow-200"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-yellow-100 rounded-xl">
                    <Trophy className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">최고 기록</p>
                    <p className="text-3xl font-bold text-gray-800">{streak.max}일</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {streak.max > 0 ? '최고 기록을 갱신해보세요!' : '첫 챌린지를 완료해보세요!'}
                </p>
              </motion.div>
            </div>
          </section>
        )}

        {/* 마일스톤 안내 */}
        {user.role === 'member' && (
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4">보상 안내</h2>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
              <div className="flex items-start gap-3 mb-4">
                <Award className="w-6 h-6 text-purple-500 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">7일 연속 달성 보상</h3>
                  <p className="text-sm text-gray-600">
                    7일 연속으로 챌린지를 완료하면 특별 뱃지를 획득할 수 있어요!
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-purple-700 bg-purple-100 rounded-lg p-3">
                <span className="font-medium">매일 경험치 +10</span>
                <span>·</span>
                <span className="font-medium">7일마다 특별 뱃지</span>
              </div>
            </div>
          </section>
        )}

        {/* 완료 기록 */}
        {user.role === 'member' && (
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4">완료 기록</h2>
            {isLoadingHistory ? (
              <div className="text-center py-12">
                <div className="animate-pulse space-y-3">
                  <div className="h-16 bg-gray-200 rounded-xl"></div>
                  <div className="h-16 bg-gray-200 rounded-xl"></div>
                  <div className="h-16 bg-gray-200 rounded-xl"></div>
                </div>
              </div>
            ) : history.length > 0 ? (
              <div className="space-y-3">
                {history.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-xl p-4 border border-gray-200 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{item.challenge_icon}</div>
                      <div>
                        <p className="font-medium text-gray-800">{item.challenge_title}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(item.completion_date).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">완료 ✓</p>
                      <p className="text-xs text-gray-500">경험치 +{item.reward_experience}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">아직 완료한 챌린지가 없어요</p>
                <p className="text-sm text-gray-500 mt-1">오늘의 챌린지부터 시작해보세요!</p>
              </div>
            )}
          </section>
        )}

        {/* 게스트 안내 */}
        {user.role === 'guest' && (
          <section className="bg-white rounded-2xl p-6 border-2 border-orange-200 text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="font-bold text-gray-800 mb-2">회원가입하고 챌린지에 도전하세요!</h3>
            <p className="text-sm text-gray-600 mb-4">
              데일리 챌린지는 회원 전용 기능이에요. 회원가입하고 경험치와 뱃지를 획득해보세요!
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-400 text-white font-medium rounded-xl hover:shadow-lg transition-all"
            >
              회원가입하기
            </button>
          </section>
        )}
      </div>
    </div>
  );
};

export default ChallengePage;
