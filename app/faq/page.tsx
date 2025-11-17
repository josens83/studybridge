'use client';

import { Metadata } from 'next';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  // 서비스 일반
  {
    category: '서비스 일반',
    question: 'StudyBridge는 어떤 서비스인가요?',
    answer: 'StudyBridge는 학생들이 학습 중 어려운 문제를 질문하고, 검증된 튜터와 다른 학생들로부터 답변을 받을 수 있는 온라인 학습 플랫폼입니다. 실시간 질문-답변, 코인 시스템, 프리미엄 구독 등 다양한 기능을 제공합니다.',
  },
  {
    category: '서비스 일반',
    question: '누구나 질문하고 답변할 수 있나요?',
    answer: '회원가입을 한 모든 사용자는 질문을 등록할 수 있습니다. 답변은 일반 회원과 검증된 튜터 모두 작성할 수 있으며, 튜터의 답변은 별도로 표시됩니다.',
  },
  {
    category: '서비스 일반',
    question: '어떤 과목을 질문할 수 있나요?',
    answer: '국어, 영어, 수학, 과학, 사회, 역사 등 모든 학교 과목에 대해 질문하실 수 있습니다. 과목별로 필터링하여 원하는 분야의 질문을 찾아볼 수도 있습니다.',
  },

  // 코인 및 결제
  {
    category: '코인 및 결제',
    question: '코인은 어떻게 사용하나요?',
    answer: '코인은 질문을 등록할 때 사용됩니다. 질문당 소모되는 코인은 질문의 긴급도나 난이도에 따라 다를 수 있습니다. 상점에서 코인 패키지를 구매하거나, 활동을 통해 포인트를 획득할 수 있습니다.',
  },
  {
    category: '코인 및 결제',
    question: '코인과 포인트의 차이는 무엇인가요?',
    answer: '코인은 유료로 구매하는 가상 화폐이며, 질문 등록 시 사용됩니다. 포인트는 답변 작성, 답변 채택 등 서비스 활동을 통해 무료로 획득하는 보상입니다. 포인트는 향후 코인으로 전환하거나 다양한 혜택에 사용할 수 있습니다.',
  },
  {
    category: '코인 및 결제',
    question: '코인 구매는 어떻게 하나요?',
    answer: '상단 메뉴의 코인 표시를 클릭하거나 상점 페이지에서 원하는 코인 패키지를 선택하여 구매할 수 있습니다. 결제는 Toss Payments를 통해 안전하게 진행됩니다.',
  },
  {
    category: '코인 및 결제',
    question: '코인 환불이 가능한가요?',
    answer: '구매일로부터 7일 이내, 사용하지 않은 코인에 한해 환불이 가능합니다. 환불 요청은 고객센터를 통해 접수하실 수 있습니다.',
  },
  {
    category: '코인 및 결제',
    question: '프리미엄 구독은 무엇인가요?',
    answer: '프리미엄 구독은 월정액 결제로 무제한 질문, 우선 답변, 할인 혜택 등 다양한 프리미엄 기능을 이용할 수 있는 서비스입니다. 베이직, 프로, 엔터프라이즈 세 가지 플랜이 있습니다.',
  },

  // 질문 및 답변
  {
    category: '질문 및 답변',
    question: '질문은 어떻게 등록하나요?',
    answer: '로그인 후 상단의 "질문하기" 버튼을 클릭하여 질문 등록 페이지로 이동합니다. 제목, 내용, 과목을 선택하고 필요시 이미지를 첨부한 후 제출하면 됩니다. 질문 등록 시 일정량의 코인이 소모됩니다.',
  },
  {
    category: '질문 및 답변',
    question: '질문에 이미지를 첨부할 수 있나요?',
    answer: '네, 질문과 답변 모두 최대 4개까지 이미지를 첨부할 수 있습니다. 문제 사진이나 풀이 과정을 이미지로 올리면 더 명확한 답변을 받을 수 있습니다.',
  },
  {
    category: '질문 및 답변',
    question: '답변 채택은 무엇인가요?',
    answer: '질문자는 받은 답변 중 가장 도움이 된 답변을 채택할 수 있습니다. 채택된 답변 작성자는 추가 포인트를 획득하며, 채택된 답변은 질문 상단에 강조 표시됩니다.',
  },
  {
    category: '질문 및 답변',
    question: '답변을 작성하면 어떤 혜택이 있나요?',
    answer: '답변을 작성하면 포인트를 획득할 수 있으며, 답변이 채택되면 추가 포인트를 받습니다. 또한 다른 사용자로부터 추천을 받을 수도 있습니다.',
  },
  {
    category: '질문 및 답변',
    question: '부적절한 질문이나 답변은 어떻게 신고하나요?',
    answer: '각 질문과 답변에는 신고 버튼이 있습니다. 스팸, 부적절한 콘텐츠, 저작권 침해 등의 사유로 신고할 수 있으며, 관리자가 검토 후 적절한 조치를 취합니다.',
  },

  // 계정 및 보안
  {
    category: '계정 및 보안',
    question: '회원가입은 어떻게 하나요?',
    answer: '상단의 "로그인" 버튼을 클릭한 후, 회원가입 탭에서 이메일, 비밀번호, 닉네임을 입력하여 가입할 수 있습니다. 이메일 인증 후 서비스를 이용하실 수 있습니다.',
  },
  {
    category: '계정 및 보안',
    question: '비밀번호를 잊어버렸어요',
    answer: '로그인 페이지에서 "비밀번호 찾기"를 클릭하면 가입한 이메일로 비밀번호 재설정 링크가 발송됩니다.',
  },
  {
    category: '계정 및 보안',
    question: '개인정보는 안전하게 보호되나요?',
    answer: '네, StudyBridge는 개인정보보호법을 준수하며, 모든 개인정보는 암호화되어 안전하게 저장됩니다. 자세한 내용은 개인정보처리방침을 참고해주세요.',
  },
  {
    category: '계정 및 보안',
    question: '회원 탈퇴는 어떻게 하나요?',
    answer: '대시보드의 설정 페이지에서 회원 탈퇴를 신청할 수 있습니다. 탈퇴 시 모든 개인정보와 활동 기록이 삭제되며, 남은 코인은 환불되지 않습니다.',
  },

  // 튜터
  {
    category: '튜터',
    question: '튜터가 되려면 어떻게 해야 하나요?',
    answer: '대시보드에서 튜터 신청을 할 수 있습니다. 학력 인증, 과목 전문성 검증 등의 심사 과정을 거쳐 튜터로 승인됩니다.',
  },
  {
    category: '튜터',
    question: '튜터와 일반 회원의 차이는 무엇인가요?',
    answer: '튜터는 프로필에 "튜터" 배지가 표시되며, 답변에 대한 신뢰도가 높습니다. 또한 튜터는 추가적인 포인트 보상과 수익 배분 기회를 받을 수 있습니다.',
  },

  // 기술 지원
  {
    category: '기술 지원',
    question: '이미지 업로드가 안 돼요',
    answer: '이미지는 JPG, PNG 형식이어야 하며, 파일 크기는 5MB 이하여야 합니다. 브라우저 캐시를 삭제하거나 다른 브라우저로 시도해보세요. 문제가 지속되면 고객센터로 문의해주세요.',
  },
  {
    category: '기술 지원',
    question: '모바일에서도 사용할 수 있나요?',
    answer: '네, StudyBridge는 반응형 웹으로 제작되어 PC, 태블릿, 스마트폰 등 모든 기기에서 원활하게 사용할 수 있습니다.',
  },
  {
    category: '기술 지원',
    question: '페이지가 제대로 로드되지 않아요',
    answer: '브라우저 캐시를 삭제하고 페이지를 새로고침해보세요. Chrome, Safari, Edge 등 최신 브라우저 사용을 권장합니다. 문제가 계속되면 고객센터로 연락주세요.',
  },
];

