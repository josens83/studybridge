'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Clock, Eye, Coins, MessageCircle, ThumbsUp, Award } from 'lucide-react';
import type { Question, Answer } from '@/types';

// Mock data
const MOCK_QUESTION: Question = {
  id: '1',
  author_id: 'user1',
  author_nickname: '익명123',
  title: '수학 문제 풀이 도와주세요',
  content: `이차방정식 문제인데 풀이 방법을 모르겠어요.

x² + 5x + 6 = 0

이 방정식을 풀어주시고, 풀이 과정도 자세히 설명해주시면 감사하겠습니다.`,
  subject: '수학',
  grade_level: '고등학생',
  image_urls: [],
  coins_reward: 300,
  is_urgent: false,
  is_answered: true,
  accepted_answer_id: 'ans1',
  views: 45,
  created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
};

const MOCK_ANSWERS: Answer[] = [
  {
    id: 'ans1',
    question_id: '1',
    author_id: 'tutor1',
    author_nickname: '수학튜터김',
    author_role: 'tutor',
    content: `안녕하세요! 이차방정식을 인수분해로 풀어드리겠습니다.

x² + 5x + 6 = 0

1단계: 인수분해하기
x² + 5x + 6 = (x + 2)(x + 3) = 0

2단계: 각 인수를 0으로 만드는 x 찾기
x + 2 = 0  →  x = -2
x + 3 = 0  →  x = -3

따라서 답은 x = -2, x = -3 입니다.

검산:
x = -2일 때: (-2)² + 5(-2) + 6 = 4 - 10 + 6 = 0 ✓
x = -3일 때: (-3)² + 5(-3) + 6 = 9 - 15 + 6 = 0 ✓

도움이 되셨길 바랍니다!`,
    image_urls: [],
    is_accepted: true,
    upvotes: 12,
    created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
  },
  {
    id: 'ans2',
    question_id: '1',
    author_id: 'student1',
    author_nickname: '학생ABC',
    author_role: 'student',
    content: `근의 공식으로도 풀 수 있어요!

x = (-b ± √(b² - 4ac)) / 2a

여기서 a=1, b=5, c=6 이므로:
x = (-5 ± √(25 - 24)) / 2
x = (-5 ± 1) / 2

따라서:
x = -2 또는 x = -3`,
    image_urls: [],
    is_accepted: false,
    upvotes: 5,
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
];

export default function QuestionDetailPage() {
  const params = useParams();
  const [answerContent, setAnswerContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const question = MOCK_QUESTION;
  const answers = MOCK_ANSWERS;

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Implement actual submission to Supabase
      console.log('Submitting answer:', answerContent);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setAnswerContent('');
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeAgo = getTimeAgo(new Date(question.created_at));

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Question */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${getSubjectColor(
                question.subject
              )}`}
            >
              {question.subject}
            </span>
            <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm">
              {question.grade_level}
            </span>
            {question.is_answered && (
              <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                답변완료
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold mb-4">{question.title}</h1>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
            <span>{question.author_nickname}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {timeAgo}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {question.views}
            </span>
            <span className="flex items-center gap-1 text-yellow-600 font-semibold">
              <Coins className="w-5 h-5" />
              {question.coins_reward}
            </span>
          </div>

          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap">{question.content}</p>
          </div>

          {question.image_urls.length > 0 && (
            <div className="grid grid-cols-2 gap-4 mt-6">
              {question.image_urls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Question image ${index + 1}`}
                  className="rounded-lg"
                />
              ))}
            </div>
          )}
        </div>

        {/* Answers */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <MessageCircle className="w-6 h-6" />
            답변 {answers.length}개
          </h2>

          <div className="space-y-4">
            {answers.map((answer) => (
              <AnswerCard key={answer.id} answer={answer} />
            ))}
          </div>
        </div>

        {/* Answer Form */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h3 className="text-xl font-bold mb-4">답변 작성</h3>
          <form onSubmit={handleSubmitAnswer}>
            <textarea
              value={answerContent}
              onChange={(e) => setAnswerContent(e.target.value)}
              placeholder="도움이 될 수 있는 답변을 작성해주세요"
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              required
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !answerContent.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '등록 중...' : '답변 등록'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function AnswerCard({ answer }: { answer: Answer }) {
  const timeAgo = getTimeAgo(new Date(answer.created_at));

  return (
    <div
      className={`
        bg-white rounded-lg shadow-sm p-6
        ${answer.is_accepted ? 'ring-2 ring-green-500' : ''}
      `}
    >
      {answer.is_accepted && (
        <div className="flex items-center gap-2 text-green-600 font-semibold mb-4">
          <Award className="w-5 h-5" />
          채택된 답변
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
            {answer.author_nickname[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{answer.author_nickname}</span>
              {answer.author_role === 'tutor' && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
                  튜터
                </span>
              )}
            </div>
            <span className="text-sm text-gray-600">{timeAgo}</span>
          </div>
        </div>
        <button className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
          <ThumbsUp className="w-4 h-4" />
          <span>{answer.upvotes}</span>
        </button>
      </div>

      <div className="prose max-w-none">
        <p className="whitespace-pre-wrap">{answer.content}</p>
      </div>
    </div>
  );
}

function getSubjectColor(subject: string): string {
  const colors: Record<string, string> = {
    국어: 'bg-pink-100 text-pink-700',
    영어: 'bg-blue-100 text-blue-700',
    수학: 'bg-purple-100 text-purple-700',
    과학: 'bg-green-100 text-green-700',
    사회: 'bg-orange-100 text-orange-700',
    역사: 'bg-amber-100 text-amber-700',
    기타: 'bg-gray-100 text-gray-700',
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
