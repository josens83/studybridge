import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';

// GET /api/questions - Get all questions
export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = supabaseAdmin
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (subject) {
      query = query.eq('subject', subject);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ questions: data });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

// POST /api/questions - Create a new question
export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body = await request.json();
    const {
      author_id,
      author_nickname,
      title,
      content,
      subject,
      grade_level,
      image_urls = [],
      coins_reward = 100,
      is_urgent = false,
    } = body;

    // Validate required fields
    if (!author_id || !title || !content || !subject || !grade_level) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert question
    const { data, error } = await supabaseAdmin
      .from('questions')
      .insert({
        author_id,
        author_nickname,
        title,
        content,
        subject,
        grade_level,
        image_urls,
        coins_reward,
        is_urgent,
      })
      .select()
      .single();

    if (error) throw error;

    // Deduct coins from user
    await supabaseAdmin.rpc('deduct_coins', {
      user_id: author_id,
      amount: coins_reward,
    });

    // Record coin transaction
    await supabaseAdmin.from('coin_transactions').insert({
      user_id: author_id,
      amount: -coins_reward,
      type: 'spend',
      description: `질문 등록: ${title}`,
      related_id: data.id,
    });

    return NextResponse.json({ question: data }, { status: 201 });
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    );
  }
}
