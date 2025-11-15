import { Subject, GradeLevel, SubscriptionTier } from '@/types';

// 구독 플랜
export const SUBSCRIPTION_PLANS = {
  free: {
    name: '무료',
    price: 0,
    features: [
      '하루 3개 질문',
      '광고 표시',
      '기본 답변',
    ],
    dailyQuestionLimit: 3,
  },
  premium: {
    name: '프리미엄',
    price: 39000,
    features: [
      '무제한 질문',
      '광고 제거',
      '우선 답변',
      'AI 도우미',
    ],
    dailyQuestionLimit: null,
  },
  premium_plus: {
    name: '프리미엄+',
    price: 59000,
    features: [
      '프리미엄 모든 기능',
      '월 20회 튜터 매칭',
      '1:1 맞춤 지도',
      '학습 분석 리포트',
    ],
    dailyQuestionLimit: null,
    monthlyTutoringLimit: 20,
  },
} as const;

// 코인 패키지
export const COIN_PACKAGES = [
  { coins: 1000, price: 5000, bonus: 0 },
  { coins: 3000, price: 14000, bonus: 500 },
  { coins: 5000, price: 22000, bonus: 1000 },
  { coins: 10000, price: 40000, bonus: 3000 },
] as const;

// 질문 코인 비용
export const QUESTION_COIN_COST = {
  normal: 100,
  important: 300,
  urgent: 500,
} as const;

// 과목 목록
export const SUBJECTS: Subject[] = [
  '국어',
  '영어',
  '수학',
  '과학',
  '사회',
  '역사',
  '기타',
];

// 학년 목록
export const GRADE_LEVELS: GradeLevel[] = [
  '초등학생',
  '중학생',
  '고등학생',
  '대학생',
];

// 튜터 플랫폼 수수료
export const PLATFORM_FEE_PERCENTAGE = 0.2; // 20%

// 포인트 보상
export const POINT_REWARDS = {
  answerAccepted: 100,
  questionAsked: 10,
  answerProvided: 20,
  dailyLogin: 5,
} as const;
