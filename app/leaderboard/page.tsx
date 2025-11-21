'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Medal, Award, Zap, MessageCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { getLeaderboard, getUserRank, type LeaderboardEntry } from '@/lib/supabase/gamification';
import { useAuthStore } from '@/lib/store/auth';
import LevelBadge from '@/components/gamification/LevelBadge';

export default function LeaderboardPage() {
  const { user } = useAuthStore();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'all' | 'month' | 'week'>('all');

  useEffect(() => {
    loadLeaderboard();
  }, [timeframe]);

  useEffect(() => {
    if (user) {
      loadUserRank();
    }
  }, [user]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await getLeaderboard(100);
      setLeaderboard(data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserRank = async () => {
    if (!user) return;

    try {
      const rank = await getUserRank(user.id);
      setUserRank(rank);
    } catch (error) {
      console.error('Error loading user rank:', error);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-orange-400" />;
      default:
        return <span className="font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-300';
      case 2:
        return 'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300';
      case 3:
        return 'bg-gradient-to-r from-orange-100 to-red-100 border-orange-300';
      default:
        return 'bg-white border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-12 h-12 text-yellow-500" />
            <h1 className="text-4xl font-bold">리더보드</h1>
          </div>
          <p className="text-xl text-gray-600">최고의 학습자들과 경쟁하세요!</p>
        </div>

        {/* User Rank Card */}
        {user && userRank && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-2xl">
                  #{userRank}
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">{user.nickname}</h3>
                  <p className="opacity-90">당신의 현재 순위</p>
                </div>
              </div>
              <div className="text-right">
                <LevelBadge level={user.level || 1} experience={user.experience || 0} size="large" />
                <div className="mt-2 text-sm opacity-90">
                  {user.points?.toLocaleString()} 포인트
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Timeframe Selector */}
        <div className="flex justify-center gap-2 mb-8">
          <button
            onClick={() => setTimeframe('all')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              timeframe === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setTimeframe('month')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              timeframe === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            disabled
          >
            이달
          </button>
          <button
            onClick={() => setTimeframe('week')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              timeframe === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            disabled
          >
            이번 주
          </button>
        </div>

        {/* Leaderboard */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600">리더보드를 불러오는 중...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <p className="text-gray-600">아직 리더보드 데이터가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry) => (
              <div
                key={entry.id}
                className={`${getRankColor(entry.rank)} border-2 rounded-lg p-6 transition hover:shadow-md`}
              >
                <div className="flex items-center justify-between">
                  {/* Rank & User Info */}
                  <div className="flex items-center gap-6 flex-1">
                    <div className="w-12 flex items-center justify-center">
                      {getRankIcon(entry.rank)}
                    </div>

                    <div className="flex items-center gap-4">
                      <LevelBadge level={entry.level} experience={entry.experience} size="medium" />
                      <div>
                        <Link
                          href={`/profile/${entry.id}`}
                          className="font-bold text-lg hover:text-blue-600 transition"
                        >
                          {entry.nickname}
                        </Link>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            {entry.experience.toLocaleString()} XP
                          </span>
                          <span className="flex items-center gap-1">
                            <Award className="w-4 h-4 text-purple-500" />
                            {entry.badge_count} 배지
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-gray-600 mb-1">
                        <MessageCircle className="w-4 h-4" />
                        <span className="font-semibold">{entry.total_questions}</span>
                      </div>
                      <div className="text-xs text-gray-500">질문</div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center gap-1 text-gray-600 mb-1">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-semibold">{entry.total_answers}</span>
                      </div>
                      <div className="text-xs text-gray-500">답변</div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center gap-1 text-gray-600 mb-1">
                        <Trophy className="w-4 h-4" />
                        <span className="font-semibold">{entry.best_answers}</span>
                      </div>
                      <div className="text-xs text-gray-500">채택</div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center gap-1 text-gray-600 mb-1">
                        <TrendingUp className="w-4 h-4" />
                        <span className="font-semibold">{entry.points.toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-gray-500">포인트</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        {!user && (
          <div className="mt-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">리더보드에 참여하세요!</h3>
            <p className="mb-6">질문하고 답변하며 레벨을 올려 상위권에 도전하세요.</p>
            <Link
              href="/auth"
              className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-gray-100 transition"
            >
              시작하기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
