'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Loader2, Coins } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import { purchaseCoins, COIN_PACKAGES } from '@/lib/supabase/payments';
import { supabase } from '@/lib/supabase/client';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, setUser } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coinAmount, setCoinAmount] = useState(0);

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }

    processPayment();
  }, [user, router]);

  const processPayment = async () => {
    const packageId = searchParams.get('package');
    const orderId = searchParams.get('orderId');
    const paymentKey = searchParams.get('paymentKey');
    const amount = searchParams.get('amount');

    if (!packageId || !orderId || !paymentKey || !amount || !user) {
      setError('결제 정보가 올바르지 않습니다.');
      setIsProcessing(false);
      return;
    }

    try {
      // Find package
      const pkg = COIN_PACKAGES.find((p) => p.id === packageId);
      if (!pkg) {
        throw new Error('존재하지 않는 패키지입니다.');
      }

      // Process purchase
      await purchaseCoins(user.id, pkg.price, orderId, paymentKey);

      setCoinAmount(pkg.totalCoins);

      // Refresh user data
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userData) {
        setUser(userData);
      }

      setIsProcessing(false);
    } catch (error: any) {
      console.error('Payment processing error:', error);
      setError(error.message || '결제 처리 중 오류가 발생했습니다.');
      setIsProcessing(false);
    }
  };

  if (!user) {
    return null;
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">결제 처리 중...</h2>
          <p className="text-gray-600">잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">결제 처리 실패</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Link
              href="/shop"
              className="block w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              다시 시도하기
            </Link>
            <Link
              href="/"
              className="block w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
            >
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* Success Icon */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold mb-2">결제 완료!</h2>
          <p className="text-gray-600">코인이 성공적으로 충전되었습니다.</p>
        </div>

        {/* Coin Display */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-6 mb-6">
          <div className="text-center text-white">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Coins className="w-6 h-6" />
              <span className="text-lg font-semibold">충전된 코인</span>
            </div>
            <div className="text-5xl font-bold mb-2">
              +{coinAmount.toLocaleString()}
            </div>
            <div className="text-sm opacity-90">
              현재 보유: {user.coins.toLocaleString()} 코인
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold mb-3 text-center">이제 할 수 있는 것들</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              질문 {Math.floor(coinAmount / 100)}개 등록 가능
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              긴급 질문으로 빠른 답변 받기
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              튜터 매칭 서비스 이용
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/ask"
            className="block w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition font-bold text-center shadow-lg"
          >
            지금 바로 질문하기
          </Link>
          <Link
            href="/dashboard"
            className="block w-full py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-semibold text-center"
          >
            대시보드로 이동
          </Link>
        </div>

        {/* Receipt */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            결제 내역은 대시보드의 거래 내역에서 확인하실 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">결제 처리 중...</h2>
          <p className="text-gray-600">잠시만 기다려주세요.</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
