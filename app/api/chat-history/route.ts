import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/chat-history
 * 로그인한 사용자의 최근 채팅 세션과 메시지를 가져옵니다.
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

    // 최근 세션 가져오기 (가장 최근 1개)
    const { data: sessions, error: sessionsError } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (sessionsError) {
      console.error('[Chat History API] Sessions fetch error:', sessionsError);
      return NextResponse.json(
        { error: '세션 조회 실패', details: sessionsError.message },
        { status: 500 }
      );
    }

    if (!sessions || sessions.length === 0) {
      return NextResponse.json({
        session: null,
        messages: []
      });
    }

    const latestSession = sessions[0];

    // 해당 세션의 메시지 가져오기
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', latestSession.id)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('[Chat History API] Messages fetch error:', messagesError);
      return NextResponse.json(
        { error: '메시지 조회 실패', details: messagesError.message },
        { status: 500 }
      );
    }

    // 프론트엔드 형식으로 변환
    const formattedMessages = (messages || []).map((msg: any) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      mode: msg.mode,
      timestamp: new Date(msg.created_at)
    }));

    const chatSession = {
      id: latestSession.id,
      messages: formattedMessages,
      currentMode: latestSession.mode,
      createdAt: new Date(latestSession.created_at),
      lastUpdatedAt: new Date(latestSession.updated_at),
      isGuest: false
    };

    return NextResponse.json({
      session: chatSession,
      sessionId: latestSession.id
    });

  } catch (error) {
    console.error('[Chat History API] Error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
