import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { session_id, platform, image_url } = await request.json();

    if (!session_id) {
      return NextResponse.json(
        { error: 'session_id가 필요합니다' },
        { status: 400 }
      );
    }

    // Authorization 헤더에서 토큰 가져오기
    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);

      if (authError) {
        console.error('[Share API] Auth error:', authError);
      } else if (user) {
        userId = user.id;
      }
    }

    // 기존 공유 레코드 확인
    const { data: existingShare } = await supabase
      .from('shares')
      .select('*')
      .eq('session_id', session_id)
      .maybeSingle();

    if (existingShare) {
      // 기존 레코드가 있으면 share_count 증가
      const { data: updatedShare, error: updateError } = await supabase
        .from('shares')
        .update({
          share_count: existingShare.share_count + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingShare.id)
        .select()
        .single();

      if (updateError) {
        console.error('[Share API] Update error:', updateError);
        return NextResponse.json(
          { error: '공유 업데이트 실패', details: updateError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        share: updatedShare,
        message: '공유되었습니다!',
      });
    } else {
      // 새로운 공유 레코드 생성
      const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://mugonggam.app'}/chat/${session_id}`;

      const { data: newShare, error: insertError } = await supabase
        .from('shares')
        .insert({
          user_id: userId,
          session_id,
          share_url: shareUrl,
          image_url: image_url || null,
          platform: platform || null,
          share_count: 1,
        })
        .select()
        .single();

      if (insertError) {
        console.error('[Share API] Insert error:', insertError);
        return NextResponse.json(
          { error: '공유 생성 실패', details: insertError.message },
          { status: 500 }
        );
      }

      // chat_sessions의 is_shared를 true로 업데이트
      await supabase
        .from('chat_sessions')
        .update({ is_shared: true })
        .eq('id', session_id);

      // 회원이면 total_shares 증가 및 경험치 추가
      if (userId) {
        const { data: userData } = await supabase
          .from('users')
          .select('total_shares, experience')
          .eq('id', userId)
          .single();

        if (userData) {
          await supabase
            .from('users')
            .update({
              total_shares: (userData.total_shares || 0) + 1,
              experience: (userData.experience || 0) + 5, // 공유당 5 경험치
            })
            .eq('id', userId);
        }
      }

      return NextResponse.json({
        success: true,
        share: newShare,
        message: '공유되었습니다!',
      });
    }

  } catch (error) {
    console.error('[Share API] Unexpected error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// GET: 특정 세션의 공유 정보 조회
export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'session_id가 필요합니다' },
        { status: 400 }
      );
    }

    const { data: share, error } = await supabase
      .from('shares')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (error) {
      console.error('[Share API] GET error:', error);
      return NextResponse.json(
        { error: '공유 정보 조회 실패', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      share: share || null,
      share_count: share?.share_count || 0,
    });

  } catch (error) {
    console.error('[Share API] Unexpected GET error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
