"use client";

import { useKakaoLoader } from "react-kakao-maps-sdk";

export default function KakaoProvider({ children }: { children: React.ReactNode }) {
  useKakaoLoader({
    appkey: "78b5881c960d9aa54821f2fa5c611d41",
    libraries: ["services", "clusterer"],
  });
  
  return <>{children}</>;
}
