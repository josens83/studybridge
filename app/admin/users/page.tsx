'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  Shield,
  ShieldOff,
  Users,
  Award,
  ChevronLeft,
  ChevronRight,
  Mail,
  Coins,
  Star,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import {
  isAdmin,
  getAllUsers,
  updateUserRole,
  blockUser,
  unblockUser,
  AdminUser,
} from '@/lib/supabase/admin';

export default function AdminUsersPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const pageSize = 20;

  useEffect(() => {
    async function checkAuth() {
      if (!user) {
        router.push('/auth');
        return;
      }

      const adminStatus = await isAdmin(user.id);
      if (!adminStatus) {
        alert('관리자 권한이 필요합니다.');
        router.push('/');
        return;
      }

      loadUsers();
    }

    checkAuth();
  }, [user, router, currentPage]);

  async function loadUsers() {
    setLoading(true);
    try {
      const { users: data, total: count } = await getAllUsers(
        currentPage,
        pageSize,
        searchQuery || undefined
      );
      setUsers(data);
      setTotal(count);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setCurrentPage(1);
    loadUsers();
  }

  async function handleUpdateRole(
    userId: string,
    newRole: 'student' | 'tutor' | 'admin'
  ) {
    if (!confirm(`이 사용자의 역할을 "${getRoleLabel(newRole)}"로 변경하시겠습니까?`)) {
      return;
    }

    setActionLoading(true);
    try {
      await updateUserRole(userId, newRole);
      alert('역할이 업데이트되었습니다.');
      loadUsers();
    } catch (error) {
      alert('역할 업데이트 중 오류가 발생했습니다.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleBlockUser(userId: string) {
    if (!user) return;

    const reason = prompt('차단 사유를 입력하세요:');
    if (!reason) return;

    setActionLoading(true);
    try {
      await blockUser(userId, reason, user.id);
      alert('사용자가 차단되었습니다.');
      loadUsers();
    } catch (error) {
      alert('사용자 차단 중 오류가 발생했습니다.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleUnblockUser(userId: string) {
    if (!confirm('이 사용자의 차단을 해제하시겠습니까?')) {
      return;
    }

    setActionLoading(true);
    try {
      await unblockUser(userId);
      alert('차단이 해제되었습니다.');
      loadUsers();
    } catch (error) {
      alert('차단 해제 중 오류가 발생했습니다.');
    } finally {
      setActionLoading(false);
    }
  }

  function getRoleLabel(role: string) {
    switch (role) {
      case 'student':
        return '일반 회원';
      case 'tutor':
        return '튜터';
      case 'admin':
        return '관리자';
      default:
        return role;
    }
  }

  function getRoleColor(role: string) {
    switch (role) {
      case 'student':
        return 'bg-gray-100 text-gray-700';
      case 'tutor':
        return 'bg-purple-100 text-purple-700';
      case 'admin':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-lg transition">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">사용자 관리</h1>
              <p className="text-gray-600 mt-1">
                전체 {total.toLocaleString()}명의 사용자
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 검색 */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="이메일 또는 닉네임으로 검색..."
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              검색
            </button>
          </form>
        </div>

        {/* 사용자 목록 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">사용자가 없습니다.</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        사용자
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        이메일
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        역할
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        코인/포인트
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        구독
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        상태
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        가입일
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        작업
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                              {u.nickname[0]}
                            </div>
                            <span className="font-semibold text-gray-900">
                              {u.nickname}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4" />
                            {u.email}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${getRoleColor(
                              u.role
                            )}`}
                          >
                            {getRoleLabel(u.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="flex items-center gap-1 text-yellow-600">
                              <Coins className="w-4 h-4" />
                              {u.coins.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-1 text-blue-600 mt-1">
                              <Star className="w-4 h-4" />
                              {u.points.toLocaleString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700">
                            {u.subscription_tier === 'free'
                              ? '무료'
                              : u.subscription_tier === 'premium'
                              ? '프리미엄'
                              : '프리미엄+'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {u.is_blocked ? (
                            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                              차단됨
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                              활성
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(u.created_at).toLocaleDateString('ko-KR')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <div className="relative group">
                              <button
                                disabled={actionLoading}
                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                              >
                                <Award className="w-4 h-4 text-gray-600" />
                              </button>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                                <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 space-y-1 min-w-[120px]">
                                  <button
                                    onClick={() => handleUpdateRole(u.id, 'student')}
                                    disabled={actionLoading || u.role === 'student'}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 rounded disabled:opacity-50"
                                  >
                                    일반 회원
                                  </button>
                                  <button
                                    onClick={() => handleUpdateRole(u.id, 'tutor')}
                                    disabled={actionLoading || u.role === 'tutor'}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 rounded disabled:opacity-50"
                                  >
                                    튜터
                                  </button>
                                  <button
                                    onClick={() => handleUpdateRole(u.id, 'admin')}
                                    disabled={actionLoading || u.role === 'admin'}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 rounded disabled:opacity-50"
                                  >
                                    관리자
                                  </button>
                                </div>
                              </div>
                            </div>

                            {u.is_blocked ? (
                              <button
                                onClick={() => handleUnblockUser(u.id)}
                                disabled={actionLoading}
                                className="p-2 hover:bg-green-100 rounded-lg transition disabled:opacity-50"
                                title="차단 해제"
                              >
                                <ShieldOff className="w-4 h-4 text-green-600" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleBlockUser(u.id)}
                                disabled={actionLoading}
                                className="p-2 hover:bg-red-100 rounded-lg transition disabled:opacity-50"
                                title="차단"
                              >
                                <Shield className="w-4 h-4 text-red-600" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
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
        )}
      </div>
    </div>
  );
}
