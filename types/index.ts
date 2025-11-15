// 사용자 타입
export type UserRole = 'student' | 'tutor' | 'admin';

export interface User {
  id: string;
  email?: string;
  nickname: string;
  role: UserRole;
  avatar_url?: string;
  coins: number;
  points: number;
  subscription_tier: SubscriptionTier;
  subscription_expires_at?: string;
  created_at: string;
  is_anonymous: boolean;
}

// 구독 타입
export type SubscriptionTier = 'free' | 'premium' | 'premium_plus';

export interface Subscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  status: 'active' | 'cancelled' | 'expired';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

// 과목 타입
export type Subject =
  | '국어'
  | '영어'
  | '수학'
  | '과학'
  | '사회'
  | '역사'
  | '기타';

export type GradeLevel =
  | '초등학생'
  | '중학생'
  | '고등학생'
  | '대학생';

// 질문 타입
export interface Question {
  id: string;
  author_id: string;
  author_nickname: string;
  title: string;
  content: string;
  subject: Subject;
  grade_level: GradeLevel;
  image_urls: string[];
  coins_reward: number;
  is_urgent: boolean;
  is_answered: boolean;
  accepted_answer_id?: string;
  views: number;
  created_at: string;
  updated_at: string;
}

// 답변 타입
export interface Answer {
  id: string;
  question_id: string;
  author_id: string;
  author_nickname: string;
  author_role: UserRole;
  content: string;
  image_urls: string[];
  is_accepted: boolean;
  upvotes: number;
  created_at: string;
  updated_at: string;
}

// 튜터 타입
export interface Tutor {
  id: string;
  user_id: string;
  university: string;
  major: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  rating: number;
  total_sessions: number;
  specialties: Subject[];
  hourly_rate: number;
  is_available: boolean;
  bio: string;
  created_at: string;
}

// 튜터링 세션 타입
export interface TutoringSession {
  id: string;
  student_id: string;
  tutor_id: string;
  subject: Subject;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  scheduled_at?: string;
  started_at?: string;
  ended_at?: string;
  duration_minutes?: number;
  cost: number;
  rating?: number;
  feedback?: string;
  created_at: string;
}

// 결제 타입
export interface Payment {
  id: string;
  user_id: string;
  type: 'subscription' | 'coins' | 'tutoring';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  payment_key?: string;
  order_id: string;
  created_at: string;
}

// 코인 거래 타입
export interface CoinTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'earn' | 'spend' | 'purchase' | 'refund';
  description: string;
  related_id?: string; // question_id, answer_id, etc.
  created_at: string;
}

// 포인트 거래 타입
export interface PointTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'earn' | 'spend';
  description: string;
  related_id?: string;
  created_at: string;
}

// 알림 타입
export interface Notification {
  id: string;
  user_id: string;
  type: 'answer' | 'accepted' | 'message' | 'system';
  title: string;
  content: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}
