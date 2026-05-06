"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Map as MapIcon, Users, Calendar, BarChart, Settings, ShieldCheck, LogOut } from 'lucide-react';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>InsurePro</div>
        <span className={styles.logoText}>영업 관리 시스템</span>
      </div>

      <div className={styles.navGroup}>
        <div className={styles.navTitle}>영업 관리 (FC)</div>
        <nav className={styles.nav}>
          <Link href="/sales/dashboard" className={`${styles.navItem} ${pathname.includes('dashboard') ? styles.active : ''}`}>
            <MapIcon className={styles.icon} size={20} />
            <span>영업 지도</span>
          </Link>
          <Link href="/sales/clients" className={`${styles.navItem} ${pathname.includes('clients') ? styles.active : ''}`}>
            <Users className={styles.icon} size={20} />
            <span>고객 목록</span>
          </Link>
          <Link href="/sales/calendar" className={`${styles.navItem} ${pathname.includes('calendar') ? styles.active : ''}`}>
            <Calendar className={styles.icon} size={20} />
            <span>일정 관리</span>
          </Link>
          <Link href="/sales/stats" className={`${styles.navItem} ${pathname.includes('stats') ? styles.active : ''}`}>
            <BarChart className={styles.icon} size={20} />
            <span>통계 및 대시보드</span>
          </Link>
        </nav>
      </div>

      {user?.role === 'admin' && (
        <div className={styles.navGroup}>
          <div className={styles.navTitle}>관리자 (Manager)</div>
          <nav className={styles.nav}>
            <Link href="/admin/users" className={`${styles.navItem} ${pathname.includes('admin/users') ? styles.active : ''}`}>
              <ShieldCheck className={styles.icon} size={20} />
              <span>사용자 관리</span>
            </Link>
          </nav>
        </div>
      )}

      <div className={styles.bottomNav}>
        <button className={styles.navItem} onClick={logout} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <LogOut className={styles.icon} size={20} />
          <span>로그아웃</span>
        </button>
      </div>
    </aside>
  );
}
