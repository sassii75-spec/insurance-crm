"use client";

import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import AuthWrapper from "@/components/layout/AuthWrapper";
import KakaoProvider from "@/components/KakaoProvider";
import { Suspense } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <title>InsurePro - 모바일 영업 지도</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body>
        <KakaoProvider>
          <AuthProvider>
            <Suspense fallback={<div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>}>
              <AuthWrapper>
                {children}
              </AuthWrapper>
            </Suspense>
          </AuthProvider>
        </KakaoProvider>
      </body>
    </html>
  );
}
