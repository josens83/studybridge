import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '이용약관',
  description: 'StudyBridge 서비스 이용약관',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold mb-2">이용약관</h1>
          <p className="text-gray-600 mb-8">최종 업데이트: 2025년 11월 17일</p>

          <div className="space-y-8">
            <Section title="제1조 (목적)">
              <p>
                본 약관은 StudyBridge(이하 &ldquo;회사&rdquo;)가 운영하는 StudyBridge 서비스(이하 &ldquo;서비스&rdquo;)의 이용과 관련하여
                회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
              </p>
            </Section>

            <Section title="제2조 (용어의 정의)">
              <ul className="list-disc list-inside space-y-2">
                <li>&ldquo;서비스&rdquo;라 함은 StudyBridge가 제공하는 질문/답변 플랫폼 및 관련 서비스 일체를 의미합니다.</li>
                <li>&ldquo;이용자&rdquo;라 함은 본 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.</li>
                <li>&ldquo;회원&rdquo;이라 함은 회사와 서비스 이용계약을 체결하고 이용자 ID를 부여받은 자를 의미합니다.</li>
                <li>&ldquo;코인&rdquo;이라 함은 서비스 내에서 사용되는 가상 화폐를 의미합니다.</li>
                <li>&ldquo;포인트&rdquo;라 함은 활동 보상으로 지급되는 가상 포인트를 의미합니다.</li>
              </ul>
            </Section>

            <Section title="제3조 (약관의 효력 및 변경)">
              <ul className="list-disc list-inside space-y-2">
                <li>본 약관은 서비스를 이용하고자 하는 모든 이용자에 대하여 그 효력이 발생합니다.</li>
                <li>
                  회사는 필요한 경우 관련 법령을 위배하지 않는 범위 내에서 본 약관을 변경할 수 있으며,
                  변경된 약관은 서비스 내 공지사항을 통해 공지합니다.
                </li>
                <li>이용자가 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.</li>
              </ul>
            </Section>

            <Section title="제4조 (서비스의 제공)">
              <ul className="list-disc list-inside space-y-2">
                <li>질문 및 답변 등록 서비스</li>
                <li>검증된 튜터 매칭 서비스</li>
                <li>코인 및 포인트 시스템</li>
                <li>프리미엄 구독 서비스</li>
                <li>기타 회사가 추가 개발하거나 제휴계약 등을 통해 이용자에게 제공하는 일체의 서비스</li>
              </ul>
            </Section>

            <Section title="제5조 (서비스의 중단)">
              <p>
                회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신두절 또는 운영상 상당한 이유가 있는 경우
                서비스의 제공을 일시적으로 중단할 수 있습니다.
              </p>
            </Section>

            <Section title="제6조 (회원가입)">
              <ul className="list-disc list-inside space-y-2">
                <li>이용자는 회사가 정한 양식에 따라 회원정보를 기입한 후 본 약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다.</li>
                <li>회사는 제1항과 같이 회원으로 가입할 것을 신청한 이용자 중 다음 각 호에 해당하지 않는 한 회원으로 등록합니다.</li>
                <li>가입신청자가 본 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우</li>
                <li>등록 내용에 허위, 기재누락, 오기가 있는 경우</li>
                <li>기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이 있다고 판단되는 경우</li>
              </ul>
            </Section>

            <Section title="제7조 (코인 및 포인트)">
              <ul className="list-disc list-inside space-y-2">
                <li>코인은 유료로 구매할 수 있으며, 질문 등록 시 사용됩니다.</li>
                <li>포인트는 서비스 활동(질문, 답변, 채택 등)을 통해 무료로 획득할 수 있습니다.</li>
                <li>코인의 환불은 구매일로부터 7일 이내, 미사용 코인에 한해 가능합니다.</li>
                <li>부정한 방법으로 코인이나 포인트를 획득한 경우, 회사는 이를 회수하고 회원자격을 제한할 수 있습니다.</li>
              </ul>
            </Section>

            <Section title="제8조 (이용자의 의무)">
              <ul className="list-disc list-inside space-y-2">
                <li>타인의 정보 도용 금지</li>
                <li>회사가 게시한 정보의 변경 금지</li>
                <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시 금지</li>
                <li>회사 및 기타 제3자의 저작권 등 지적재산권 침해 금지</li>
                <li>회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위 금지</li>
                <li>외설 또는 폭력적인 메시지, 화상, 음성 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위 금지</li>
              </ul>
            </Section>

            <Section title="제9조 (저작권의 귀속 및 이용제한)">
              <p>
                회사가 작성한 저작물에 대한 저작권 기타 지적재산권은 회사에 귀속합니다.
                이용자는 서비스를 이용함으로써 얻은 정보 중 회사에게 지적재산권이 귀속된 정보를
                회사의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나
                제3자에게 이용하게 하여서는 안됩니다.
              </p>
            </Section>

            <Section title="제10조 (분쟁해결)">
              <p>
                회사와 이용자는 서비스와 관련하여 발생한 분쟁을 원만하게 해결하기 위하여 필요한 모든 노력을 하여야 합니다.
                본 약관에 명시되지 않은 사항은 전기통신사업법 등 관계법령과 상관습에 따릅니다.
              </p>
            </Section>

            <Section title="부칙">
              <p>본 약관은 2025년 11월 17일부터 시행됩니다.</p>
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
