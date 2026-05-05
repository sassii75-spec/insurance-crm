"use client";

import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import AuthWrapper from "@/components/layout/AuthWrapper";
import Script from "next/script";

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
        <Script 
          src="//dapi.kakao.com/v2/maps/sdk.js?appkey=78b5881c960d9aa54821f2fa5c611d41&libraries=services,clusterer&autoload=false" 
          strategy="beforeInteractive" 
        />
      </head>
      <body>
        <AuthProvider>
          <AuthWrapper>
            {children}
          </AuthWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
