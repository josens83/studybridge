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
  bio?: string;
  grade_level?: string;
  subjects_of_interest?: string[];
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

// 대화방 타입
export type ConversationType = 'direct' | 'group' | 'tutoring';

export interface Conversation {
  id: string;
  type: ConversationType;
  title?: string;
  created_by?: string;
  question_id?: string;
  tutoring_session_id?: string;
  last_message_at?: string;
  last_message_preview?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// 대화 참여자 타입
export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'admin' | 'member';
  nickname_override?: string;
  is_muted: boolean;
  is_pinned: boolean;
  last_read_at?: string;
  joined_at: string;
  left_at?: string;
}

// 메시지 타입
export type MessageType = 'text' | 'image' | 'file' | 'system' | 'question_link';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content?: string;
  message_type: MessageType;
  image_urls: string[];
  file_url?: string;
  file_name?: string;
  file_size?: number;
  reply_to_id?: string;
  is_edited: boolean;
  is_deleted: boolean;
  deleted_at?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// 메시지 + 발신자 정보
export interface MessageWithSender extends Message {
  sender: {
    id: string;
    nickname: string;
    avatar_url?: string;
    role: UserRole;
  };
  reply_to?: Message;
  read_by?: string[];
}

// 대화방 + 참여자 + 마지막 메시지 정보
export interface ConversationWithDetails extends Conversation {
  participants: (ConversationParticipant & {
    user: {
      id: string;
      nickname: string;
      avatar_url?: string;
      role: UserRole;
    };
  })[];
  unread_count: number;
  other_participant?: {
    id: string;
    nickname: string;
    avatar_url?: string;
    role: UserRole;
  };
}

// 사용자 온라인 상태
export type PresenceStatus = 'online' | 'away' | 'offline';

export interface UserPresence {
  user_id: string;
  status: PresenceStatus;
  last_seen_at: string;
  current_conversation_id?: string;
}

// 타이핑 인디케이터
export interface TypingIndicator {
  user_id: string;
  conversation_id: string;
  is_typing: boolean;
}

// 메시지 검색 결과
export interface MessageSearchResult {
  message_id: string;
  conversation_id: string;
  content: string;
  sender_nickname: string;
  created_at: string;
}
