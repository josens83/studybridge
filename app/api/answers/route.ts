import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

// POST /api/answers - Create a new answer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      question_id,
      author_id,
      author_nickname,
      author_role,
      content,
      image_urls = [],
    } = body;

    // Validate required fields
    if (!question_id || !author_id || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert answer
    const { data, error } = await supabaseAdmin
      .from('answers')
      .insert({
        question_id,
        author_id,
        author_nickname,
        author_role,
        content,
        image_urls,
      })
      .select()
      .single();

    if (error) throw error;

    // Award points for answering
    await supabaseAdmin.rpc('add_points', {
      user_id: author_id,
      amount: 20,
    });

    // Record point transaction
    await supabaseAdmin.from('point_transactions').insert({
      user_id: author_id,
      amount: 20,
      type: 'earn',
      description: '답변 작성 보상',
      related_id: data.id,
    });

    // Create notification for question author
    const { data: question } = await supabaseAdmin
      .from('questions')
      .select('author_id, title')
      .eq('id', question_id)
      .single();

    if (question) {
      await supabaseAdmin.from('notifications').insert({
        user_id: question.author_id,
        type: 'answer',
        title: '새로운 답변',
        content: `"${question.title}" 질문에 새로운 답변이 달렸습니다.`,
        link: `/question/${question_id}`,
      });
    }

    return NextResponse.json({ answer: data }, { status: 201 });
  } catch (error) {
    console.error('Error creating answer:', error);
    return NextResponse.json(
      { error: 'Failed to create answer' },
      { status: 500 }
    );
  }
}
