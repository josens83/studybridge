import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white mb-4">
              <BookOpen className="w-6 h-6" />
              <span>StudyBridge</span>
            </Link>
            <p className="text-sm">
              학생과 튜터를 연결하는<br />
              숙제 도움 플랫폼
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">서비스</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/questions" className="hover:text-white transition">
                  질문 목록
                </Link>
              </li>
              <li>
                <Link href="/tutoring" className="hover:text-white transition">
                  튜터 매칭
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition">
                  요금제
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-white mb-4">고객지원</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/faq" className="hover:text-white transition">
                  자주 묻는 질문
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  문의하기
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition">
                  이용약관
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition">
                  개인정보처리방침
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">연락처</h3>
            <ul className="space-y-2 text-sm">
              <li>이메일: support@studybridge.com</li>
              <li>전화: 1234-5678</li>
              <li>운영시간: 평일 09:00 - 18:00</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>&copy; 2024 StudyBridge. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
