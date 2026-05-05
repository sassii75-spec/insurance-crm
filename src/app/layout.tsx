"use client";

import "./globals.css";
import 'leaflet/dist/leaflet.css';
import { AuthProvider } from "@/contexts/AuthContext";
import AuthWrapper from "@/components/layout/AuthWrapper";

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
        <AuthProvider>
          <AuthWrapper>
            {children}
          </AuthWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
