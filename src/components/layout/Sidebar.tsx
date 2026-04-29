import Link from 'next/link';
import { Home, Users, Briefcase, Calendar, Settings, ShieldCheck } from 'lucide-react';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>InsurePro</div>
        <span className={styles.logoText}>영업 관리 시스템</span>
      </div>

      <div className={styles.navGroup}>
        <div className={styles.navTitle}>영업 관리 (FC)</div>
        <nav className={styles.nav}>
          <Link href="/sales/dashboard" className={styles.navItem}>
            <Home className={styles.icon} size={20} />
            <span>대시보드</span>
          </Link>
          <Link href="/sales/clients" className={styles.navItem}>
            <Users className={styles.icon} size={20} />
            <span>고객 관리</span>
          </Link>
          <Link href="/sales/policies" className={styles.navItem}>
            <Briefcase className={styles.icon} size={20} />
            <span>계약 관리</span>
          </Link>
          <Link href="/sales/calendar" className={styles.navItem}>
            <Calendar className={styles.icon} size={20} />
            <span>일정 관리</span>
          </Link>
        </nav>
      </div>

      <div className={styles.navGroup}>
        <div className={styles.navTitle}>관리자 (Manager)</div>
        <nav className={styles.nav}>
          <Link href="/admin/dashboard" className={styles.navItem}>
            <ShieldCheck className={styles.icon} size={20} />
            <span>관리자 대시보드</span>
          </Link>
          <Link href="/admin/agents" className={styles.navItem}>
            <Users className={styles.icon} size={20} />
            <span>영업자 관리</span>
          </Link>
        </nav>
      </div>

      <div className={styles.bottomNav}>
        <Link href="/settings" className={styles.navItem}>
          <Settings className={styles.icon} size={20} />
          <span>설정</span>
        </Link>
      </div>
    </aside>
  );
}
