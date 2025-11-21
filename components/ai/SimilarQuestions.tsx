'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileQuestion, Loader2, MessageCircle, Eye } from 'lucide-react';

interface Question {
  id: string;
  title: string;
  content: string;
  subject: string;
  grade_level: string;
  views: number;
  is_answered: boolean;
  created_at: string;
}

interface SimilarQuestionsProps {
  questionId?: string;
  question: string;
  subject: string;
}

export default function SimilarQuestions({ questionId, question, subject }: SimilarQuestionsProps) {
  const [similarQuestions, setSimilarQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSimilarQuestions();
  }, [questionId, question, subject]);

  const fetchSimilarQuestions = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/ai/similar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId,
          question,
          subject,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSimilarQuestions(data.questions || []);
      }
    } catch (err) {
      console.error('Error fetching similar questions:', err);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <FileQuestion className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold">비슷한 질문</h3>
        </div>
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600 text-sm">유사한 질문을 찾는 중...</p>
        </div>
      </div>
    );
  }

  if (similarQuestions.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <FileQuestion className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold">비슷한 질문</h3>
        </div>
        <p className="text-gray-500 text-sm text-center py-4">
          비슷한 질문이 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <FileQuestion className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold">비슷한 질문</h3>
        <span className="text-sm text-gray-500">({similarQuestions.length}개)</span>
      </div>

      <div className="space-y-3">
        {similarQuestions.map((q) => (
          <Link
            key={q.id}
            href={`/question/${q.id}`}
            className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="font-semibold text-sm flex-1 line-clamp-2">
                {q.title}
              </h4>
              {q.is_answered && (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex-shrink-0">
                  답변완료
                </span>
              )}
            </div>

            <p className="text-gray-600 text-sm line-clamp-1 mb-2">
              {q.content}
            </p>

            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="px-2 py-0.5 bg-gray-100 rounded">{q.subject}</span>
              <span className="px-2 py-0.5 bg-gray-100 rounded">{q.grade_level}</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {q.views}
              </span>
              <span>{getTimeAgo(q.created_at)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
