import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/chat-sessions/[sessionId]
 * 특정 채팅 세션과 메시지를 가져옵니다.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { sessionId } = await params;

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


    // 세션 가져오기 (사용자 권한 확인)
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: '세션을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }


    // 해당 세션의 메시지 가져오기
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', session.id)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('[Chat Session API] Messages fetch error:', messagesError);
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
      id: session.id,
      messages: formattedMessages,
      currentMode: session.mode,
      createdAt: new Date(session.created_at),
      lastUpdatedAt: new Date(session.updated_at),
      isGuest: false
    };

    return NextResponse.json({
      session: chatSession,
      sessionId: session.id
    });

  } catch (error) {
    console.error('[Chat Session API] Error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
