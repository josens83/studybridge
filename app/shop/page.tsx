'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Coins, Check, Sparkles, Crown, Zap } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import { COIN_PACKAGES, type CoinPackage } from '@/lib/supabase/payments';
import { loadTossPayments } from '@tosspayments/payment-sdk';

const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || 'test_ck_4Gv6LjeKD8aXQJRRAn4rW0X9bAqw';

export default function ShopPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [selectedPackage, setSelectedPackage] = useState<CoinPackage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth');
    }
  }, [user, router]);

  const handlePurchase = async (pkg: CoinPackage) => {
    if (!user) {
      alert('로그인이 필요합니다.');
      router.push('/auth');
      return;
    }

    setIsProcessing(true);
    setSelectedPackage(pkg);

    try {
      // Initialize Toss Payments
      const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);

      // Generate order ID
      const orderId = `coin_${user.id}_${Date.now()}`;

      // Request payment
      await tossPayments.requestPayment('카드', {
        amount: pkg.price,
        orderId: orderId,
        orderName: `StudyBridge 코인 ${pkg.totalCoins}개`,
        customerName: user.nickname || user.email,
        successUrl: `${window.location.origin}/shop/success?package=${pkg.id}`,
        failUrl: `${window.location.origin}/shop/fail`,
      });
    } catch (error) {
      console.error('Payment error:', error);
      alert('결제 요청 중 오류가 발생했습니다.');
      setIsProcessing(false);
      setSelectedPackage(null);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
            <Coins className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold mb-4">코인 충전</h1>
          <p className="text-gray-600 text-lg">
            코인을 구매하고 더 많은 질문을 해보세요
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-sm">
            <Coins className="w-5 h-5 text-yellow-600" />
            <span className="font-semibold">현재 보유: </span>
            <span className="text-2xl font-bold text-blue-600">{user.coins.toLocaleString()}</span>
            <span className="text-gray-600">코인</span>
          </div>
        </div>

        {/* Coin Packages */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {COIN_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative bg-white rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${
                pkg.popular ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                    <Crown className="w-4 h-4" />
                    인기
                  </div>
                </div>
              )}

              <div className="p-6">
                {/* Package Name */}
                <div className="text-center mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">{pkg.name}</h3>
                  {pkg.savings && (
                    <span className="inline-block mt-2 px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-semibold">
                      {pkg.savings}
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-blue-600 mb-1">
                    {pkg.price.toLocaleString()}원
                  </div>
                </div>

                {/* Coins */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-gray-700">기본 코인</span>
                    <span className="font-bold text-gray-900">
                      {pkg.coins.toLocaleString()}
                    </span>
                  </div>
                  {pkg.bonus > 0 && (
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <span className="text-gray-700 flex items-center gap-1">
                        <Sparkles className="w-4 h-4 text-yellow-600" />
                        보너스
                      </span>
                      <span className="font-bold text-yellow-600">
                        +{pkg.bonus.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg">
                    <span className="font-semibold">총 지급</span>
                    <span className="text-xl font-bold">
                      {pkg.totalCoins.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Purchase Button */}
                <button
                  onClick={() => handlePurchase(pkg)}
                  disabled={isProcessing}
                  className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
                    pkg.popular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl`}
                >
                  {isProcessing && selectedPackage?.id === pkg.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      처리 중...
                    </span>
                  ) : (
                    '구매하기'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">코인으로 할 수 있는 것들</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <BenefitCard
              icon={<Zap className="w-8 h-8 text-yellow-600" />}
              title="질문 등록"
              description="코인을 사용해 질문을 등록하고 답변을 받으세요"
              items={['일반 질문: 100코인', '중요 질문: 300코인', '긴급 질문: 500코인']}
            />
            <BenefitCard
              icon={<Crown className="w-8 h-8 text-purple-600" />}
              title="우선 답변"
              description="더 많은 코인을 걸수록 빠른 답변을 받을 수 있어요"
              items={['긴급 질문 우선 노출', '튜터 알림 발송', '24시간 내 답변 보장']}
            />
            <BenefitCard
              icon={<Sparkles className="w-8 h-8 text-blue-600" />}
              title="보상 획득"
              description="좋은 답변을 작성하면 코인으로 보상받으세요"
              items={['답변 채택 시 코인 획득', '추천 많은 답변 보너스', '활동 포인트 적립']}
            />
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-gray-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">자주 묻는 질문</h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            <FAQItem
              question="코인 유효기간이 있나요?"
              answer="구매하신 코인은 유효기간 없이 계속 사용하실 수 있습니다."
            />
            <FAQItem
              question="코인을 환불받을 수 있나요?"
              answer="미사용 코인에 한해 구매일로부터 7일 이내 100% 환불이 가능합니다."
            />
            <FAQItem
              question="결제 수단은 무엇이 있나요?"
              answer="신용카드, 체크카드, 계좌이체, 가상계좌 등 다양한 결제 수단을 지원합니다."
            />
            <FAQItem
              question="보너스 코인도 질문에 사용할 수 있나요?"
              answer="네, 보너스 코인도 일반 코인과 동일하게 모든 기능에 사용 가능합니다."
            />
          </div>
        </div>

        {/* Support */}
        <div className="mt-12 text-center text-gray-600">
          <p>
            결제 관련 문의사항이 있으신가요?{' '}
            <a href="mailto:support@studybridge.com" className="text-blue-600 hover:underline">
              support@studybridge.com
            </a>
            으로 연락주세요.
          </p>
        </div>
      </div>
    </div>
  );
}

function BenefitCard({
  icon,
  title,
  description,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  items: string[];
}) {
  return (
    <div className="p-6 border border-gray-200 rounded-xl hover:border-blue-300 transition">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="bg-white p-6 rounded-xl">
      <h3 className="font-bold text-lg mb-2">{question}</h3>
      <p className="text-gray-600">{answer}</p>
    </div>
  );
}
