'use client';

import { useState } from 'react';
import QuestionList from '@/components/questions/QuestionList';
import Link from 'next/link';
import { Plus, Search, SlidersHorizontal } from 'lucide-react';
import { SUBJECTS } from '@/lib/utils/constants';

export default function QuestionsPage() {
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // For actual search
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'views' | 'coins' | 'answered'>('newest');
  const [gradeLevel, setGradeLevel] = useState<string | undefined>(undefined);
  const [showAnswered, setShowAnswered] = useState<'all' | 'answered' | 'unanswered'>('all');
  const [showUrgent, setShowUrgent] = useState<boolean | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);

  const filters = ['전체', ...SUBJECTS];

  const handleFilterClick = (filter: string) => {
    if (filter === '전체') {
      setSelectedSubject(undefined);
    } else {
      setSelectedSubject(filter);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchQuery);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
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
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="질문 제목이나 내용으로 검색..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              검색
            </button>
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchTerm('');
                }}
                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
              >
                초기화
              </button>
            )}
          </form>
          {searchTerm && (
            <p className="mt-3 text-sm text-gray-600">
              '<span className="font-semibold text-blue-600">{searchTerm}</span>' 검색 결과
            </p>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            {filters.map((filter) => (
              <FilterButton
                key={filter}
                label={filter}
                active={filter === '전체' ? !selectedSubject : selectedSubject === filter}
                onClick={() => handleFilterClick(filter)}
              />
            ))}
          </div>
        </div>

        {/* Sort and Advanced Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">정렬 및 필터</h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {showFilters ? '필터 숨기기' : '고급 필터'}
            </button>
          </div>

          {/* Sort Options */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              정렬 기준
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSortBy('newest')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  sortBy === 'newest'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                최신순
              </button>
              <button
                onClick={() => setSortBy('oldest')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  sortBy === 'oldest'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                오래된순
              </button>
              <button
                onClick={() => setSortBy('views')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  sortBy === 'views'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                조회수 높은순
              </button>
              <button
                onClick={() => setSortBy('coins')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  sortBy === 'coins'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                코인 높은순
              </button>
              <button
                onClick={() => setSortBy('answered')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  sortBy === 'answered'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                답변 많은순
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              {/* Grade Level Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  학년
                </label>
                <select
                  value={gradeLevel || ''}
                  onChange={(e) => setGradeLevel(e.target.value || undefined)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">전체</option>
                  <option value="초등학교">초등학교</option>
                  <option value="중학교">중학교</option>
                  <option value="고등학교">고등학교</option>
                  <option value="대학교">대학교</option>
                  <option value="기타">기타</option>
                </select>
              </div>

              {/* Answered Status Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  답변 상태
                </label>
                <select
                  value={showAnswered}
                  onChange={(e) => setShowAnswered(e.target.value as 'all' | 'answered' | 'unanswered')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">전체</option>
                  <option value="answered">답변 완료</option>
                  <option value="unanswered">답변 대기</option>
                </select>
              </div>

              {/* Urgent Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  긴급 질문
                </label>
                <select
                  value={showUrgent === undefined ? '' : showUrgent ? 'true' : 'false'}
                  onChange={(e) => setShowUrgent(e.target.value === '' ? undefined : e.target.value === 'true')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">전체</option>
                  <option value="true">긴급 질문만</option>
                  <option value="false">일반 질문만</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Questions List */}
        <QuestionList
          subject={selectedSubject}
          searchTerm={searchTerm}
          showPagination={true}
          sortBy={sortBy}
          gradeLevel={gradeLevel}
          isAnswered={showAnswered === 'all' ? undefined : showAnswered === 'answered'}
          isUrgent={showUrgent}
        />
      </div>
    </div>
  );
}

function FilterButton({
  label,
  active = false,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-semibold transition ${
        active
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );
}
