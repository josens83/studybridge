import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AuthProvider from '@/components/providers/AuthProvider';
import RealtimeProvider from '@/components/providers/RealtimeProvider';
import GlobalErrorHandler from '@/components/providers/GlobalErrorHandler';
import QueryProvider from '@/components/providers/QueryProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'StudyBridge - 학생과 튜터를 연결하는 숙제 도움 플랫폼',
    template: '%s | StudyBridge',
  },
  description: '질문하고 답변받고, 검증된 튜터와 1:1 매칭까지. 공부가 쉬워지는 곳, StudyBridge. 무제한 질문, AI 도우미, 실시간 답변으로 학습을 도와드립니다.',
  keywords: ['숙제', '질문', '답변', '튜터', '과외', '학습', '공부', '학생', 'Q&A', '온라인 교육', '학습 도우미'],
  authors: [{ name: 'StudyBridge' }],
  creator: 'StudyBridge',
  publisher: 'StudyBridge',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'StudyBridge - 학생과 튜터를 연결하는 숙제 도움 플랫폼',
    description: '질문하고 답변받고, 검증된 튜터와 1:1 매칭까지. 공부가 쉬워지는 곳',
    url: '/',
    siteName: 'StudyBridge',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StudyBridge - 학생과 튜터를 연결하는 숙제 도움 플랫폼',
    description: '질문하고 답변받고, 검증된 튜터와 1:1 매칭까지',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification tokens here when ready
    // google: 'google-site-verification-token',
    // yandex: 'yandex-verification-token',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            <RealtimeProvider>
              <GlobalErrorHandler />
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
              </div>
            </RealtimeProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
