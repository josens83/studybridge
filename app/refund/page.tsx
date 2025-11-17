import { Metadata } from 'next';
import Link from 'next/link';
import { AlertCircle, CheckCircle, XCircle, Clock, Mail, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: '환불 정책',
  description: 'StudyBridge 코인 및 구독 환불 정책',
};

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold mb-2">환불 정책</h1>
          <p className="text-gray-600 mb-8">최종 업데이트: 2025년 11월 17일</p>

          <div className="space-y-8">
            {/* 기본 원칙 */}
            <Section title="1. 기본 원칙">
              <p className="mb-4">
                StudyBridge는 전자상거래 등에서의 소비자보호에 관한 법률 및 관련 법령을 준수하여
                이용자의 환불 요청을 처리합니다.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-blue-900 text-sm">
                    환불 정책은 상품 유형(코인, 구독)에 따라 다르게 적용됩니다.
                    아래 내용을 자세히 확인해주세요.
                  </p>
                </div>
              </div>
            </Section>

            {/* 코인 환불 */}
            <Section title="2. 코인 환불 정책">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    환불 가능 조건
                  </h3>
                  <ul className="list-disc list-inside space-y-2 ml-7">
                    <li>구매일로부터 <strong>7일 이내</strong></li>
                    <li>구매한 코인을 <strong>사용하지 않은 경우</strong></li>
                    <li>시스템 오류로 인한 중복 결제</li>
                    <li>서비스 장애로 인한 코인 미지급</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    환불 불가 조건
                  </h3>
                  <ul className="list-disc list-inside space-y-2 ml-7">
                    <li>구매 후 7일이 경과한 경우</li>
                    <li>코인을 일부라도 사용한 경우</li>
                    <li>보너스 코인 (구매 시 추가로 제공된 코인)</li>
                    <li>이벤트나 프로모션으로 무료 지급받은 코인</li>
                    <li>이용약관 위반으로 인한 계정 정지 시</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-900 text-sm">
                    <strong>부분 환불:</strong> 코인 패키지 구매 후 일부만 사용한 경우,
                    사용한 코인에 대한 금액을 차감하고 남은 금액을 환불해드립니다.
                    단, 보너스 코인은 환불 대상에서 제외됩니다.
                  </p>
                </div>
              </div>
            </Section>

            {/* 구독 환불 */}
            <Section title="3. 구독 환불 정책">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    환불 가능 조건
                  </h3>
                  <ul className="list-disc list-inside space-y-2 ml-7">
                    <li>최초 결제일로부터 <strong>7일 이내</strong></li>
                    <li>구독 서비스를 <strong>실질적으로 이용하지 않은 경우</strong></li>
                    <li>시스템 오류로 인한 중복 결제</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    환불 불가 조건
                  </h3>
                  <ul className="list-disc list-inside space-y-2 ml-7">
                    <li>결제 후 7일이 경과한 경우</li>
                    <li>구독 혜택(무제한 질문 등)을 이미 사용한 경우</li>
                    <li>구독 기간 중 일부 기간이 경과한 경우</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-900 text-sm mb-2">
                    <strong>구독 취소:</strong> 구독은 언제든지 취소할 수 있으며,
                    현재 결제된 기간까지는 서비스를 이용하실 수 있습니다.
                  </p>
                  <p className="text-blue-900 text-sm">
                    <strong>자동 갱신:</strong> 구독 취소 시 다음 결제일에 자동 갱신되지 않으며,
                    추가 요금이 청구되지 않습니다.
                  </p>
                </div>
              </div>
            </Section>

            {/* 환불 절차 */}
            <Section title="4. 환불 신청 절차">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">환불 신청</h3>
                    <p className="text-gray-700 text-sm">
                      고객센터를 통해 환불 신청서를 제출하거나,
                      이메일(refund@studybridge.com)로 환불 요청
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">심사 및 확인</h3>
                    <p className="text-gray-700 text-sm">
                      환불 조건 확인 (구매일, 사용 내역 등) - 영업일 기준 1-2일 소요
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">환불 처리</h3>
                    <p className="text-gray-700 text-sm">
                      승인 시 결제 수단으로 환불 처리 - 영업일 기준 3-5일 소요
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">환불 완료</h3>
                    <p className="text-gray-700 text-sm">
                      이메일로 환불 완료 통지 - 카드사별 환불 반영 기간 상이
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-600" />
                  환불 신청 시 필요한 정보
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-7">
                  <li>회원 이메일 주소</li>
                  <li>주문번호 (결제 완료 이메일 참조)</li>
                  <li>결제일 및 결제 금액</li>
                  <li>환불 사유</li>
                </ul>
              </div>
            </Section>

            {/* 환불 처리 기간 */}
            <Section title="5. 환불 처리 기간">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                        결제 수단
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                        환불 처리 기간
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-3">신용카드</td>
                      <td className="border border-gray-300 px-4 py-3">
                        승인 후 3-5 영업일 (카드사 정산 일정에 따라 상이)
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-3">체크카드</td>
                      <td className="border border-gray-300 px-4 py-3">
                        승인 후 3-5 영업일
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-3">계좌이체</td>
                      <td className="border border-gray-300 px-4 py-3">
                        승인 후 1-2 영업일 (환불 계좌 정보 제공 필요)
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-3">간편결제</td>
                      <td className="border border-gray-300 px-4 py-3">
                        승인 후 3-7 영업일 (서비스별 상이)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Section>

            {/* 예외 사항 */}
            <Section title="6. 예외 사항">
              <ul className="list-disc list-inside space-y-2">
                <li>
                  천재지변, 시스템 장애 등 회사의 귀책사유로 서비스를 이용할 수 없는 경우,
                  사용 기간에 관계없이 전액 환불 처리됩니다.
                </li>
                <li>
                  결제 오류, 중복 결제 등의 경우 즉시 환불 처리되며,
                  일반 환불 절차와 다르게 진행될 수 있습니다.
                </li>
                <li>
                  법률에 의해 소비자에게 유리한 경우, 해당 법률이 우선 적용됩니다.
                </li>
              </ul>
            </Section>

            {/* 환불 거부 */}
            <Section title="7. 환불 거부 사유">
              <ul className="list-disc list-inside space-y-2">
                <li>이용약관을 위반하여 계정이 정지된 경우</li>
                <li>부정한 방법으로 코인이나 구독을 획득한 경우</li>
                <li>환불 신청 정보가 허위로 확인된 경우</li>
                <li>환불 가능 기간이 경과한 경우</li>
              </ul>
              <p className="mt-4 text-sm text-gray-600">
                환불이 거부된 경우 이메일로 거부 사유를 안내드리며,
                이의가 있을 시 재심사를 요청하실 수 있습니다.
              </p>
            </Section>

            {/* 문의 */}
            <Section title="8. 환불 관련 문의">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold mb-4">환불 담당 부서</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">이메일</p>
                      <a
                        href="mailto:refund@studybridge.com"
                        className="text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        refund@studybridge.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">전화</p>
                      <a
                        href="tel:02-1234-5678"
                        className="text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        02-1234-5678
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">운영 시간</p>
                      <p className="font-semibold">평일 09:00 - 18:00 (주말 및 공휴일 휴무)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-4 justify-center">
                <Link
                  href="/contact"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  환불 문의하기
                </Link>
                <Link
                  href="/faq"
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
                >
                  자주 묻는 질문
                </Link>
              </div>
            </Section>

            {/* 부칙 */}
            <Section title="부칙">
              <p>본 환불 정책은 2025년 11월 17일부터 시행됩니다.</p>
              <p className="mt-2 text-sm text-gray-600">
                본 정책은 관련 법령 및 회사 정책 변경에 따라 수정될 수 있으며,
                변경 시 7일 전 공지합니다.
              </p>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="text-gray-700 leading-relaxed">{children}</div>
    </section>
  );
}
