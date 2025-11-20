'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle } from 'lucide-react';

function PaymentFailContent() {
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get('message') || '결제가 취소되었습니다.';
  const errorCode = searchParams.get('code');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-red-600" />
        </div>

        {/* Message */}
        <h2 className="text-2xl font-bold mb-3">결제 실패</h2>
        <p className="text-gray-600 mb-6">{errorMessage}</p>

        {errorCode && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500">
              오류 코드: <span className="font-mono font-semibold">{errorCode}</span>
            </p>
          </div>
        )}

        {/* Common Reasons */}
        <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
          <h3 className="font-semibold mb-3 text-sm text-blue-900">결제 실패 주요 원인</h3>
          <ul className="space-y-2 text-xs text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>카드 한도 초과 또는 잔액 부족</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>카드 정보 입력 오류</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>카드사 승인 거부</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>결제 창을 닫거나 취소 버튼 클릭</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/shop"
            className="block w-full py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold shadow-lg"
          >
            다시 시도하기
          </Link>
          <Link
            href="/"
            className="block w-full py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-semibold"
          >
            홈으로 돌아가기
          </Link>
        </div>

        {/* Support */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            문제가 계속되면{' '}
            <a
              href="mailto:support@studybridge.com"
              className="text-blue-600 hover:underline font-semibold"
            >
              고객센터
            </a>
            로 문의해주세요.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <XCircle className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">로딩 중...</h2>
          <p className="text-gray-600">잠시만 기다려주세요.</p>
        </div>
      </div>
    }>
      <PaymentFailContent />
    </Suspense>
  );
}
