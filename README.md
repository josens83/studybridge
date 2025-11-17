# StudyBridge 🎓

학생과 튜터를 연결하는 유료 숙제 도움 플랫폼

## 현재 구현 상태 ✅

**Core MVP 완성 (2025-11-17)**

완전히 동작하는 Q&A 플랫폼이 구현되었습니다:
- ✅ 회원가입 / 로그인 / 익명 로그인
- ✅ 질문 작성 (이미지 첨부, 코인 차감)
- ✅ 질문 목록 조회 (실시간 데이터)
- ✅ 질문 상세 조회 및 답변 작성
- ✅ 답변 채택 시스템 (코인 보상 자동 지급)
- ✅ 코인/포인트 거래 시스템
- ✅ 실시간 알림 시스템
- ✅ 이미지 업로드 및 저장

**완료된 핵심 기능:**
- ✅ 대시보드 통계 및 활동 내역
- ✅ 과목별 필터링
- ✅ 전체 검색 기능
- ✅ 코인 구매 시스템 (토스페이먼츠)
- ✅ 프리미엄 구독 결제
- ✅ 이용약관/개인정보처리방침
- ✅ SEO 최적화

**개발 예정:**
- 🚧 튜터 매칭 시스템
- 🚧 AI 문제 풀이 도우미
- 🚧 신고/차단 기능
- 🚧 React Native 모바일 앱

## 주요 기능

### 1. Q&A 게시판 ✅ (구현 완료)
- **익명 질문/답변 시스템**: 한 번의 클릭으로 익명 로그인 가능
- **과목별 카테고리**: 국어, 영어, 수학, 과학, 사회, 역사, 기타
- **학년별 선택**: 초등학생부터 대학생까지
- **코인 보상 시스템**:
  - 질문 작성 시 100~500 코인 소비 (긴급도에 따라)
  - 답변 작성 시 20 포인트 획득
  - 답변 채택 시 질문의 코인 전액 + 100 포인트 획득
- **이미지 첨부**: 질문/답변에 최대 5개 이미지 첨부 가능
- **베스트 답변 채택**: 질문 작성자만 답변 채택 가능 (1회 제한)

### 2. 코인/포인트 시스템 ✅ (구현 완료)
- **코인**: 질문 작성에 사용
  - 일반 질문: 100 코인
  - 중요 질문: 300 코인
  - 긴급 질문: 500 코인
  - 코인 충전: 4가지 패키지 (₩5,000 ~ ₩40,000)
  - 보너스 코인 제공 (최대 30% 추가)
- **포인트**: 활동 보상
  - 질문 작성: +10 포인트
  - 답변 작성: +20 포인트
  - 답변 채택됨: +100 포인트
- **자동 거래 시스템**: 데이터베이스 함수로 모든 코인/포인트 거래 자동 처리
- **결제**: 토스페이먼츠 연동으로 안전한 결제

### 3. 프리미엄 구독 ✅ (구현 완료)
- **무료 플랜**: 하루 3개 질문, 광고 표시, 기본 기능
- **프리미엄 (월 39,000원)**:
  - 무제한 질문
  - 광고 제거
  - 우선 답변
  - AI 도우미 (베타)
  - 질문 우선 노출
- **프리미엄+ (월 59,000원)**:
  - 프리미엄 모든 기능
  - 월 20회 튜터 매칭
  - 1:1 맞춤 학습 지도
  - 학습 리포트 제공
  - 과제 첨삭 서비스
- **결제 시스템**: 토스페이먼츠 정기결제, 언제든 취소 가능

### 4. 검색 기능 ✅ (구현 완료)
- **전체 검색**: 질문 제목과 내용에서 키워드 검색
- **필터 결합**: 검색어 + 과목 필터 동시 적용
- **실시간 검색**: 검색 결과 즉시 표시
- **검색 결과 표시**: 검색어 하이라이트 및 결과 수 표시

### 5. 튜터 매칭 시스템 🚧 (개발 예정)
- 검증된 명문대 튜터
- 실시간 1:1 매칭
- 평균 응답 시간: 10분 이내
- 튜터 평가 및 피드백

## 기술 스택

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth, Database, Realtime)
- **결제**: 토스페이먼츠
- **UI**: Lucide Icons
- **상태관리**: Zustand
- **Form**: React Hook Form + Zod

## 프로젝트 구조

