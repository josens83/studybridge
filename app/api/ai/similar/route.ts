import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { questionId, question, subject } = body;

    if (!question) {
      return NextResponse.json(
        { error: 'Missing question text' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Use full-text search to find similar questions
    let query = supabase
      .from('questions')
      .select('id, title, content, subject, grade_level, views, is_answered, created_at')
      .textSearch('search_vector', question, {
        type: 'websearch',
        config: 'simple',
      })
      .limit(6); // Get 6 to exclude the current question

    // Exclude current question if provided
    if (questionId) {
      query = query.neq('id', questionId);
    }

    // Filter by subject if provided
    if (subject) {
      query = query.eq('subject', subject);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error finding similar questions:', error);
      return NextResponse.json({ questions: [] });
    }

    // Return up to 5 similar questions
    return NextResponse.json({ questions: data?.slice(0, 5) || [] });
  } catch (error: any) {
    console.error('Error in similar questions endpoint:', error);
    return NextResponse.json({ questions: [] });
  }
}
