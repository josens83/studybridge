-- =====================================================
-- 003_test_data.sql
-- Sample data for testing StudyBridge platform
-- =====================================================
--
-- IMPORTANT: This file contains test data for development/testing only
-- DO NOT run this on production database
--
-- To use this data:
-- 1. Make sure 001_initial_schema.sql and 002_functions.sql are already executed
-- 2. Run this SQL in Supabase SQL Editor
-- 3. You can login with test user credentials or use anonymous login
--
-- Test Users:
-- Email: student1@test.com / Password: password123
-- Email: tutor1@test.com / Password: password123
-- =====================================================

-- Clean existing test data (optional - uncomment if needed)
-- DELETE FROM public.notifications;
-- DELETE FROM public.answers;
-- DELETE FROM public.questions;
-- DELETE FROM public.coin_transactions;
-- DELETE FROM public.point_transactions;
-- DELETE FROM public.users WHERE email LIKE '%@test.com';

-- =====================================================
-- Insert Test Users
-- =====================================================

-- Note: In production, users are created via auth.users table by Supabase Auth
-- For testing, we'll create profile records directly
-- You'll need to sign up these users through the UI first, or create them in auth.users

INSERT INTO public.users (id, email, nickname, role, coins, points, subscription_tier)
VALUES
  -- Student users
  ('11111111-1111-1111-1111-111111111111', 'student1@test.com', '공부왕김씨', 'student', 800, 120, 'free'),
  ('22222222-2222-2222-2222-222222222222', 'student2@test.com', '수학천재', 'student', 1200, 250, 'premium'),
  ('33333333-3333-3333-3333-333333333333', 'student3@test.com', '영어마스터', 'student', 500, 80, 'free'),

  -- Tutor users
  ('44444444-4444-4444-4444-444444444444', 'tutor1@test.com', '서울대튜터', 'tutor', 2000, 450, 'free'),
  ('55555555-5555-5555-5555-555555555555', 'tutor2@test.com', '과학선생님', 'tutor', 1500, 380, 'premium')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  nickname = EXCLUDED.nickname,
  coins = EXCLUDED.coins,
  points = EXCLUDED.points;

-- =====================================================
-- Insert Test Questions
-- =====================================================

INSERT INTO public.questions (id, author_id, author_nickname, title, content, subject, grade_level, coins_reward, is_urgent, views, created_at)
VALUES
  (
    'q1111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    '공부왕김씨',
    '2차 방정식 근의 공식 유도 과정이 궁금합니다',
    'ax^2 + bx + c = 0 형태의 2차 방정식에서 근의 공식을 유도하는 과정을 자세히 설명해주세요. 완전제곱식을 이용한다고 들었는데 잘 이해가 안 가요.',
    '수학',
    '중3',
    300,
    false,
    45,
    NOW() - INTERVAL '2 hours'
  ),
  (
    'q2222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    '수학천재',
    '영어 관계대명사 what과 which의 차이점',
    '관계대명사 what과 which를 언제 사용하는지 헷갈립니다. 쉽게 구분하는 방법이 있을까요?',
    '영어',
    '고1',
    100,
    false,
    32,
    NOW() - INTERVAL '5 hours'
  ),
  (
    'q3333333-3333-3333-3333-333333333333',
    '33333333-3333-3333-3333-333333333333',
    '영어마스터',
    '광합성 과정에서 명반응과 암반응의 차이',
    '생물 시간에 광합성을 배우고 있는데, 명반응과 암반응이 각각 어떤 과정인지, 어디서 일어나는지 정리가 안 됩니다. 도와주세요!',
    '과학',
    '고2',
    500,
    true,
    67,
    NOW() - INTERVAL '30 minutes'
  ),
  (
    'q4444444-4444-4444-4444-444444444444',
    '11111111-1111-1111-1111-111111111111',
    '공부왕김씨',
    '조선시대 붕당정치의 전개 과정',
    '조선 후기 붕당정치가 어떻게 전개되었는지 시간 순서대로 정리해주세요. 서인, 남인, 노론, 소론 등이 헷갈립니다.',
    '역사',
    '고1',
    200,
    false,
    28,
    NOW() - INTERVAL '1 day'
  ),
  (
    'q5555555-5555-5555-5555-555555555555',
    '22222222-2222-2222-2222-222222222222',
    '수학천재',
    '미분 기본 공식 암기 팁 있나요?',
    '미적분 시험이 얼마 안 남았는데 기본 미분 공식들이 자꾸 헷갈립니다. 효과적으로 암기하는 방법이 있을까요?',
    '수학',
    '고3',
    100,
    false,
    19,
    NOW() - INTERVAL '3 hours'
  ),
  (
    'q6666666-6666-6666-6666-666666666666',
    '33333333-3333-3333-3333-333333333333',
    '영어마스터',
    '훈민정음 창제 원리 설명해주세요',
    '국어 과제로 훈민정음의 과학적 창제 원리에 대해 써야 하는데, 자음과 모음이 어떤 원리로 만들어졌는지 설명 부탁드립니다.',
    '국어',
    '중2',
    100,
    false,
    15,
    NOW() - INTERVAL '6 hours'
  );

