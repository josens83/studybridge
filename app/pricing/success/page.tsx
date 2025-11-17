'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Loader2, Crown, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import { purchaseSubscription } from '@/lib/supabase/payments';
import { supabase } from '@/lib/supabase/client';

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, setUser } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [planName, setPlanName] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }

    processSubscription();
  }, [user, router]);

  const processSubscription = async () => {
    const tier = searchParams.get('tier') as 'premium' | 'premium_plus' | null;
    const orderId = searchParams.get('orderId');
    const paymentKey = searchParams.get('paymentKey');

    if (!tier || !orderId || !paymentKey || !user) {
      setError('구독 정보가 올바르지 않습니다.');
      setIsProcessing(false);
      return;
    }

    try {
      // Process subscription
      await purchaseSubscription(user.id, tier, orderId, paymentKey);

      setPlanName(tier === 'premium' ? '프리미엄' : '프리미엄+');

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
      console.error('Subscription processing error:', error);
      setError(error.message || '구독 처리 중 오류가 발생했습니다.');
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
          <h2 className="text-2xl font-bold mb-2">구독 처리 중...</h2>
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
          <h2 className="text-2xl font-bold mb-4">구독 처리 실패</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Link
              href="/pricing"
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full">
        {/* Success Icon */}
        <div className="text-center mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <Crown className="w-14 h-14 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-2">구독 완료!</h2>
          <p className="text-gray-600">{planName} 멤버가 되신 것을 환영합니다</p>
        </div>

        {/* Plan Info */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-6 mb-6 text-white">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-6 h-6" />
              <span className="text-lg font-semibold">현재 플랜</span>
            </div>
            <div className="text-4xl font-bold mb-2">{planName}</div>
            <div className="text-sm opacity-90">
              매월 자동 갱신 (언제든지 취소 가능)
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <h3 className="font-bold mb-4 text-center text-lg">이제 누릴 수 있는 혜택</h3>
          <ul className="space-y-3">
            <li className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-gray-700">무제한 질문 등록</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-gray-700">광고 없는 쾌적한 환경</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-gray-700">우선 답변 및 질문 우선 노출</span>
            </li>
            {planName === '프리미엄+' && (
              <>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Crown className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-gray-700">월 20회 튜터 매칭</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Crown className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-gray-700">1:1 맞춤 학습 지도</span>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/ask"
            className="block w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition font-bold text-center shadow-lg"
          >
            프리미엄 기능으로 질문하기
          </Link>
          <Link
            href="/dashboard"
            className="block w-full py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-semibold text-center"
          >
            대시보드로 이동
          </Link>
        </div>

        {/* Note */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            구독은 언제든지 대시보드에서 취소하실 수 있습니다.
            <br />
            결제 내역은 대시보드의 거래 내역에서 확인하세요.
          </p>
        </div>
      </div>
    </div>
  );
}
