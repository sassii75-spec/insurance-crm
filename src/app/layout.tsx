"use client";

import "./globals.css";
import styles from "./Layout.module.css";
import { Search, Map as MapIcon, Users, Calendar, Settings, BarChart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import 'leaflet/dist/leaflet.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <html lang="ko">
      <head>
        <title>InsurePro - 모바일 영업 지도</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body>
        <div className={styles.mainLayout}>
          
          <div className={styles.contentWrapper}>
            {/* 상단 플로팅 검색바 (모바일용) */}
            <header className={styles.floatingHeader}>
              <Search size={20} style={{ color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="고객 이름, 주소 검색" 
                className={styles.searchInput} 
              />
            </header>
            
            {/* 메인 지도 콘텐츠 영역 */}
            {children}
          </div>

          {/* 하단 내비게이션 (Bottom Navigation) */}
          <nav className={styles.bottomNav}>
            <Link href="/sales/dashboard" className={`${styles.navItem} ${pathname.includes('dashboard') || pathname.includes('map') ? styles.active : ''}`}>
              <MapIcon size={24} />
              <span>지도</span>
            </Link>
            <Link href="/sales/clients" className={`${styles.navItem} ${pathname.includes('clients') ? styles.active : ''}`}>
              <Users size={24} />
              <span>고객목록</span>
            </Link>
            <Link href="/sales/calendar" className={`${styles.navItem} ${pathname.includes('calendar') ? styles.active : ''}`}>
              <Calendar size={24} />
              <span>일정</span>
            </Link>
            <Link href="/sales/stats" className={`${styles.navItem} ${pathname.includes('stats') ? styles.active : ''}`}>
              <BarChart size={24} />
              <span>대시보드</span>
            </Link>
          </nav>

        </div>
      </body>
    </html>
  );
}
