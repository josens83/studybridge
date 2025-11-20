'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, SlidersHorizontal, X, Tag as TagIcon, TrendingUp } from 'lucide-react';
import { SUBJECTS, GRADE_LEVELS } from '@/lib/utils/constants';
import { searchQuestions, getPopularTags, type SearchFilters } from '@/lib/supabase/search';
import type { Question } from '@/types';
import QuestionCard from '@/components/questions/QuestionCard';

interface Tag {
  id: string;
  name: string;
  slug: string;
  usage_count: number;
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [popularTags, setPopularTags] = useState<Tag[]>([]);

  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>();
  const [selectedGrade, setSelectedGrade] = useState<string | undefined>();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showAnswered, setShowAnswered] = useState<'all' | 'answered' | 'unanswered'>('all');
  const [showUrgent, setShowUrgent] = useState<boolean | undefined>();
  const [sortBy, setSortBy] = useState<'relevance' | 'recent' | 'popular' | 'unanswered'>('recent');
  const [showFilters, setShowFilters] = useState(false);

  const pageSize = 20;

  useEffect(() => {
    loadPopularTags();
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [
    searchQuery,
    selectedSubject,
    selectedGrade,
    selectedTags,
    showAnswered,
    showUrgent,
    sortBy,
    currentPage,
  ]);

  const loadPopularTags = async () => {
    const tags = await getPopularTags(15);
    setPopularTags(tags);
  };

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const filters: SearchFilters = {
        query: searchQuery || undefined,
        subject: selectedSubject,
        gradeLevel: selectedGrade,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        isAnswered: showAnswered === 'answered' ? true : showAnswered === 'unanswered' ? false : undefined,
        isUrgent: showUrgent,
        sortBy,
      };

      const result = await searchQuestions(filters, currentPage, pageSize);
      setQuestions(result.questions);
      setTotalCount(result.totalCount);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSubject(undefined);
    setSelectedGrade(undefined);
    setSelectedTags([]);
    setShowAnswered('all');
    setShowUrgent(undefined);
    setSortBy('recent');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedSubject ||
    selectedGrade ||
    selectedTags.length > 0 ||
    showAnswered !== 'all' ||
    showUrgent !== undefined;

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">질문 목록</h1>
            <p className="text-gray-600">다른 학생들의 질문을 보고 답변해보세요</p>
          </div>
          <Link
            href="/ask"
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            <Plus className="w-5 h-5" />
            질문하기
          </Link>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="질문을 검색하세요..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition ${
                showFilters ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* Popular Tags */}
        {popularTags.length > 0 && (
          <div className="mb-6 bg-white rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold">인기 태그</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularTags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1 rounded-full text-sm transition ${
                    selectedTags.includes(tag.id)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <TagIcon className="w-3 h-3" />
                    {tag.name}
                    <span className="text-xs opacity-75">({tag.usage_count})</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-white rounded-lg p-6 mb-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">필터</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                >
                  필터 초기화
                </button>
              )}
            </div>

            {/* Subject Filter */}
            <div>
              <label className="block text-sm font-semibold mb-2">과목</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedSubject(undefined)}
                  className={`px-4 py-2 rounded-lg transition ${
                    !selectedSubject
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  전체
                </button>
                {SUBJECTS.map(subject => (
                  <button
                    key={subject}
                    onClick={() => setSelectedSubject(subject)}
                    className={`px-4 py-2 rounded-lg transition ${
                      selectedSubject === subject
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>

            {/* Grade Level Filter */}
            <div>
              <label className="block text-sm font-semibold mb-2">학년</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedGrade(undefined)}
                  className={`px-4 py-2 rounded-lg transition ${
                    !selectedGrade
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  전체
                </button>
                {GRADE_LEVELS.map(grade => (
                  <button
                    key={grade}
                    onClick={() => setSelectedGrade(grade)}
                    className={`px-4 py-2 rounded-lg transition ${
                      selectedGrade === grade
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {grade}
                  </button>
                ))}
              </div>
            </div>

            {/* Answer Status Filter */}
            <div>
              <label className="block text-sm font-semibold mb-2">답변 상태</label>
              <div className="flex gap-2">
                {['all', 'answered', 'unanswered'].map(status => (
                  <button
                    key={status}
                    onClick={() => setShowAnswered(status as typeof showAnswered)}
                    className={`px-4 py-2 rounded-lg transition ${
                      showAnswered === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status === 'all' ? '전체' : status === 'answered' ? '답변 완료' : '답변 대기'}
                  </button>
                ))}
              </div>
            </div>

            {/* Urgent Filter */}
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showUrgent === true}
                  onChange={(e) => setShowUrgent(e.target.checked ? true : undefined)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-semibold">긴급 질문만 보기</span>
              </label>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-semibold mb-2">정렬</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="recent">최신순</option>
                <option value="popular">인기순</option>
                <option value="unanswered">답변 대기순</option>
                {searchQuery && <option value="relevance">관련도순</option>}
              </select>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600">
            총 <span className="font-semibold text-gray-900">{totalCount}</span>개의 질문
          </p>
        </div>

        {/* Question List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-600">질문을 불러오는 중...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <p className="text-gray-600 mb-4">검색 결과가 없습니다.</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                필터 초기화
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map(question => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              이전
            </button>
            <span className="px-4 py-2">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              다음
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
