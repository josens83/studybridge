# StudyBridge 설정 가이드

## 1. Supabase 설정

### 1.1 프로젝트 생성

1. [Supabase](https://supabase.com)에 접속하여 새 프로젝트 생성
2. 프로젝트 이름: `studybridge`
3. 데이터베이스 비밀번호 설정 (안전하게 보관)
4. 리전 선택: Northeast Asia (Seoul) 또는 가까운 리전

### 1.2 데이터베이스 마이그레이션

1. Supabase 대시보드에서 SQL Editor 열기
2. `supabase/migrations/001_initial_schema.sql` 파일의 내용 복사
3. SQL Editor에 붙여넣고 실행 (Run)
4. `supabase/migrations/002_functions.sql` 파일도 동일하게 실행

### 1.3 Storage 설정

1. Supabase 대시보드에서 Storage 메뉴 열기
2. Create new bucket 클릭
3. Bucket 이름: `question-images`
4. Public bucket 체크
5. File size limit: 5MB
6. Allowed MIME types: `image/png, image/jpeg, image/jpg, image/webp`

또는 앱에서 자동으로 생성하려면:
```typescript
import { createImageBucket } from '@/lib/supabase/storage';
await createImageBucket();
```

### 1.4 인증 설정

1. Supabase 대시보드에서 Authentication > Settings
2. **익명 로그인 활성화**:
   - Enable anonymous sign-ins 체크
3. **이메일 설정** (선택사항):
   - Enable email confirmations (이메일 확인 필요시)
   - Secure email change (이메일 변경시 확인)

### 1.5 환경 변수 획득

1. Supabase 대시보드에서 Settings > API
2. 다음 정보 복사:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY` (비공개!)

## 2. 토스페이먼츠 설정

### 2.1 계정 생성

1. [토스페이먼츠](https://www.tosspayments.com)에 가입
2. 개발자 센터 접속
3. 테스트 모드로 시작

### 2.2 API 키 획득

1. 개발자 센터에서 API 키 메뉴
2. Client Key 복사 → `NEXT_PUBLIC_TOSS_CLIENT_KEY`
3. Secret Key 복사 → `TOSS_SECRET_KEY` (비공개!)

## 3. 로컬 환경 설정

### 3.1 환경 변수 파일 생성

`.env.example`을 `.env.local`로 복사:

```bash
cp .env.example .env.local
```

`.env.local` 파일 편집:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Toss Payments
NEXT_PUBLIC_TOSS_CLIENT_KEY=your-toss-client-key
TOSS_SECRET_KEY=your-toss-secret-key

# OpenAI (선택사항 - AI 기능용)
OPENAI_API_KEY=your-openai-api-key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3.2 의존성 설치

```bash
npm install
```

### 3.3 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

## 4. 초기 데이터 설정 (선택사항)

### 4.1 테스트 사용자 생성

Supabase SQL Editor에서 실행:

```sql
-- 테스트 사용자 생성 (익명)
INSERT INTO public.users (id, nickname, is_anonymous, coins, points)
VALUES (gen_random_uuid(), '익명1234', true, 1000, 100);

-- 테스트 튜터 생성
INSERT INTO public.tutors (user_id, university, major, specialties, hourly_rate, bio, verification_status)
VALUES (
  (SELECT id FROM public.users LIMIT 1),
  '서울대학교',
  '수학교육과',
  ARRAY['수학', '과학'],
  30000,
  '수학을 쉽고 재미있게 가르칩니다.',
  'verified'
);
```

### 4.2 테스트 질문 생성

```sql
INSERT INTO public.questions (
  author_id,
  author_nickname,
  title,
  content,
  subject,
  grade_level,
  coins_reward,
  is_urgent
)
VALUES (
  (SELECT id FROM public.users LIMIT 1),
  '익명1234',
  '수학 문제 풀이 도와주세요',
  '이차방정식 x² + 5x + 6 = 0을 풀어주세요.',
  '수학',
  '고등학생',
  300,
  false
);
```

## 5. 프로덕션 배포 (Vercel)

### 5.1 Vercel 연동

```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 배포
vercel
```

### 5.2 환경 변수 설정

Vercel 대시보드에서:
1. Settings > Environment Variables
2. `.env.local`의 모든 변수 추가
3. Production, Preview, Development 모두 체크

### 5.3 도메인 설정

1. Vercel 대시보드에서 Domains 메뉴
2. 커스텀 도메인 추가 (예: studybridge.com)
3. DNS 설정 안내에 따라 도메인 연결

### 5.4 환경 변수 업데이트

프로덕션 URL로 업데이트:
```env
NEXT_PUBLIC_APP_URL=https://studybridge.com
```

## 6. 보안 체크리스트

- [ ] `.env.local` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] `SUPABASE_SERVICE_ROLE_KEY`가 서버 사이드에서만 사용되는지 확인
- [ ] RLS 정책이 모든 테이블에 적용되어 있는지 확인
- [ ] Supabase Storage 버킷이 올바른 권한으로 설정되어 있는지 확인
- [ ] 토스페이먼츠 Secret Key가 노출되지 않았는지 확인
- [ ] CORS 설정이 올바른지 확인

## 7. 추가 설정 (선택사항)

### 7.1 이메일 템플릿 커스터마이징

Supabase 대시보드 > Authentication > Email Templates에서:
- Confirm signup
- Reset password
- Magic link

템플릿을 프로젝트에 맞게 수정

### 7.2 Webhook 설정

결제 완료 알림을 받으려면:
1. 토스페이먼츠 대시보드에서 Webhook 설정
2. Endpoint: `https://your-domain.com/api/webhooks/payment`
3. Events: 결제 완료, 결제 취소 등

### 7.3 모니터링 설정

- Sentry: 에러 트래킹
- Google Analytics: 사용자 분석
- Vercel Analytics: 성능 모니터링

## 8. 문제 해결

### 데이터베이스 연결 오류

```
Error: Invalid API key
```

해결: `.env.local` 파일의 Supabase URL과 키가 올바른지 확인

### 익명 로그인 오류

```
Error: Anonymous sign-ins are disabled
```

해결: Supabase Authentication > Settings에서 익명 로그인 활성화

### 이미지 업로드 오류

```
Error: Bucket not found
```

해결: Supabase Storage에서 `question-images` 버킷 생성

## 9. 개발 팁

### 로컬 Supabase 사용 (선택사항)

```bash
# Supabase CLI 설치
npm install -g supabase

# 로컬 Supabase 시작
supabase start

# 마이그레이션 실행
supabase db reset
```

### 데이터베이스 스키마 변경

1. 새 마이그레이션 파일 생성
2. SQL 작성
3. Supabase SQL Editor에서 실행
4. Git에 커밋

## 10. 운영 가이드

### 일일 점검 사항

- [ ] 에러 로그 확인
- [ ] 질문/답변 모니터링
- [ ] 결제 정상 작동 확인
- [ ] 사용자 피드백 확인

### 주간 점검 사항

- [ ] 데이터베이스 백업
- [ ] 성능 메트릭 확인
- [ ] 보안 업데이트 확인
- [ ] 신규 기능 배포

---

질문이 있으시면 이슈를 생성해주세요: https://github.com/josens83/studybridge/issues
