'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, FileQuestion, MessageSquare, AlertCircle, TrendingUp, Coins, RefreshCw, Shield } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import { getPlatformStats, refreshPlatformStats, isAdmin, type PlatformStats } from '@/lib/supabase/admin';

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }
    checkAdminAccess();
  }, [user, router]);

  async function checkAdminAccess() {
    if (!user) return;
    const adminStatus = await isAdmin(user.id);
    if (!adminStatus) {
      router.push('/');
      return;
    }
    setIsAuthorized(true);
    loadStats();
  }

  async function loadStats() {
    setLoading(true);
    const data = await getPlatformStats();
    setStats(data);
    setLoading(false);
  }

  async function handleRefresh() {
    setRefreshing(true);
    await refreshPlatformStats();
    await loadStats();
    setRefreshing(false);
  }

  if (!isAuthorized || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Shield className="w-16 h-16 text-gray-400 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-600" />
            관리자 대시보드
          </h1>
          <button onClick={handleRefresh} disabled={refreshing} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <RefreshCw className={refreshing ? 'w-4 h-4 animate-spin' : 'w-4 h-4'} />
            새로고침
          </button>
        </div>

        {stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard title="전체 학생" value={stats.total_students} icon={<Users />} color="blue" />
              <StatCard title="전체 튜터" value={stats.total_tutors} icon={<Users />} color="purple" />
              <StatCard title="전체 질문" value={stats.total_questions} icon={<FileQuestion />} color="orange" />
              <StatCard title="전체 답변" value={stats.total_answers} icon={<MessageSquare />} color="teal" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ActionCard title="오류 로그" onClick={() => router.push('/admin/errors')} />
              <ActionCard title="사용자 관리" onClick={() => router.push('/admin/users')} />
              <ActionCard title="신고 관리" onClick={() => router.push('/admin/reports')} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm text-gray-600">{title}</span>
        <div className={`text-${color}-600`}>{icon}</div>
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}

function ActionCard({ title, onClick }: any) {
  return (
    <button onClick={onClick} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-left">
      <h3 className="font-bold text-lg">{title}</h3>
    </button>
  );
}
