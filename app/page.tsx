import Link from 'next/link';
import { BookOpen, Users, Zap, Shield } from 'lucide-react';
import QuestionList from '@/components/questions/QuestionList';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              공부가 쉬워지는 곳,<br />StudyBridge
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              질문하고 답변받고, 검증된 튜터와 1:1 매칭까지<br />
              당신의 학습을 도와드립니다
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/ask"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                질문하기
              </Link>
              <Link
                href="/pricing"
                className="bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition border-2 border-white"
              >
                요금제 보기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            왜 StudyBridge인가요?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<BookOpen className="w-12 h-12 text-blue-600" />}
              title="전과목 질문 가능"
              description="국어, 영어, 수학, 과학, 사회 등 모든 과목의 질문을 올릴 수 있어요"
            />
            <FeatureCard
              icon={<Users className="w-12 h-12 text-blue-600" />}
              title="검증된 튜터"
              description="명문대 재학생들이 직접 답변하고 1:1 매칭으로 도와드려요"
            />
            <FeatureCard
              icon={<Zap className="w-12 h-12 text-blue-600" />}
              title="빠른 응답"
              description="평균 10분 이내 답변! 급한 숙제도 걱정 없어요"
            />
            <FeatureCard
              icon={<Shield className="w-12 h-12 text-blue-600" />}
              title="익명 보장"
              description="부담없이 질문하세요. 익명으로 안전하게 이용할 수 있어요"
            />
          </div>
        </div>
      </section>

      {/* Recent Questions Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">최근 질문</h2>
            <Link
              href="/questions"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              전체 보기 →
            </Link>
          </div>
          <QuestionList limit={6} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            지금 시작하세요
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            무료로 시작하고, 필요할 때 프리미엄으로 업그레이드하세요
          </p>
          <Link
            href="/auth"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition inline-block"
          >
            회원가입하기
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
