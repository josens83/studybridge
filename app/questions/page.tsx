import QuestionList from '@/components/questions/QuestionList';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function QuestionsPage() {
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

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <FilterButton label="전체" active />
            <FilterButton label="국어" />
            <FilterButton label="영어" />
            <FilterButton label="수학" />
            <FilterButton label="과학" />
            <FilterButton label="사회" />
            <FilterButton label="역사" />
          </div>
        </div>

        {/* Questions List */}
        <QuestionList />
      </div>
    </div>
  );
}

function FilterButton({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <button
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
