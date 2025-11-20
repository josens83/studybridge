'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Book, GraduationCap, Save, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import { updateProfile, isNicknameAvailable, getUserStats } from '@/lib/supabase/profile';
import { SUBJECTS } from '@/lib/utils/constants';

const GRADE_LEVELS = ['초등학교', '중학교', '고등학교', '대학교', '기타'];

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();

  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [subjectsOfInterest, setSubjectsOfInterest] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [nicknameError, setNicknameError] = useState('');

  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalAnswers: 0,
    acceptedAnswers: 0,
    acceptanceRate: 0,
    coinsEarned: 0,
  });

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }

    loadUserData();
  }, [user, router]);

  async function loadUserData() {
    if (!user) return;

    setIsLoading(true);
    try {
      setNickname(user.nickname);
      setBio(user.bio || '');
      setGradeLevel(user.grade_level || '');
      setSubjectsOfInterest(user.subjects_of_interest || []);

      const userStats = await getUserStats(user.id);
      setStats(userStats);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleNicknameChange(value: string) {
    setNickname(value);
    setNicknameError('');

    if (!value.trim()) {
      setNicknameError('닉네임을 입력해주세요.');
      return;
    }

    if (value.length < 2 || value.length > 20) {
      setNicknameError('닉네임은 2-20자 사이여야 합니다.');
      return;
    }

    // Only check availability if nickname changed
    if (value !== user?.nickname) {
      try {
        const available = await isNicknameAvailable(value, user?.id);
        if (!available) {
          setNicknameError('이미 사용 중인 닉네임입니다.');
        }
      } catch (error) {
        console.error('Error checking nickname:', error);
      }
    }
  }

  function toggleSubject(subject: string) {
    setSubjectsOfInterest(prev =>
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  }

  async function handleSave() {
    if (!user) return;

    if (nicknameError) {
      setMessage({ type: 'error', text: '닉네임을 확인해주세요.' });
      return;
    }

    if (!nickname.trim()) {
      setMessage({ type: 'error', text: '닉네임을 입력해주세요.' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const updated = await updateProfile(user.id, {
        nickname: nickname.trim(),
        bio: bio.trim(),
        grade_level: gradeLevel || null,
        subjects_of_interest: subjectsOfInterest.length > 0 ? subjectsOfInterest : null,
      });

      // Update local user state
      setUser({
        ...user,
        nickname: updated.nickname,
        bio: updated.bio,
        grade_level: updated.grade_level,
        subjects_of_interest: updated.subjects_of_interest,
      });

      setMessage({ type: 'success', text: '프로필이 성공적으로 저장되었습니다!' });
    } catch (error) {
      console.error('Failed to update profile:', error);
      setMessage({ type: 'error', text: '프로필 저장 중 오류가 발생했습니다.' });
    } finally {
      setIsSaving(false);
    }
  }

  if (!user) {
    return null;
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
            <User className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold">프로필 설정</h1>
          </div>
          <p className="text-gray-600">내 정보를 수정하고 관리하세요</p>
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

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                기본 정보
              </h2>

              <div className="space-y-4">
                {/* Email (read-only) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    이메일
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">이메일은 변경할 수 없습니다</p>
                </div>

                {/* Nickname */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    닉네임 *
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => handleNicknameChange(e.target.value)}
                    placeholder="닉네임을 입력하세요"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      nicknameError ? 'border-red-500' : 'border-gray-300'
                    }`}
                    maxLength={20}
                  />
                  {nicknameError && (
                    <p className="text-xs text-red-600 mt-1">{nicknameError}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">2-20자 사이로 입력하세요</p>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    소개
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="자기소개를 입력하세요"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={4}
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {bio.length}/200자
                  </p>
                </div>
              </div>
            </div>

            {/* Learning Info Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                학습 정보
              </h2>

              <div className="space-y-4">
                {/* Grade Level */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    학년
                  </label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">선택하지 않음</option>
                    {GRADE_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subjects of Interest */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Book className="w-4 h-4" />
                    관심 과목
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SUBJECTS.map((subject) => (
                      <button
                        key={subject}
                        onClick={() => toggleSubject(subject)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                          subjectsOfInterest.includes(subject)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {subject}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    관심있는 과목을 선택하세요 (복수 선택 가능)
                  </p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={isSaving || !!nicknameError}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                {isSaving ? '저장 중...' : '변경사항 저장'}
              </button>
            </div>
          </div>

          {/* Sidebar - Stats */}
          <div className="space-y-6">
            {/* User Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold mb-4">내 활동 통계</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">질문한 개수</span>
                  <span className="font-bold text-blue-600">{stats.totalQuestions}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">답변한 개수</span>
                  <span className="font-bold text-green-600">{stats.totalAnswers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">채택된 답변</span>
                  <span className="font-bold text-purple-600">{stats.acceptedAnswers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">채택률</span>
                  <span className="font-bold text-orange-600">{stats.acceptanceRate}%</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t">
                  <span className="text-sm text-gray-600">획득 코인</span>
                  <span className="font-bold text-yellow-600">{stats.coinsEarned}</span>
                </div>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold mb-4">계정 정보</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">역할</span>
                  <p className="font-semibold mt-1">
                    {user.role === 'admin' ? '관리자' : user.role === 'tutor' ? '튜터' : '학생'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">구독 상태</span>
                  <p className="font-semibold mt-1">
                    {user.subscription_tier === 'premium' ? '프리미엄' :
                     user.subscription_tier === 'premium_plus' ? '프리미엄 플러스' : '무료'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">보유 코인</span>
                  <p className="font-semibold mt-1 text-yellow-600">{user.coins}</p>
                </div>
                <div>
                  <span className="text-gray-600">보유 포인트</span>
                  <p className="font-semibold mt-1 text-blue-600">{user.points}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
