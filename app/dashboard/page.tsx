'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Coins,
  Award,
  TrendingUp,
  MessageCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'answers' | 'history'>(
    'overview'
  );

  // Mock user data
  const user = {
    nickname: '익명123',
    coins: 1500,
    points: 350,
    subscription_tier: 'premium',
    questions_asked: 12,
    answers_provided: 8,
    best_answers: 3,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{user.nickname}님의 대시보드</h1>
              <div className="flex items-center gap-4">
                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  {user.subscription_tier === 'premium' ? '프리미엄' : '무료'}
                </span>
                <Link
                  href="/pricing"
                  className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                >
                  구독 업그레이드 →
                </Link>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-yellow-600 mb-1">
                  <Coins className="w-6 h-6" />
                  <span className="text-3xl font-bold">{user.coins}</span>
                </div>
                <div className="text-sm text-gray-600">코인</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-purple-600 mb-1">
                  <Award className="w-6 h-6" />
                  <span className="text-3xl font-bold">{user.points}</span>
                </div>
                <div className="text-sm text-gray-600">포인트</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<MessageCircle className="w-8 h-8 text-blue-600" />}
            value={user.questions_asked.toString()}
            label="질문한 개수"
          />
          <StatCard
            icon={<CheckCircle className="w-8 h-8 text-green-600" />}
            value={user.answers_provided.toString()}
            label="답변한 개수"
          />
          <StatCard
            icon={<Award className="w-8 h-8 text-yellow-600" />}
            value={user.best_answers.toString()}
            label="채택된 답변"
          />
          <StatCard
            icon={<TrendingUp className="w-8 h-8 text-purple-600" />}
            value="12%"
            label="채택률"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex gap-8 px-8 pt-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-4 border-b-2 transition ${
                  activeTab === 'overview'
                    ? 'border-blue-600 text-blue-600 font-semibold'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                개요
              </button>
              <button
                onClick={() => setActiveTab('questions')}
                className={`pb-4 border-b-2 transition ${
                  activeTab === 'questions'
                    ? 'border-blue-600 text-blue-600 font-semibold'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                내 질문
              </button>
              <button
                onClick={() => setActiveTab('answers')}
                className={`pb-4 border-b-2 transition ${
                  activeTab === 'answers'
                    ? 'border-blue-600 text-blue-600 font-semibold'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                내 답변
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`pb-4 border-b-2 transition ${
                  activeTab === 'history'
                    ? 'border-blue-600 text-blue-600 font-semibold'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                거래 내역
              </button>
            </nav>
          </div>

          <div className="p-8">
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'questions' && <QuestionsTab />}
            {activeTab === 'answers' && <AnswersTab />}
            {activeTab === 'history' && <HistoryTab />}
          </div>
        </div>
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
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        {icon}
        <span className="text-3xl font-bold">{value}</span>
      </div>
      <div className="text-gray-600">{label}</div>
    </div>
  );
}

function OverviewTab() {
  return (
    <div>
      <h3 className="text-xl font-bold mb-4">최근 활동</h3>
      <div className="space-y-4">
        <ActivityItem
          icon={<MessageCircle className="w-5 h-5 text-blue-600" />}
          title="수학 문제 풀이 도와주세요"
          description="답변 2개 • 30분 전"
        />
        <ActivityItem
          icon={<CheckCircle className="w-5 h-5 text-green-600" />}
          title="영어 문법 질문에 답변이 채택되었습니다"
          description="+300 코인 • 2시간 전"
        />
        <ActivityItem
          icon={<Clock className="w-5 h-5 text-orange-600" />}
          title="과학 실험 보고서 작성법"
          description="답변 대기 중 • 5시간 전"
        />
      </div>
    </div>
  );
}

function QuestionsTab() {
  return (
    <div>
      <h3 className="text-xl font-bold mb-4">내가 질문한 내용</h3>
      <div className="space-y-4">
        <QuestionItem
          title="수학 문제 풀이 도와주세요"
          subject="수학"
          status="답변 완료"
          date="30분 전"
        />
        <QuestionItem
          title="과학 실험 보고서 작성법"
          subject="과학"
          status="답변 대기"
          date="5시간 전"
        />
      </div>
    </div>
  );
}

function AnswersTab() {
  return (
    <div>
      <h3 className="text-xl font-bold mb-4">내가 답변한 내용</h3>
      <div className="space-y-4">
        <AnswerItem
          question="영어 문법 질문이요"
          status="채택됨"
          date="2시간 전"
        />
        <AnswerItem
          question="역사 연표 정리 방법"
          status="답변 완료"
          date="1일 전"
        />
      </div>
    </div>
  );
}

function HistoryTab() {
  return (
    <div>
      <h3 className="text-xl font-bold mb-4">거래 내역</h3>
      <div className="space-y-4">
        <TransactionItem
          type="earn"
          description="답변 채택 보상"
          amount="+300"
          date="2시간 전"
        />
        <TransactionItem
          type="spend"
          description="긴급 질문 등록"
          amount="-500"
          date="5시간 전"
        />
        <TransactionItem
          type="purchase"
          description="코인 구매 (1,000개)"
          amount="+1,000"
          date="2일 전"
        />
      </div>
    </div>
  );
}

function ActivityItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="mt-1">{icon}</div>
      <div className="flex-1">
        <h4 className="font-semibold mb-1">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}

function QuestionItem({
  title,
  subject,
  status,
  date,
}: {
  title: string;
  subject: string;
  status: string;
  date: string;
}) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold">{title}</h4>
        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
          {subject}
        </span>
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <span>{status}</span>
        <span>•</span>
        <span>{date}</span>
      </div>
    </div>
  );
}

function AnswerItem({
  question,
  status,
  date,
}: {
  question: string;
  status: string;
  date: string;
}) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold">{question}</h4>
        <span
          className={`px-3 py-1 rounded-full text-sm ${
            status === '채택됨'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {status}
        </span>
      </div>
      <p className="text-sm text-gray-600">{date}</p>
    </div>
  );
}

function TransactionItem({
  type,
  description,
  amount,
  date,
}: {
  type: 'earn' | 'spend' | 'purchase';
  description: string;
  amount: string;
  date: string;
}) {
  const isPositive = amount.startsWith('+');
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
      <div>
        <h4 className="font-semibold mb-1">{description}</h4>
        <p className="text-sm text-gray-600">{date}</p>
      </div>
      <div
        className={`text-xl font-bold ${
          isPositive ? 'text-green-600' : 'text-red-600'
        }`}
      >
        {amount}
      </div>
    </div>
  );
}
