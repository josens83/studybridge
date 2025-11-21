-- Add tutor-specific columns to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS education TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS teaching_experience INTEGER DEFAULT 0; -- years
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS hourly_rate INTEGER DEFAULT 0; -- in coins
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_verified_tutor BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS total_students INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Create tutor_subjects table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.tutor_subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  proficiency_level TEXT NOT NULL CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tutor_id, subject)
);

-- Create tutor_availability table
CREATE TABLE IF NOT EXISTS public.tutor_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create tutor_reviews table
CREATE TABLE IF NOT EXISTS public.tutor_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tutor_id, student_id) -- One review per student-tutor pair
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tutor_subjects_tutor ON public.tutor_subjects(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutor_subjects_subject ON public.tutor_subjects(subject);
CREATE INDEX IF NOT EXISTS idx_tutor_availability_tutor ON public.tutor_availability(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutor_reviews_tutor ON public.tutor_reviews(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutor_reviews_rating ON public.tutor_reviews(tutor_id, rating);
CREATE INDEX IF NOT EXISTS idx_users_avg_rating ON public.users(average_rating DESC) WHERE role = 'tutor';

-- Enable RLS
ALTER TABLE public.tutor_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_reviews ENABLE ROW LEVEL SECURITY;

-- RLS policies for tutor_subjects
CREATE POLICY "Everyone can view tutor subjects" ON public.tutor_subjects FOR SELECT USING (true);
CREATE POLICY "Tutors can manage own subjects" ON public.tutor_subjects FOR ALL USING (auth.uid() = tutor_id);

-- RLS policies for tutor_availability
CREATE POLICY "Everyone can view tutor availability" ON public.tutor_availability FOR SELECT USING (true);
CREATE POLICY "Tutors can manage own availability" ON public.tutor_availability FOR ALL USING (auth.uid() = tutor_id);

-- RLS policies for tutor_reviews
CREATE POLICY "Everyone can view reviews" ON public.tutor_reviews FOR SELECT USING (true);
CREATE POLICY "Students can create reviews for tutors" ON public.tutor_reviews
  FOR INSERT
  WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students can update own reviews" ON public.tutor_reviews
  FOR UPDATE
  USING (auth.uid() = student_id);
CREATE POLICY "Students can delete own reviews" ON public.tutor_reviews
  FOR DELETE
  USING (auth.uid() = student_id);

-- Function to update tutor average rating
CREATE OR REPLACE FUNCTION update_tutor_rating()
RETURNS TRIGGER AS $$
DECLARE
  v_avg_rating DECIMAL(3,2);
  v_total_reviews INTEGER;
BEGIN
  -- Calculate new average rating and total reviews
  SELECT
    ROUND(AVG(rating)::numeric, 2),
    COUNT(*)
  INTO v_avg_rating, v_total_reviews
  FROM public.tutor_reviews
  WHERE tutor_id = COALESCE(NEW.tutor_id, OLD.tutor_id);

  -- Update tutor's average rating and review count
  UPDATE public.users
  SET
    average_rating = COALESCE(v_avg_rating, 0),
    total_reviews = v_total_reviews
  WHERE id = COALESCE(NEW.tutor_id, OLD.tutor_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update rating on review insert/update/delete
DROP TRIGGER IF EXISTS tutor_review_rating_update ON public.tutor_reviews;
CREATE TRIGGER tutor_review_rating_update
  AFTER INSERT OR UPDATE OR DELETE ON public.tutor_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_tutor_rating();

-- Function to get featured tutors (highest rated, most reviews)
CREATE OR REPLACE FUNCTION get_featured_tutors(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  nickname TEXT,
  bio TEXT,
  average_rating DECIMAL(3,2),
  total_reviews INTEGER,
  total_students INTEGER,
  hourly_rate INTEGER,
  is_verified_tutor BOOLEAN,
  profile_image_url TEXT,
  subjects JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.nickname,
    u.bio,
    u.average_rating,
    u.total_reviews,
    u.total_students,
    u.hourly_rate,
    u.is_verified_tutor,
    u.profile_image_url,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'subject', ts.subject,
          'proficiency', ts.proficiency_level
        )
      ) FILTER (WHERE ts.subject IS NOT NULL),
      '[]'::jsonb
    ) as subjects
  FROM public.users u
  LEFT JOIN public.tutor_subjects ts ON u.id = ts.tutor_id
  WHERE u.role = 'tutor'
  GROUP BY u.id
  ORDER BY u.average_rating DESC, u.total_reviews DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
