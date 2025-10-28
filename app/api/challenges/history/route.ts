/**
 * 챌린지 완료 기록 API
 * GET: 사용자의 챌린지 완료 기록 조회
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
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

    // URL 파라미터에서 limit 추출 (기본값: 30)
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '30', 10);

    // 사용자의 챌린지 완료 기록 조회 (최근순)
    const { data: userChallenges, error: challengesError } = await supabase
      .from('user_challenges')
      .select(`
        id,
        challenge_id,
        completed_at,
        completion_date,
        challenges (
          title,
          icon,
          reward_experience
        )
      `)
      .eq('user_id', userId)
      .order('completion_date', { ascending: false })
      .limit(limit);

    if (challengesError) {
      console.error('Error fetching challenge history:', challengesError);
      return NextResponse.json(
        { error: '챌린지 기록을 불러오는 중 오류가 발생했습니다' },
        { status: 500 }
      );
    }

    // 데이터 포맷팅
    const history = userChallenges?.map((item: any) => ({
      id: item.id,
      challenge_id: item.challenge_id,
      completed_at: item.completed_at,
      completion_date: item.completion_date,
      challenge_title: item.challenges?.title || '챌린지',
      challenge_icon: item.challenges?.icon || '🎯',
      reward_experience: item.challenges?.reward_experience || 10,
    })) || [];

    return NextResponse.json({ history });

  } catch (error) {
    console.error('Challenge history fetch error:', error);
    return NextResponse.json(
      { error: '챌린지 기록을 불러오는 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
