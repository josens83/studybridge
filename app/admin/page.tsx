'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  MessageSquare,
  MessageCircle,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Calendar,
  Activity,
  ShieldAlert,
  Settings,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import { isAdmin, getAdminStats, getRecentActivities, AdminStats, RecentActivity } from '@/lib/supabase/admin';

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

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

      setAuthorized(true);
      loadData();
    }

    checkAuth();
  }, [user, router]);

  async function loadData() {
    try {
      const [statsData, activitiesData] = await Promise.all([
        getAdminStats(),
        getRecentActivities(10),
      ]);

      setStats(statsData);
      setActivities(activitiesData);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (!authorized || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">권한 확인 중...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: '전체 사용자',
      value: stats?.totalUsers.toLocaleString() || '0',
      icon: Users,
      color: 'bg-blue-500',
      change: `+${stats?.newUsersToday || 0} 오늘`,
    },
    {
      title: '전체 질문',
      value: stats?.totalQuestions.toLocaleString() || '0',
      icon: MessageSquare,
      color: 'bg-green-500',
      change: `+${stats?.questionsToday || 0} 오늘`,
    },
    {
      title: '전체 답변',
      value: stats?.totalAnswers.toLocaleString() || '0',
      icon: MessageCircle,
      color: 'bg-purple-500',
      change: '',
    },
    {
      title: '대기중 신고',
      value: stats?.pendingReports.toLocaleString() || '0',
      icon: AlertTriangle,
      color: 'bg-red-500',
      change: `/ ${stats?.totalReports || 0} 전체`,
    },
    {
      title: '총 매출',
      value: `₩${stats?.totalRevenue.toLocaleString() || '0'}`,
      icon: DollarSign,
      color: 'bg-yellow-500',
      change: '',
    },
  ];

  const quickActions = [
    { label: '신고 관리', href: '/admin/reports', icon: ShieldAlert, color: 'bg-red-600' },
    { label: '사용자 관리', href: '/admin/users', icon: Users, color: 'bg-blue-600' },
    { label: '질문 관리', href: '/admin/questions', icon: MessageSquare, color: 'bg-green-600' },
    { label: '설정', href: '/admin/settings', icon: Settings, color: 'bg-gray-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
              <p className="text-gray-600 mt-1">StudyBridge 시스템 관리</p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
            >
              메인으로
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm mb-1">{card.title}</h3>
                <p className="text-3xl font-bold text-gray-900 mb-1">{card.value}</p>
                {card.change && <p className="text-sm text-gray-500">{card.change}</p>}
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 빠른 액션 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                빠른 액션
              </h2>
              <div className="space-y-3">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.label}
                      href={action.href}
                      className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    >
                      <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-semibold text-gray-900">{action.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* 시스템 상태 */}
            <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                시스템 상태
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">서버 상태</span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    정상
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">데이터베이스</span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    정상
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">결제 시스템</span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    정상
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 최근 활동 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                최근 활동
              </h2>

              {activities.length === 0 ? (
                <p className="text-gray-500 text-center py-8">최근 활동이 없습니다.</p>
              ) : (
                <div className="space-y-3">
                  {activities.map((activity) => {
                    const getActivityIcon = () => {
                      switch (activity.type) {
                        case 'question':
                          return <MessageSquare className="w-4 h-4 text-green-600" />;
                        case 'answer':
                          return <MessageCircle className="w-4 h-4 text-blue-600" />;
                        case 'report':
                          return <AlertTriangle className="w-4 h-4 text-red-600" />;
                        case 'payment':
                          return <DollarSign className="w-4 h-4 text-yellow-600" />;
                        default:
                          return <Activity className="w-4 h-4 text-gray-600" />;
                      }
                    };

                    const getActivityColor = () => {
                      switch (activity.type) {
                        case 'question':
                          return 'bg-green-100';
                        case 'answer':
                          return 'bg-blue-100';
                        case 'report':
                          return 'bg-red-100';
                        case 'payment':
                          return 'bg-yellow-100';
                        default:
                          return 'bg-gray-100';
                      }
                    };

                    return (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                      >
                        <div className={`w-8 h-8 ${getActivityColor()} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          {getActivityIcon()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 font-medium">
                            <span className="text-blue-600">{activity.user_nickname}</span>
                            {' '}님이{' '}
                            {activity.description}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(activity.created_at).toLocaleString('ko-KR')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
