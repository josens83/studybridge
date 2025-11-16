'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, MessageCircle, Eye, Coins } from 'lucide-react';
import { Question } from '@/types';
import { getQuestions } from '@/lib/supabase/questions';

interface QuestionListProps {
  limit?: number;
  subject?: string;
}

export default function QuestionList({ limit, subject }: QuestionListProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadQuestions();
  }, [limit, subject]);

  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      const data = await getQuestions({ limit, subject });
      setQuestions(data);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-gray-600 mt-4">질문을 불러오는 중...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg">
        <p className="text-gray-600">아직 질문이 없습니다.</p>
        <Link
          href="/ask"
          className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-semibold"
        >
          첫 질문을 올려보세요 →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <QuestionCard key={question.id} question={question} />
      ))}
    </div>
  );
}

function QuestionCard({ question }: { question: Question }) {
  const timeAgo = getTimeAgo(new Date(question.created_at));

  return (
    <Link
      href={`/question/${question.id}`}
      className="block bg-white rounded-lg shadow-sm hover:shadow-md transition p-6 border border-gray-100"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getSubjectColor(question.subject)}`}>
              {question.subject}
            </span>
            <span className="text-sm text-gray-500">{question.grade_level}</span>
            {question.is_urgent && (
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                긴급
              </span>
            )}
            {question.is_answered && (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                답변완료
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold mb-2 text-gray-900">
            {question.title}
          </h3>
          <p className="text-gray-600 line-clamp-2 mb-3">
            {question.content}
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{question.author_nickname}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {timeAgo}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {question.views}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-1 text-yellow-600 font-semibold">
            <Coins className="w-5 h-5" />
            <span>{question.coins_reward}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function getSubjectColor(subject: string): string {
  const colors: Record<string, string> = {
    '국어': 'bg-pink-100 text-pink-700',
    '영어': 'bg-blue-100 text-blue-700',
    '수학': 'bg-purple-100 text-purple-700',
    '과학': 'bg-green-100 text-green-700',
    '사회': 'bg-orange-100 text-orange-700',
    '역사': 'bg-amber-100 text-amber-700',
    '기타': 'bg-gray-100 text-gray-700',
  };
  return colors[subject] || colors['기타'];
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return '방금 전';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}일 전`;
  return `${Math.floor(seconds / 604800)}주 전`;
}
