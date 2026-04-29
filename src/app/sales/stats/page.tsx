"use client";

import { useState } from 'react';
import styles from './Stats.module.css';
import { useClients, Client } from '@/hooks/useClients';
import { TrendingUp, Users, Gift, MessageSquare, DollarSign, X, UserPlus } from 'lucide-react';

export default function StatsDashboard() {
  const { clients, isLoaded } = useClients();
  const [modalType, setModalType] = useState<'contracts' | 'meetings' | 'gifts' | 'consultations' | 'new_clients' | null>(null);

  if (!isLoaded) return <div className={styles.container}>데이터를 불러오는 중입니다...</div>;

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`; // e.g., "2024-04"

  // 1. Contracts & Amount
  const contractClients = clients.filter(c => c.contractDate && c.contractDate.startsWith(currentMonthStr));
  const totalContractAmount = contractClients.reduce((sum, c) => sum + (c.contractAmount || 0), 0);

  // 2. Meetings
  const meetingClients = clients.filter(c => c.lastMeetingDate && c.lastMeetingDate.startsWith(currentMonthStr));

  // 3. Gifts
  const giftClients = clients.filter(c => c.gifts && c.gifts.some(g => g.date.startsWith(currentMonthStr)));

  // 4. Consultations
  const consultationClients = clients.filter(c => c.consultations && c.consultations.some(cst => cst.date.startsWith(currentMonthStr)));

  // 5. New Clients
  const newlyRegisteredClients = clients.filter(c => {
    const timestamp = parseInt(c.id);
    if (isNaN(timestamp) || timestamp < 1000000000000) return false; // Ignore hardcoded small ids like '1', '2'
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` === currentMonthStr;
  });

  const handleCardClick = (type: 'contracts' | 'meetings' | 'gifts' | 'consultations' | 'new_clients') => {
    setModalType(type);
  };

  const getModalTitle = () => {
    switch (modalType) {
      case 'contracts': return '이번 달 계약 내역';
      case 'meetings': return '이번 달 미팅 고객';
      case 'gifts': return '이번 달 선물 발송 내역';
      case 'consultations': return '이번 달 상담 내역';
      case 'new_clients': return '이번 달 신규 등록 고객';
      default: return '';
    }
  };

  const renderModalContent = () => {
    switch (modalType) {
      case 'contracts':
        return contractClients.length > 0 ? contractClients.map(c => (
          <div key={c.id} className={styles.detailItem}>
            <div className={styles.detailHeader}>
              <span className={styles.detailName}>{c.name} 고객</span>
              <span className={styles.detailDate}>{c.contractDate}</span>
            </div>
            <div className={styles.detailContent}>
              계약 금액: {c.contractAmount?.toLocaleString() || 0}원<br/>
              상품: {c.products.join(', ')}
            </div>
          </div>
        )) : <div className={styles.emptyState}>이번 달 계약 내역이 없습니다.</div>;
      case 'meetings':
        return meetingClients.length > 0 ? meetingClients.map(c => (
          <div key={c.id} className={styles.detailItem}>
            <div className={styles.detailHeader}>
              <span className={styles.detailName}>{c.name} 고객</span>
              <span className={styles.detailDate}>{c.lastMeetingDate}</span>
            </div>
          </div>
        )) : <div className={styles.emptyState}>이번 달 미팅 내역이 없습니다.</div>;
      case 'gifts':
        return giftClients.length > 0 ? giftClients.map(c => {
          const thisMonthGifts = c.gifts!.filter(g => g.date.startsWith(currentMonthStr));
          return thisMonthGifts.map(g => (
            <div key={g.id} className={styles.detailItem}>
              <div className={styles.detailHeader}>
                <span className={styles.detailName}>{c.name} 고객</span>
                <span className={styles.detailDate}>{g.date}</span>
              </div>
              <div className={styles.detailContent}>
                선물: {g.item}<br/>
                {g.trackingNumber && `송장번호: ${g.trackingNumber}`}
              </div>
            </div>
          ));
        }) : <div className={styles.emptyState}>이번 달 선물 발송 내역이 없습니다.</div>;
      case 'consultations':
        return consultationClients.length > 0 ? consultationClients.map(c => {
          const thisMonthConsultations = c.consultations!.filter(cst => cst.date.startsWith(currentMonthStr));
          return thisMonthConsultations.map(cst => (
            <div key={cst.id} className={styles.detailItem}>
              <div className={styles.detailHeader}>
                <span className={styles.detailName}>{c.name} 고객</span>
                <span className={styles.detailDate}>{cst.date}</span>
              </div>
              <div className={styles.detailContent}>
                {cst.content}
              </div>
            </div>
          ));
        }) : <div className={styles.emptyState}>이번 달 상담 내역이 없습니다.</div>;
      case 'new_clients':
        return newlyRegisteredClients.length > 0 ? newlyRegisteredClients.map(c => {
          const date = new Date(parseInt(c.id));
          const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          return (
            <div key={c.id} className={styles.detailItem}>
              <div className={styles.detailHeader}>
                <span className={styles.detailName}>{c.name} 고객</span>
                <span className={styles.detailDate}>{dateStr} 등록</span>
              </div>
              <div className={styles.detailContent}>
                연락처: {c.mobile}<br/>
                상태: {c.status === 'active' ? '계약중' : c.status === 'opportunity' ? '기회고객' : '해지고객'}
              </div>
            </div>
          );
        }) : <div className={styles.emptyState}>이번 달 신규 등록된 고객이 없습니다.</div>;
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>실적 대시보드</h1>
        <p className={styles.subtitle}>{now.getFullYear()}년 {now.getMonth() + 1}월 활동 통계</p>
      </div>

      <div className={styles.grid}>
        <div className={`${styles.card} ${styles.cardFull}`} onClick={() => handleCardClick('contracts')}>
          <div className={styles.cardIcon}>
            <DollarSign size={24} />
          </div>
          <div className={styles.cardLabel}>이번 달 계약 총액 ({contractClients.length}건)</div>
          <div className={styles.cardValue}>
            {totalContractAmount.toLocaleString()} <span className={styles.unit}>원</span>
          </div>
        </div>

        <div className={styles.card} onClick={() => handleCardClick('meetings')}>
          <div className={styles.cardIcon} style={{ background: '#fef3c7', color: '#d97706' }}>
            <Users size={20} />
          </div>
          <div className={styles.cardLabel}>이번 달 미팅</div>
          <div className={styles.cardValue}>
            {meetingClients.length} <span className={styles.unit}>건</span>
          </div>
        </div>

        <div className={styles.card} onClick={() => handleCardClick('gifts')}>
          <div className={styles.cardIcon} style={{ background: '#fce7f3', color: '#db2777' }}>
            <Gift size={20} />
          </div>
          <div className={styles.cardLabel}>이번 달 선물</div>
          <div className={styles.cardValue}>
            {giftClients.reduce((acc, c) => acc + c.gifts!.filter(g => g.date.startsWith(currentMonthStr)).length, 0)} <span className={styles.unit}>건</span>
          </div>
        </div>

        <div className={styles.card} onClick={() => handleCardClick('consultations')}>
          <div className={styles.cardIcon} style={{ background: '#e0e7ff', color: '#4f46e5' }}>
            <MessageSquare size={20} />
          </div>
          <div className={styles.cardLabel}>이번 달 상담</div>
          <div className={styles.cardValue}>
            {consultationClients.reduce((acc, c) => acc + c.consultations!.filter(cst => cst.date.startsWith(currentMonthStr)).length, 0)} <span className={styles.unit}>건</span>
          </div>
        </div>

        <div className={styles.card} onClick={() => handleCardClick('new_clients')}>
          <div className={styles.cardIcon} style={{ background: '#dcfce7', color: '#16a34a' }}>
            <UserPlus size={20} />
          </div>
          <div className={styles.cardLabel}>이번 달 신규 등록</div>
          <div className={styles.cardValue}>
            {newlyRegisteredClients.length} <span className={styles.unit}>명</span>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {modalType && (
        <div className={styles.modalOverlay} onClick={() => setModalType(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>{getModalTitle()}</span>
              <button className={styles.modalClose} onClick={() => setModalType(null)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              {renderModalContent()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
