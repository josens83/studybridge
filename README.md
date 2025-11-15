# StudyBridge 🎓

학생과 튜터를 연결하는 유료 숙제 도움 플랫폼

## 주요 기능

### 1. Q&A 게시판
- 익명 질문/답변 시스템
- 과목별 카테고리 (국어, 영어, 수학, 과학, 사회, 역사, 기타)
- 학년별 필터링
- 코인 보상 시스템
- 베스트 답변 채택

### 2. 프리미엄 구독
- **무료 플랜**: 하루 3개 질문, 광고 표시
- **프리미엄 (월 39,000원)**: 무제한 질문, 광고 제거, 우선 답변, AI 도우미
- **프리미엄+ (월 59,000원)**: 프리미엄 + 월 20회 튜터 매칭

### 3. 튜터 매칭 시스템
- 검증된 명문대 튜터
- 실시간 1:1 매칭
- 평균 응답 시간: 10분 이내
- 튜터 평가 및 피드백

### 4. 코인 시스템
- 질문당 100~500 코인 소비
- 답변 채택시 코인 획득
- 코인 구매: 1,000코인 = 5,000원

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
2. `supabase/migrations/001_initial_schema.sql` 파일의 SQL을 실행
3. 익명 로그인 활성화 (Authentication > Settings > Anonymous sign-ins)

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 데이터베이스 스키마

### 주요 테이블

- `users`: 사용자 정보
- `questions`: 질문
- `answers`: 답변
- `tutors`: 튜터 프로필
- `tutoring_sessions`: 튜터링 세션
- `subscriptions`: 구독 정보
- `payments`: 결제 내역
- `coin_transactions`: 코인 거래
- `point_transactions`: 포인트 거래
- `notifications`: 알림

## 비즈니스 모델

### 수익원

1. **구독료**: 프리미엄 월 39,000원, 프리미엄+ 월 59,000원
2. **코인 판매**: 1,000코인 = 5,000원
3. **튜터 수수료**: 튜터링 비용의 20%

### 타겟 사용자

- 초중고 학생 및 대학생
- 숙제 도움이 필요한 학생
- 수입을 원하는 명문대 재학생 튜터

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
