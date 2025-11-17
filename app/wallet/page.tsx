'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Coins,
  Star,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  Calendar,
  Plus,
  Minus,
  ShoppingCart,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import { supabase } from '@/lib/supabase/client';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  created_at: string;
}

export default function WalletPage() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();

  const [coinTransactions, setCoinTransactions] = useState<Transaction[]>([]);
  const [pointTransactions, setPointTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'coins' | 'points'>('coins');
  const [convertAmount, setConvertAmount] = useState('');
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }

    loadTransactions();
  }, [user, router]);

  async function loadTransactions() {
    if (!user) return;

    setLoading(true);
    try {
      const [coins, points] = await Promise.all([
        supabase
          .from('coin_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('point_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20),
      ]);

      if (coins.data) setCoinTransactions(coins.data);
      if (points.data) setPointTransactions(points.data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleConvertPoints() {
    if (!user || !convertAmount) return;

    const amount = parseInt(convertAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('유효한 포인트를 입력해주세요.');
      return;
    }

    // 100 포인트 = 10 코인 (10:1 비율)
    const coinsToReceive = Math.floor(amount / 10);
    if (coinsToReceive === 0) {
      alert('최소 10 포인트가 필요합니다.');
      return;
    }

    if (amount > user.points) {
      alert('보유 포인트가 부족합니다.');
      return;
    }

    if (
      !confirm(
        `${amount} 포인트를 ${coinsToReceive} 코인으로 전환하시겠습니까?\n(전환 비율: 10 포인트 = 1 코인)`
      )
    ) {
      return;
    }

    setConverting(true);
    try {
      // Deduct points
      const { error: pointsError } = await supabase.rpc('add_points', {
        user_id: user.id,
        amount: -amount,
      });

      if (pointsError) throw pointsError;

      // Add coins
      const { error: coinsError } = await supabase.rpc('add_coins', {
        user_id: user.id,
        amount: coinsToReceive,
      });

      if (coinsError) throw coinsError;

      // Record transactions
      await Promise.all([
        supabase.from('point_transactions').insert({
          user_id: user.id,
          amount: -amount,
          type: 'spend',
          description: `코인으로 전환 (${coinsToReceive}개)`,
        }),
        supabase.from('coin_transactions').insert({
          user_id: user.id,
          amount: coinsToReceive,
          type: 'purchase',
          description: `포인트 전환 (${amount}pt)`,
        }),
      ]);

      // Update local user state
      updateUser({
        ...user,
        points: user.points - amount,
        coins: user.coins + coinsToReceive,
      });

      alert(`${amount} 포인트가 ${coinsToReceive} 코인으로 전환되었습니다!`);
      setConvertAmount('');
      loadTransactions();
    } catch (error) {
      console.error('Failed to convert points:', error);
      alert('포인트 전환 중 오류가 발생했습니다.');
    } finally {
      setConverting(false);
    }
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">내 지갑</h1>
          <p className="text-gray-600">코인과 포인트 내역을 확인하고 관리하세요</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Balance Cards */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <Coins className="w-8 h-8" />
                <Link
                  href="/shop"
                  className="px-4 py-2 bg-white text-yellow-600 rounded-lg hover:bg-yellow-50 transition font-semibold text-sm flex items-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  구매
                </Link>
              </div>
              <p className="text-yellow-100 mb-1">보유 코인</p>
              <p className="text-4xl font-bold">{user.coins.toLocaleString()}</p>
            </div>

            <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <Star className="w-8 h-8" />
              </div>
              <p className="text-blue-100 mb-1">보유 포인트</p>
              <p className="text-4xl font-bold">{user.points.toLocaleString()}</p>
            </div>

            {/* Convert Points */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-purple-600" />
                포인트 전환
              </h3>

              <p className="text-sm text-gray-600 mb-4">
                보유 포인트를 코인으로 전환하세요
                <br />
                <span className="font-semibold text-purple-600">
                  전환 비율: 10 포인트 = 1 코인
                </span>
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    전환할 포인트
                  </label>
                  <input
                    type="number"
                    value={convertAmount}
                    onChange={(e) => setConvertAmount(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="포인트 입력"
                    min="10"
                    step="10"
                  />
                </div>

                {convertAmount && parseInt(convertAmount) > 0 && (
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm text-purple-900">
                      받을 코인: <span className="font-bold">{Math.floor(parseInt(convertAmount) / 10)}</span>개
                    </p>
                  </div>
                )}

                <button
                  onClick={handleConvertPoints}
                  disabled={converting || !convertAmount || parseInt(convertAmount) < 10}
                  className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {converting ? '전환 중...' : '코인으로 전환'}
                </button>
              </div>
            </div>
          </div>

          {/* Transactions */}
          <div className="md:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('coins')}
                  className={`flex-1 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                    activeTab === 'coins'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Coins className="w-5 h-5" />
                  코인 내역
                </button>
                <button
                  onClick={() => setActiveTab('points')}
                  className={`flex-1 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                    activeTab === 'points'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Star className="w-5 h-5" />
                  포인트 내역
                </button>
              </div>
            </div>

            {/* Transaction List */}
            {loading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">내역을 불러오는 중...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(activeTab === 'coins' ? coinTransactions : pointTransactions).length ===
                0 ? (
                  <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    {activeTab === 'coins' ? (
                      <Coins className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    ) : (
                      <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    )}
                    <p className="text-gray-600">거래 내역이 없습니다.</p>
                  </div>
                ) : (
                  (activeTab === 'coins' ? coinTransactions : pointTransactions).map(
                    (transaction) => {
                      const isPositive = transaction.amount > 0;
                      const color = isPositive ? 'text-green-600' : 'text-red-600';
                      const bgColor = isPositive ? 'bg-green-100' : 'bg-red-100';
                      const Icon = isPositive ? Plus : Minus;

                      return (
                        <div
                          key={transaction.id}
                          className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
                              <Icon className={`w-6 h-6 ${color}`} />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {transaction.description}
                              </p>
                              <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(transaction.created_at).toLocaleString('ko-KR')}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className={`text-2xl font-bold ${color}`}>
                              {isPositive ? '+' : ''}
                              {transaction.amount.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              {activeTab === 'coins' ? '코인' : '포인트'}
                            </p>
                          </div>
                        </div>
                      );
                    }
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
