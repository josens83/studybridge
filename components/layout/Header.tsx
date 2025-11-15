'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, BookOpen, Coins, User } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-blue-600">
            <BookOpen className="w-8 h-8" />
            <span>StudyBridge</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/questions" className="text-gray-700 hover:text-blue-600 transition">
              질문 목록
            </Link>
            <Link href="/tutoring" className="text-gray-700 hover:text-blue-600 transition">
              튜터 매칭
            </Link>
            <Link href="/pricing" className="text-gray-700 hover:text-blue-600 transition">
              요금제
            </Link>
            <div className="flex items-center gap-4 ml-4">
              <Link
                href="/ask"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                질문하기
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
              >
                <Coins className="w-5 h-5" />
                <span>1,000</span>
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
              >
                <User className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4">
            <div className="flex flex-col gap-4">
              <Link
                href="/questions"
                className="text-gray-700 hover:text-blue-600 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                질문 목록
              </Link>
              <Link
                href="/tutoring"
                className="text-gray-700 hover:text-blue-600 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                튜터 매칭
              </Link>
              <Link
                href="/pricing"
                className="text-gray-700 hover:text-blue-600 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                요금제
              </Link>
              <Link
                href="/ask"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                질문하기
              </Link>
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-blue-600 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                내 대시보드
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
