'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  BookOpen,
  Users,
  Zap,
  Shield,
  MessageSquare,
  CheckCircle,
  Star,
  TrendingUp,
  ArrowRight,
  Quote,
} from 'lucide-react';
import QuestionList from '@/components/questions/QuestionList';
import { supabase } from '@/lib/supabase/client';

export default function Home() {
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalAnswers: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const [questions, answers, users] = await Promise.all([
        supabase.from('questions').select('*', { count: 'exact', head: true }),
        supabase.from('answers').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        totalQuestions: questions.count || 0,
        totalAnswers: answers.count || 0,
        totalUsers: users.count || 0,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block px-4 py-2 bg-blue-500 bg-opacity-30 rounded-full text-sm font-semibold mb-6">
              🎓 대한민국 No.1 학습 플랫폼
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              공부가 쉬워지는 곳,
              <br />
              <span className="bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                StudyBridge
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-blue-100">
              질문하고 답변받고, 검증된 튜터와 1:1 매칭까지
              <br />
              당신의 학습을 완벽하게 도와드립니다
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/ask"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                무료로 질문하기
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/pricing"
                className="bg-transparent text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:bg-opacity-10 transition border-2 border-white flex items-center justify-center gap-2"
              >
                요금제 보기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-y border-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                {stats.totalQuestions.toLocaleString()}+
              </div>
              <div className="text-gray-600 font-semibold">해결된 질문</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-green-600 mb-2">
                {stats.totalAnswers.toLocaleString()}+
              </div>
              <div className="text-gray-600 font-semibold">전문가 답변</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-purple-600 mb-2">
                {stats.totalUsers.toLocaleString()}+
              </div>
              <div className="text-gray-600 font-semibold">활성 사용자</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-yellow-600 mb-2">
                98%
              </div>
              <div className="text-gray-600 font-semibold">만족도</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">왜 StudyBridge인가요?</h2>
            <p className="text-xl text-gray-600">
              학생들이 선택하는 이유가 있습니다
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<BookOpen className="w-12 h-12" />}
              title="전과목 질문 가능"
              description="국어, 영어, 수학, 과학, 사회 등 모든 과목의 질문을 올릴 수 있어요"
              color="blue"
            />
            <FeatureCard
              icon={<Users className="w-12 h-12" />}
              title="검증된 튜터"
              description="명문대 재학생과 전문가들이 직접 답변하고 1:1 매칭으로 도와드려요"
              color="green"
            />
            <FeatureCard
              icon={<Zap className="w-12 h-12" />}
              title="빠른 응답"
              description="평균 10분 이내 답변! 급한 숙제도 걱정 없어요"
              color="yellow"
            />
            <FeatureCard
              icon={<Shield className="w-12 h-12" />}
              title="안전한 환경"
              description="철저한 콘텐츠 관리와 익명 보장으로 안전하게 이용하세요"
              color="purple"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">어떻게 작동하나요?</h2>
            <p className="text-xl text-gray-600">
              3단계로 간단하게 시작하세요
            </p>
          </div>
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <StepCard
                number="1"
                title="질문 등록"
                description="궁금한 문제를 사진과 함께 업로드하세요. 과목과 난이도를 선택하면 끝!"
                icon={<MessageSquare className="w-8 h-8" />}
              />
              <StepCard
                number="2"
                title="전문가 답변"
                description="검증된 튜터들이 빠르게 답변을 작성합니다. 평균 응답 시간 10분!"
                icon={<Users className="w-8 h-8" />}
              />
              <StepCard
                number="3"
                title="문제 해결"
                description="가장 도움이 된 답변을 채택하고, 포인트를 받으세요. 학습 완료!"
                icon={<CheckCircle className="w-8 h-8" />}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">사용자 후기</h2>
            <p className="text-xl text-gray-600">
              실제 사용자들의 생생한 경험담
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <TestimonialCard
              name="김민준"
              role="고등학교 2학년"
              content="수학 문제 풀다가 막혔는데 10분만에 상세한 풀이를 받았어요! 시험 준비에 정말 큰 도움이 됐습니다."
              rating={5}
            />
            <TestimonialCard
              name="이서연"
              role="중학교 3학년"
              content="영어 문법이 너무 어려웠는데, 튜터님이 쉽게 설명해주셔서 이해가 잘 됐어요. 성적도 올랐습니다!"
              rating={5}
            />
            <TestimonialCard
              name="박준서"
              role="고등학교 1학년"
              content="과학 실험 보고서 작성할 때 도움 받았어요. 선생님께 칭찬도 받고 정말 뿌듯했습니다!"
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* Recent Questions Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-4xl font-bold mb-2">최근 질문</h2>
              <p className="text-gray-600">지금 학생들이 궁금해하는 질문들을 확인하세요</p>
            </div>
            <Link
              href="/questions"
              className="hidden md:flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-lg"
            >
              전체 보기
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <QuestionList limit={6} />
          <div className="text-center mt-8 md:hidden">
            <Link
              href="/questions"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-lg"
            >
              전체 보기
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            지금 바로 시작하세요
          </h2>
          <p className="text-xl md:text-2xl mb-10 text-blue-100">
            무료로 시작하고, 필요할 때 프리미엄으로 업그레이드하세요
            <br />
            첫 질문은 무료입니다!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth"
              className="bg-white text-blue-600 px-10 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition shadow-lg hover:shadow-xl inline-block"
            >
              무료로 시작하기
            </Link>
            <Link
              href="/pricing"
              className="bg-transparent text-white px-10 py-4 rounded-lg font-bold text-lg hover:bg-white hover:bg-opacity-10 transition border-2 border-white inline-block"
            >
              요금제 살펴보기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    purple: 'from-purple-500 to-purple-600',
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
      <div className={`mb-6 inline-block p-4 rounded-xl bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} text-white group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
  icon,
}: {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative">
      <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all border border-gray-100">
        <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
          {number}
        </div>
        <div className="text-blue-600 mb-4">{icon}</div>
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function TestimonialCard({
  name,
  role,
  content,
  rating,
}: {
  name: string;
  role: string;
  content: string;
  rating: number;
}) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all border border-gray-100 relative">
      <Quote className="absolute top-4 right-4 w-10 h-10 text-blue-200" />
      <div className="flex gap-1 mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="text-gray-700 mb-6 leading-relaxed italic">"{content}"</p>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
          {name[0]}
        </div>
        <div>
          <div className="font-bold text-gray-900">{name}</div>
          <div className="text-sm text-gray-600">{role}</div>
        </div>
      </div>
    </div>
  );
}
