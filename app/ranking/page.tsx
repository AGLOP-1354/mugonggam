'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, TrendingUp, Share2, Calendar } from 'lucide-react';
import { RankingResponse, RankingItem } from '@/types/ranking';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

export default function RankingPage() {
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRankings(selectedDate);
  }, [selectedDate]);

  const fetchRankings = async (date: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ranking?date=${date}&limit=10`);

      if (!response.ok) {
        throw new Error('랭킹 조회 실패');
      }

      const data: RankingResponse = await response.json();
      setRankings(data.rankings);
    } catch (err) {
      console.error('Error fetching rankings:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      toast.error('랭킹을 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedDate);
    if (direction === 'prev') {
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      const today = new Date();
      if (currentDate < today) {
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-yellow-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-12 h-12 text-yellow-500" />
            <h1 className="text-4xl font-bold text-gray-800">
              🏆 오늘의 공감 랭킹
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            가장 많이 공유된 대화 TOP 10
          </p>
        </motion.div>

        {/* 날짜 선택 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-md p-4 mb-6 flex items-center justify-between"
        >
          <button
            onClick={() => handleDateChange('prev')}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ← 이전
          </button>

          <div className="flex items-center gap-2 text-gray-800 font-semibold text-lg">
            <Calendar className="w-5 h-5" />
            {format(new Date(selectedDate), 'yyyy년 MM월 dd일 (EEE)', { locale: ko })}
            {isToday && (
              <span className="ml-2 px-3 py-1 bg-orange-500 text-white text-sm rounded-full">
                오늘
              </span>
            )}
          </div>

          <button
            onClick={() => handleDateChange('next')}
            disabled={isToday}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isToday
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            다음 →
          </button>
        </motion.div>

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4" />
            <p className="text-gray-600">랭킹을 불러오는 중...</p>
          </div>
        )}

        {/* 에러 상태 */}
        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center"
          >
            <p className="text-red-600 text-lg mb-4">⚠️ {error}</p>
            <button
              onClick={() => fetchRankings(selectedDate)}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              다시 시도
            </button>
          </motion.div>
        )}

        {/* 랭킹 리스트 */}
        {!isLoading && !error && (
          <>
            {rankings.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-md p-12 text-center"
              >
                <div className="text-6xl mb-4">😔</div>
                <p className="text-gray-600 text-lg mb-2">아직 랭킹 데이터가 없어요</p>
                <p className="text-gray-500 text-sm">
                  {isToday
                    ? '첫 번째로 대화를 공유해보세요!'
                    : '이 날짜에는 공유된 대화가 없습니다'}
                </p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {rankings.map((item, index) => (
                    <RankingCard
                      key={item.id}
                      item={item}
                      rank={index + 1}
                      index={index}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}

        {/* 참여 독려 배너 */}
        {!isLoading && isToday && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl shadow-lg p-6 text-white text-center"
          >
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="text-2xl font-bold mb-2">나도 랭킹에 도전!</h3>
            <p className="mb-4">재미있는 대화를 공유하면 랭킹에 오를 수 있어요</p>
            <button
              onClick={() => window.location.href = '/chat'}
              className="px-8 py-3 bg-white text-orange-500 rounded-full font-bold hover:scale-105 transition-transform"
            >
              지금 대화하러 가기 →
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// 랭킹 카드 컴포넌트
interface RankingCardProps {
  item: RankingItem;
  rank: number;
  index: number;
}

function RankingCard({ item, rank, index }: RankingCardProps) {
  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `${rank}위`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-yellow-600';
      case 2:
        return 'from-gray-300 to-gray-500';
      case 3:
        return 'from-orange-400 to-orange-600';
      default:
        return 'from-gray-200 to-gray-300';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all overflow-hidden"
    >
      <div className="flex items-center p-6 gap-4">
        {/* 순위 */}
        <div
          className={`flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br ${getRankColor(
            rank
          )} flex items-center justify-center text-white font-bold text-lg shadow-md`}
        >
          {rank <= 3 ? (
            <span className="text-3xl">{getMedalIcon(rank).slice(0, 2)}</span>
          ) : (
            <span>{rank}</span>
          )}
        </div>

        {/* 내용 */}
        <div className="flex-1 min-w-0">
          <p className="text-gray-800 font-medium text-lg mb-2 truncate">
            {item.content}
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Share2 className="w-4 h-4" />
            <span className="font-semibold text-orange-500">
              {item.share_count.toLocaleString()}회 공유
            </span>
          </div>
        </div>

        {/* 트렌드 아이콘 */}
        {rank <= 3 && (
          <div className="flex-shrink-0">
            <TrendingUp className="w-8 h-8 text-orange-500 animate-pulse" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