-- =====================================================
-- Insert Test Answers
-- =====================================================

INSERT INTO public.answers (id, question_id, author_id, author_nickname, author_role, content, upvotes, is_accepted, created_at)
VALUES
  (
    'a1111111-1111-1111-1111-111111111111',
    'q1111111-1111-1111-1111-111111111111',
    '44444444-4444-4444-4444-444444444444',
    '서울대튜터',
    'tutor',
    E'2차 방정식의 근의 공식을 완전제곱식으로 유도하는 과정입니다:\n\n1) ax^2 + bx + c = 0\n2) 양변을 a로 나누면: x^2 + (b/a)x + c/a = 0\n3) c/a를 우변으로 이항: x^2 + (b/a)x = -c/a\n4) 양변에 (b/2a)^2를 더함: x^2 + (b/a)x + (b/2a)^2 = -c/a + (b/2a)^2\n5) 좌변을 완전제곱식으로: (x + b/2a)^2 = (b^2 - 4ac)/4a^2\n6) 양변에 제곱근: x + b/2a = ±√(b^2 - 4ac)/2a\n7) 정리하면: x = (-b ± √(b^2 - 4ac))/2a\n\n이해가 되셨나요?',
    5,
    true,
    NOW() - INTERVAL '1 hour 30 minutes'
  ),
  (
    'a2222222-2222-2222-2222-222222222222',
    'q1111111-1111-1111-1111-111111111111',
    '55555555-5555-5555-5555-555555555555',
    '과학선생님',
    'tutor',
    E'완전제곱식 공식을 기억하면 쉽습니다!\n\n(x + p)^2 = x^2 + 2px + p^2\n\n이 공식을 이용해서 좌변을 완전제곱식으로 만드는 것이 핵심이에요.',
    2,
    false,
    NOW() - INTERVAL '1 hour 45 minutes'
  ),
  (
    'a3333333-3333-3333-3333-333333333333',
    'q2222222-2222-2222-2222-222222222222',
    '44444444-4444-4444-4444-444444444444',
    '서울대튜터',
    'tutor',
    E'간단히 구분하는 방법:\n\n1) what: 선행사가 없을 때 사용 (선행사 포함)\n   - What I need is your help. (내가 필요한 것은 너의 도움이다)\n   - "the thing(s) which"와 같은 의미\n\n2) which: 선행사가 있을 때 사용\n   - The book which I bought is interesting. (내가 산 책은 흥미롭다)\n   - "선행사 the book"이 앞에 있음\n\n핵심: 앞에 명사가 있으면 which, 없으면 what!',
    3,
    true,
    NOW() - INTERVAL '4 hours 20 minutes'
  ),
  (
    'a4444444-4444-4444-4444-444444444444',
    'q3333333-3333-3333-3333-333333333333',
    '55555555-5555-5555-5555-555555555555',
    '과학선생님',
    'tutor',
    E'광합성의 명반응과 암반응 차이:\n\n【명반응 (Light Reaction)】\n- 장소: 엽록체의 틸라코이드\n- 필요: 빛 에너지\n- 과정: 물 분해 → 산소 발생, ATP와 NADPH 생성\n- 결과: 화학 에너지 생성\n\n【암반응 (Dark Reaction, Calvin Cycle)】\n- 장소: 엽록체의 스트로마\n- 필요: 명반응의 산물 (ATP, NADPH)\n- 과정: 이산화탄소 고정 → 포도당 합성\n- 결과: 유기물(포도당) 생성\n\n※ 암반응은 어둠에서만 일어나는 게 아니라, 빛이 없어도 일어날 수 있다는 의미입니다!\n\n이해 되셨나요?',
    4,
    false,
    NOW() - INTERVAL '20 minutes'
  ),
  (
    'a5555555-5555-5555-5555-555555555555',
    'q5555555-5555-5555-5555-555555555555',
    '44444444-4444-4444-4444-444444444444',
    '서울대튜터',
    'tutor',
    E'미분 공식 암기 팁:\n\n1. 기본 공식 노래로 만들기\n   - (x^n)\' = nx^(n-1)\n   - (e^x)\' = e^x\n   - (ln x)\' = 1/x\n\n2. 삼각함수는 순환 구조로\n   - sin → cos → -sin → -cos → sin\n\n3. 자주 쓰는 공식은 손으로 반복 쓰기\n\n4. 문제 풀 때마다 공식 먼저 쓰고 시작\n\n화이팅!',
    1,
    false,
    NOW() - INTERVAL '2 hours 30 minutes'
  );

