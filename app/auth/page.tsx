'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { signUp, signIn, signInAnonymously } from '@/lib/supabase/auth';
import { useAuthStore } from '@/lib/store/auth';

type AuthMode = 'login' | 'signup';

export default function AuthPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const { profile } = await signUp({ email, password, nickname });
        setUser(profile);
        router.push('/dashboard');
      } else {
        const { profile } = await signIn({ email, password });
        setUser(profile);
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setError(error.message || '인증 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { profile } = await signInAnonymously();
      setUser(profile);
      router.push('/');
    } catch (error: any) {
      console.error('Anonymous login error:', error);
      setError(error.message || '익명 로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <BookOpen className="w-10 h-10 text-blue-600" />
          <span className="text-3xl font-bold text-blue-600">StudyBridge</span>
        </Link>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 font-semibold border-b-2 transition ${
              mode === 'login'
                ? 'border-blue-600 text-blue-600'
                : 'border-gray-200 text-gray-600'
            }`}
          >
            로그인
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 font-semibold border-b-2 transition ${
              mode === 'signup'
                ? 'border-blue-600 text-blue-600'
                : 'border-gray-200 text-gray-600'
            }`}
          >
            회원가입
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-semibold mb-2">닉네임</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="사용할 닉네임을 입력하세요"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-2">이메일</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일을 입력하세요"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">비밀번호</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {mode === 'login' && (
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 text-blue-600" />
                <span>로그인 상태 유지</span>
              </label>
              <Link href="/reset-password" className="text-blue-600 hover:text-blue-700">
                비밀번호 찾기
              </Link>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">또는</span>
          </div>
        </div>

        {/* Anonymous Login */}
        <button
          onClick={handleAnonymousLogin}
          disabled={isLoading}
          className="w-full bg-gray-100 text-gray-900 py-3 rounded-lg hover:bg-gray-200 transition font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          익명으로 시작하기
        </button>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          {mode === 'login' ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}{' '}
          <button
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            {mode === 'login' ? '회원가입' : '로그인'}
          </button>
        </p>
      </div>
    </div>
  );
}
