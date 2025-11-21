'use client';

import { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  level?: 'page' | 'component' | 'critical';
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to backend (we'll implement this separately)
    this.logErrorToBackend(error, errorInfo);
  }

  logErrorToBackend = async (error: Error, errorInfo: React.ErrorInfo) => {
    try {
      // For now, just log to console. We'll add Supabase logging later
      console.log('Error logged:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      });
    } catch (e) {
      console.error('Failed to log error to backend:', e);
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Different UI based on error level
      const { level = 'component' } = this.props;
      const { error } = this.state;

      if (level === 'critical') {
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                치명적인 오류가 발생했습니다
              </h1>
              <p className="text-gray-600 mb-6">
                앱에 예상치 못한 문제가 발생했습니다. 페이지를 새로고침하거나 홈으로 이동해주세요.
              </p>
              {process.env.NODE_ENV === 'development' && error && (
                <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left">
                  <p className="text-sm font-mono text-red-600 break-all">
                    {error.message}
                  </p>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleReload}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <RefreshCw className="w-4 h-4" />
                  새로고침
                </button>
                <Link
                  href="/"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  <Home className="w-4 h-4" />
                  홈으로
                </Link>
              </div>
            </div>
          </div>
        );
      }

      if (level === 'page') {
        return (
          <div className="min-h-[400px] flex items-center justify-center p-8">
            <div className="max-w-lg w-full bg-white rounded-lg border-2 border-red-200 p-8 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                페이지 로딩 중 오류가 발생했습니다
              </h2>
              <p className="text-gray-600 mb-6">
                일시적인 문제일 수 있습니다. 다시 시도해주세요.
              </p>
              {process.env.NODE_ENV === 'development' && error && (
                <div className="bg-gray-100 rounded-lg p-3 mb-6 text-left">
                  <p className="text-xs font-mono text-red-600 break-all">
                    {error.message}
                  </p>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <RefreshCw className="w-4 h-4" />
                  다시 시도
                </button>
                <Link
                  href="/"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  <Home className="w-4 h-4" />
                  홈으로
                </Link>
              </div>
            </div>
          </div>
        );
      }

      // Component level (default)
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1">
                컴포넌트 오류
              </h3>
              <p className="text-sm text-red-700 mb-3">
                이 부분을 표시하는 중 문제가 발생했습니다.
              </p>
              {process.env.NODE_ENV === 'development' && error && (
                <div className="bg-white rounded p-2 mb-3 text-xs font-mono text-red-600 break-all">
                  {error.message}
                </div>
              )}
              <button
                onClick={this.handleReset}
                className="text-sm text-red-600 hover:text-red-700 font-medium underline"
              >
                다시 시도
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