-- =====================================================
-- Update questions with accepted answers
-- =====================================================

UPDATE public.questions
SET
  is_answered = true,
  accepted_answer_id = 'a1111111-1111-1111-1111-111111111111'
WHERE id = 'q1111111-1111-1111-1111-111111111111';

UPDATE public.questions
SET
  is_answered = true,
  accepted_answer_id = 'a3333333-3333-3333-3333-333333333333'
WHERE id = 'q2222222-2222-2222-2222-222222222222';

-- =====================================================
-- Insert Test Coin Transactions
-- =====================================================

INSERT INTO public.coin_transactions (user_id, amount, transaction_type, description, created_at)
VALUES
  -- Question rewards (accepted answers)
  ('44444444-4444-4444-4444-444444444444', 300, 'reward', '질문 답변 채택 보상', NOW() - INTERVAL '1 hour 25 minutes'),
  ('44444444-4444-4444-4444-444444444444', 100, 'reward', '질문 답변 채택 보상', NOW() - INTERVAL '4 hours 15 minutes'),

  -- Question costs
  ('11111111-1111-1111-1111-111111111111', -300, 'spend', '질문 등록 (중요)', NOW() - INTERVAL '2 hours'),
  ('22222222-2222-2222-2222-222222222222', -100, 'spend', '질문 등록 (일반)', NOW() - INTERVAL '5 hours'),
  ('33333333-3333-3333-3333-333333333333', -500, 'spend', '질문 등록 (긴급)', NOW() - INTERVAL '30 minutes'),
  ('11111111-1111-1111-1111-111111111111', -200, 'spend', '질문 등록 (중요)', NOW() - INTERVAL '1 day'),
  ('22222222-2222-2222-2222-222222222222', -100, 'spend', '질문 등록 (일반)', NOW() - INTERVAL '3 hours'),
  ('33333333-3333-3333-3333-333333333333', -100, 'spend', '질문 등록 (일반)', NOW() - INTERVAL '6 hours');

-- =====================================================
-- Insert Test Point Transactions
-- =====================================================

