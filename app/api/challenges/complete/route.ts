/**
 * 챌린지 완료 API
 * POST: 챌린지 완료 처리
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CompleteChallengeRequest, CompleteChallengeResponse } from '@/types/challenge';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: '인증에 실패했습니다' },
        { status: 401 }
      );
    }

    const userId = user.id;
    const body: CompleteChallengeRequest = await request.json();
    const { challenge_id, session_id } = body;

    if (!challenge_id) {
      return NextResponse.json(
        { error: 'challenge_id가 필요합니다' },
        { status: 400 }
      );
    }

    const todayDate = new Date().toISOString().split('T')[0];

    // 챌린지 정보 조회
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', challenge_id)
      .eq('is_active', true)
      .single();

    if (challengeError || !challenge) {
      return NextResponse.json(
        { error: '챌린지를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 이미 완료했는지 확인
    const { data: existingCompletion } = await supabase
      .from('user_challenges')
      .select('*')
      .eq('user_id', userId)
      .eq('challenge_id', challenge_id)
      .eq('completion_date', todayDate)
      .limit(1);

    if (existingCompletion && existingCompletion.length > 0) {
      return NextResponse.json(
        { error: '이미 완료한 챌린지입니다' },
        { status: 400 }
      );
    }

    // 챌린지 완료 기록 삽입
    const { error: insertError } = await supabase
      .from('user_challenges')
      .insert({
        user_id: userId,
        challenge_id,
        session_id: session_id || null,
        completion_date: todayDate,
      });

    if (insertError) {
      console.error('Challenge completion insert error:', insertError);
      return NextResponse.json(
        { error: '챌린지 완료 처리 중 오류가 발생했습니다' },
        { status: 500 }
      );
    }

    // 연속 기록 조회 (트리거가 자동으로 업데이트함)
    const { data: streakData } = await supabase
      .from('challenge_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    const currentStreak = streakData?.current_streak || 1;
    const isStreakMilestone = currentStreak % 7 === 0; // 7일 단위 마일스톤

    // 사용자 경험치 업데이트
    const { data: userData } = await supabase
      .from('users')
      .select('experience')
      .eq('id', userId)
      .single();

    if (userData) {
      const newExperience = (userData.experience || 0) + challenge.reward_experience;
      const { error: expUpdateError } = await supabase
        .from('users')
        .update({ experience: newExperience })
        .eq('id', userId);

      if (expUpdateError) {
        console.error('Experience update error:', expUpdateError);
      }
    }

    // 7일 연속 완료 시 뱃지 부여
    let badgeAwarded: string | undefined;
    if (isStreakMilestone && challenge.reward_badge) {
      badgeAwarded = challenge.reward_badge;

      // badges 배열에 뱃지 추가 (중복 방지)
      const { data: userData } = await supabase
        .from('users')
        .select('badges')
        .eq('id', userId)
        .single();

      const currentBadges = userData?.badges || [];
      if (!currentBadges.includes(badgeAwarded)) {
        await supabase
          .from('users')
          .update({
            badges: [...currentBadges, badgeAwarded],
          })
          .eq('id', userId);
      }
    }

    const response: CompleteChallengeResponse = {
      success: true,
      reward_experience: challenge.reward_experience,
      reward_badge: badgeAwarded,
      new_streak: currentStreak,
      is_streak_milestone: isStreakMilestone,
      message: isStreakMilestone
        ? `🎉 축하합니다! ${currentStreak}일 연속 완료! ${badgeAwarded ? `"${badgeAwarded}" 뱃지를 획득했습니다!` : ''}`
        : `✅ 챌린지 완료! 경험치 +${challenge.reward_experience}`,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Challenge completion error:', error);
    return NextResponse.json(
      { error: '챌린지 완료 처리 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
