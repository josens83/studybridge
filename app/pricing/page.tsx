import Link from 'next/link';
import { Check, Zap } from 'lucide-react';
import { SUBSCRIPTION_PLANS, COIN_PACKAGES } from '@/lib/utils/constants';

export default function PricingPage() {
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
            name={SUBSCRIPTION_PLANS.free.name}
            price={SUBSCRIPTION_PLANS.free.price}
            features={SUBSCRIPTION_PLANS.free.features}
            buttonText="무료로 시작"
            buttonLink="/auth"
          />

          {/* Premium Plan */}
          <PlanCard
            name={SUBSCRIPTION_PLANS.premium.name}
            price={SUBSCRIPTION_PLANS.premium.price}
            features={SUBSCRIPTION_PLANS.premium.features}
            buttonText="프리미엄 시작"
            buttonLink="/auth"
            highlighted
          />

          {/* Premium Plus Plan */}
          <PlanCard
            name={SUBSCRIPTION_PLANS.premium_plus.name}
            price={SUBSCRIPTION_PLANS.premium_plus.price}
            features={SUBSCRIPTION_PLANS.premium_plus.features}
            buttonText="프리미엄+ 시작"
            buttonLink="/auth"
          />
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
  highlighted = false,
}: {
  name: string;
  price: number;
  features: string[];
  buttonText: string;
  buttonLink: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`
        bg-white rounded-lg shadow-sm p-8 relative
        ${highlighted ? 'ring-2 ring-blue-500 scale-105' : ''}
      `}
    >
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
          추천
        </div>
      )}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2">{name}</h3>
        <div className="text-4xl font-bold mb-2">
          {price === 0 ? '무료' : `${price.toLocaleString()}원`}
        </div>
        {price > 0 && <div className="text-gray-600">/ 월</div>}
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        href={buttonLink}
        className={`
          block w-full text-center py-3 rounded-lg font-semibold transition
          ${
            highlighted
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
          }
        `}
      >
        {buttonText}
      </Link>
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
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition">
      <div className="text-center">
        {bonus > 0 && (
          <div className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold mb-3">
            <Zap className="w-4 h-4" />
            보너스 {bonus}
          </div>
        )}
        <div className="text-3xl font-bold mb-1">
          {(coins + bonus).toLocaleString()}
        </div>
        <div className="text-gray-600 mb-4">코인</div>
        <div className="text-2xl font-bold text-blue-600 mb-4">
          {price.toLocaleString()}원
        </div>
        <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold">
          구매하기
        </button>
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
