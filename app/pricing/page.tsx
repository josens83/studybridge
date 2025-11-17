'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, Zap, Crown, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import { SUBSCRIPTION_PLANS as PLAN_DATA } from '@/lib/supabase/payments';
import { loadTossPayments } from '@tosspayments/payment-sdk';

const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || 'test_ck_4Gv6LjeKD8aXQJRRAn4rW0X9bAqw';

// Coin packages for display
const COIN_PACKAGES = [
  { coins: 1000, price: 5000, bonus: 0 },
  { coins: 3000, price: 14000, bonus: 500 },
  { coins: 5000, price: 22000, bonus: 1000 },
  { coins: 10000, price: 40000, bonus: 3000 },
];

const FREE_PLAN = {
  name: '무료',
  price: 0,
  features: [
    '하루 3개 질문',
    '기본 답변 기능',
    '광고 표시',
    '커뮤니티 참여',
  ],
};

export default function PricingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSubscribe = async (planTier: 'premium' | 'premium_plus', price: number) => {
    if (!user) {
      alert('로그인이 필요합니다.');
      router.push('/auth');
      return;
    }

    setIsProcessing(true);
    setSelectedPlan(planTier);

    try {
      const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);
      const orderId = `sub_${planTier}_${user.id}_${Date.now()}`;

      await tossPayments.requestPayment('카드', {
        amount: price,
        orderId: orderId,
        orderName: `StudyBridge ${planTier === 'premium' ? '프리미엄' : '프리미엄+'} 구독`,
        customerName: user.nickname || user.email,
        successUrl: `${window.location.origin}/pricing/success?tier=${planTier}`,
        failUrl: `${window.location.origin}/shop/fail`,
      });
    } catch (error) {
      console.error('Payment error:', error);
      alert('결제 요청 중 오류가 발생했습니다.');
      setIsProcessing(false);
      setSelectedPlan(null);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">요금제</h1>
          <p className="text-xl text-gray-600">
            나에게 맞는 플랜을 선택하세요
          </p>
        </div>

        {/* Subscription Plans */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Free Plan */}
          <PlanCard
            name={FREE_PLAN.name}
            price={FREE_PLAN.price}
            features={FREE_PLAN.features}
            buttonText="무료로 시작"
            buttonLink="/auth"
            currentTier={user?.subscription_tier}
          />

          {/* Premium Plan */}
          {PLAN_DATA.filter(p => p.tier === 'premium').map((plan) => (
            <PlanCard
              key={plan.id}
              name={plan.name}
              price={plan.price}
              features={plan.features}
              tier={plan.tier}
              buttonText={user?.subscription_tier === 'premium' ? '현재 플랜' : '구독하기'}
              onSubscribe={() => handleSubscribe(plan.tier, plan.price)}
              highlighted={plan.popular}
              isProcessing={isProcessing && selectedPlan === plan.tier}
              currentTier={user?.subscription_tier}
            />
          ))}

          {/* Premium Plus Plan */}
          {PLAN_DATA.filter(p => p.tier === 'premium_plus').map((plan) => (
            <PlanCard
              key={plan.id}
              name={plan.name}
              price={plan.price}
              features={plan.features}
              tier={plan.tier}
              buttonText={user?.subscription_tier === 'premium_plus' ? '현재 플랜' : '구독하기'}
              onSubscribe={() => handleSubscribe(plan.tier, plan.price)}
              isProcessing={isProcessing && selectedPlan === plan.tier}
              currentTier={user?.subscription_tier}
            />
          ))}
        </div>

        {/* Coin Packages */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">코인 충전</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {COIN_PACKAGES.map((pkg, index) => (
              <CoinPackageCard
                key={index}
                coins={pkg.coins}
                price={pkg.price}
                bonus={pkg.bonus}
              />
            ))}
          </div>
          <p className="text-center text-gray-600 mt-6">
            코인으로 질문을 올리고, 튜터에게 답변을 요청하세요
          </p>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">자주 묻는 질문</h2>
          <div className="space-y-6">
            <FAQItem
              question="구독을 취소하면 어떻게 되나요?"
              answer="구독을 취소해도 현재 결제 기간이 끝날 때까지 프리미엄 기능을 이용할 수 있습니다. 기간이 끝나면 자동으로 무료 플랜으로 전환됩니다."
            />
            <FAQItem
              question="코인은 어떻게 사용하나요?"
              answer="코인은 질문을 올릴 때 소모됩니다. 일반 질문은 100코인, 중요 질문은 300코인, 긴급 질문은 500코인이 필요합니다. 답변이 채택되면 코인을 돌려받을 수 있습니다."
            />
            <FAQItem
              question="튜터 매칭은 어떻게 이루어지나요?"
              answer="프리미엄+ 회원은 월 20회 튜터 매칭을 무료로 이용할 수 있습니다. 검증된 명문대 튜터가 평균 10분 이내에 1:1로 답변해드립니다."
            />
            <FAQItem
              question="환불이 가능한가요?"
              answer="구독 시작 후 7일 이내에 서비스를 이용하지 않았다면 전액 환불이 가능합니다. 코인 구매는 사용하지 않은 경우에만 환불 가능합니다."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanCard({
  name,
  price,
  features,
  buttonText,
  buttonLink,
  tier,
  onSubscribe,
  highlighted = false,
  isProcessing = false,
  currentTier,
}: {
  name: string;
  price: number;
  features: string[];
  buttonText: string;
  buttonLink?: string;
  tier?: 'premium' | 'premium_plus';
  onSubscribe?: () => void;
  highlighted?: boolean;
  isProcessing?: boolean;
  currentTier?: string;
}) {
  const isCurrent = tier && currentTier === tier;

  return (
    <div
      className={`
        bg-white rounded-2xl shadow-lg p-8 relative transition-all
        ${highlighted ? 'ring-2 ring-blue-500 scale-105' : ''}
        ${isCurrent ? 'ring-2 ring-green-500' : ''}
      `}
    >
      {highlighted && !isCurrent && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
          <Crown className="w-4 h-4" />
          인기
        </div>
      )}
      {isCurrent && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
          현재 플랜
        </div>
      )}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2">{name}</h3>
        <div className="text-4xl font-bold mb-2 text-blue-600">
          {price === 0 ? '무료' : `${price.toLocaleString()}원`}
        </div>
        {price > 0 && <div className="text-gray-600">/ 월</div>}
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
      {buttonLink ? (
        <Link
          href={buttonLink}
          className="block w-full text-center py-3 rounded-xl font-bold transition bg-gray-100 text-gray-900 hover:bg-gray-200"
        >
          {buttonText}
        </Link>
      ) : onSubscribe ? (
        <button
          onClick={onSubscribe}
          disabled={isProcessing || isCurrent}
          className={`
            w-full py-4 rounded-xl font-bold transition-all shadow-lg
            ${
              isCurrent
                ? 'bg-green-500 text-white cursor-default'
                : highlighted
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              처리 중...
            </span>
          ) : (
            buttonText
          )}
        </button>
      ) : null}
    </div>
  );
}

function CoinPackageCard({
  coins,
  price,
  bonus,
}: {
  coins: number;
  price: number;
  bonus: number;
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl hover:-translate-y-1 transition-all">
      <div className="text-center">
        {bonus > 0 && (
          <div className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold mb-3">
            <Zap className="w-4 h-4" />
            +{bonus.toLocaleString()} 보너스
          </div>
        )}
        <div className="text-3xl font-bold mb-1">
          {(coins + bonus).toLocaleString()}
        </div>
        <div className="text-gray-600 mb-4">코인</div>
        <div className="text-2xl font-bold text-blue-600 mb-4">
          {price.toLocaleString()}원
        </div>
        <Link
          href="/shop"
          className="block w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-bold"
        >
          구매하기
        </Link>
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="font-semibold text-lg mb-2">{question}</h3>
      <p className="text-gray-600">{answer}</p>
    </div>
  );
}