```
studybridge/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 인증 관련 페이지
│   ├── ask/               # 질문 작성 페이지
│   ├── question/[id]/     # 질문 상세 페이지
│   ├── tutoring/          # 튜터 매칭 페이지
│   ├── pricing/           # 요금제 페이지
│   ├── dashboard/         # 사용자 대시보드
│   └── admin/             # 관리자 대시보드
├── components/            # React 컴포넌트
│   ├── ui/               # 재사용 가능한 UI 컴포넌트
│   ├── layout/           # 레이아웃 컴포넌트
│   ├── questions/        # 질문 관련 컴포넌트
│   └── tutors/           # 튜터 관련 컴포넌트
├── lib/                  # 유틸리티 및 설정
│   ├── supabase/        # Supabase 클라이언트
│   └── utils/           # 헬퍼 함수
├── types/               # TypeScript 타입 정의
├── supabase/            # Supabase 마이그레이션
└── public/              # 정적 파일
```

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example` 파일을 `.env.local`로 복사하고 필요한 값을 입력하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_TOSS_CLIENT_KEY=your-toss-client-key
TOSS_SECRET_KEY=your-toss-secret-key
OPENAI_API_KEY=your-openai-api-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성

2. 데이터베이스 마이그레이션 실행 (순서대로):
   ```bash
   # 1. 기본 스키마 생성
   # supabase/migrations/001_initial_schema.sql 내용을
   # Supabase Dashboard > SQL Editor에서 실행

   # 2. 데이터베이스 함수 생성
   # supabase/migrations/002_functions.sql 내용을
   # Supabase Dashboard > SQL Editor에서 실행
   ```

3. 익명 로그인 활성화:
   - Dashboard > Authentication > Settings
   - "Anonymous sign-ins" 활성화

4. Storage 버킷 생성:
   - Dashboard > Storage > Create bucket
   - 버킷 이름: `question-images`
   - Public 설정 활성화

5. Realtime 활성화:
   - Dashboard > Database > Replication
   - `notifications` 테이블 Realtime 활성화

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 사용 방법

### 첫 사용자 시작하기

1. **익명 로그인으로 시작**
   - 홈페이지에서 "익명으로 시작하기" 버튼 클릭
   - 자동으로 익명 계정 생성 (초기 코인 300, 포인트 50)

2. **질문 작성**
   - 우측 상단 "질문하기" 버튼 클릭
   - 제목, 내용, 과목, 학년 선택
   - 긴급도 선택 (일반 100코인 / 중요 300코인 / 긴급 500코인)
   - 이미지 첨부 (선택 사항)
   - "질문 등록" 버튼 클릭

3. **답변 작성**
   - 질문 목록에서 질문 클릭
   - 하단 답변 작성란에 답변 입력
   - "답변 등록" 버튼 클릭
   - 자동으로 20 포인트 획득

4. **답변 채택**
   - 본인이 작성한 질문에 답변이 달리면
   - 마음에 드는 답변의 "채택하기" 버튼 클릭
   - 답변 작성자에게 질문의 코인 + 100 포인트 자동 지급

### 코인/포인트 흐름

```
질문 작성 → 코인 차감 (-100~500) + 포인트 획득 (+10)
답변 작성 → 포인트 획득 (+20)
답변 채택 → 답변자가 코인 획득 (질문의 코인) + 포인트 획득 (+100)
```

### 테스트 시나리오

**2개의 브라우저 창으로 테스트:**

1. **창 1 (질문자)**
   - 익명 로그인 A
   - 질문 작성 (예: 수학 문제)
   - 코인 차감 확인

2. **창 2 (답변자)**
   - 익명 로그인 B
   - 질문 목록에서 질문 확인
   - 답변 작성
   - 포인트 +20 확인

3. **창 1로 돌아가서**
   - 새로운 답변 확인
   - "채택하기" 버튼 클릭
   - 알림 확인

4. **창 2에서**
   - 코인 증가 확인 (헤더)
   - 포인트 +100 확인

## 아키텍처

### 전체 구조

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Pages     │  │ Components  │  │    Zustand  │    │
│  │  (App Dir)  │  │     (UI)    │  │   (State)   │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
└────────────────────────┬────────────────────────────────┘
                         │
              ┌──────────┴──────────┐
              │                     │
    ┌─────────▼─────────┐  ┌───────▼────────┐
    │  Supabase Auth    │  │ Supabase DB    │
    │  - Email Login    │  │ - PostgreSQL   │
    │  - Anonymous      │  │ - RLS Policies │
    │  - Session Mgmt   │  │ - Functions    │
    └───────────────────┘  └────────┬───────┘
                                    │
                      ┌─────────────┼─────────────┐
                      │             │             │
            ┌─────────▼──┐   ┌─────▼─────┐  ┌───▼────┐
            │  Storage   │   │ Realtime  │  │  Edge  │
            │  (Images)  │   │  (Notify) │  │  Func  │
            └────────────┘   └───────────┘  └────────┘
```

### 핵심 데이터 흐름

