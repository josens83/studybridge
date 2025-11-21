'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Upload, X, Coins, AlertCircle, Loader2 } from 'lucide-react';
import { SUBJECTS, GRADE_LEVELS, QUESTION_COIN_COST } from '@/lib/utils/constants';
import { useAuthStore } from '@/lib/store/auth';
import { createQuestion } from '@/lib/supabase/questions';
import { uploadImages } from '@/lib/supabase/storage';
import ErrorBoundary from '@/components/error/ErrorBoundary';
import { logError } from '@/lib/error-logging';

type UrgencyLevel = 'normal' | 'important' | 'urgent';

function AskQuestionPageContent() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState<string>('');
  const [gradeLevel, setGradeLevel] = useState<string>('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('normal');
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const coinCost = QUESTION_COIN_COST[urgency];

  useEffect(() => {
    // Redirect if not authenticated
    if (!user) {
      router.push('/auth');
    }

    // Check if user has enough coins
    if (user && user.coins < coinCost) {
      setError(`코인이 부족합니다. 필요한 코인: ${coinCost}, 보유 코인: ${user.coins}`);
    } else {
      setError(null);
    }
  }, [user, coinCost, router]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = [...images, ...files].slice(0, 5);

    setImages(newImages);

    // Generate previews
    const newPreviews = newImages.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);

    // Revoke old URL
    URL.revokeObjectURL(previews[index]);

    setImages(newImages);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('로그인이 필요합니다.');
      return;
    }

    if (user.coins < coinCost) {
      setError(`코인이 부족합니다. 필요한 코인: ${coinCost}, 보유 코인: ${user.coins}`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Upload images first
      let imageUrls: string[] = [];
      if (images.length > 0) {
        imageUrls = await uploadImages(images, user.id);
      }

      // Create question
      const question = await createQuestion({
        author_id: user.id,
        author_nickname: user.nickname,
        title,
        content,
        subject,
        grade_level: gradeLevel,
        image_urls: imageUrls,
        coins_reward: coinCost,
        is_urgent: urgency === 'urgent',
      });

      // Clean up
      previews.forEach((url) => URL.revokeObjectURL(url));

      // Redirect to question detail
      router.push(`/question/${question.id}`);
    } catch (error: any) {
      console.error('Error submitting question:', error);
      setError(error.message || '질문 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = title && content && subject && gradeLevel && user && user.coins >= coinCost;

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold mb-2">질문하기</h1>
          <p className="text-gray-600 mb-8">
            궁금한 점을 질문하고 전문가의 답변을 받아보세요
          </p>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 mb-6">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="질문 제목을 입력하세요"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Subject and Grade */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  과목 <span className="text-red-500">*</span>
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">과목 선택</option>
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  학년 <span className="text-red-500">*</span>
                </label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">학년 선택</option>
                  {GRADE_LEVELS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                질문 내용 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="질문 내용을 자세히 작성해주세요"
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                이미지 첨부 (선택, 최대 5개)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={isSubmitting || images.length >= 5}
                />
                <label
                  htmlFor="image-upload"
                  className={`cursor-pointer flex flex-col items-center ${
                    isSubmitting || images.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Upload className="w-12 h-12 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    클릭하여 이미지 업로드
                  </span>
                </label>
              </div>

              {/* Image Preview */}
              {previews.length > 0 && (
                <div className="grid grid-cols-5 gap-2 mt-4">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <div className="relative w-full h-20 rounded overflow-hidden">
                        <Image
                          src={preview}
                          alt={`Upload ${index + 1}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      {!isSubmitting && (
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Urgency */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                긴급도
              </label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: 'normal', label: '일반', coins: QUESTION_COIN_COST.normal },
                  { value: 'important', label: '중요', coins: QUESTION_COIN_COST.important },
                  { value: 'urgent', label: '긴급', coins: QUESTION_COIN_COST.urgent },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`
                      border-2 rounded-lg p-4 cursor-pointer transition
                      ${
                        urgency === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-300'
                      }
                      ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <input
                      type="radio"
                      name="urgency"
                      value={option.value}
                      checked={urgency === option.value}
                      onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                      className="hidden"
                      disabled={isSubmitting}
                    />
                    <div className="text-center">
                      <div className="font-semibold">{option.label}</div>
                      <div className="text-sm text-gray-600 flex items-center justify-center gap-1 mt-1">
                        <Coins className="w-4 h-4" />
                        {option.coins}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                긴급도가 높을수록 더 빠른 답변을 받을 수 있습니다
              </p>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm">
                <span className="font-semibold">소모 코인:</span>{' '}
                <span className="text-blue-600 font-bold">{coinCost}</span>
                <span className="text-gray-600 ml-2">(보유: {user.coins})</span>
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>등록 중...</span>
                    </>
                  ) : (
                    <span>질문 등록</span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AskQuestionPage() {
  const { user } = useAuthStore();

  return (
    <ErrorBoundary
      level="page"
      onError={(error, errorInfo) => {
        logError(error, errorInfo, {
          userId: user?.id,
          severity: 'high',
          additionalData: { page: 'ask' },
        });
      }}
    >
      <AskQuestionPageContent />
    </ErrorBoundary>
  );
}
