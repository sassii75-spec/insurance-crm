"use client";

import { useAuth } from "@/contexts/AuthContext";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "@/app/Layout.module.css";
import { Search, Map as MapIcon, Users, Calendar, BarChart, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import Sidebar from "./Sidebar";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    handleResize(); // initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (localSearch) {
      params.set('q', localSearch);
    } else {
      params.delete('q');
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    if (!loading) {
      if (!user && pathname !== '/login') {
        router.push('/login');
      } else if (user && pathname === '/') {
        router.push('/sales/dashboard');
      }
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;
  }

  // If not logged in and on login page, just show children
  if (!user || pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className={styles.mainLayout}>
      {isDesktop && <Sidebar />}

      <div className={styles.contentWrapper}>
        {/* 상단 플로팅 검색바 (모바일용) */}
        <header className={styles.floatingHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Search size={20} style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }} />
            <input 
              type="search" 
              placeholder="이름, 주소 검색 (입력 후 Enter)" 
              className={styles.searchInput} 
              value={localSearch}
              onChange={handleSearch}
            />
          </form>
          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
            <LogOut size={16} /> 로그아웃
          </button>
        </header>
        
        {/* 메인 콘텐츠 영역 */}
        {children}
      </div>

      {/* 하단 내비게이션 (Bottom Navigation) - 모바일용 */}
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
        {user?.role === 'admin' && (
          <Link href="/admin/users" className={`${styles.navItem} ${pathname.includes('admin') ? styles.active : ''}`}>
            <Settings size={24} />
            <span>관리자</span>
          </Link>
        )}
      </nav>
    </div>
  );
}
