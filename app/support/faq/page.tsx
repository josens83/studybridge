'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HelpCircle, ChevronDown, ChevronUp, Search, ArrowLeft, MessageCircle } from 'lucide-react';
import Link from 'next/link';

interface FAQ {
  id: number;
  category: string;
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    id: 1,
    category: '계정',
    question: '회원가입은 어떻게 하나요?',
    answer: '우측 상단의 "로그인" 버튼을 클릭한 후 "회원가입" 탭을 선택하여 이메일과 비밀번호를 입력하시면 됩니다. 이메일 인증 후 바로 서비스를 이용하실 수 있습니다.',
  },
  {
    id: 2,
    category: '계정',
    question: '비밀번호를 잊어버렸어요.',
    answer: '로그인 페이지에서 "비밀번호 찾기"를 클릭하시면 가입하신 이메일로 비밀번호 재설정 링크가 전송됩니다. 링크를 통해 새로운 비밀번호를 설정하실 수 있습니다.',
  },
  {
    id: 3,
    category: '결제',
    question: '코인은 어떻게 충전하나요?',
    answer: '상단 메뉴의 "코인 충전" 버튼을 클릭하거나 /shop 페이지에서 원하시는 코인 패키지를 선택하여 결제하실 수 있습니다. 신용카드, 계좌이체, 간편결제 등 다양한 결제 수단을 지원합니다.',
  },
  {
    id: 4,
    category: '결제',
    question: '코인과 포인트의 차이는 무엇인가요?',
    answer: '코인은 충전하여 질문을 올릴 때 사용하는 유료 화폐이고, 포인트는 답변을 채택받을 때 획득하는 무료 보상입니다. 포인트는 10:1 비율로 코인으로 전환할 수 있습니다.',
  },
  {
    id: 5,
    category: '질문',
    question: '질문은 어떻게 하나요?',
    answer: '상단의 "질문하기" 버튼을 클릭하여 과목, 학년, 질문 제목과 내용을 입력하시면 됩니다. 이미지를 첨부할 수도 있으며, 질문 시 코인이 차감됩니다. 긴급 질문은 추가 코인이 필요합니다.',
  },
  {
    id: 6,
    category: '질문',
    question: '질문을 수정하거나 삭제할 수 있나요?',
    answer: '본인이 작성한 질문은 언제든 수정하거나 삭제할 수 있습니다. 질문 상세 페이지에서 "수정하기" 또는 "삭제하기" 버튼을 사용하세요. 단, 이미 답변이 달린 질문을 삭제하면 답변도 함께 삭제됩니다.',
  },
  {
    id: 7,
    category: '답변',
    question: '답변은 어떻게 하나요?',
    answer: '질문 목록에서 답변하고 싶은 질문을 선택한 후 답변 작성란에 내용을 입력하고 "답변 작성" 버튼을 클릭하시면 됩니다. 답변이 채택되면 질문에 걸린 코인을 획득할 수 있습니다.',
  },
  {
    id: 8,
    category: '답변',
    question: '답변 채택은 어떻게 하나요?',
    answer: '본인이 작성한 질문에 달린 답변 중 가장 도움이 된 답변의 "채택하기" 버튼을 클릭하시면 됩니다. 한 질문당 하나의 답변만 채택할 수 있으며, 채택 후에는 취소할 수 없습니다.',
  },
  {
    id: 9,
    category: '튜터링',
    question: '1:1 튜터링은 어떻게 이용하나요?',
    answer: '"튜터 매칭" 메뉴에서 과목과 학년에 맞는 튜터를 선택하여 예약할 수 있습니다. 튜터의 프로필과 리뷰를 확인한 후 예약을 진행하시면 됩니다.',
  },
  {
    id: 10,
    category: '튜터링',
    question: '튜터가 되려면 어떻게 해야 하나요?',
    answer: '설정 페이지에서 "튜터 신청"을 선택하고 학력, 전공, 과외 경력 등을 입력하여 신청하시면 됩니다. 관리자 검토 후 승인되면 튜터 활동을 시작할 수 있습니다.',
  },
  {
    id: 11,
    category: '구독',
    question: '구독 플랜의 차이는 무엇인가요?',
    answer: '무료 플랜은 기본 기능만 이용 가능하고, 베이직 플랜은 월 할인 혜택과 우선 답변을, 프리미엄 플랜은 무제한 질문과 1:1 튜터링 할인을 제공합니다. 자세한 내용은 요금제 페이지를 참고하세요.',
  },
  {
    id: 12,
    category: '구독',
    question: '구독을 취소하려면 어떻게 하나요?',
    answer: '설정 > 구독 관리 페이지에서 "구독 취소" 버튼을 클릭하시면 됩니다. 취소 후에도 결제한 기간까지는 프리미엄 기능을 이용하실 수 있으며, 자동 갱신이 중지됩니다.',
  },
  {
    id: 13,
    category: '신고',
    question: '부적절한 콘텐츠는 어떻게 신고하나요?',
    answer: '각 질문과 답변에 "신고하기" 버튼이 있습니다. 클릭하여 신고 사유를 선택하고 제출하시면 관리자가 검토 후 적절한 조치를 취합니다.',
  },
  {
    id: 14,
    category: '신고',
    question: '신고 처리는 얼마나 걸리나요?',
    answer: '신고된 콘텐츠는 24시간 이내에 검토되며, 정책 위반이 확인되면 즉시 삭제 또는 제재 조치가 이루어집니다. 긴급한 경우 고객센터로 직접 연락 주시기 바랍니다.',
  },
  {
    id: 15,
    category: '기타',
    question: '포인트는 어떻게 사용하나요?',
    answer: '포인트는 지갑 페이지에서 코인으로 전환할 수 있습니다. 10포인트 = 1코인으로 전환되며, 전환된 코인은 질문 작성 시 사용할 수 있습니다.',
  },
  {
    id: 16,
    category: '기타',
    question: '앱은 없나요?',
    answer: '현재는 웹 버전만 제공되고 있습니다. 모바일 브라우저에서도 최적화되어 있어 편리하게 이용하실 수 있으며, 향후 모바일 앱 출시를 준비 중입니다.',
  },
];

