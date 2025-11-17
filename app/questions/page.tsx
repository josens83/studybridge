'use client';

import { useState } from 'react';
import QuestionList from '@/components/questions/QuestionList';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { SUBJECTS } from '@/lib/utils/constants';

export default function QuestionsPage() {
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // For actual search

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

        {/* Questions List */}
        <QuestionList subject={selectedSubject} searchTerm={searchTerm} />
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
