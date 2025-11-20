'use client';

import { useRouter } from 'next/navigation';
import { Shield, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
            <Shield className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold">개인정보처리방침</h1>
          </div>
          <p className="text-gray-600">
            최종 수정일: {new Date().toLocaleDateString('ko-KR')}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm p-8 prose prose-blue max-w-none">
          <section className="mb-8">
            <p className="text-gray-700 leading-relaxed mb-4">
              StudyBridge(이하 &ldquo;회사&rdquo;)는 정보주체의 자유와 권리 보호를 위해 「개인정보 보호법」 및 관계 법령이 정한 바를 준수하여, 적법하게 개인정보를 처리하고 안전하게 관리하고 있습니다. 이에 「개인정보 보호법」 제30조에 따라 정보주체에게 개인정보 처리에 관한 절차 및 기준을 안내하고, 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리방침을 수립·공개합니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">제1조 (개인정보의 처리 목적)</h2>
            <p className="text-gray-700 leading-relaxed mb-2">회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
              <li>회원가입 및 관리: 회원가입 의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리, 서비스 부정이용 방지 목적</li>
              <li>서비스 제공: 질문·답변 서비스 제공, 튜터링 매칭 서비스 제공, 본인인증, 콘텐츠 제공</li>
              <li>서비스 개선: 신규 서비스 개발 및 특화, 통계학적 특성에 따른 서비스 제공 및 광고 게재, 서비스의 유효성 확인, 이벤트 정보 및 참여기회 제공, 접속빈도 파악</li>
              <li>결제 서비스: 서비스 제공에 따른 요금정산 목적</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">제2조 (개인정보의 처리 및 보유 기간)</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
              <li>회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</li>
              <li>각각의 개인정보 처리 및 보유 기간은 다음과 같습니다:
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>회원가입 및 관리: 회원 탈퇴 시까지 (다만, 관계 법령 위반에 따른 수사·조사 등이 진행중인 경우에는 해당 수사·조사 종료 시까지)</li>
                  <li>서비스 제공: 서비스 제공기간 종료 시까지</li>
                  <li>결제 및 환불: 「전자상거래 등에서의 소비자보호에 관한 법률」에 따라 5년간 보관</li>
                </ul>
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">제3조 (처리하는 개인정보의 항목)</h2>
            <p className="text-gray-700 leading-relaxed mb-2">회사는 다음의 개인정보 항목을 처리하고 있습니다:</p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
              <li>필수항목
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>이메일 주소</li>
                  <li>비밀번호 (암호화 저장)</li>
                  <li>닉네임</li>
                </ul>
              </li>
              <li>선택항목
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>프로필 사진</li>
                  <li>학년</li>
                  <li>관심 과목</li>
                  <li>자기소개</li>
                </ul>
              </li>
              <li>자동수집 항목
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>IP 주소</li>
                  <li>쿠키</li>
                  <li>접속 로그</li>
                  <li>서비스 이용 기록</li>
                </ul>
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">제4조 (개인정보의 제3자 제공)</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              회사는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 「개인정보 보호법」 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
            </p>
            <p className="text-gray-700 leading-relaxed">
              회사는 결제 처리를 위해 다음과 같이 개인정보를 제3자에게 제공하고 있습니다:
            </p>
            <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-gray-700">
              <li>제공받는 자: 결제대행업체 (PG사)</li>
              <li>제공 목적: 결제 서비스 제공</li>
              <li>제공 항목: 이메일, 결제 정보</li>
              <li>보유 기간: 거래 종료 후 5년</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">제5조 (개인정보처리의 위탁)</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다:
            </p>
            <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-gray-700">
              <li>수탁업체: Supabase (데이터베이스 서비스)</li>
              <li>위탁 업무: 서비스 제공을 위한 인프라 운영</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">제6조 (정보주체의 권리·의무 및 행사방법)</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
              <li>정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다:
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>개인정보 열람 요구</li>
                  <li>오류 등이 있을 경우 정정 요구</li>
                  <li>삭제 요구</li>
                  <li>처리정지 요구</li>
                </ul>
              </li>
              <li>제1항에 따른 권리 행사는 회사에 대해 서면, 전화, 전자우편 등을 통하여 하실 수 있으며 회사는 이에 대해 지체 없이 조치하겠습니다.</li>
              <li>정보주체가 개인정보의 오류 등에 대한 정정 또는 삭제를 요구한 경우에는 회사는 정정 또는 삭제를 완료할 때까지 당해 개인정보를 이용하거나 제공하지 않습니다.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">제7조 (개인정보의 파기)</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
              <li>회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.</li>
              <li>개인정보 파기의 절차 및 방법은 다음과 같습니다:
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>파기절차: 불필요하게 된 개인정보 및 개인정보파일은 개인정보책임자의 책임 하에 내부방침 절차에 따라 파기합니다.</li>
                  <li>파기방법: 전자적 파일 형태로 기록·저장된 개인정보는 기록을 재생할 수 없도록 파기하며, 종이 문서에 기록·저장된 개인정보는 분쇄기로 분쇄하거나 소각하여 파기합니다.</li>
                </ul>
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">제8조 (개인정보의 안전성 확보조치)</h2>
            <p className="text-gray-700 leading-relaxed mb-2">회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:</p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
              <li>관리적 조치: 내부관리계획 수립·시행, 정기적 직원 교육 등</li>
              <li>기술적 조치: 개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치, 고유식별정보 등의 암호화, 보안프로그램 설치</li>
              <li>물리적 조치: 전산실, 자료보관실 등의 접근통제</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">제9조 (개인정보 보호책임자)</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 ml-4">
              <p className="text-gray-700 font-semibold mb-2">개인정보 보호책임자</p>
              <ul className="list-none space-y-1 text-gray-700">
                <li>성명: StudyBridge 관리자</li>
                <li>직책: 대표</li>
                <li>연락처: support@studybridge.com</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">제10조 (개인정보 열람청구)</h2>
            <p className="text-gray-700 leading-relaxed">
              정보주체는 「개인정보 보호법」 제35조에 따른 개인정보의 열람 청구를 아래의 부서에 할 수 있습니다. 회사는 정보주체의 개인정보 열람청구가 신속하게 처리되도록 노력하겠습니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">제11조 (권익침해 구제방법)</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              정보주체는 개인정보침해로 인한 구제를 받기 위하여 개인정보분쟁조정위원회, 한국인터넷진흥원 개인정보침해신고센터 등에 분쟁해결이나 상담 등을 신청할 수 있습니다:
            </p>
            <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-gray-700">
              <li>개인정보분쟁조정위원회: (국번없이) 1833-6972 (www.kopico.go.kr)</li>
              <li>개인정보침해신고센터: (국번없이) 118 (privacy.kisa.or.kr)</li>
              <li>대검찰청: (국번없이) 1301 (www.spo.go.kr)</li>
              <li>경찰청: (국번없이) 182 (ecrm.cyber.go.kr)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">제12조 (개인정보 처리방침 변경)</h2>
            <p className="text-gray-700 leading-relaxed">
              이 개인정보 처리방침은 {new Date().toLocaleDateString('ko-KR')}부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
            </p>
          </section>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
            <h3 className="font-bold text-blue-900 mb-2">시행일자</h3>
            <p className="text-sm text-blue-800">
              본 방침은 {new Date().toLocaleDateString('ko-KR')}부터 시행됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
