'use client';

import { useState } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import {
  createReport,
  REPORT_REASONS,
  type ReportReason,
  type ContentType,
} from '@/lib/supabase/reports';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: ContentType;
  contentId: string;
  reportedUserId: string;
  contentTitle?: string;
}

export default function ReportModal({
  isOpen,
  onClose,
  contentType,
  contentId,
  reportedUserId,
  contentTitle,
}: ReportModalProps) {
  const { user } = useAuthStore();
  const [selectedReason, setSelectedReason] = useState<ReportReason | ''>('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('로그인이 필요합니다.');
      return;
    }

    if (!selectedReason) {
      setError('신고 사유를 선택해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createReport({
        reporter_id: user.id,
        reported_user_id: reportedUserId,
        content_type: contentType,
        content_id: contentId,
        reason: selectedReason as ReportReason,
        description: description.trim() || undefined,
      });

      alert('신고가 접수되었습니다. 검토 후 조치하겠습니다.');
      onClose();
      setSelectedReason('');
      setDescription('');
    } catch (error: any) {
      setError(error.message || '신고 접수 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setSelectedReason('');
      setDescription('');
      setError(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">신고하기</h2>
              {contentTitle && (
                <p className="text-sm text-gray-600 mt-1 truncate max-w-xs">
                  {contentTitle}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Reason Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              신고 사유 <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {REPORT_REASONS.map((reason) => (
                <label
                  key={reason.value}
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition ${
                    selectedReason === reason.value
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reason.value}
                    checked={selectedReason === reason.value}
                    onChange={(e) => setSelectedReason(e.target.value as ReportReason)}
                    className="sr-only"
                  />
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        selectedReason === reason.value
                          ? 'border-red-500 bg-red-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedReason === reason.value && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{reason.label}</div>
                      <div className="text-sm text-gray-600 mt-0.5">{reason.description}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              상세 설명 (선택사항)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="신고 사유에 대한 추가 설명을 입력해주세요..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              rows={4}
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {description.length}/500
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Notice */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-sm text-gray-900 mb-2">안내사항</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• 허위 신고 시 서비스 이용이 제한될 수 있습니다.</li>
              <li>• 신고 내용은 관리자만 확인할 수 있습니다.</li>
              <li>• 검토 결과는 별도로 안내되지 않습니다.</li>
              <li>• 긴급한 경우 고객센터로 직접 문의해주세요.</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!selectedReason || isSubmitting}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  처리 중...
                </>
              ) : (
                '신고하기'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
