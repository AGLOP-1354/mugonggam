/**
 * 데일리 챌린지 API
 * GET: 오늘의 챌린지 조회
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Challenge, TodayChallengeResponse } from '@/types/challenge';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (!error && user) {
        userId = user.id;
      }
    }

    // 오늘의 요일 계산 (0=일요일, 6=토요일)
    const today = new Date();
    const dayOfWeek = today.getDay();
    const todayDate = today.toISOString().split('T')[0];

    // 오늘의 챌린지 조회
    const { data: challenges, error: challengeError } = await supabase
      .from('challenges')
      .select('*')
      .eq('type', 'daily')
      .eq('day_of_week', dayOfWeek)
      .eq('is_active', true)
      .limit(1);

    if (challengeError || !challenges || challenges.length === 0) {
      return NextResponse.json(
        { error: '오늘의 챌린지를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    const challenge = challenges[0] as Challenge;

    // 게스트 사용자인 경우 완료 정보 없이 반환
    if (!userId) {
      return NextResponse.json({
        challenge,
        is_completed: false,
        streak: {
          current: 0,
          max: 0,
        },
      } as TodayChallengeResponse);
    }

    // 회원 사용자: 완료 여부 확인
    const { data: userChallenges } = await supabase
      .from('user_challenges')
      .select('*')
      .eq('user_id', userId)
      .eq('challenge_id', challenge.id)
      .eq('completion_date', todayDate)
      .limit(1);

    const isCompleted = userChallenges && userChallenges.length > 0;
    const completedAt = isCompleted ? userChallenges[0].completed_at : undefined;

    // 연속 기록 조회
    const { data: streakData } = await supabase
      .from('challenge_streaks')
      .select('*')
      .eq('user_id', userId)
      .limit(1);

    const streak = streakData && streakData.length > 0 ? streakData[0] : {
      current_streak: 0,
      max_streak: 0,
      last_completed_date: null,
    };

    return NextResponse.json({
      challenge,
      is_completed: isCompleted,
      completed_at: completedAt,
      streak: {
        current: streak.current_streak,
        max: streak.max_streak,
        last_completed_date: streak.last_completed_date,
      },
    } as TodayChallengeResponse);

  } catch (error) {
    console.error('Challenge fetch error:', error);
    return NextResponse.json(
      { error: '챌린지를 불러오는 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
