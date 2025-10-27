import { NextRequest, NextResponse } from 'next/server';

import { EMPATHY_MODES } from '@/constants/modes';
import { EmpathyMode, Message } from '@/types/chat';

const SOLAR_API_URL = 'https://api.upstage.ai/v1/solar/chat/completions';

export async function POST(request: NextRequest) {
  try {
    const { message, mode, history } = await request.json();

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

    return NextResponse.json({ response });

  } catch (error) {
    console.error('Solar API error:', error);
    return NextResponse.json(
      { error: 'AI 응답 생성 실패' },
      { status: 500 }
    );
  }
}
