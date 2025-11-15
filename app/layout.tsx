import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'StudyBridge - 학생과 튜터를 연결하는 숙제 도움 플랫폼',
  description: '질문하고 답변받고, 검증된 튜터와 1:1 매칭까지. 공부가 쉬워지는 곳, StudyBridge',
  keywords: '숙제, 질문, 답변, 튜터, 과외, 학습, 공부, 학생',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
