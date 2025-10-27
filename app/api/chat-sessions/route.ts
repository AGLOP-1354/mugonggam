import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/chat-sessions
 * 로그인한 사용자의 모든 채팅 세션 목록을 가져옵니다.
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

    // 모든 세션 가져오기 (user 메시지 개수 계산 포함)
    const { data: sessions, error: sessionsError } = await supabase
      .from('chat_sessions')
      .select(`
        id,
        title,
        mode,
        message_count,
        created_at,
        updated_at
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (sessionsError) {
      console.error('[Chat Sessions API] Sessions fetch error:', sessionsError);
      return NextResponse.json(
        { error: '세션 조회 실패', details: sessionsError.message },
        { status: 500 }
      );
    }

    // 각 세션의 user 메시지 개수 계산
    const sessionsWithUserCount = await Promise.all(
      (sessions || []).map(async (session) => {
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('session_id', session.id)
          .eq('role', 'user');

        return {
          ...session,
          user_message_count: count || 0
        };
      })
    );

    return NextResponse.json({
      sessions: sessionsWithUserCount
    });

  } catch (error) {
    console.error('[Chat Sessions API] Error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chat-sessions
 * 채팅 세션을 데이터베이스에 저장합니다.
 *
 * Request Body:
 * {
 *   session: ChatSession (from chatStore)
 * }
 */
export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  try {
    const { session } = await request.json();

    if (!session || !session.messages || session.messages.length === 0) {
      return NextResponse.json(
        { error: '저장할 채팅 세션이 없습니다.' },
        { status: 400 }
      );
    }

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

    const userId = user.id;

    // 1. 채팅 세션 생성
    const { data: chatSession, error: sessionError } = await supabase
      .from('chat_sessions')
      .insert({
        user_id: userId,
        title: session.messages[0]?.content.substring(0, 50) || '새 대화',
        mode: session.currentMode,
        message_count: session.messages.length,
        is_shared: false,
        created_at: session.createdAt,
        updated_at: session.lastUpdatedAt,
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Chat session creation error:', sessionError);
      return NextResponse.json(
        { error: '채팅 세션 생성 실패', details: sessionError.message },
        { status: 500 }
      );
    }

    // 2. 메시지들 저장
    const messages = session.messages.map((msg: any) => ({
      session_id: chatSession.id,
      role: msg.role,
      content: msg.content,
      mode: msg.mode,
      created_at: msg.timestamp,
    }));

    const { error: messagesError } = await supabase
      .from('messages')
      .insert(messages);

    if (messagesError) {
      console.error('Messages insertion error:', messagesError);
      // 세션은 생성되었지만 메시지 저장 실패 - 세션 삭제
      await supabase.from('chat_sessions').delete().eq('id', chatSession.id);

      return NextResponse.json(
        { error: '메시지 저장 실패', details: messagesError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      sessionId: chatSession.id,
      messageCount: messages.length,
    });

  } catch (error) {
    console.error('Chat session save error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