const categories = Array.from(new Set(faqs.map((faq) => faq.category)));

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filteredFAQs =
    selectedCategory === '전체'
      ? faqs
      : faqs.filter((faq) => faq.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">자주 묻는 질문</h1>
          <p className="text-gray-600 text-lg">
            StudyBridge 이용에 도움이 되는 자주 묻는 질문들을 모았습니다.
          </p>
        </div>

        {/* 카테고리 필터 */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          <button
            onClick={() => setSelectedCategory('전체')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              selectedCategory === '전체'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            전체
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ 아코디언 */}
        <div className="space-y-4">
          {filteredFAQs.map((faq, index) => {
            const globalIndex = faqs.indexOf(faq);
            const isOpen = openIndex === globalIndex;

            return (
              <div
                key={globalIndex}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        {faq.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {faq.question}
                    </h3>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0 ml-4" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0 ml-4" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-2">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 추가 도움말 */}
        <div className="mt-12 bg-white rounded-xl shadow-sm p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">답변을 찾지 못하셨나요?</h2>
          <p className="text-gray-600 mb-6">
            추가 문의사항이 있으시면 고객센터로 연락주세요.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/contact"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              문의하기
            </a>
            <a
              href="mailto:support@studybridge.com"
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
            >
              이메일 보내기
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