export default function FAQPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const categories = ['전체', ...Array.from(new Set(faqs.map(f => f.category)))];

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === '전체' || faq.category === selectedCategory;
    const matchesSearch = searchTerm === '' ||
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  function toggleFAQ(id: number) {
    setExpandedId(expandedId === id ? null : id);
  }

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
            <HelpCircle className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold">자주 묻는 질문 (FAQ)</h1>
          </div>
          <p className="text-gray-600">궁금하신 내용을 빠르게 찾아보세요</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="질문을 검색하세요..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-4 mb-8">
          {filteredFAQs.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">검색 결과가 없습니다</h3>
              <p className="text-gray-600">다른 키워드로 검색해보세요</p>
            </div>
          ) : (
            filteredFAQs.map((faq) => (
              <div key={faq.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <div className="flex items-start gap-4 text-left flex-1">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold mt-0.5">
                      {faq.category}
                    </span>
                    <h3 className="font-bold text-lg flex-1">{faq.question}</h3>
                  </div>
                  {expandedId === faq.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {expandedId === faq.id && (
                  <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                    <p className="text-gray-700 leading-relaxed pl-20">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-sm p-8 text-white text-center">
          <MessageCircle className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">원하는 답변을 찾지 못하셨나요?</h3>
          <p className="mb-6 text-blue-100">
            고객지원팀에 문의하시면 빠르게 도와드리겠습니다
          </p>
          <Link
            href="/support/contact"
            className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition font-semibold"
          >
            문의하기
          </Link>
        </div>
      </div>
    </div>
  );
}
