import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.kakao.com https://*.daumcdn.net https://*.daum.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://api.dicebear.com https://*.daumcdn.net https://*.kakaocdn.net https://*.kakao.com https://*.daum.net; connect-src 'self' https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://*.kakao.com https://*.daum.net wss://*.firebaseio.com; font-src 'self' data:; frame-src 'self' https://*.kakao.com https://*.daum.net https://*.daumcdn.net;" },
        ],
      },
    ];
  },
};

export default nextConfig;
