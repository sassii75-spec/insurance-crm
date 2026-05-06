import type { Metadata, Viewport } from 'next';
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import AuthWrapper from "@/components/layout/AuthWrapper";
import { Suspense } from "react";

export const metadata: Metadata = {
  metadataBase: new URL('https://insurepro.shop'),
  title: "InsurePro - 모바일 영업 지도",
  description: "모바일 환경에 최적화된 보험 영업 관리 시스템",
  openGraph: {
    title: "InsurePro - 모바일 영업 지도",
    description: "모바일 환경에 최적화된 보험 영업 관리 시스템",
    url: 'https://insurepro.shop',
    siteName: 'InsurePro',
    locale: 'ko_KR',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>
          <Suspense fallback={<div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>}>
            <AuthWrapper>
              {children}
            </AuthWrapper>
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}
