'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Clock, Eye, Coins, ThumbsUp, Award, AlertCircle, Loader2, ImageIcon } from 'lucide-react';
import type { Question, Answer } from '@/types';
import { getQuestionById } from '@/lib/supabase/questions';
import { getAnswersByQuestionId, createAnswer, acceptAnswer, upvoteAnswer } from '@/lib/supabase/answers';
import { useAuthStore } from '@/lib/store/auth';

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();

  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [answerContent, setAnswerContent] = useState('');
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true);
  const [isLoadingAnswers, setIsLoadingAnswers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      loadQuestion(params.id as string);
      loadAnswers(params.id as string);
    }
  }, [params.id]);

  const loadQuestion = async (id: string) => {
    try {
      setIsLoadingQuestion(true);
      const data = await getQuestionById(id);
      setQuestion(data);
    } catch (error) {
      console.error('Error loading question:', error);
      setError('질문을 불러올 수 없습니다.');
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  const loadAnswers = async (questionId: string) => {
    try {
      setIsLoadingAnswers(true);
      const data = await getAnswersByQuestionId(questionId);
      setAnswers(data);
    } catch (error) {
      console.error('Error loading answers:', error);
    } finally {
      setIsLoadingAnswers(false);
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('로그인이 필요합니다.');
      router.push('/auth');
      return;
    }

    if (!question) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const newAnswer = await createAnswer({
        question_id: question.id,
        author_id: user.id,
        author_nickname: user.nickname,
        author_role: user.role,
        content: answerContent,
        image_urls: [],
      });

      setAnswers([...answers, newAnswer]);
      setAnswerContent('');
    } catch (error: any) {
      console.error('Error submitting answer:', error);
      setError(error.message || '답변 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    if (!user || !question) return;

    if (user.id !== question.author_id) {
      setError('질문 작성자만 답변을 채택할 수 있습니다.');
      return;
    }

    if (question.accepted_answer_id) {
      setError('이미 채택된 답변이 있습니다.');
      return;
    }

    try {
      await acceptAnswer(question.id, answerId, user.id);

      // Reload question and answers
      await loadQuestion(question.id);
      await loadAnswers(question.id);

      alert('답변이 채택되었습니다! 코인이 답변자에게 지급되었습니다.');
    } catch (error: any) {
      console.error('Error accepting answer:', error);
      setError(error.message || '답변 채택 중 오류가 발생했습니다.');
    }
  };

  const handleUpvote = async (answerId: string) => {
    if (!user) {
      setError('로그인이 필요합니다.');
      return;
    }

    try {
      await upvoteAnswer(answerId);
      await loadAnswers(question!.id);
    } catch (error: any) {
      console.error('Error upvoting answer:', error);
    }
  };

  if (isLoadingQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">질문을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">질문을 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-6">{error || '요청하신 질문이 존재하지 않습니다.'}</p>
          <button
            onClick={() => router.push('/questions')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            질문 목록으로
          </button>
        </div>
      </div>
    );
  }

  const timeAgo = getTimeAgo(new Date(question.created_at));
  const isQuestionAuthor = user?.id === question.author_id;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 mb-6">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Question */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getSubjectColor(question.subject)}`}>
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
            {question.is_urgent && (
              <span className="px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                긴급
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

          <div className="prose max-w-none mb-6">
            <p className="whitespace-pre-wrap text-gray-700">{question.content}</p>
          </div>

          {question.image_urls && question.image_urls.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {question.image_urls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Question image ${index + 1}`}
                  className="rounded-lg border border-gray-200"
                />
              ))}
            </div>
          )}
        </div>

        {/* Answers */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            답변 {answers.length}개
          </h2>

          {isLoadingAnswers ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-gray-600">답변을 불러오는 중...</p>
            </div>
          ) : answers.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-gray-600">아직 답변이 없습니다.</p>
              <p className="text-sm text-gray-500 mt-2">첫 답변을 작성해보세요!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {answers.map((answer) => (
                <AnswerCard
                  key={answer.id}
                  answer={answer}
                  isQuestionAuthor={isQuestionAuthor}
                  canAccept={!question.accepted_answer_id && isQuestionAuthor}
                  onAccept={() => handleAcceptAnswer(answer.id)}
                  onUpvote={() => handleUpvote(answer.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Answer Form */}
        {user ? (
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
                disabled={isSubmitting}
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !answerContent.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>등록 중...</span>
                    </>
                  ) : (
                    <span>답변 등록</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600 mb-4">답변을 작성하려면 로그인이 필요합니다.</p>
            <button
              onClick={() => router.push('/auth')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              로그인하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function AnswerCard({
  answer,
  isQuestionAuthor,
  canAccept,
  onAccept,
  onUpvote,
}: {
  answer: Answer;
  isQuestionAuthor: boolean;
  canAccept: boolean;
  onAccept: () => void;
  onUpvote: () => void;
}) {
  const timeAgo = getTimeAgo(new Date(answer.created_at));

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${answer.is_accepted ? 'ring-2 ring-green-500' : ''}`}>
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

        <div className="flex items-center gap-2">
          <button
            onClick={onUpvote}
            className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            <ThumbsUp className="w-4 h-4" />
            <span>{answer.upvotes}</span>
          </button>

          {canAccept && !answer.is_accepted && (
            <button
              onClick={onAccept}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-sm"
            >
              채택하기
            </button>
          )}
        </div>
      </div>

      <div className="prose max-w-none">
        <p className="whitespace-pre-wrap text-gray-700">{answer.content}</p>
      </div>

      {answer.image_urls && answer.image_urls.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          {answer.image_urls.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`Answer image ${index + 1}`}
              className="rounded-lg border border-gray-200"
            />
          ))}
        </div>
      )}
    </div>
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
