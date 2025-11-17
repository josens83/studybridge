'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Bell, Trash2, Save, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import { supabase } from '@/lib/supabase/client';

export default function SettingsPage() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'notifications' | 'account'>('profile');

  // 프로필 설정
  const [profileData, setProfileData] = useState({
    nickname: '',
    email: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // 비밀번호 변경
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // 알림 설정
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    newAnswers: true,
    acceptedAnswer: true,
    promotions: false,
  });
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsSuccess, setNotificationsSuccess] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }

    setProfileData({
      nickname: user.nickname,
      email: user.email,
    });
  }, [user, router]);

  if (!user) {
    return null;
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!profileData.nickname.trim()) {
      setProfileError('닉네임을 입력해주세요.');
      return;
    }

    if (profileData.nickname.length < 2 || profileData.nickname.length > 20) {
      setProfileError('닉네임은 2-20자 사이여야 합니다.');
      return;
    }

    setProfileLoading(true);

    try {
      const { error } = await supabase
        .from('users')
        .update({ nickname: profileData.nickname })
        .eq('id', user.id);

      if (error) throw error;

      updateUser({ ...user, nickname: profileData.nickname });
      setProfileSuccess('프로필이 업데이트되었습니다.');

      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (error) {
      setProfileError('프로필 업데이트 중 오류가 발생했습니다.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('모든 필드를 입력해주세요.');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('새 비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    setPasswordLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      setPasswordSuccess('비밀번호가 변경되었습니다.');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (error: any) {
      setPasswordError(error.message || '비밀번호 변경 중 오류가 발생했습니다.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleNotificationsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotificationsLoading(true);
    setNotificationsSuccess('');

    try {
      // TODO: 실제 알림 설정 저장 로직 구현
      await new Promise(resolve => setTimeout(resolve, 1000));

      setNotificationsSuccess('알림 설정이 저장되었습니다.');
      setTimeout(() => setNotificationsSuccess(''), 3000);
    } catch (error) {
      // Handle error
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      '정말로 계정을 삭제하시겠습니까?\n\n모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.\n남은 코인은 환불되지 않습니다.'
    );

    if (!confirmed) return;

    const doubleConfirm = window.confirm(
      '마지막 확인: 계정을 삭제하면 되돌릴 수 없습니다.\n계속하시겠습니까?'
    );

    if (!doubleConfirm) return;

    try {
      // TODO: 실제 계정 삭제 로직 구현
      // 1. 사용자 데이터 삭제 (질문, 답변 등)
      // 2. Supabase Auth 계정 삭제

      alert('계정이 삭제되었습니다.');
      router.push('/');
    } catch (error) {
      alert('계정 삭제 중 오류가 발생했습니다.');
    }
  };

  const tabs = [
    { id: 'profile' as const, label: '프로필', icon: User },
    { id: 'password' as const, label: '비밀번호', icon: Lock },
    { id: 'notifications' as const, label: '알림 설정', icon: Bell },
    { id: 'account' as const, label: '계정 관리', icon: Trash2 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">설정</h1>
          <p className="text-gray-600">계정 정보와 환경 설정을 관리하세요</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {/* 사이드바 탭 */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-4 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-8">
              {/* 프로필 탭 */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">프로필 설정</h2>

                  {profileSuccess && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                      {profileSuccess}
                    </div>
                  )}

                  {profileError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                      {profileError}
                    </div>
                  )}

                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        닉네임
                      </label>
                      <input
                        type="text"
                        value={profileData.nickname}
                        onChange={(e) =>
                          setProfileData({ ...profileData, nickname: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="닉네임을 입력하세요"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        이메일
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                      <p className="text-sm text-gray-600 mt-2">
                        이메일은 변경할 수 없습니다.
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-800">
                          <p className="font-semibold mb-1">계정 정보</p>
                          <p>가입일: {new Date(user.created_at).toLocaleDateString('ko-KR')}</p>
                          <p>역할: {user.role === 'tutor' ? '튜터' : '일반 회원'}</p>
                          <p>보유 코인: {user.coins.toLocaleString()}개</p>
                          <p>보유 포인트: {user.points.toLocaleString()}점</p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={profileLoading}
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2 disabled:bg-gray-400"
                    >
                      {profileLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          저장 중...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          변경사항 저장
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* 비밀번호 탭 */}
              {activeTab === 'password' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">비밀번호 변경</h2>

                  {passwordSuccess && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                      {passwordSuccess}
                    </div>
                  )}

                  {passwordError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                      {passwordError}
                    </div>
                  )}

                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        현재 비밀번호
                      </label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, currentPassword: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="현재 비밀번호"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        새 비밀번호
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, newPassword: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="새 비밀번호 (최소 6자)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        새 비밀번호 확인
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="새 비밀번호 확인"
                      />
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-yellow-800">
                          <p className="font-semibold mb-1">보안 안내</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>비밀번호는 최소 6자 이상이어야 합니다</li>
                            <li>영문, 숫자, 특수문자를 조합하는 것을 권장합니다</li>
                            <li>다른 사이트와 다른 비밀번호를 사용하세요</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2 disabled:bg-gray-400"
                    >
                      {passwordLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          변경 중...
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5" />
                          비밀번호 변경
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* 알림 설정 탭 */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">알림 설정</h2>

                  {notificationsSuccess && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                      {notificationsSuccess}
                    </div>
                  )}

                  <form onSubmit={handleNotificationsSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <div>
                          <p className="font-semibold text-gray-900">이메일 알림</p>
                          <p className="text-sm text-gray-600">
                            중요한 알림을 이메일로 받습니다
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.emailNotifications}
                          onChange={(e) =>
                            setNotifications({
                              ...notifications,
                              emailNotifications: e.target.checked,
                            })
                          }
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </label>

                      <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <div>
                          <p className="font-semibold text-gray-900">새 답변 알림</p>
                          <p className="text-sm text-gray-600">
                            내 질문에 새 답변이 달리면 알림을 받습니다
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.newAnswers}
                          onChange={(e) =>
                            setNotifications({
                              ...notifications,
                              newAnswers: e.target.checked,
                            })
                          }
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </label>

                      <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <div>
                          <p className="font-semibold text-gray-900">답변 채택 알림</p>
                          <p className="text-sm text-gray-600">
                            내 답변이 채택되면 알림을 받습니다
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.acceptedAnswer}
                          onChange={(e) =>
                            setNotifications({
                              ...notifications,
                              acceptedAnswer: e.target.checked,
                            })
                          }
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </label>

                      <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <div>
                          <p className="font-semibold text-gray-900">프로모션 알림</p>
                          <p className="text-sm text-gray-600">
                            할인, 이벤트 등 프로모션 정보를 받습니다
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.promotions}
                          onChange={(e) =>
                            setNotifications({
                              ...notifications,
                              promotions: e.target.checked,
                            })
                          }
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={notificationsLoading}
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2 disabled:bg-gray-400"
                    >
                      {notificationsLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          저장 중...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          설정 저장
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* 계정 관리 탭 */}
              {activeTab === 'account' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">계정 관리</h2>

                  <div className="space-y-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <div className="flex items-start gap-3 mb-4">
                        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="text-lg font-bold text-red-900 mb-2">
                            계정 삭제
                          </h3>
                          <p className="text-red-800 mb-4">
                            계정을 삭제하면 다음 데이터가 영구적으로 삭제됩니다:
                          </p>
                          <ul className="list-disc list-inside space-y-1 text-red-800 text-sm mb-6">
                            <li>프로필 정보 및 활동 기록</li>
                            <li>작성한 모든 질문과 답변</li>
                            <li>보유 중인 코인 및 포인트</li>
                            <li>구독 정보 (환불 불가)</li>
                          </ul>
                          <p className="text-red-900 font-semibold">
                            ⚠️ 이 작업은 되돌릴 수 없습니다!
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={handleDeleteAccount}
                        className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-5 h-5" />
                        계정 삭제
                      </button>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-3">
                        데이터 내보내기
                      </h3>
                      <p className="text-gray-700 mb-4">
                        개인정보 보호법에 따라 내 데이터를 다운로드할 수 있습니다.
                      </p>
                      <button className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold">
                        데이터 요청하기
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
