import { getSupabase } from './client';

export interface TutorSubject {
  id: string;
  tutor_id: string;
  subject: string;
  proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  created_at: string;
}

export interface TutorAvailability {
  id: string;
  tutor_id: string;
  day_of_week: number; // 0 = Sunday, 6 = Saturday
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface TutorReview {
  id: string;
  tutor_id: string;
  student_id: string;
  rating: number;
  review_text?: string;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
  student?: {
    nickname: string;
  };
}

export interface TutorProfile {
  id: string;
  nickname: string;
  bio?: string;
  education?: string;
  teaching_experience: number;
  hourly_rate: number;
  is_verified_tutor: boolean;
  average_rating: number;
  total_reviews: number;
  total_students: number;
  profile_image_url?: string;
  subjects?: TutorSubject[];
  availability?: TutorAvailability[];
  recent_reviews?: TutorReview[];
}

/**
 * Get tutor profile with all details
 */
export async function getTutorProfile(tutorId: string): Promise<TutorProfile | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', tutorId)
    .eq('role', 'tutor')
    .single();

  if (error || !data) {
    console.error('Error fetching tutor profile:', error);
    return null;
  }

  // Fetch subjects
  const { data: subjects } = await supabase
    .from('tutor_subjects')
    .select('*')
    .eq('tutor_id', tutorId)
    .order('proficiency_level', { ascending: false });

  // Fetch availability
  const { data: availability } = await supabase
    .from('tutor_availability')
    .select('*')
    .eq('tutor_id', tutorId)
    .eq('is_available', true)
    .order('day_of_week');

  // Fetch recent reviews
  const { data: reviews } = await supabase
    .from('tutor_reviews')
    .select(`
      *,
      student:users!tutor_reviews_student_id_fkey(nickname)
    `)
    .eq('tutor_id', tutorId)
    .order('created_at', { ascending: false })
    .limit(10);

  return {
    ...data,
    subjects: subjects || [],
    availability: availability || [],
    recent_reviews: reviews || [],
  };
}

/**
 * Get featured tutors (highest rated)
 */
export async function getFeaturedTutors(limit: number = 10): Promise<any[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase.rpc('get_featured_tutors', {
    p_limit: limit,
  });

  if (error) {
    console.error('Error fetching featured tutors:', error);
    return [];
  }

  return data || [];
}

/**
 * Search tutors by subject and filters
 */
export async function searchTutors(filters: {
  subject?: string;
  minRating?: number;
  maxHourlyRate?: number;
  verified?: boolean;
}): Promise<any[]> {
  const supabase = getSupabase();

  let query = supabase
    .from('users')
    .select(`
      id,
      nickname,
      bio,
      average_rating,
      total_reviews,
      hourly_rate,
      is_verified_tutor,
      profile_image_url,
      tutor_subjects(subject, proficiency_level)
    `)
    .eq('role', 'tutor');

  if (filters.minRating) {
    query = query.gte('average_rating', filters.minRating);
  }

  if (filters.maxHourlyRate) {
    query = query.lte('hourly_rate', filters.maxHourlyRate);
  }

  if (filters.verified) {
    query = query.eq('is_verified_tutor', true);
  }

  const { data, error } = await query.order('average_rating', { ascending: false });

  if (error) {
    console.error('Error searching tutors:', error);
    return [];
  }

  // Filter by subject if specified
  if (filters.subject) {
    return (data || []).filter((tutor: any) =>
      tutor.tutor_subjects?.some((s: any) => s.subject === filters.subject)
    );
  }

  return data || [];
}

/**
 * Add or update tutor subject
 */
export async function updateTutorSubject(
  tutorId: string,
  subject: string,
  proficiencyLevel: TutorSubject['proficiency_level']
): Promise<TutorSubject | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('tutor_subjects')
    .upsert({
      tutor_id: tutorId,
      subject,
      proficiency_level: proficiencyLevel,
    })
    .select()
    .single();

  if (error) {
    console.error('Error updating tutor subject:', error);
    return null;
  }

  return data;
}

/**
 * Remove tutor subject
 */
export async function removeTutorSubject(tutorId: string, subject: string): Promise<boolean> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('tutor_subjects')
    .delete()
    .eq('tutor_id', tutorId)
    .eq('subject', subject);

  if (error) {
    console.error('Error removing tutor subject:', error);
    return false;
  }

  return true;
}

/**
 * Update tutor availability
 */
export async function updateTutorAvailability(
  tutorId: string,
  availability: Omit<TutorAvailability, 'id' | 'tutor_id' | 'created_at' | 'updated_at'>
): Promise<TutorAvailability | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('tutor_availability')
    .upsert({
      tutor_id: tutorId,
      ...availability,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error updating tutor availability:', error);
    return null;
  }

  return data;
}

/**
 * Create or update tutor review
 */
export async function createOrUpdateTutorReview(
  tutorId: string,
  studentId: string,
  rating: number,
  reviewText?: string,
  isAnonymous: boolean = false
): Promise<TutorReview | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('tutor_reviews')
    .upsert({
      tutor_id: tutorId,
      student_id: studentId,
      rating,
      review_text: reviewText,
      is_anonymous: isAnonymous,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating/updating review:', error);
    return null;
  }

  return data;
}

/**
 * Delete tutor review
 */
export async function deleteTutorReview(reviewId: string): Promise<boolean> {
  const supabase = getSupabase();

  const { error } = await supabase.from('tutor_reviews').delete().eq('id', reviewId);

  if (error) {
    console.error('Error deleting review:', error);
    return false;
  }

  return true;
}

/**
 * Get tutor reviews
 */
export async function getTutorReviews(tutorId: string, limit: number = 20): Promise<TutorReview[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('tutor_reviews')
    .select(`
      *,
      student:users!tutor_reviews_student_id_fkey(nickname)
    `)
    .eq('tutor_id', tutorId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }

  return data || [];
}
