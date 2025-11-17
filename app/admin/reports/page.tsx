'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle, Eye, MessageSquare, MessageCircle, User } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import { isAdmin, getReports, updateReportStatus, Report, blockUser, deleteQuestion, deleteAnswer } from '@/lib/supabase/admin';
import { REPORT_REASONS } from '@/lib/supabase/reports';

export default function AdminReportsPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewing' | 'resolved' | 'dismissed'>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNote, setAdminNote] = useState('');

  useEffect(() => {
    async function checkAuth() {
      if (!user) {
        router.push('/auth');
        return;
      }

      const adminStatus = await isAdmin(user.id);
      if (!adminStatus) {
        alert('관리자 권한이 필요합니다.');
        router.push('/');
        return;
      }

      loadReports();
    }

    checkAuth();
  }, [user, router, filter]);

  async function loadReports() {
    setLoading(true);
    try {
      const data = await getReports(filter === 'all' ? undefined : filter);
      setReports(data);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus(
    reportId: string,
    status: 'reviewing' | 'resolved' | 'dismissed'
  ) {
    if (!confirm(`이 신고를 "${getStatusLabel(status)}" 상태로 변경하시겠습니까?`)) {
      return;
    }

    setActionLoading(true);
    try {
      await updateReportStatus(reportId, status, adminNote || undefined);
      alert('신고 상태가 업데이트되었습니다.');
      setSelectedReport(null);
      setAdminNote('');
      loadReports();
    } catch (error) {
      alert('상태 업데이트 중 오류가 발생했습니다.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleBlockUser(userId: string, reason: string) {
    if (!user || !confirm('이 사용자를 차단하시겠습니까?')) {
      return;
    }

    setActionLoading(true);
    try {
      await blockUser(userId, reason, user.id);
      alert('사용자가 차단되었습니다.');
    } catch (error) {
      alert('사용자 차단 중 오류가 발생했습니다.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteContent(report: Report) {
    if (!confirm('이 콘텐츠를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    setActionLoading(true);
    try {
      if (report.content_type === 'question') {
        await deleteQuestion(report.content_id);
      } else if (report.content_type === 'answer') {
        await deleteAnswer(report.content_id);
      }
      alert('콘텐츠가 삭제되었습니다.');
      await updateReportStatus(report.id, 'resolved', '콘텐츠 삭제 완료');
      loadReports();
    } catch (error) {
      alert('콘텐츠 삭제 중 오류가 발생했습니다.');
    } finally {
      setActionLoading(false);
    }
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case 'pending':
        return '대기중';
      case 'reviewing':
        return '검토중';
      case 'resolved':
        return '처리완료';
      case 'dismissed':
        return '기각';
      default:
        return status;
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'reviewing':
        return 'bg-blue-100 text-blue-700';
      case 'resolved':
        return 'bg-green-100 text-green-700';
      case 'dismissed':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  function getContentTypeIcon(type: string) {
    switch (type) {
      case 'question':
        return <MessageSquare className="w-4 h-4" />;
      case 'answer':
        return <MessageCircle className="w-4 h-4" />;
      case 'user':
        return <User className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  }

  function getReasonLabel(reason: string) {
    const reasonObj = REPORT_REASONS.find((r) => r.value === reason);
    return reasonObj?.label || reason;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">신고 관리</h1>
              <p className="text-gray-600 mt-1">사용자 신고 검토 및 처리</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 필터 */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            {(['all', 'pending', 'reviewing', 'resolved', 'dismissed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? '전체' : getStatusLabel(f)}
              </button>
            ))}
          </div>
        </div>

        {/* 신고 목록 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">신고가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      {getContentTypeIcon(report.content_type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(report.status)}`}>
                          {getStatusLabel(report.status)}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                          {report.content_type === 'question'
                            ? '질문'
                            : report.content_type === 'answer'
                            ? '답변'
                            : '사용자'}
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg text-gray-900">
                        {getReasonLabel(report.reason)}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        신고자: <span className="font-semibold">{report.reporter_nickname}</span> →
                        피신고자: <span className="font-semibold text-red-600">{report.reported_user_nickname}</span>
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(report.created_at).toLocaleString('ko-KR')}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedReport(selectedReport?.id === report.id ? null : report)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition font-semibold flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    {selectedReport?.id === report.id ? '닫기' : '상세보기'}
                  </button>
                </div>

                {report.description && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">신고 내용:</p>
                    <p className="text-gray-700">{report.description}</p>
                  </div>
                )}

                {selectedReport?.id === report.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        관리자 메모
                      </label>
                      <textarea
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={3}
                        placeholder="처리 내용을 입력하세요..."
                      />
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {report.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(report.id, 'reviewing')}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-gray-400"
                        >
                          검토중으로 변경
                        </button>
                      )}

                      <button
                        onClick={() => handleUpdateStatus(report.id, 'resolved')}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold flex items-center gap-2 disabled:bg-gray-400"
                      >
                        <CheckCircle className="w-4 h-4" />
                        처리완료
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(report.id, 'dismissed')}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold flex items-center gap-2 disabled:bg-gray-400"
                      >
                        <XCircle className="w-4 h-4" />
                        기각
                      </button>

                      {report.content_type !== 'user' && (
                        <button
                          onClick={() => handleDeleteContent(report)}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:bg-gray-400"
                        >
                          콘텐츠 삭제
                        </button>
                      )}

                      <button
                        onClick={() => handleBlockUser(report.reported_user_id, report.reason)}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold disabled:bg-gray-400"
                      >
                        사용자 차단
                      </button>

                      <Link
                        href={
                          report.content_type === 'question'
                            ? `/question/${report.content_id}`
                            : '#'
                        }
                        target="_blank"
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
                      >
                        콘텐츠 보기
                      </Link>
                    </div>

                    {report.admin_note && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-semibold text-blue-900 mb-1">이전 처리 내역:</p>
                        <p className="text-blue-800">{report.admin_note}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