INSERT INTO public.point_transactions (user_id, amount, transaction_type, description, created_at)
VALUES
  -- Question asking points
  ('11111111-1111-1111-1111-111111111111', 10, 'reward', '질문 등록 보상', NOW() - INTERVAL '2 hours'),
  ('22222222-2222-2222-2222-222222222222', 10, 'reward', '질문 등록 보상', NOW() - INTERVAL '5 hours'),
  ('33333333-3333-3333-3333-333333333333', 10, 'reward', '질문 등록 보상', NOW() - INTERVAL '30 minutes'),
  ('11111111-1111-1111-1111-111111111111', 10, 'reward', '질문 등록 보상', NOW() - INTERVAL '1 day'),
  ('22222222-2222-2222-2222-222222222222', 10, 'reward', '질문 등록 보상', NOW() - INTERVAL '3 hours'),
  ('33333333-3333-3333-3333-333333333333', 10, 'reward', '질문 등록 보상', NOW() - INTERVAL '6 hours'),

  -- Answer points
  ('44444444-4444-4444-4444-444444444444', 20, 'reward', '답변 작성 보상', NOW() - INTERVAL '1 hour 30 minutes'),
  ('55555555-5555-5555-5555-555555555555', 20, 'reward', '답변 작성 보상', NOW() - INTERVAL '1 hour 45 minutes'),
  ('44444444-4444-4444-4444-444444444444', 20, 'reward', '답변 작성 보상', NOW() - INTERVAL '4 hours 20 minutes'),
  ('55555555-5555-5555-5555-555555555555', 20, 'reward', '답변 작성 보상', NOW() - INTERVAL '20 minutes'),
  ('44444444-4444-4444-4444-444444444444', 20, 'reward', '답변 작성 보상', NOW() - INTERVAL '2 hours 30 minutes'),

  -- Accepted answer bonus
  ('44444444-4444-4444-4444-444444444444', 100, 'reward', '답변 채택 보너스', NOW() - INTERVAL '1 hour 25 minutes'),
  ('44444444-4444-4444-4444-444444444444', 100, 'reward', '답변 채택 보너스', NOW() - INTERVAL '4 hours 15 minutes');

-- =====================================================
-- Insert Test Notifications
-- =====================================================

INSERT INTO public.notifications (user_id, type, title, content, related_id, is_read, created_at)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'answer',
    '새 답변이 달렸습니다',
    '"2차 방정식 근의 공식 유도 과정이 궁금합니다" 질문에 서울대튜터님이 답변했습니다.',
    'q1111111-1111-1111-1111-111111111111',
    false,
    NOW() - INTERVAL '1 hour 30 minutes'
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'accepted',
    '답변이 채택되었습니다!',
    '공부왕김씨님이 회원님의 답변을 채택했습니다. +300 코인, +100 포인트',
    'a1111111-1111-1111-1111-111111111111',
    false,
    NOW() - INTERVAL '1 hour 25 minutes'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'answer',
    '새 답변이 달렸습니다',
    '"영어 관계대명사 what과 which의 차이점" 질문에 서울대튜터님이 답변했습니다.',
    'q2222222-2222-2222-2222-222222222222',
    true,
    NOW() - INTERVAL '4 hours 20 minutes'
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'accepted',
    '답변이 채택되었습니다!',
    '수학천재님이 회원님의 답변을 채택했습니다. +100 코인, +100 포인트',
    'a3333333-3333-3333-3333-333333333333',
    true,
    NOW() - INTERVAL '4 hours 15 minutes'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'answer',
    '새 답변이 달렸습니다',
    '"광합성 과정에서 명반응과 암반응의 차이" 질문에 과학선생님님이 답변했습니다.',
    'q3333333-3333-3333-3333-333333333333',
    false,
    NOW() - INTERVAL '20 minutes'
  );

-- =====================================================
-- Verification Queries (for testing)
-- =====================================================

-- Uncomment these to verify the data was inserted correctly:

-- SELECT COUNT(*) as user_count FROM public.users WHERE email LIKE '%@test.com';
-- SELECT COUNT(*) as question_count FROM public.questions;
-- SELECT COUNT(*) as answer_count FROM public.answers;
-- SELECT COUNT(*) as coin_tx_count FROM public.coin_transactions;
-- SELECT COUNT(*) as point_tx_count FROM public.point_transactions;
-- SELECT COUNT(*) as notification_count FROM public.notifications;

-- View questions with their answers:
-- SELECT q.title, q.subject, COUNT(a.id) as answer_count
-- FROM public.questions q
-- LEFT JOIN public.answers a ON q.id = a.question_id
-- GROUP BY q.id, q.title, q.subject
-- ORDER BY q.created_at DESC;

-- =====================================================
-- END OF TEST DATA
-- =====================================================

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Test data inserted successfully!';
  RAISE NOTICE '📊 Created: 5 users, 6 questions, 5 answers, transactions, notifications';
  RAISE NOTICE '🔐 Test accounts: student1@test.com, tutor1@test.com (password: password123)';
  RAISE NOTICE '⚠️  Remember: Create these users via Supabase Auth signup first!';
END $$;