**1. 질문 작성 플로우:**
```typescript
User → createQuestion() → Supabase DB
  ├─ Insert into questions table
  ├─ Call deduct_coins() function  // 코인 차감
  ├─ Call add_points() function     // 포인트 +10
  └─ Upload images to Storage (optional)
```

**2. 답변 작성 플로우:**
```typescript
User → createAnswer() → Supabase DB
  ├─ Insert into answers table
  ├─ Call add_points() function     // 포인트 +20
  └─ Create notification (Realtime) → Question Author
```

**3. 답변 채택 플로우 (핵심):**
```typescript
Question Author → acceptAnswer() → Supabase DB Function
  ├─ Validate: Is user the question author?
  ├─ Validate: Is answer already accepted?
  ├─ Update question.accepted_answer_id
  ├─ Update answer.is_accepted = true
  ├─ Call add_coins(answerer, question.coins_reward)
  ├─ Call add_points(answerer, 100)
  └─ Create notification → Answer Author
```

**모든 코인/포인트 거래는 PostgreSQL 함수로 처리되어 트랜잭션 안정성 보장**

### 데이터베이스 함수 (002_functions.sql)

핵심 비즈니스 로직을 DB 레벨에서 처리:

- `add_coins(user_id, amount)`: 코인 추가 및 거래 기록
- `deduct_coins(user_id, amount)`: 코인 차감 및 거래 기록
- `add_points(user_id, amount)`: 포인트 추가 및 거래 기록
- `accept_answer(question_id, answer_id, author_id)`: 답변 채택 및 보상 지급

## 데이터베이스 스키마

### 주요 테이블

- `users`: 사용자 정보 (닉네임, 이메일, 코인, 포인트, 역할)
- `questions`: 질문 (제목, 내용, 과목, 학년, 코인 보상, 이미지)
- `answers`: 답변 (내용, 작성자, 채택 여부, 추천수)
- `coin_transactions`: 코인 거래 내역 (타입, 금액, 설명)
- `point_transactions`: 포인트 거래 내역 (타입, 금액, 설명)
- `notifications`: 알림 (타입, 내용, 읽음 여부)
- `tutors`: 튜터 프로필 (인증, 대학, 전공, 요금)
- `tutoring_sessions`: 튜터링 세션
- `subscriptions`: 구독 정보 (플랜, 상태)
- `payments`: 결제 내역

## 배포

### Vercel 배포 (권장)

1. GitHub 레포지토리 연결
2. 환경 변수 설정:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL`
3. 빌드 및 배포 자동화

### 환경별 설정

- **개발**: `npm run dev` (localhost:3000)
- **프로덕션**: `npm run build && npm run start`
- **린트**: `npm run lint`

## 비즈니스 모델

### 수익원

1. **구독료**: 프리미엄 월 39,000원, 프리미엄+ 월 59,000원
2. **코인 판매**: 1,000코인 = 5,000원 (개발 예정)
3. **튜터 수수료**: 튜터링 비용의 20% (개발 예정)

### 타겟 사용자

- 초중고 학생 및 대학생
- 숙제 도움이 필요한 학생
- 수입을 원하는 명문대 재학생 튜터

## 개발 로드맵

### ✅ Phase 1: Core MVP (완료)
- [x] 사용자 인증 (이메일, 익명)
- [x] 질문/답변 시스템
- [x] 코인/포인트 시스템
- [x] 이미지 업로드
- [x] 실시간 알림

### ✅ Phase 2: Enhanced Features (완료)
- [x] 대시보드 통계
- [x] 과목별 필터링
- [x] 검색 기능
- [x] 이용약관/개인정보처리방침
- [x] SEO 최적화 (메타태그, sitemap, robots.txt)

### ✅ Phase 3: Payment Features (완료)
- [x] 토스페이먼츠 연동
- [x] 코인 구매 시스템
- [x] 구독 결제 시스템
- [x] 결제 성공/실패 페이지

### 📋 Phase 4: Advanced Features (예정)
- [ ] 사용자 프로필 페이지
- [ ] 신고/차단 기능
- [ ] AI 문제 풀이 도우미
- [ ] 튜터 매칭 시스템
- [ ] 관리자 대시보드

### 📋 Phase 4: Mobile & Scaling (예정)
- [ ] React Native 모바일 앱
- [ ] 관리자 대시보드
- [ ] 성능 최적화
- [ ] SEO 최적화

## 참고 서비스

- **Brainly**: 커뮤니티 기반 포인트 시스템
- **오누이**: 실시간 튜터 매칭, 구독 모델
- **콴다**: AI 문제 인식, 코인 시스템
- **Course Hero**: 구독제 + 콘텐츠 기여 보상

## 라이선스

MIT

## 문의

- Email: support@studybridge.com
- GitHub: [https://github.com/josens83/studybridge](https://github.com/josens83/studybridge)
