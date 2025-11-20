import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description: 'StudyBridge 개인정보처리방침',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold mb-2">개인정보처리방침</h1>
          <p className="text-gray-600 mb-8">최종 업데이트: 2025년 11월 17일</p>

          <div className="space-y-8">
            <Section title="1. 개인정보의 수집 및 이용목적">
              <p className="mb-4">
                StudyBridge(이하 &ldquo;회사&rdquo;)는 다음의 목적을 위하여 개인정보를 처리합니다.
                처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며,
                이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>회원 가입 의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증</li>
                <li>회원자격 유지·관리, 서비스 부정이용 방지</li>
                <li>각종 고지·통지, 고충처리</li>
                <li>재화 또는 서비스 제공(코인 구매, 구독 서비스)</li>
                <li>마케팅 및 광고에의 활용(신규 서비스 개발 및 맞춤 서비스 제공)</li>
                <li>서비스 이용기록과 접속 빈도 분석, 서비스 이용에 대한 통계</li>
              </ul>
            </Section>

            <Section title="2. 수집하는 개인정보의 항목">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">가. 회원가입 시</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>필수항목: 이메일, 비밀번호, 닉네임</li>
                    <li>선택항목: 학년, 관심 과목</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">나. 서비스 이용 과정에서 자동 수집되는 정보</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>IP 주소, 쿠키, 서비스 이용 기록, 기기정보</li>
                    <li>불량 이용 기록</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">다. 결제 정보</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>신용카드 정보, 은행계좌 정보 (결제대행사를 통해 처리)</li>
                  </ul>
                </div>
              </div>
            </Section>

            <Section title="3. 개인정보의 보유 및 이용기간">
              <p className="mb-4">
                회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의 받은
                개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>회원 탈퇴 시까지 (단, 관계 법령 위반에 따른 수사·조사 등이 진행중인 경우에는 해당 수사·조사 종료 시까지)</li>
                <li>
                  전자상거래 등에서의 소비자보호에 관한 법률에 따라:
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>계약 또는 청약철회 등에 관한 기록: 5년</li>
                    <li>대금결제 및 재화 등의 공급에 관한 기록: 5년</li>
                    <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년</li>
                  </ul>
                </li>
                <li>통신비밀보호법에 따라 웹사이트 로그 기록 자료: 3개월</li>
              </ul>
            </Section>

            <Section title="4. 개인정보의 제3자 제공">
              <p>
                회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다.
                다만, 아래의 경우에는 예외로 합니다:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>이용자가 사전에 동의한 경우</li>
                <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
              </ul>
            </Section>

            <Section title="5. 개인정보의 파기">
              <p className="mb-4">
                회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는
                지체없이 해당 개인정보를 파기합니다.
              </p>
              <div>
                <h3 className="font-semibold mb-2">가. 파기절차</h3>
                <p className="mb-4">
                  이용자가 입력한 정보는 목적 달성 후 별도의 DB에 옮겨져(종이의 경우 별도의 서류)
                  내부 방침 및 기타 관련 법령에 따라 일정기간 저장된 후 혹은 즉시 파기됩니다.
                </p>

                <h3 className="font-semibold mb-2">나. 파기방법</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용합니다.</li>
                  <li>종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각을 통하여 파기합니다.</li>
                </ul>
              </div>
            </Section>

            <Section title="6. 이용자의 권리·의무 및 행사방법">
              <p>
                이용자는 개인정보주체로서 다음과 같은 권리를 행사할 수 있습니다:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>개인정보 열람요구</li>
                <li>오류 등이 있을 경우 정정 요구</li>
                <li>삭제요구</li>
                <li>처리정지 요구</li>
              </ul>
              <p className="mt-4">
                권리 행사는 회사에 대해 서면, 전화, 전자우편 등을 통하여 하실 수 있으며
                회사는 이에 대해 지체없이 조치하겠습니다.
              </p>
            </Section>

            <Section title="7. 개인정보 보호책임자">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold mb-2">개인정보 보호책임자</p>
                <ul className="space-y-1">
                  <li>성명: StudyBridge 관리팀</li>
                  <li>이메일: privacy@studybridge.com</li>
                  <li>전화번호: 02-1234-5678</li>
                </ul>
              </div>
            </Section>

            <Section title="8. 개인정보 처리방침 변경">
              <p>
                이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가,
                삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
              </p>
            </Section>

            <Section title="부칙">
              <p>본 방침은 2025년 11월 17일부터 시행됩니다.</p>
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
