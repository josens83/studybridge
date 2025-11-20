'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Clock, Award, CheckCircle, MessageCircle, Loader2 } from 'lucide-react';
import { SUBJECTS } from '@/lib/utils/constants';
import { useAuthStore } from '@/lib/store/auth';
import { getOrCreateDirectConversation } from '@/lib/supabase/chat';
import type { Tutor } from '@/types';

// Mock data
const MOCK_TUTORS: Tutor[] = [
  {
    id: '1',
    user_id: 'user1',
    university: '서울대학교',
    major: '수학교육과',
    verification_status: 'verified',
    rating: 4.9,
    total_sessions: 156,
    specialties: ['수학', '과학'],
    hourly_rate: 30000,
    is_available: true,
    bio: '안녕하세요! 수학을 쉽고 재미있게 가르치는 것을 좋아합니다. 중고등학교 수학 전문입니다.',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: 'user2',
    university: '연세대학교',
    major: '영어영문학과',
    verification_status: 'verified',
    rating: 4.8,
    total_sessions: 203,
    specialties: ['영어'],
    hourly_rate: 35000,
    is_available: true,
    bio: '영어 회화부터 문법, 독해까지 모두 도와드립니다. 토익/토플 전문 튜터입니다.',
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    user_id: 'user3',
    university: '고려대학교',
    major: '화학과',
    verification_status: 'verified',
    rating: 4.7,
    total_sessions: 89,
    specialties: ['과학'],
    hourly_rate: 28000,
    is_available: false,
    bio: '화학 전문 튜터입니다. 개념부터 실전 문제풀이까지 체계적으로 지도합니다.',
    created_at: new Date().toISOString(),
  },
];

export default function TutoringPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);
  const [loadingTutorId, setLoadingTutorId] = useState<string | null>(null);

  const filteredTutors = MOCK_TUTORS.filter((tutor) => {
    if (showOnlyAvailable && !tutor.is_available) return false;
    if (selectedSubject && !tutor.specialties.includes(selectedSubject)) return false;
    return true;
  });

  const handleStartChat = async (tutor: Tutor) => {
    if (!user) {
      alert('로그인이 필요합니다.');
      router.push('/auth');
      return;
    }

    setLoadingTutorId(tutor.id);

    try {
      // Create or get existing conversation
      const conversationId = await getOrCreateDirectConversation(
        user.id,
        tutor.user_id
      );

      // Navigate to chat room
      router.push(`/messages/${conversationId}`);
    } catch (error) {
      console.error('Error starting chat:', error);
      alert('대화를 시작할 수 없습니다. 다시 시도해주세요.');
    } finally {
      setLoadingTutorId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">튜터 매칭</h1>
          <p className="text-xl text-gray-600">
            검증된 명문대 튜터와 1:1 매칭으로 학습하세요
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <StatCard
            icon={<CheckCircle className="w-8 h-8 text-blue-600" />}
            value="200+"
            label="검증된 튜터"
          />
          <StatCard
            icon={<Star className="w-8 h-8 text-yellow-500" />}
            value="4.8"
            label="평균 평점"
          />
          <StatCard
            icon={<Clock className="w-8 h-8 text-green-600" />}
            value="10분"
            label="평균 응답 시간"
          />
          <StatCard
            icon={<Award className="w-8 h-8 text-purple-600" />}
            value="5,000+"
            label="완료된 세션"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">과목</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">전체</option>
                {SUBJECTS.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="available"
                checked={showOnlyAvailable}
                onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                className="w-4 h-4 text-blue-600"
              />
              <label htmlFor="available" className="text-sm">
                현재 가능한 튜터만 보기
              </label>
            </div>
          </div>
        </div>

        {/* Tutors List */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTutors.map((tutor) => (
            <TutorCard
              key={tutor.id}
              tutor={tutor}
              onStartChat={() => handleStartChat(tutor)}
              isLoading={loadingTutorId === tutor.id}
            />
          ))}
        </div>

        {filteredTutors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">조건에 맞는 튜터가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 text-center">
      <div className="flex justify-center mb-3">{icon}</div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-gray-600">{label}</div>
    </div>
  );
}

function TutorCard({
  tutor,
  onStartChat,
  isLoading,
}: {
  tutor: Tutor;
  onStartChat: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-lg">
              {tutor.university[0]}
            </div>
            <div>
              <h3 className="font-semibold">{tutor.university}</h3>
              <p className="text-sm text-gray-600">{tutor.major}</p>
            </div>
          </div>
        </div>
        {tutor.is_available ? (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
            온라인
          </span>
        ) : (
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
            오프라인
          </span>
        )}
      </div>

      <p className="text-gray-700 mb-4 line-clamp-2">{tutor.bio}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {tutor.specialties.map((specialty) => (
          <span
            key={specialty}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
          >
            {specialty}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          <span className="font-semibold">{tutor.rating}</span>
          <span className="text-gray-600 text-sm">
            ({tutor.total_sessions}회)
          </span>
        </div>
        <div className="text-lg font-bold text-blue-600">
          {tutor.hourly_rate.toLocaleString()}원/시간
        </div>
      </div>

      <button
        onClick={onStartChat}
        disabled={!tutor.is_available || isLoading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            연결 중...
          </>
        ) : tutor.is_available ? (
          <>
            <MessageCircle className="w-4 h-4" />
            대화하기
          </>
        ) : (
          '현재 불가능'
        )}
      </button>
    </div>
  );
}
