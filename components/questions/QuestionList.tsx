'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, MessageCircle, Eye, Coins, ChevronLeft, ChevronRight, Bookmark } from 'lucide-react';
import { Question } from '@/types';
import { getQuestions, searchQuestions } from '@/lib/supabase/questions';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/store/auth';
import { toggleBookmark, isBookmarked } from '@/lib/supabase/bookmarks';

interface QuestionListProps {
  limit?: number;
  subject?: string;
  searchTerm?: string;
  showPagination?: boolean;
  sortBy?: 'newest' | 'oldest' | 'views' | 'coins' | 'answered';
  gradeLevel?: string;
  isAnswered?: boolean;
  isUrgent?: boolean;
}

const ITEMS_PER_PAGE = 20;

function applySorting(questions: Question[], sortBy: string): Question[] {
  const sorted = [...questions];

  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    case 'views':
      return sorted.sort((a, b) => b.views - a.views);
    case 'coins':
      return sorted.sort((a, b) => b.coins_reward - a.coins_reward);
    case 'answered':
      return sorted.sort((a, b) => (b.is_answered ? 1 : 0) - (a.is_answered ? 1 : 0));
    default:
      return sorted;
  }
}

export default function QuestionList({
  limit,
  subject,
  searchTerm,
  showPagination = false,
  sortBy = 'newest',
  gradeLevel,
  isAnswered,
  isUrgent,
}: QuestionListProps) {
  const { user } = useAuthStore();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadQuestions();
  }, [limit, subject, searchTerm, currentPage, sortBy, gradeLevel, isAnswered, isUrgent]);

  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      let data: Question[];

      if (searchTerm && searchTerm.trim()) {
        // Use search function when search term is provided
        data = await searchQuestions(searchTerm);

        // Apply filters
        if (subject) {
          data = data.filter(q => q.subject === subject);
        }
        if (gradeLevel) {
          data = data.filter(q => q.grade_level === gradeLevel);
        }
        if (isAnswered !== undefined) {
          data = data.filter(q => q.is_answered === isAnswered);
        }
        if (isUrgent !== undefined) {
          data = data.filter(q => q.is_urgent === isUrgent);
        }

        // Apply sorting
        data = applySorting(data, sortBy);

        // Pagination for search results
        if (showPagination) {
          const start = (currentPage - 1) * ITEMS_PER_PAGE;
          const end = start + ITEMS_PER_PAGE;
          setTotalPages(Math.ceil(data.length / ITEMS_PER_PAGE));
          data = data.slice(start, end);
        }
      } else {
        // Regular query with filters and pagination
        let query = supabase.from('questions').select('*', showPagination ? { count: 'exact' } : undefined);

        // Apply filters
        if (subject) {
          query = query.eq('subject', subject);
        }
        if (gradeLevel) {
          query = query.eq('grade_level', gradeLevel);
        }
        if (isAnswered !== undefined) {
          query = query.eq('is_answered', isAnswered);
        }
        if (isUrgent !== undefined) {
          query = query.eq('is_urgent', isUrgent);
        }

        // Apply sorting
        switch (sortBy) {
          case 'newest':
            query = query.order('created_at', { ascending: false });
            break;
          case 'oldest':
            query = query.order('created_at', { ascending: true });
            break;
          case 'views':
            query = query.order('views', { ascending: false });
            break;
          case 'coins':
            query = query.order('coins_reward', { ascending: false });
            break;
          case 'answered':
            // Note: Can't directly count answers in this query, will use is_answered
            query = query.order('is_answered', { ascending: false });
            break;
          default:
            query = query.order('created_at', { ascending: false });
        }

        if (showPagination) {
          const { count: totalCount, error: countError } = await supabase
            .from('questions')
            .select('*', { count: 'exact', head: true });

          if (!countError) {
            setTotalPages(Math.ceil((totalCount || 0) / ITEMS_PER_PAGE));
          }

          const offset = (currentPage - 1) * ITEMS_PER_PAGE;
          query = query.range(offset, offset + ITEMS_PER_PAGE - 1);
        } else if (limit) {
          query = query.limit(limit);
        }

        const { data: result, error } = await query;
        if (error) throw error;
        data = result || [];
      }

      setQuestions(data);

      // Load bookmarks for logged-in users
      if (user) {
        const bookmarkChecks = await Promise.all(
          data.map(q => isBookmarked(user.id, q.id))
        );
        const bookmarked = new Set(
          data.filter((_, idx) => bookmarkChecks[idx]).map(q => q.id)
        );
        setBookmarkedQuestions(bookmarked);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  async function handleToggleBookmark(questionId: string, e: React.MouseEvent) {
    e.preventDefault(); // Prevent navigation when clicking bookmark
    e.stopPropagation();

    if (!user) {
      alert('북마크를 사용하려면 로그인이 필요합니다.');
      return;
    }

    try {
      const nowBookmarked = await toggleBookmark(user.id, questionId);
      setBookmarkedQuestions(prev => {
        const newSet = new Set(prev);
        if (nowBookmarked) {
          newSet.add(questionId);
        } else {
          newSet.delete(questionId);
        }
        return newSet;
      });
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      alert('북마크 처리 중 오류가 발생했습니다.');
    }
  }

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
    <>
      <div className="space-y-4">
        {questions.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            isBookmarked={bookmarkedQuestions.has(question.id)}
            onToggleBookmark={(e) => handleToggleBookmark(question.id, e)}
          />
        ))}
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg hover:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 rounded-lg font-semibold transition ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg hover:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </>
  );
}

function QuestionCard({
  question,
  isBookmarked,
  onToggleBookmark,
}: {
  question: Question;
  isBookmarked: boolean;
  onToggleBookmark: (e: React.MouseEvent) => void;
}) {
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
          <button
            onClick={onToggleBookmark}
            className={`p-2 rounded-lg transition ${
              isBookmarked
                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={isBookmarked ? '북마크 해제' : '북마크 추가'}
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
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
