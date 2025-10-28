import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { RankingResponse, RankingItem } from '@/types/ranking';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const limitParam = searchParams.get('limit');

    // 날짜 파라미터 (기본값: 오늘)
    const targetDate = dateParam || new Date().toISOString().split('T')[0];
    const limit = limitParam ? parseInt(limitParam) : 10;

    // rankings 테이블에서 조회
    const { data: rankings, error, count } = await supabase
      .from('rankings')
      .select('*', { count: 'exact' })
      .eq('date', targetDate)
      .order('share_count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[Ranking API] Error fetching rankings:', error);
      return NextResponse.json(
        { error: '랭킹 조회 실패', details: error.message },
        { status: 500 }
      );
    }

    // rankings 테이블이 비어있으면 실시간으로 shares에서 계산
    if (!rankings || rankings.length === 0) {
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      // shares 테이블에서 당일 공유 순위 계산
      const { data: shares, error: sharesError } = await supabase
        .from('shares')
        .select('session_id, share_count')
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString())
        .order('share_count', { ascending: false })
        .limit(limit);

      if (sharesError) {
        console.error('[Ranking API] Error fetching shares:', sharesError);
        return NextResponse.json(
          { error: '공유 데이터 조회 실패', details: sharesError.message },
          { status: 500 }
        );
      }

      // session_id로 메시지 내용 가져오기
      const sessionIds = shares?.map(s => s.session_id) || [];

      if (sessionIds.length > 0) {
        const { data: sessions } = await supabase
          .from('chat_sessions')
          .select('id, title')
          .in('id', sessionIds);

        // 임시 랭킹 데이터 생성
        const tempRankings: RankingItem[] = shares?.map((share, index) => {
          const session = sessions?.find(s => s.id === share.session_id);
          return {
            id: `temp-${index}`,
            date: targetDate,
            content: session?.title || '대화 내용',
            share_count: share.share_count,
            session_id: share.session_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        }) || [];

        const response: RankingResponse = {
          rankings: tempRankings,
          date: targetDate,
          total: tempRankings.length,
        };

        return NextResponse.json(response);
      }
    }

    const response: RankingResponse = {
      rankings: rankings || [],
      date: targetDate,
      total: count || 0,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('[Ranking API] Unexpected error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// POST: 랭킹 업데이트 (배치 작업용)
export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { date: targetDateParam } = await request.json();

    // 기본값: 어제 날짜
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const targetDate = targetDateParam || yesterday.toISOString().split('T')[0];

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // 당일 공유 TOP 10 가져오기
    const { data: topShares, error: sharesError } = await supabase
      .from('shares')
      .select('session_id, share_count')
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString())
      .order('share_count', { ascending: false })
      .limit(10);

    if (sharesError) {
      console.error('[Ranking API] Error fetching shares for update:', sharesError);
      return NextResponse.json(
        { error: '공유 데이터 조회 실패', details: sharesError.message },
        { status: 500 }
      );
    }

    if (!topShares || topShares.length === 0) {
      return NextResponse.json({
        message: '업데이트할 데이터가 없습니다',
        updated: 0,
      });
    }

    // session_id로 대화 내용 가져오기
    const sessionIds = topShares.map(s => s.session_id);
    const { data: sessions } = await supabase
      .from('chat_sessions')
      .select('id, title')
      .in('id', sessionIds);

    // rankings 테이블에 삽입
    const rankingsToInsert = topShares.map(share => {
      const session = sessions?.find(s => s.id === share.session_id);
      return {
        date: targetDate,
        content: session?.title || '대화 내용',
        share_count: share.share_count,
        session_id: share.session_id,
      };
    });

    const { error: insertError, count } = await supabase
      .from('rankings')
      .upsert(rankingsToInsert, {
        onConflict: 'date,session_id',
        ignoreDuplicates: false,
      });

    if (insertError) {
      console.error('[Ranking API] Error inserting rankings:', insertError);
      return NextResponse.json(
        { error: '랭킹 업데이트 실패', details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: '랭킹이 성공적으로 업데이트되었습니다',
      updated: count || rankingsToInsert.length,
      date: targetDate,
    });

  } catch (error) {
    console.error('[Ranking API] Unexpected error in POST:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
