import styles from "@/components/Dashboard.module.css";
import { TrendingUp, Users, Target, ShieldCheck, MoreHorizontal } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>관리자 대시보드</h1>
          <p className={styles.subtitle}>강남본부 전체 영업 현황입니다.</p>
        </div>
        <button className="btn-primary">리포트 다운로드</button>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>본부 전체 실적 (환산)</span>
            <div className={styles.statIcon}><TrendingUp size={18} /></div>
          </div>
          <div className={styles.statValue}>45,240,000</div>
          <div className={styles.statFooter}>
            <span className={styles.trendUp}>+5.2%</span>
            <span style={{ color: 'var(--text-muted)' }}>지난 달 대비</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>소속 영업자 수</span>
            <div className={styles.statIcon}><Users size={18} /></div>
          </div>
          <div className={styles.statValue}>32 명</div>
          <div className={styles.statFooter}>
            <span style={{ color: 'var(--text-muted)' }}>변동 없음</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>목표 달성률</span>
            <div className={styles.statIcon}><Target size={18} /></div>
          </div>
          <div className={styles.statValue}>85 %</div>
          <div className={styles.statFooter}>
            <span className={styles.trendUp}>목표 순항 중</span>
          </div>
        </div>
      </div>

      <div className={styles.sectionsGrid}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>우수 영업자 TOP 4</h2>
            <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>전체 보기</button>
          </div>
          <div className={styles.list}>
            {['김영업', '박성실', '이도전', '최우수'].map((name, i) => (
              <div key={i} className={styles.listItem}>
                <div className={styles.itemInfo}>
                  <div className={styles.itemAvatar}>{name.charAt(0)}</div>
                  <div className={styles.itemDetails}>
                    <span className={styles.itemName}>{name} FC</span>
                    <span className={styles.itemSub}>달성률 {120 - i * 10}% • 이번 달 {15 - i * 2}건 체결</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span className="badge badge-success">Top {i + 1}</span>
                  <button style={{ color: 'var(--text-muted)' }}><MoreHorizontal size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>시스템 공지사항</h2>
            <ShieldCheck size={20} style={{ color: 'var(--text-muted)' }} />
          </div>
          <div className={styles.list}>
            <div className={styles.listItem} style={{ borderLeft: '4px solid var(--primary)' }}>
              <div className={styles.itemDetails}>
                <span className={styles.itemName}>4월 영업 마감 안내</span>
                <span className={styles.itemSub}>4월 30일 18:00까지 전산 입력 필수</span>
              </div>
            </div>
            <div className={styles.listItem} style={{ borderLeft: '4px solid var(--border)' }}>
              <div className={styles.itemDetails}>
                <span className={styles.itemName}>신상품 출시 교육</span>
                <span className={styles.itemSub}>다음 주 수요일 오전 10시</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
