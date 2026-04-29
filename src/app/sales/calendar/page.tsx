"use client";

import { useState, useMemo } from 'react';
import styles from './Calendar.module.css';
import { useClients } from '@/hooks/useClients';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ExternalLink } from 'lucide-react';

type EventType = 'meeting' | 'consultation' | 'new_client' | 'gift' | 'contract';

interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  type: EventType;
  title: string;
  content: string;
  clientId: string;
}

export default function CalendarPage() {
  const { clients, isLoaded } = useClients();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  const getGoogleCalendarLink = (event: CalendarEvent) => {
    const dateStr = event.date.replace(/-/g, '');
    const url = new URL('https://calendar.google.com/calendar/r/eventedit');
    url.searchParams.append('text', event.title);
    // Google Calendar expects basic format for all-day or specific times. 
    // We'll set it as a 1-hour event at 9 AM UTC just to make it a discrete event block.
    url.searchParams.append('dates', `${dateStr}T090000Z/${dateStr}T100000Z`);
    url.searchParams.append('details', event.content);
    return url.toString();
  };

  // 1. Aggregate all events
  const allEvents = useMemo(() => {
    const events: CalendarEvent[] = [];
    
    clients.forEach(client => {
      // New Client
      const timestamp = parseInt(client.id);
      if (!isNaN(timestamp) && timestamp > 1000000000000) {
        const d = new Date(timestamp);
        events.push({
          id: `new_${client.id}`,
          date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
          type: 'new_client',
          title: `신규 등록: ${client.name} 고객`,
          content: `연락처: ${client.mobile}\n상태: ${client.status}`,
          clientId: client.id
        });
      }

      // Meeting
      if (client.lastMeetingDate) {
        events.push({
          id: `meet_${client.id}`,
          date: client.lastMeetingDate,
          type: 'meeting',
          title: `미팅: ${client.name} 고객`,
          content: `연락처: ${client.mobile}`,
          clientId: client.id
        });
      }

      // Contract
      if (client.contractDate) {
        events.push({
          id: `cont_${client.id}`,
          date: client.contractDate,
          type: 'contract',
          title: `계약 체결: ${client.name} 고객`,
          content: `계약 금액: ${client.contractAmount?.toLocaleString() || 0}원\n상품: ${client.products.join(', ')}`,
          clientId: client.id
        });
      }

      // Consultations
      client.consultations?.forEach(cst => {
        events.push({
          id: `cst_${cst.id}`,
          date: cst.date,
          type: 'consultation',
          title: `상담: ${client.name} 고객`,
          content: cst.content,
          clientId: client.id
        });
      });

      // Gifts
      client.gifts?.forEach(g => {
        events.push({
          id: `gift_${g.id}`,
          date: g.date,
          type: 'gift',
          title: `선물 발송: ${client.name} 고객`,
          content: `선물 내용: ${g.item}\n송장번호: ${g.trackingNumber || '없음'}`,
          clientId: client.id
        });
      });
    });

    return events;
  }, [clients]);

  // 2. Generate Calendar Grid
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const days = [];
  // Empty slots for previous month
  for (let i = 0; i < firstDay; i++) {
    days.push({ empty: true, key: `empty-${i}` });
  }
  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayEvents = allEvents.filter(e => e.date === dateStr);
    days.push({ empty: false, key: dateStr, dateStr, dayNumber: d, events: dayEvents });
  }

  const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;

  const selectedEvents = allEvents.filter(e => e.date === selectedDateStr);

  const getEventStyle = (type: EventType) => {
    switch(type) {
      case 'meeting': return { color: '#ca8a04', bg: '#fefce8', border: '#eab308' };
      case 'consultation': return { color: '#2563eb', bg: '#eff6ff', border: '#3b82f6' };
      case 'new_client': return { color: '#16a34a', bg: '#f0fdf4', border: '#22c55e' };
      case 'gift': return { color: '#db2777', bg: '#fdf2f8', border: '#ec4899' };
      case 'contract': return { color: '#9333ea', bg: '#faf5ff', border: '#a855f7' };
    }
  };

  const getEventDotClass = (type: EventType) => {
    switch(type) {
      case 'meeting': return styles.dotMeeting;
      case 'consultation': return styles.dotConsultation;
      case 'new_client': return styles.dotNewClient;
      case 'gift': return styles.dotGift;
      case 'contract': return styles.dotContract;
    }
  };

  if (!isLoaded) return <div className={styles.container}>데이터를 불러오는 중입니다...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.monthNav}>
          <button className={styles.navBtn} onClick={prevMonth}><ChevronLeft size={20}/></button>
          <div className={styles.monthTitle}>{year}년 {month + 1}월</div>
          <button className={styles.navBtn} onClick={nextMonth}><ChevronRight size={20}/></button>
        </div>
      </div>

      <div className={styles.calendarCard}>
        <div className={styles.weekdays}>
          <div style={{color: '#ef4444'}}>일</div><div>월</div><div>화</div><div>수</div><div>목</div><div>금</div><div style={{color: '#3b82f6'}}>토</div>
        </div>
        <div className={styles.daysGrid}>
          {days.map(day => {
            if (day.empty) return <div key={day.key} className={styles.dayCell}></div>;
            
            const isSelected = selectedDateStr === day.dateStr;
            const isToday = todayStr === day.dateStr;
            
            return (
              <div 
                key={day.key} 
                className={`${styles.dayCell} ${isSelected ? styles.selected : ''} ${isToday && !isSelected ? styles.today : ''}`}
                onClick={() => setSelectedDateStr(day.dateStr!)}
              >
                <div className={styles.dayNumber} style={isToday && !isSelected ? {color: 'var(--primary)', fontWeight: 700} : {}}>{day.dayNumber}</div>
                <div className={styles.dotsContainer}>
                  {/* Show up to 4 dots */}
                  {day.events?.slice(0, 4).map((e, idx) => (
                    <div key={idx} className={`${styles.dot} ${getEventDotClass(e.type)}`} style={isSelected ? {backgroundColor: 'white'} : {}}></div>
                  ))}
                  {day.events && day.events.length > 4 && (
                    <div style={{fontSize: '8px', fontWeight: 'bold', color: isSelected ? 'white' : 'var(--text-muted)'}}>+</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.legend}>
          <div className={styles.legendItem}><div className={`${styles.dot} ${styles.dotMeeting}`}></div> 미팅</div>
          <div className={styles.legendItem}><div className={`${styles.dot} ${styles.dotConsultation}`}></div> 상담</div>
          <div className={styles.legendItem}><div className={`${styles.dot} ${styles.dotContract}`}></div> 계약</div>
          <div className={styles.legendItem}><div className={`${styles.dot} ${styles.dotNewClient}`}></div> 등록</div>
          <div className={styles.legendItem}><div className={`${styles.dot} ${styles.dotGift}`}></div> 선물</div>
        </div>
      </div>

      {selectedDateStr && (
        <div className={styles.detailsSection}>
          <h3 className={styles.detailsTitle}>
            <CalendarIcon size={20} color="var(--primary)"/> {selectedDateStr} 일정
          </h3>
          
          {selectedEvents.length > 0 ? (
            selectedEvents.map(e => {
              const style = getEventStyle(e.type);
              return (
                <div key={e.id} className={styles.eventCard} style={{ borderLeftColor: style.border }}>
                  <div className={styles.eventHeader}>
                    <div className={styles.eventTitle}>
                      <span className={styles.eventBadge} style={{ backgroundColor: style.border }}>
                        {e.type === 'meeting' ? '미팅' : e.type === 'consultation' ? '상담' : e.type === 'contract' ? '계약' : e.type === 'gift' ? '선물' : '신규가입'}
                      </span>
                      {e.title}
                    </div>
                    
                    <a href={getGoogleCalendarLink(e)} target="_blank" rel="noopener noreferrer" className={styles.googleBtn}>
                      구글 캘린더 <ExternalLink size={12} />
                    </a>
                  </div>
                  <div className={styles.eventContent}>
                    {e.content.split('\n').map((line, i) => (
                      <span key={i}>{line}<br/></span>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className={styles.emptyState}>이 날짜에 등록된 일정이 없습니다.</div>
          )}
        </div>
      )}
    </div>
  );
}
