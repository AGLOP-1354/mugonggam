import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/users/me
 * 현재 로그인한 사용자 정보 조회
 */
export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Authorization 헤더에서 토큰 가져오기
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // 토큰으로 사용자 정보 가져오기
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // DB에서 사용자 정보 조회
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (dbError) {
      // DB에 사용자 정보가 없으면 생성
      if (dbError.code === 'PGRST116') {
        const nickname = user.user_metadata.full_name ||
                        user.user_metadata.name ||
                        user.email?.split('@')[0] ||
                        '사용자';

        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email,
            nickname: nickname,
            role: 'member',
            provider: user.app_metadata.provider || 'email',
            level: 1,
            experience: 0,
            total_chats: 0,
            total_shares: 0,
            current_streak: 0,
            last_login_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (createError) {
          console.error('User creation error:', createError);
          return NextResponse.json(
            { error: '사용자 정보 생성 실패' },
            { status: 500 }
          );
        }

        return NextResponse.json({ user: newUser });
      }

      console.error('User fetch error:', dbError);
      return NextResponse.json(
        { error: '사용자 정보 조회 실패' },
        { status: 500 }
      );
    }

    return NextResponse.json({ user: userData });

  } catch (error) {
    console.error('User fetch error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
