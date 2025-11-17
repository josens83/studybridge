'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bookmark, BookmarkX, Clock, Eye, Coins, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import { getUserBookmarks } from '@/lib/supabase/bookmarks';
import type { Question } from '@/types';

export default function BookmarksPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }

    loadBookmarks();
  }, [user, router]);

  async function loadBookmarks() {
    if (!user) return;

    setLoading(true);
    try {
      const data = await getUserBookmarks(user.id);
      setBookmarks(data);
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    } finally {
      setLoading(false);
    }
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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            뒤로 가기
          </button>

          <div className="flex items-center gap-3 mb-2">
            <Bookmark className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold">내 북마크</h1>
          </div>
          <p className="text-gray-600">나중에 다시 볼 질문들을 저장해두었습니다</p>
        </div>

        {/* Bookmarks List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">북마크를 불러오는 중...</p>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <BookmarkX className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">저장된 북마크가 없습니다</h2>
            <p className="text-gray-600 mb-6">
              관심있는 질문을 북마크하면 여기에서 모아볼 수 있습니다
            </p>
            <Link
              href="/questions"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              질문 둘러보기
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              총 <span className="font-semibold text-blue-600">{bookmarks.length}</span>개의
              북마크
            </div>

            <div className="space-y-4">
              {bookmarks.map((bookmark) => (
                <Link
                  key={bookmark.id}
                  href={`/question/${bookmark.id}`}
                  className="block bg-white rounded-lg shadow-sm hover:shadow-md transition p-6 border border-gray-100"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${getSubjectColor(
                            bookmark.subject
                          )}`}
                        >
                          {bookmark.subject}
                        </span>
                        <span className="text-sm text-gray-500">
                          {bookmark.grade_level}
                        </span>
                        {bookmark.is_urgent && (
                          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                            긴급
                          </span>
                        )}
                        {bookmark.is_answered && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                            답변완료
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold mb-2 text-gray-900">
                        {bookmark.title}
                      </h3>
                      <p className="text-gray-600 line-clamp-2 mb-3">
                        {bookmark.content}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{bookmark.author_nickname}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {getTimeAgo(new Date(bookmark.created_at))}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {bookmark.views}
                        </span>
                        <span className="flex items-center gap-1 text-blue-600">
                          <Bookmark className="w-4 h-4 fill-current" />
                          {getTimeAgo(new Date(bookmark.bookmarkedAt))} 저장
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1 text-yellow-600 font-semibold">
                        <Coins className="w-5 h-5" />
                        <span>{bookmark.coins_reward}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
