'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ArrowLeft, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import { updatePassword } from '@/lib/supabase/profile';

export default function PasswordSettingsPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [errors, setErrors] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  function validatePassword(password: string): string {
    if (password.length < 8) {
      return '비밀번호는 최소 8자 이상이어야 합니다.';
    }
    if (!/[A-Za-z]/.test(password)) {
      return '비밀번호는 최소 하나의 영문자를 포함해야 합니다.';
    }
    if (!/[0-9]/.test(password)) {
      return '비밀번호는 최소 하나의 숫자를 포함해야 합니다.';
    }
    return '';
  }

  function handleNewPasswordChange(value: string) {
    setNewPassword(value);
    const error = validatePassword(value);
    setErrors(prev => ({ ...prev, newPassword: error }));
  }

  function handleConfirmPasswordChange(value: string) {
    setConfirmPassword(value);
    const error = value !== newPassword ? '비밀번호가 일치하지 않습니다.' : '';
    setErrors(prev => ({ ...prev, confirmPassword: error }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!user) {
      router.push('/auth');
      return;
    }

    // Validate
    const newPasswordError = validatePassword(newPassword);
    if (newPasswordError) {
      setErrors(prev => ({ ...prev, newPassword: newPasswordError }));
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: '비밀번호가 일치하지 않습니다.' }));
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      await updatePassword(newPassword);
      setMessage({ type: 'success', text: '비밀번호가 성공적으로 변경되었습니다!' });

      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Failed to update password:', error);
      setMessage({
        type: 'error',
        text: error.message || '비밀번호 변경 중 오류가 발생했습니다.'
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
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
            <Lock className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold">비밀번호 변경</h1>
          </div>
          <p className="text-gray-600">안전한 비밀번호로 계정을 보호하세요</p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <Check className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <p
              className={`text-sm font-semibold ${
                message.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}
            >
              {message.text}
            </p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                새 비밀번호 *
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => handleNewPasswordChange(e.target.value)}
                  placeholder="새 비밀번호를 입력하세요"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 ${
                    errors.newPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-xs text-red-600 mt-1">{errors.newPassword}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                최소 8자, 영문자와 숫자를 포함해야 합니다
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                비밀번호 확인 *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  placeholder="비밀번호를 다시 입력하세요"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2 text-sm">비밀번호 요구사항:</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${newPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-400'}`} />
                  최소 8자 이상
                </li>
                <li className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${/[A-Za-z]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-400'}`} />
                  영문자 포함
                </li>
                <li className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${/[0-9]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-400'}`} />
                  숫자 포함
                </li>
                <li className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${newPassword && newPassword === confirmPassword ? 'bg-green-500' : 'bg-gray-400'}`} />
                  비밀번호 일치
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isLoading || !!errors.newPassword || !!errors.confirmPassword}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? '변경 중...' : '비밀번호 변경'}
              </button>
            </div>
          </form>
        </div>

        {/* Security Tips */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600" />
            보안 팁
          </h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>다른 사이트에서 사용하지 않는 고유한 비밀번호를 사용하세요</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>정기적으로 비밀번호를 변경하는 것이 좋습니다</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>개인정보(이름, 생일 등)를 비밀번호에 포함하지 마세요</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>대문자, 소문자, 숫자, 특수문자를 조합하면 더 안전합니다</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
