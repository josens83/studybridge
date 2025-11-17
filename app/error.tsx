'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, Home, RefreshCw, Mail } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 에러 로깅 (프로덕션에서는 외부 서비스로 전송)
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 에러 아이콘 */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-red-100 rounded-full mb-6">
            <AlertCircle className="w-16 h-16 text-red-600" />
          </div>
        </div>

        {/* 메시지 */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          문제가 발생했습니다
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          일시적인 오류로 페이지를 표시할 수 없습니다.
        </p>
        <p className="text-gray-600 mb-8">
          잠시 후 다시 시도해주세요.
        </p>

        {/* 에러 정보 (개발 모드에서만) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-8 p-4 bg-gray-100 rounded-lg text-left max-w-xl mx-auto">
            <p className="text-sm font-mono text-red-600 break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-gray-600 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            <RefreshCw className="w-5 h-5" />
            다시 시도
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold"
          >
            <Home className="w-5 h-5" />
            홈으로 돌아가기
          </Link>
        </div>

        {/* 도움말 카드 */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            이런 경우 시도해보세요
          </h2>

          <div className="space-y-4 text-left">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 font-bold text-sm">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">페이지 새로고침</h3>
                <p className="text-sm text-gray-600">
                  브라우저의 새로고침 버튼을 눌러보세요 (Ctrl+R 또는 Cmd+R)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 font-bold text-sm">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">브라우저 캐시 삭제</h3>
                <p className="text-sm text-gray-600">
                  브라우저 설정에서 캐시와 쿠키를 삭제해보세요
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 font-bold text-sm">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">인터넷 연결 확인</h3>
                <p className="text-sm text-gray-600">
                  네트워크 연결 상태를 확인해보세요
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 font-bold text-sm">4</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">다른 브라우저 사용</h3>
                <p className="text-sm text-gray-600">
                  Chrome, Safari, Edge 등 최신 브라우저를 사용해보세요
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 고객센터 링크 */}
        <div className="mt-8">
          <p className="text-gray-600 mb-4">문제가 계속되시나요?</p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
          >
            <Mail className="w-5 h-5" />
            고객센터에 문의하기
          </Link>
        </div>
      </div>
    </div>
  );
}
