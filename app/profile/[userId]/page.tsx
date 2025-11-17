'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Calendar,
  MessageSquare,
  MessageCircle,
  Award,
  TrendingUp,
  Coins,
  Star,
  ArrowLeft,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import type { Question, Answer } from '@/types';

interface UserProfile {
  id: string;
  nickname: string;
  email: string;
  role: string;
  coins: number;
  points: number;
  subscription_tier: string;
  created_at: string;
}

interface UserStats {
  totalQuestions: number;
  totalAnswers: number;
  acceptedAnswers: number;
  acceptanceRate: number;
}

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentQuestions, setRecentQuestions] = useState<Question[]>([]);
  const [recentAnswers, setRecentAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'questions' | 'answers'>('questions');

  useEffect(() => {
    if (userId) {
      loadProfile();
    }
  }, [userId]);

  async function loadProfile() {
    setLoading(true);
    try {
      // Load user profile
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;
      setProfile(user);

      // Load statistics
      const [questionsCount, answersCount, acceptedCount] = await Promise.all([
        supabase
          .from('questions')
          .select('*', { count: 'exact', head: true })
          .eq('author_id', userId),
        supabase
          .from('answers')
          .select('*', { count: 'exact', head: true })
          .eq('author_id', userId),
        supabase
          .from('answers')
          .select('*', { count: 'exact', head: true })
          .eq('author_id', userId)
          .eq('is_accepted', true),
      ]);

      const totalQuestions = questionsCount.count || 0;
      const totalAnswers = answersCount.count || 0;
      const acceptedAnswers = acceptedCount.count || 0;
      const acceptanceRate =
        totalAnswers > 0 ? (acceptedAnswers / totalAnswers) * 100 : 0;

      setStats({
        totalQuestions,
        totalAnswers,
        acceptedAnswers,
        acceptanceRate,
      });

      // Load recent questions
      const { data: questions } = await supabase
        .from('questions')
        .select('*')
        .eq('author_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentQuestions(questions || []);

      // Load recent answers
      const { data: answers } = await supabase
        .from('answers')
        .select('*, questions(title, subject)')
        .eq('author_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentAnswers(answers || []);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  }

  function getRoleLabel(role: string) {
    switch (role) {
      case 'student':
        return '일반 회원';
      case 'tutor':
        return '튜터';
      case 'admin':
        return '관리자';
      default:
        return role;
    }
  }

  function getRoleColor(role: string) {
    switch (role) {
      case 'student':
        return 'bg-gray-100 text-gray-700';
      case 'tutor':
        return 'bg-purple-100 text-purple-700';
      case 'admin':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">프로필을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">사용자를 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-6">요청하신 사용자 프로필이 존재하지 않습니다.</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            홈으로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            뒤로 가기
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-8 sticky top-8">
              <div className="text-center">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold mx-auto mb-4">
                  {profile.nickname[0]}
                </div>

                <h1 className="text-2xl font-bold mb-2">{profile.nickname}</h1>

                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4 ${getRoleColor(
                    profile.role
                  )}`}
                >
                  {getRoleLabel(profile.role)}
                </span>

                <div className="flex items-center justify-center gap-2 text-gray-600 mb-6">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    {new Date(profile.created_at).toLocaleDateString('ko-KR')} 가입
                  </span>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Coins className="w-5 h-5 text-yellow-600" />
                    <span>코인</span>
                  </div>
                  <span className="font-semibold">{profile.coins.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Star className="w-5 h-5 text-blue-600" />
                    <span>포인트</span>
                  </div>
                  <span className="font-semibold">{profile.points.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-700">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <span>구독 플랜</span>
                  </div>
                  <span className="font-semibold">
                    {profile.subscription_tier === 'free'
                      ? '무료'
                      : profile.subscription_tier === 'premium'
                      ? '프리미엄'
                      : '프리미엄+'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Section */}
          <div className="md:col-span-2">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalQuestions || 0}
                </p>
                <p className="text-sm text-gray-600">작성한 질문</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalAnswers || 0}
                </p>
                <p className="text-sm text-gray-600">작성한 답변</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.acceptedAnswers || 0}
                </p>
                <p className="text-sm text-gray-600">채택된 답변</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-yellow-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.acceptanceRate.toFixed(0)}%
                </p>
                <p className="text-sm text-gray-600">채택률</p>
              </div>
            </div>

            {/* Activity Tabs */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('questions')}
                  className={`flex-1 py-3 rounded-lg font-semibold transition ${
                    activeTab === 'questions'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  최근 질문
                </button>
                <button
                  onClick={() => setActiveTab('answers')}
                  className={`flex-1 py-3 rounded-lg font-semibold transition ${
                    activeTab === 'answers'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  최근 답변
                </button>
              </div>
            </div>

            {/* Content */}
            {activeTab === 'questions' ? (
              recentQuestions.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">작성한 질문이 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentQuestions.map((question) => (
                    <Link
                      key={question.id}
                      href={`/question/${question.id}`}
                      className="block bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
                    >
                      <div className="flex items-start gap-4 mb-3">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                          {question.subject}
                        </span>
                        {question.is_answered && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                            답변완료
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {question.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(question.created_at).toLocaleDateString('ko-KR')}
                      </p>
                    </Link>
                  ))}
                </div>
              )
            ) : recentAnswers.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">작성한 답변이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentAnswers.map((answer: any) => (
                  <Link
                    key={answer.id}
                    href={`/question/${answer.question_id}`}
                    className="block bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
                  >
                    <div className="flex items-start gap-4 mb-3">
                      {answer.is_accepted && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold flex items-center gap-1">
                          <Award className="w-4 h-4" />
                          채택됨
                        </span>
                      )}
                      {answer.questions && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          {answer.questions.subject}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {answer.questions?.title || '질문 제목'}
                    </h3>
                    <p className="text-gray-700 mb-2 line-clamp-2">{answer.content}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{new Date(answer.created_at).toLocaleDateString('ko-KR')}</span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        {answer.upvotes} 추천
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
