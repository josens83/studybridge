import Link from 'next/link';
import { Home, Search, HelpCircle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 일러스트 */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-blue-100 rounded-full mb-6">
            <span className="text-6xl font-bold text-blue-600">404</span>
          </div>
        </div>

        {/* 메시지 */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          <br />
          주소를 다시 확인해주세요.
        </p>

        {/* 액션 버튼 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            <Home className="w-5 h-5" />
            홈으로 돌아가기
          </Link>

          <Link
            href="/questions"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold"
          >
            <Search className="w-5 h-5" />
            질문 둘러보기
          </Link>
        </div>

        {/* 유용한 링크 */}
        <div className="bg-white rounded-xl shadow-sm p-8 text-left">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            다음 페이지를 찾으시나요?
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href="/ask"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <h3 className="font-semibold text-gray-900 mb-1">질문하기</h3>
              <p className="text-sm text-gray-600">
                학습 중 궁금한 점을 질문하세요
              </p>
            </Link>

            <Link
              href="/dashboard"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <h3 className="font-semibold text-gray-900 mb-1">대시보드</h3>
              <p className="text-sm text-gray-600">
                내 활동과 통계를 확인하세요
              </p>
            </Link>

            <Link
              href="/shop"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <h3 className="font-semibold text-gray-900 mb-1">코인 상점</h3>
              <p className="text-sm text-gray-600">
                코인을 구매하고 질문하세요
              </p>
            </Link>

            <Link
              href="/faq"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <h3 className="font-semibold text-gray-900 mb-1">FAQ</h3>
              <p className="text-sm text-gray-600">
                자주 묻는 질문을 확인하세요
              </p>
            </Link>
          </div>
        </div>

        {/* 도움말 */}
        <div className="mt-8 text-sm text-gray-600">
          <p>
            문제가 계속되면{' '}
            <Link href="/contact" className="text-blue-600 hover:text-blue-700 font-semibold">
              고객센터
            </Link>
            로 문의해주세요.
          </p>
        </div>
      </div>
    </div>
  );
}
