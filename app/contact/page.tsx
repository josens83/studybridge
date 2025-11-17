'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 유효성 검사
    if (!formData.name.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('유효한 이메일 주소를 입력해주세요.');
      return;
    }
    if (!formData.category) {
      setError('문의 유형을 선택해주세요.');
      return;
    }
    if (!formData.subject.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }
    if (!formData.message.trim()) {
      setError('문의 내용을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: 실제 API 호출로 대체
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 성공 처리
      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: '',
        message: '',
      });

      // 3초 후 성공 메시지 초기화
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    } catch (err) {
      setError('문의 접수 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">고객센터</h1>
          <p className="text-gray-600 text-lg">
            문의사항이 있으시면 언제든지 연락주세요. 빠르게 답변드리겠습니다.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* 연락처 정보 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">이메일</h3>
                <p className="text-sm text-gray-600">문의 및 지원</p>
              </div>
            </div>
            <a
              href="mailto:support@studybridge.com"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              support@studybridge.com
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Phone className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">전화</h3>
                <p className="text-sm text-gray-600">상담 가능</p>
              </div>
            </div>
            <a
              href="tel:02-1234-5678"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              02-1234-5678
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">운영 시간</h3>
                <p className="text-sm text-gray-600">고객 지원</p>
              </div>
            </div>
            <p className="text-gray-700 font-medium">
              평일 09:00 - 18:00
              <br />
              <span className="text-sm text-gray-600">(주말 및 공휴일 휴무)</span>
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* 문의 양식 */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold mb-6">문의하기</h2>

              {isSubmitted && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-green-800 font-semibold">
                      문의가 접수되었습니다!
                    </p>
                    <p className="text-green-700 text-sm mt-1">
                      입력하신 이메일로 확인 메일을 보내드렸습니다. 영업일 기준 1-2일
                      내로 답변드리겠습니다.
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      이름 *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="홍길동"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      이메일 *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    문의 유형 *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">선택해주세요</option>
                    <option value="general">일반 문의</option>
                    <option value="payment">결제 및 환불</option>
                    <option value="technical">기술 지원</option>
                    <option value="tutor">튜터 신청</option>
                    <option value="report">신고 및 제재</option>
                    <option value="partnership">제휴 문의</option>
                    <option value="other">기타</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    제목 *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="문의 제목을 입력해주세요"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    문의 내용 *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="문의 내용을 자세히 입력해주세요"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-lg flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      전송 중...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      문의하기
                    </>
                  )}
                </button>

                <p className="text-sm text-gray-600 text-center">
                  * 표시는 필수 입력 항목입니다.
                </p>
              </form>
            </div>
          </div>

          {/* 사이드바 정보 */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold mb-4">빠른 도움말</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="/faq"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    자주 묻는 질문 →
                  </a>
                  <p className="text-sm text-gray-600 mt-1">
                    일반적인 질문에 대한 답변을 확인하세요
                  </p>
                </li>
                <li>
                  <a
                    href="/terms"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    이용약관 →
                  </a>
                  <p className="text-sm text-gray-600 mt-1">
                    서비스 이용 규정을 확인하세요
                  </p>
                </li>
                <li>
                  <a
                    href="/privacy"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    개인정보처리방침 →
                  </a>
                  <p className="text-sm text-gray-600 mt-1">
                    개인정보 보호 정책을 확인하세요
                  </p>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
              <h3 className="text-lg font-bold mb-3 text-blue-900">
                긴급한 문의사항이 있으신가요?
              </h3>
              <p className="text-sm text-blue-800 mb-4">
                결제 오류, 계정 문제 등 긴급한 사항은 전화로 문의하시면 더 빠르게
                도움을 받으실 수 있습니다.
              </p>
              <a
                href="tel:02-1234-5678"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                <Phone className="w-4 h-4" />
                전화 상담하기
              </a>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold mb-3">오시는 길</h3>
              <div className="flex items-start gap-2 text-gray-700">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5 text-gray-500" />
                <div>
                  <p className="font-medium">서울시 강남구 테헤란로 123</p>
                  <p className="text-sm text-gray-600 mt-1">
                    StudyBridge 빌딩 5층
                    <br />
                    (지하철 2호선 강남역 3번 출구 도보 5분)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
