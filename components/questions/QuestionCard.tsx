import Link from 'next/link';
import { Eye, MessageCircle, Coins, Clock, AlertCircle } from 'lucide-react';
import type { Question } from '@/types';

interface QuestionCardProps {
  question: Question;
}

export default function QuestionCard({ question }: QuestionCardProps) {
  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return '방금 전';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}일 전`;
    return `${Math.floor(seconds / 604800)}주 전`;
  };

  const getSubjectColor = (subject: string) => {
    const colors: Record<string, string> = {
      '수학': 'bg-blue-100 text-blue-700',
      '영어': 'bg-green-100 text-green-700',
      '과학': 'bg-purple-100 text-purple-700',
      '국어': 'bg-red-100 text-red-700',
      '사회': 'bg-yellow-100 text-yellow-700',
      '역사': 'bg-orange-100 text-orange-700',
      '기타': 'bg-gray-100 text-gray-700',
    };
    return colors[subject] || 'bg-gray-100 text-gray-700';
  };

  return (
    <Link href={`/question/${question.id}`}>
      <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition border border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getSubjectColor(question.subject)}`}>
                {question.subject}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-700">
                {question.grade_level}
              </span>
              {question.is_urgent && (
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-700 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  긴급
                </span>
              )}
              {question.is_answered && (
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                  답변 완료
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold mb-2 text-gray-900 hover:text-blue-600 transition">
              {question.title}
            </h3>

            {/* Content Preview */}
            <p className="text-gray-600 line-clamp-2 mb-3">
              {question.content}
            </p>

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {getTimeAgo(question.created_at)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {question.views} 조회
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                0 답변
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">{question.author_nickname}</span>
            </div>
          </div>

          {/* Coin Reward */}
          <div className="ml-4 flex-shrink-0">
            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 rounded-lg border border-yellow-200">
              <Coins className="w-5 h-5 text-yellow-600" />
              <span className="text-lg font-bold text-yellow-600">
                {question.coins_reward}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
