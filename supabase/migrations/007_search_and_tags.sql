-- Add Full-Text Search for questions
-- Create a text search configuration for Korean (using simple for now)
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create index for full-text search
CREATE INDEX IF NOT EXISTS idx_questions_search ON public.questions USING gin(search_vector);

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_question_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.content, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW.subject, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update search vector
DROP TRIGGER IF EXISTS questions_search_vector_update ON public.questions;
CREATE TRIGGER questions_search_vector_update
  BEFORE INSERT OR UPDATE OF title, content, subject
  ON public.questions
  FOR EACH ROW
  EXECUTE FUNCTION update_question_search_vector();

-- Update existing questions with search vectors
UPDATE public.questions SET search_vector =
  setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(content, '')), 'B') ||
  setweight(to_tsvector('simple', coalesce(subject, '')), 'C');

-- Create tags table
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create question_tags junction table (many-to-many)
CREATE TABLE IF NOT EXISTS public.question_tags (
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (question_id, tag_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tags_name ON public.tags(name);
CREATE INDEX IF NOT EXISTS idx_tags_usage ON public.tags(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_question_tags_question ON public.question_tags(question_id);
CREATE INDEX IF NOT EXISTS idx_question_tags_tag ON public.question_tags(tag_id);

-- Enable RLS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_tags ENABLE ROW LEVEL SECURITY;

-- RLS policies for tags (everyone can read)
CREATE POLICY "Everyone can view tags" ON public.tags FOR SELECT USING (true);

-- RLS policies for question_tags
CREATE POLICY "Everyone can view question tags" ON public.question_tags FOR SELECT USING (true);
CREATE POLICY "Question authors can add tags" ON public.question_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.questions
      WHERE id = question_id AND author_id = auth.uid()
    )
  );
CREATE POLICY "Question authors can remove tags" ON public.question_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.questions
      WHERE id = question_id AND author_id = auth.uid()
    )
  );

-- Function to update tag usage count
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.tags SET usage_count = usage_count + 1 WHERE id = NEW.tag_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.tags SET usage_count = usage_count - 1 WHERE id = OLD.tag_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update tag usage count
DROP TRIGGER IF EXISTS question_tags_usage_count ON public.question_tags;
CREATE TRIGGER question_tags_usage_count
  AFTER INSERT OR DELETE ON public.question_tags
  FOR EACH ROW
  EXECUTE FUNCTION update_tag_usage_count();

-- Insert some common tags
INSERT INTO public.tags (name, slug, description) VALUES
  ('수학-공식', 'math-formula', '수학 공식 관련 질문'),
  ('수학-증명', 'math-proof', '수학 증명 관련 질문'),
  ('영어-문법', 'english-grammar', '영어 문법 관련 질문'),
  ('영어-독해', 'english-reading', '영어 독해 관련 질문'),
  ('과학-실험', 'science-experiment', '과학 실험 관련 질문'),
  ('물리-역학', 'physics-mechanics', '물리 역학 관련 질문'),
  ('화학-반응', 'chemistry-reaction', '화학 반응 관련 질문'),
  ('코딩', 'coding', '프로그래밍 및 코딩 관련'),
  ('시험-대비', 'exam-prep', '시험 대비 관련'),
  ('숙제-도움', 'homework-help', '숙제 도움 필요')
ON CONFLICT (slug) DO NOTHING;

-- Create materialized view for popular questions (for better performance)
CREATE MATERIALIZED VIEW IF NOT EXISTS popular_questions AS
SELECT
  q.*,
  COUNT(DISTINCT a.id) as answer_count,
  COUNT(DISTINCT b.id) as bookmark_count
FROM public.questions q
LEFT JOIN public.answers a ON q.id = a.question_id
LEFT JOIN public.bookmarks b ON q.id = b.question_id
GROUP BY q.id
ORDER BY q.views DESC, answer_count DESC
LIMIT 100;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_popular_questions_id ON popular_questions(id);

-- Function to refresh popular questions
CREATE OR REPLACE FUNCTION refresh_popular_questions()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY popular_questions;
END;
$$ LANGUAGE plpgsql;
