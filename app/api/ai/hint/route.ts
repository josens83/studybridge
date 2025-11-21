import { NextRequest, NextResponse } from 'next/server';
import { generateHint } from '@/lib/ai/openai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, subject, gradeLevel } = body;

    if (!question || !subject || !gradeLevel) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error: 'AI 기능이 설정되지 않았습니다.',
          hint: '이 질문에 대한 힌트를 제공하려면 OpenAI API 키가 필요합니다.',
          concepts: [],
          relatedTopics: []
        },
        { status: 200 } // Return 200 with fallback message
      );
    }

    const hint = await generateHint(question, subject, gradeLevel);

    return NextResponse.json(hint);
  } catch (error: any) {
    console.error('Error in AI hint endpoint:', error);

    // Return a fallback response instead of error
    return NextResponse.json({
      hint: '죄송합니다. 현재 AI 힌트를 생성할 수 없습니다. 나중에 다시 시도해주세요.',
      concepts: [],
      relatedTopics: [],
    });
  }
}
