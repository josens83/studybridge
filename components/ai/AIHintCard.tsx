'use client';

import { useState } from 'react';
import { Lightbulb, Loader2, Sparkles } from 'lucide-react';

interface AIHintCardProps {
  question: string;
  subject: string;
  gradeLevel: string;
}

interface Hint {
  hint: string;
  concepts: string[];
  relatedTopics: string[];
}

export default function AIHintCard({ question, subject, gradeLevel }: AIHintCardProps) {
  const [hint, setHint] = useState<Hint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);

  const fetchHint = async () => {
    if (hint) {
      setShowHint(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/hint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          subject,
          gradeLevel,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setHint(data);
        setShowHint(true);
      } else {
        setError(data.error || 'AI 힌트를 가져올 수 없습니다.');
      }
    } catch (err) {
      console.error('Error fetching AI hint:', err);
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg">AI 학습 도우미</h3>
          <p className="text-sm text-gray-600">스스로 생각할 수 있도록 힌트를 제공합니다</p>
        </div>
      </div>

      {!showHint && !loading && (
        <button
          onClick={fetchHint}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition font-semibold flex items-center justify-center gap-2"
        >
          <Lightbulb className="w-5 h-5" />
          AI 힌트 받기
        </button>
      )}

      {loading && (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-2" />
          <p className="text-gray-600">AI가 힌트를 생성하는 중...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {showHint && hint && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <div className="flex items-start gap-2 mb-2">
              <Lightbulb className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold mb-2">힌트</h4>
                <p className="text-gray-700">{hint.hint}</p>
              </div>
            </div>
          </div>

          {hint.concepts && hint.concepts.length > 0 && (
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold mb-2">핵심 개념</h4>
              <div className="flex flex-wrap gap-2">
                {hint.concepts.map((concept, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </div>
          )}

          {hint.relatedTopics && hint.relatedTopics.length > 0 && (
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <h4 className="font-semibold mb-2">관련 주제</h4>
              <ul className="space-y-1">
                {hint.relatedTopics.map((topic, index) => (
                  <li key={index} className="text-gray-700 text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    {topic}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={() => setShowHint(false)}
            className="text-sm text-purple-600 hover:text-purple-700 font-semibold"
          >
            힌트 숨기기
          </button>
        </div>
      )}
    </div>
  );
}
