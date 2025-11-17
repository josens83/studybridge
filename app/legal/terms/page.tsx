'use client';

import { useRouter } from 'next/navigation';
import { FileText, ArrowLeft } from 'lucide-react';

export default function TermsOfServicePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            뒤로 가기
          </button>

          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold">이용약관</h1>
          </div>
          <p className="text-gray-600">
            최종 수정일: {new Date().toLocaleDateString('ko-KR')}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm p-8 prose prose-blue max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">제1조 (목적)</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              본 약관은 StudyBridge(이하 "회사")가 제공하는 온라인 학습 Q&A 및 튜터링 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">제2조 (정의)</h2>
            <p className="text-gray-700 leading-relaxed mb-2">본 약관에서 사용하는 용어의 정의는 다음과 같습니다:</p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
              <li>"서비스"란 회사가 제공하는 온라인 학습 질의응답 및 튜터링 플랫폼을 의미합니다.</li>
              <li>"회원"이란 본 약관에 따라 회사와 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 자를 의미합니다.</li>
              <li>"아이디(ID)"란 회원의 식별과 서비스 이용을 위하여 회원이 설정하고 회사가 승인하는 이메일 주소를 의미합니다.</li>
              <li>"비밀번호"란 회원이 부여받은 아이디와 일치된 회원임을 확인하고 회원 자신의 비밀을 보호하기 위하여 회원이 설정한 문자와 숫자의 조합을 의미합니다.</li>
              <li>"코인"이란 서비스 내에서 질문 작성 등에 사용할 수 있는 유료 가상화폐를 의미합니다.</li>
              <li>"포인트"란 답변 채택 등을 통해 획득할 수 있는 무료 보상을 의미합니다.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">제3조 (약관의 게시와 개정)</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
              <li>회사는 본 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기 화면 및 설정 메뉴에 게시합니다.</li>
              <li>회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.</li>
              <li>회사가 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행약관과 함께 서비스 초기화면에 그 적용일자 7일 이전부터 적용일자 전일까지 공지합니다.</li>
              <li>회원이 개정약관의 적용에 동의하지 않는 경우 회사는 해당 회원에 대하여 개정 약관의 내용을 적용할 수 없으며, 이 경우 회원은 이용계약을 해지할 수 있습니다.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">제4조 (회원가입)</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
              <li>회원가입은 이용자가 약관의 내용에 대하여 동의를 한 다음 회원가입신청을 하고 회사가 이러한 신청에 대하여 승낙함으로써 체결됩니다.</li>
              <li>회원가입신청서에는 다음 사항을 기재해야 합니다:
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>이메일 주소</li>
                  <li>비밀번호</li>
                  <li>닉네임</li>
                </ul>
              </li>
              <li>회사는 다음 각 호에 해당하는 신청에 대하여는 승낙을 하지 않거나 사후에 이용계약을 해지할 수 있습니다:
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>가입신청자가 본 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우</li>
                  <li>실명이 아니거나 타인의 명의를 이용한 경우</li>
                  <li>허위의 정보를 기재하거나, 회사가 제시하는 내용을 기재하지 않은 경우</li>
                  <li>기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이 있다고 판단되는 경우</li>
                </ul>
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">제5조 (서비스의 제공 및 변경)</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
              <li>회사는 다음과 같은 서비스를 제공합니다:
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>학습 질문 및 답변 플랫폼</li>
                  <li>1:1 튜터링 매칭 서비스</li>
                  <li>코인 충전 및 관리</li>
                  <li>포인트 적립 및 전환</li>
                  <li>기타 회사가 추가 개발하거나 다른 회사와의 제휴계약 등을 통해 회원에게 제공하는 일체의 서비스</li>
                </ul>
              </li>
              <li>회사는 서비스의 내용을 변경할 경우 변경 사유 및 내용을 서비스 화면에 공지합니다.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">제6조 (서비스의 중단)</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
              <li>회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.</li>
              <li>회사는 제1항의 사유로 서비스의 제공이 일시적으로 중단됨으로 인하여 이용자 또는 제3자가 입은 손해에 대하여 배상합니다. 단, 회사가 고의 또는 과실이 없음을 입증하는 경우에는 그러하지 아니합니다.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">제7조 (코인 및 포인트)</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
              <li>코인은 회원이 유료로 충전하여 질문 작성 등 서비스 이용에 사용할 수 있는 가상화폐입니다.</li>
              <li>포인트는 답변 채택 등을 통해 무료로 획득할 수 있으며, 10:1 비율로 코인으로 전환할 수 있습니다.</li>
              <li>코인 충전 금액은 환불이 불가능하며, 미사용 코인은 1년간 유효합니다.</li>
              <li>포인트의 유효기간은 획득일로부터 1년입니다.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">제8조 (회원의 의무)</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
              <li>회원은 다음 행위를 하여서는 안 됩니다:
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>신청 또는 변경 시 허위내용의 등록</li>
                  <li>타인의 정보 도용</li>
                  <li>회사가 게시한 정보의 변경</li>
                  <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
                  <li>회사와 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                  <li>회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                  <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
                </ul>
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">제9조 (저작권의 귀속 및 이용제한)</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
              <li>회사가 작성한 저작물에 대한 저작권 기타 지적재산권은 회사에 귀속합니다.</li>
              <li>회원이 서비스 내에 게시한 게시물의 저작권은 해당 게시물의 저작자에게 귀속됩니다.</li>
              <li>회원은 서비스를 이용함으로써 얻은 정보 중 회사에게 지적재산권이 귀속된 정보를 회사의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안 됩니다.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">제10조 (분쟁해결)</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
              <li>회사는 이용자가 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상처리하기 위하여 피해보상처리기구를 설치·운영합니다.</li>
              <li>회사는 이용자로부터 제출되는 불만사항 및 의견은 우선적으로 그 사항을 처리합니다. 다만, 신속한 처리가 곤란한 경우에는 이용자에게 그 사유와 처리일정을 즉시 통보해 드립니다.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">제11조 (재판권 및 준거법)</h2>
            <p className="text-gray-700 leading-relaxed">
              본 약관에 명시되지 않은 사항은 전기통신사업법 등 관계법령과 상관습에 따릅니다. 서비스 이용으로 발생한 분쟁에 대해 소송이 제기될 경우 대한민국 법원을 관할 법원으로 합니다.
            </p>
          </section>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
            <h3 className="font-bold text-blue-900 mb-2">부칙</h3>
            <p className="text-sm text-blue-800">
              본 약관은 {new Date().toLocaleDateString('ko-KR')}부터 적용됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
