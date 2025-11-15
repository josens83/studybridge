'use client';

import Link from 'next/link';
import { Clock, MessageCircle, Eye, Coins } from 'lucide-react';
import { Question } from '@/types';

interface QuestionListProps {
  limit?: number;
}

// Mock data for now - will be replaced with actual Supabase data
const MOCK_QUESTIONS: Question[] = [
  {
    id: '1',
    author_id: 'user1',
    author_nickname: '익명123',
    title: '수학 문제 풀이 도와주세요',
    content: '이차방정식 문제인데 풀이 방법을 모르겠어요. x^2 + 5x + 6 = 0을 풀어주세요.',
    subject: '수학',
    grade_level: '고등학생',
    image_urls: [],
    coins_reward: 300,
    is_urgent: false,
    is_answered: false,
    views: 45,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: '2',
    author_id: 'user2',
    author_nickname: '학생ABC',
    title: '영어 문법 질문이요',
    content: '현재완료와 과거완료의 차이점을 설명해주세요.',
    subject: '영어',
    grade_level: '중학생',
    image_urls: [],
    coins_reward: 200,
    is_urgent: false,
    is_answered: true,
    accepted_answer_id: 'ans1',
    views: 89,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
  },
  {
    id: '3',
    author_id: 'user3',
    author_nickname: '공부왕',
    title: '과학 실험 보고서 작성법',
    content: '실험 보고서의 구조와 작성 방법을 알려주세요.',
    subject: '과학',
    grade_level: '고등학생',
    image_urls: [],
    coins_reward: 500,
    is_urgent: true,
    is_answered: false,
    views: 23,
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
];

export default function QuestionList({ limit }: QuestionListProps) {
  const questions = limit ? MOCK_QUESTIONS.slice(0, limit) : MOCK_QUESTIONS;

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
            <span className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              {Math.floor(Math.random() * 5)}
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
