import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import { EMPATHY_MODES } from '@/constants/modes';
import { EmpathyMode, Message } from '@/types/chat';

const SOLAR_API_URL = 'https://api.upstage.ai/v1/solar/chat/completions';

export async function POST(request: NextRequest) {
  try {
    const { message, mode, history, sessionId } = await request.json();

    const modeConfig = EMPATHY_MODES[mode as EmpathyMode];

    // 대화 히스토리 포맷팅
    const messages = [
      {
        role: 'system',
        content: modeConfig.systemPrompt
      },
      ...(history || []).map((msg: Message) => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ];

    // Solar API 호출
    const solarResponse = await fetch(SOLAR_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SOLAR_API_KEY}`
      },
      body: JSON.stringify({
        model: 'solar-pro',
        messages,
        temperature: 0.9,
        max_tokens: 500
      })
    });

    if (!solarResponse.ok) {
      const errorData = await solarResponse.json();
      console.error('Solar API error:', errorData);
      throw new Error(`Solar API error: ${solarResponse.status}`);
    }

    const data = await solarResponse.json();
    const response = data.choices[0].message.content;

    // 로그인 유저인 경우 DB에 저장
    let dbSessionId = sessionId;
    let dbSaveError = null;

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Authorization 헤더에서 토큰 가져오기
      const authHeader = request.headers.get('authorization');

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);

        // 토큰으로 사용자 정보 가져오기
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) {
          console.error('[Chat API] Auth error:', authError);
          dbSaveError = `Auth error: ${authError.message}`;
        } else if (user) {
          // 1. 세션 생성 또는 업데이트
          if (dbSessionId) {
            const { error: updateError } = await supabase
              .from('chat_sessions')
              .update({
                updated_at: new Date().toISOString(),
              })
              .eq('id', dbSessionId);

            if (updateError) {
              console.error('[Chat API] Session update error:', updateError);
              dbSaveError = `Session update error: ${updateError.message}`;
            }
          } else {
            const { data: newSession, error: sessionError } = await supabase
              .from('chat_sessions')
              .insert({
                user_id: user.id,
                title: message.substring(0, 50),
                mode: mode,
                message_count: 0,
                is_shared: false,
              })
              .select()
              .single();

            if (sessionError) {
              console.error('[Chat API] Session creation error:', sessionError);
              dbSaveError = `Session creation error: ${sessionError.message}`;
            } else if (newSession) {
              dbSessionId = newSession.id;
            }
          }

          // 2. 메시지 저장 (사용자 메시지 + AI 응답)
          if (dbSessionId) {
            const { error: messagesError } = await supabase.from('messages').insert([
              {
                session_id: dbSessionId,
                role: 'user',
                content: message,
                mode: mode,
              },
              {
                session_id: dbSessionId,
                role: 'assistant',
                content: response,
                mode: mode,
              }
            ]);

            if (messagesError) {
              console.error('[Chat API] Messages insert error:', messagesError);
              dbSaveError = `Messages insert error: ${messagesError.message}`;
            } else {
            }

            // 3. users 테이블 업데이트 (total_chats, experience) - RPC 함수 사용
            const { error: userUpdateError } = await supabase.rpc('increment_user_stats', {
              user_id: user.id
            });

            if (userUpdateError) {
              console.error('[Chat API] User update error:', userUpdateError);
              // RPC 함수가 없을 수 있으니 직접 업데이트 시도

              const { data: userData } = await supabase
                .from('users')
                .select('total_chats, experience')
                .eq('id', user.id)
                .single();

              if (userData) {
                const newTotalChats = (userData.total_chats || 0) + 1;
                const newExperience = (userData.experience || 0) + 1;

                const { error: directUpdateError } = await supabase
                  .from('users')
                  .update({
                    total_chats: newTotalChats,
                    experience: newExperience,
                    last_login_at: new Date().toISOString(),
                  })
                  .eq('id', user.id);

                if (directUpdateError) {
                  console.error('[Chat API] Direct user update error:', directUpdateError);
                  dbSaveError = `User update error: ${directUpdateError.message}`;
                } else {
                }
              }
            } else {
            }
          } else {
            console.error('[Chat API] No session ID available for message saving');
            dbSaveError = 'No session ID available';
          }
        } else {
          dbSaveError = 'No user found';
        }
      }
    } catch (dbError) {
      // DB 저장 실패해도 AI 응답은 반환
      console.error('[Chat API] DB save error:', dbError);
      dbSaveError = dbError instanceof Error ? dbError.message : 'Unknown error';
    }

    return NextResponse.json({
      response,
      sessionId: dbSessionId,
      dbSaved: !dbSaveError,
      dbError: dbSaveError
    });

  } catch (error) {
    console.error('Solar API error:', error);
    return NextResponse.json(
      { error: 'AI 응답 생성 실패' },
      { status: 500 }
    );
  }
}
