'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Coins,
  Award,
  TrendingUp,
  MessageCircle,
  CheckCircle,
  Clock,
  Loader2,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import {
  getUserStats,
  getRecentActivities,
  getUserQuestions,
  getUserAnswers,
  getAllTransactions,
  type UserStats,
  type Activity,
  type Transaction,
} from '@/lib/supabase/dashboard';
import type { Question, Answer } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'answers' | 'history'>(
    'overview'
  );

  const [stats, setStats] = useState<UserStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<(Answer & { question: Question })[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }

    loadDashboardData();
  }, [user, router]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const [statsData, activitiesData, questionsData, answersData, transactionsData] = await Promise.all([
        getUserStats(user.id),
        getRecentActivities(user.id, 5),
        getUserQuestions(user.id),
        getUserAnswers(user.id),
        getAllTransactions(user.id, 20),
      ]);

      setStats(statsData);
      setActivities(activitiesData);
      setQuestions(questionsData);
      setAnswers(answersData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">대시보드를 불러오는 중...</p>
        </div>
      </div>
    );
  }

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
            value={stats?.questions_asked.toString() || '0'}
            label="질문한 개수"
          />
          <StatCard
            icon={<CheckCircle className="w-8 h-8 text-green-600" />}
            value={stats?.answers_provided.toString() || '0'}
            label="답변한 개수"
          />
          <StatCard
            icon={<Award className="w-8 h-8 text-yellow-600" />}
            value={stats?.best_answers.toString() || '0'}
            label="채택된 답변"
          />
          <StatCard
            icon={<TrendingUp className="w-8 h-8 text-purple-600" />}
            value={`${stats?.acceptance_rate || 0}%`}
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
            {activeTab === 'overview' && <OverviewTab activities={activities} />}
            {activeTab === 'questions' && <QuestionsTab questions={questions} />}
            {activeTab === 'answers' && <AnswersTab answers={answers} />}
            {activeTab === 'history' && <HistoryTab transactions={transactions} />}
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

function OverviewTab({ activities }: { activities: Activity[] }) {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'question':
        return <MessageCircle className="w-5 h-5 text-blue-600" />;
      case 'answer':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'accepted':
        return <Award className="w-5 h-5 text-yellow-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return '방금 전';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}일 전`;
    return `${Math.floor(seconds / 604800)}주 전`;
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">최근 활동</h3>
      {activities.length === 0 ? (
        <div className="text-center py-12 text-gray-600">
          아직 활동 내역이 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <ActivityItem
              key={activity.id}
              icon={getActivityIcon(activity.type)}
              title={activity.title}
              description={`${activity.description} • ${getTimeAgo(activity.created_at)}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function QuestionsTab({ questions }: { questions: Question[] }) {
  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return '방금 전';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}일 전`;
    return `${Math.floor(seconds / 604800)}주 전`;
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">내가 질문한 내용</h3>
      {questions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">아직 질문한 내용이 없습니다.</p>
          <Link
            href="/ask"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            질문하러 가기
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <Link key={question.id} href={`/question/${question.id}`}>
              <QuestionItem
                title={question.title}
                subject={question.subject}
                status={question.is_answered ? '답변 완료' : '답변 대기'}
                date={getTimeAgo(question.created_at)}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function AnswersTab({ answers }: { answers: (Answer & { question: Question })[] }) {
  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return '방금 전';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}일 전`;
    return `${Math.floor(seconds / 604800)}주 전`;
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">내가 답변한 내용</h3>
      {answers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">아직 답변한 내용이 없습니다.</p>
          <Link
            href="/questions"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            답변하러 가기
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {answers.map((answer) => (
            <Link key={answer.id} href={`/question/${answer.question.id}`}>
              <AnswerItem
                question={answer.question.title}
                status={answer.is_accepted ? '채택됨' : '답변 완료'}
                date={getTimeAgo(answer.created_at)}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryTab({ transactions }: { transactions: Transaction[] }) {
  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return '방금 전';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}일 전`;
    return `${Math.floor(seconds / 604800)}주 전`;
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">거래 내역</h3>
      {transactions.length === 0 ? (
        <div className="text-center py-12 text-gray-600">
          아직 거래 내역이 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              type={transaction.type}
              description={`${transaction.description} (${transaction.currency === 'coins' ? '코인' : '포인트'})`}
              amount={transaction.amount > 0 ? `+${transaction.amount}` : transaction.amount.toString()}
              date={getTimeAgo(transaction.created_at)}
            />
          ))}
        </div>
      )}
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
