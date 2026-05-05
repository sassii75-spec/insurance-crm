"use client";

import { useState, useEffect } from 'react';
import styles from './Clients.module.css';
import { useClients, Client } from '@/hooks/useClients';
import { useAuth } from '@/contexts/AuthContext';
import { FileUp, Plus, ChevronDown, ChevronUp, X, Edit2, Trash2, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import DaumPostcode from 'react-daum-postcode';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function ClientsPage() {
  const { clients, isLoaded, addClient, updateClient, deleteClient, addMultipleClients } = useClients();
  const { user } = useAuth();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  
  // Filter & Sort State
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<string>('default');
  const [filterPlannerId, setFilterPlannerId] = useState<string>('all');
  
  const [planners, setPlanners] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    if (user?.role === 'admin') {
      const fetchPlanners = async () => {
        const snapshot = await getDocs(collection(db, 'users'));
        const loadedPlanners: {id: string, name: string}[] = [];
        snapshot.forEach(doc => {
          loadedPlanners.push({ id: doc.id, name: doc.data().name || doc.id });
        });
        setPlanners(loadedPlanners);
      };
      fetchPlanners();
    }
  }, [user]);

  const getPlannerName = (userId: string | undefined) => {
    if (!userId) return '';
    if (userId === user?.id) return user?.name || userId;
    return planners.find(p => p.id === userId)?.name || userId;
  };

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [formData, setFormData] = useState({
    name: '', age: '', gender: '남', address: '', phone: '', mobile: '', products: '', contractDate: '', contractAmount: 0, lastMeetingDate: '', status: 'active', photo: '', plannerAllocationMonth: '', notes: '',
    consultations: [] as { id: string, date: string, content: string }[],
    gifts: [] as { id: string, date: string, item: string, trackingNumber?: string }[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoaded) return <div style={{ padding: '2rem', textAlign: 'center' }}>데이터 불러오는 중...</div>;

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { range: 2 }) as any[];

      const newClients = data.map(row => ({
        name: row['고객명'] || row['이름'] || '',
        age: String(row['나이'] || ''),
        gender: row['성별'] || '남',
        address: row['주소'] || '',
        phone: String(row['전화번호'] || ''),
        mobile: String(row['핸드폰번호'] || ''),
        products: row['가입상품'] ? String(row['가입상품']).split(',').map(s=>s.trim()) : [],
        contractDate: row['계약일자'] || '',
        lastMeetingDate: row['최근미팅일자'] || '',
        plannerAllocationMonth: row['플래너배분월'] ? String(row['플래너배분월']) : '',
        notes: row['기타'] || '',
        registrationDate: row['등록일자'] || '',
        userId: row['담당플래너'] || '',
        status: (row['상태'] === '계약중' ? 'active' : row['상태'] === '해지' ? 'terminated' : 'opportunity') as 'active'|'opportunity'|'terminated'
      }));

      addMultipleClients(newClients);
      alert(`${newClients.length}명의 고객이 등록되었습니다.`);
    };
    reader.readAsBinaryString(file);
    e.target.value = ''; // Reset
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const openModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name, age: client.age, gender: client.gender, address: client.address, 
        phone: client.phone, mobile: client.mobile, products: client.products.join(', '), 
        contractDate: client.contractDate, contractAmount: client.contractAmount || 0, lastMeetingDate: client.lastMeetingDate, status: client.status,
        photo: client.photo || '',
        plannerAllocationMonth: client.plannerAllocationMonth || '',
        notes: client.notes || '',
        consultations: client.consultations || [],
        gifts: client.gifts || []
      });
    } else {
      setEditingClient(null);
      setFormData({ name: '', age: '', gender: '남', address: '', phone: '', mobile: '', products: '', contractDate: '', contractAmount: 0, lastMeetingDate: '', status: 'active', photo: '', plannerAllocationMonth: '', notes: '', consultations: [], gifts: [] });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const submitData = {
      ...formData,
      status: formData.status as 'active' | 'opportunity' | 'terminated',
      products: formData.products.split(',').map(p => p.trim()).filter(p => p)
    };

    if (editingClient) {
      await updateClient(editingClient.id, submitData);
    } else {
      await addClient(submitData as any);
    }
    setIsSubmitting(false);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`${name} 고객 정보를 정말 삭제하시겠습니까?`)) {
      deleteClient(id);
    }
  };

  const handleExcelDownload = () => {
    const currentCountStr = localStorage.getItem('insurepro_download_count') || '0';
    const nextCount = parseInt(currentCountStr, 10) + 1;
    localStorage.setItem('insurepro_download_count', String(nextCount));

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
    const userId = "admin(영업관리자)";

    const dataRows = displayClients.map(c => ({
      '고객명': c.name,
      '나이': c.age,
      '성별': c.gender,
      '전화번호': c.phone,
      '핸드폰번호': c.mobile,
      '주소': c.address,
      '상태': c.status === 'active' ? '계약중' : c.status === 'opportunity' ? '기회' : '해지',
      '가입상품': c.products.join(', '),
      '계약일자': c.contractDate,
      '최근미팅일자': c.lastMeetingDate,
      '플래너배분월': c.plannerAllocationMonth || '',
      '등록일자': c.registrationDate || '',
      '담당플래너': getPlannerName(c.userId),
      '기타': c.notes || ''
    }));

    const ws = XLSX.utils.json_to_sheet(dataRows, { origin: "A3" } as any);

    XLSX.utils.sheet_add_aoa(ws, [
      ["[보안 안내] 본 문서는 지정된 용도로만 사용 가능하며, 무단 유출 시 법적 책임을 질 수 있습니다."],
      [`다운로드 일시: ${formattedDate} | 사용자 아이디: ${userId} | 누적 다운로드: ${nextCount}회`]
    ], { origin: "A1" });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "고객DB");
    XLSX.writeFile(wb, `고객DB_${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}.xlsx`);
  };

  // Filter & Sort Logic
  let displayClients = [...clients];
  if (filterStatus !== 'all') {
    displayClients = displayClients.filter(c => c.status === filterStatus);
  }
  if (user?.role === 'admin' && filterPlannerId !== 'all') {
    displayClients = displayClients.filter(c => c.userId === filterPlannerId);
  }
  if (sortOrder === 'nameAsc') {
    displayClients.sort((a, b) => a.name.localeCompare(b.name, 'ko-KR'));
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>고객 DB 관리</h1>
        <div className={styles.actions}>
          <button className={styles.downloadBtn} onClick={handleExcelDownload}>
            <Download size={16} /> 엑셀 다운로드
          </button>
          <div className={styles.excelBtn}>
            <FileUp size={16} /> 엑셀 등록
            <input type="file" accept=".xlsx, .xls" className={styles.fileInput} onChange={handleExcelUpload} />
          </div>
        </div>
      </div>

      <div className={styles.filterSection}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>상태 검색</label>
          <div className={styles.radioGroup}>
            <label><input type="radio" name="status" value="all" checked={filterStatus === 'all'} onChange={(e) => setFilterStatus(e.target.value)} /> 전체</label>
            <label><input type="radio" name="status" value="active" checked={filterStatus === 'active'} onChange={(e) => setFilterStatus(e.target.value)} /> 계약중</label>
            <label><input type="radio" name="status" value="opportunity" checked={filterStatus === 'opportunity'} onChange={(e) => setFilterStatus(e.target.value)} /> 기회</label>
            <label><input type="radio" name="status" value="terminated" checked={filterStatus === 'terminated'} onChange={(e) => setFilterStatus(e.target.value)} /> 해지</label>
          </div>
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>정렬 기준</label>
          <div className={styles.radioGroup}>
            <label><input type="radio" name="sort" value="default" checked={sortOrder === 'default'} onChange={(e) => setSortOrder(e.target.value)} /> 등록순</label>
            <label><input type="radio" name="sort" value="nameAsc" checked={sortOrder === 'nameAsc'} onChange={(e) => setSortOrder(e.target.value)} /> 가나다순</label>
          </div>
        </div>
        {user?.role === 'admin' && (
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>담당 플래너</label>
            <select className={styles.selectField} style={{ padding: '0.25rem 0.5rem', width: '120px' }} value={filterPlannerId} onChange={(e) => setFilterPlannerId(e.target.value)}>
              <option value="all">전체</option>
              {planners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className={styles.list}>
        {displayClients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>조건에 맞는 고객이 없습니다.</div>
        ) : (
          displayClients.map(client => (
            <div key={client.id} className={styles.card}>
              <div className={styles.cardHeader} onClick={() => toggleExpand(client.id)}>
                <div className={styles.cardInfo}>
                  <div className={styles.avatar}>
                    {client.photo ? <img src={client.photo} className={styles.avatarImg} alt="profile" /> : client.name.charAt(0)}
                  </div>
                  <div className={styles.nameGroup}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={styles.name}>{client.name}</span>
                      <span className={`${styles.statusBadge} ${styles[client.status]}`}>
                        {client.status === 'active' ? '계약중' : client.status === 'opportunity' ? '기회' : '해지'}
                      </span>
                    </div>
                    <span className={styles.subInfo}>{client.mobile} | {client.address.split(' ').slice(0,2).join(' ')}</span>
                  </div>
                </div>
                {expandedId === client.id ? <ChevronUp size={20} color="var(--text-muted)"/> : <ChevronDown size={20} color="var(--text-muted)"/>}
              </div>

              {expandedId === client.id && (
                <div className={styles.cardDetails}>
                  <div className={styles.detailRow}><div className={styles.detailLabel}>나이/성별</div><div className={styles.detailValue}>{client.age}세 / {client.gender}</div></div>
                  <div className={styles.detailRow}><div className={styles.detailLabel}>전화번호</div><div className={styles.detailValue}>{client.phone || '-'}</div></div>
                  <div className={styles.detailRow}><div className={styles.detailLabel}>핸드폰</div><div className={styles.detailValue}>{client.mobile}</div></div>
                  <div className={styles.detailRow}><div className={styles.detailLabel}>주소</div><div className={styles.detailValue}>{client.address}</div></div>
                  <div className={styles.detailRow}><div className={styles.detailLabel}>가입상품</div><div className={styles.detailValue}>{client.products.join(', ') || '-'}</div></div>
                  <div className={styles.detailRow}><div className={styles.detailLabel}>계약일자</div><div className={styles.detailValue}>{client.contractDate || '-'}</div></div>
                  <div className={styles.detailRow}><div className={styles.detailLabel}>최근미팅</div><div className={styles.detailValue}>{client.lastMeetingDate || '-'}</div></div>
                  <div className={styles.detailRow}><div className={styles.detailLabel}>배분월</div><div className={styles.detailValue}>{client.plannerAllocationMonth || '-'}</div></div>
                  <div className={styles.detailRow}><div className={styles.detailLabel}>등록일자</div><div className={styles.detailValue}>{client.registrationDate || '-'}</div></div>
                  <div className={styles.detailRow}><div className={styles.detailLabel}>담당플래너</div><div className={styles.detailValue}>{getPlannerName(client.userId) || '-'}</div></div>
                  {client.notes && <div className={styles.detailRow}><div className={styles.detailLabel}>기타</div><div className={styles.detailValue}>{client.notes}</div></div>}
                  
                  {client.consultations && client.consultations.length > 0 && (
                    <div className={styles.historySection}>
                      <div className={styles.historyTitle}>상담 히스토리</div>
                      <div className={styles.historyList}>
                        {client.consultations.map(c => (
                          <div key={c.id} className={styles.historyItem}>
                            <div className={styles.historyDate}>{c.date}</div>
                            <div className={styles.historyContent}>{c.content}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {client.gifts && client.gifts.length > 0 && (
                    <div className={styles.historySection}>
                      <div className={styles.historyTitle}>선물 발송 내역</div>
                      <div className={styles.historyList}>
                        {client.gifts.map(g => (
                          <div key={g.id} className={styles.historyItem}>
                            <div className={styles.historyDate}>{g.date}</div>
                            <div className={styles.historyContent}>{g.item}</div>
                            {g.trackingNumber && (
                              <div 
                                className={styles.trackingBtn} 
                                onClick={(e) => { e.stopPropagation(); window.open(`https://trace.cjlogistics.com/next/tracking.html?wblNo=${g.trackingNumber}`, '_blank'); }}
                              >
                                CJ대한통운 조회: {g.trackingNumber}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={styles.cardActions}>
                    <button className={styles.editBtn} onClick={(e) => { e.stopPropagation(); openModal(client); }}><Edit2 size={14}/> 수정</button>
                    <button className={styles.deleteBtn} onClick={(e) => { e.stopPropagation(); handleDelete(client.id, client.name); }}><Trash2 size={14}/> 삭제</button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <button className={styles.fab} onClick={() => openModal()}>
        <Plus size={28} />
      </button>

      {/* Modal / Bottom Sheet */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{editingClient ? '고객 정보 수정' : '신규 고객 등록'}</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={24} color="var(--text-muted)"/></button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className={styles.formGroup} style={{ flex: 1 }}><label>고객명</label><input required className="input-field" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} /></div>
                <div className={styles.formGroup} style={{ width: '80px' }}><label>나이</label><input type="number" className="input-field" value={formData.age} onChange={e=>setFormData({...formData, age: e.target.value})} /></div>
                <div className={styles.formGroup} style={{ width: '80px' }}><label>성별</label>
                  <select className={styles.selectField} value={formData.gender} onChange={e=>setFormData({...formData, gender: e.target.value})}>
                    <option value="남">남</option><option value="여">여</option>
                  </select>
                </div>
              </div>
              
              <div className={styles.formGroup}><label>상태</label>
                <select className={styles.selectField} value={formData.status} onChange={e=>setFormData({...formData, status: e.target.value})}>
                  <option value="active">계약중</option><option value="opportunity">기회고객</option><option value="terminated">해지고객</option>
                </select>
              </div>

              <div className={styles.formGroup}><label>핸드폰 번호</label><input required type="tel" className="input-field" placeholder="010-0000-0000" value={formData.mobile} onChange={e=>setFormData({...formData, mobile: e.target.value})} /></div>
              <div className={styles.formGroup}>
                <label>주소</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input className="input-field" style={{ flex: 1 }} placeholder="주소 검색을 이용하세요" value={formData.address} readOnly />
                  <button type="button" onClick={() => setIsAddressModalOpen(true)} className="btn-primary" style={{ padding: '0 1rem', whiteSpace: 'nowrap' }}>주소 검색</button>
                </div>
              </div>
              <div className={styles.formGroup}><label>가입/관심 상품 (쉼표로 구분)</label><input className="input-field" placeholder="종신보험, 암보험" value={formData.products} onChange={e=>setFormData({...formData, products: e.target.value})} /></div>
              <div className={styles.formGroup}><label>계약 금액(원)</label><input type="number" className="input-field" placeholder="예: 5000000" value={formData.contractAmount} onChange={e=>setFormData({...formData, contractAmount: parseInt(e.target.value) || 0})} /></div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className={styles.formGroup} style={{ flex: 1 }}><label>플래너 배분월</label><input type="text" className="input-field" placeholder="예: 2024년 5월" value={formData.plannerAllocationMonth} onChange={e=>setFormData({...formData, plannerAllocationMonth: e.target.value})} /></div>
              </div>
              <div className={styles.formGroup}><label>기타 (메모)</label><textarea className="input-field" style={{ minHeight: '60px', resize: 'vertical' }} value={formData.notes} onChange={e=>setFormData({...formData, notes: e.target.value})} /></div>

              <div className={styles.formGroup}>
                <label>고객 사진 (선택)</label>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="input-field" style={{ padding: '0.5rem' }} />
                {formData.photo && <img src={formData.photo} alt="Preview" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', marginTop: '0.5rem' }} />}
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className={styles.formGroup} style={{ flex: 1 }}><label>계약일자</label><input type="date" className="input-field" value={formData.contractDate} onChange={e=>setFormData({...formData, contractDate: e.target.value})} /></div>
                <div className={styles.formGroup} style={{ flex: 1 }}><label>최근 미팅</label><input type="date" className="input-field" value={formData.lastMeetingDate} onChange={e=>setFormData({...formData, lastMeetingDate: e.target.value})} /></div>
              </div>

              <div className={styles.formGroup}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <label>상담 히스토리</label>
                  <button type="button" onClick={() => setFormData({...formData, consultations: [...formData.consultations, { id: Date.now().toString(), date: new Date().toISOString().split('T')[0], content: '' }]})} style={{color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600}}>+ 추가</button>
                </div>
                {formData.consultations.map((c, i) => (
                  <div key={c.id} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input type="date" className="input-field" style={{ width: '120px', padding: '0.5rem' }} value={c.date} onChange={e => { const newC = [...formData.consultations]; newC[i].date = e.target.value; setFormData({...formData, consultations: newC}); }} />
                    <input className="input-field" style={{ flex: 1, padding: '0.5rem' }} placeholder="상담 내용" value={c.content} onChange={e => { const newC = [...formData.consultations]; newC[i].content = e.target.value; setFormData({...formData, consultations: newC}); }} />
                    <button type="button" onClick={() => { const newC = formData.consultations.filter(item => item.id !== c.id); setFormData({...formData, consultations: newC}); }}><X size={16} color="var(--danger)"/></button>
                  </div>
                ))}
              </div>

              <div className={styles.formGroup}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <label>선물 발송 내역</label>
                  <button type="button" onClick={() => setFormData({...formData, gifts: [...formData.gifts, { id: Date.now().toString(), date: new Date().toISOString().split('T')[0], item: '', trackingNumber: '' }]})} style={{color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600}}>+ 추가</button>
                </div>
                {formData.gifts.map((g, i) => (
                  <div key={g.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem', border: '1px solid var(--border)', padding: '0.75rem', borderRadius: '4px', background: 'var(--bg-main)' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input type="date" className="input-field" style={{ width: '120px', padding: '0.5rem' }} value={g.date} onChange={e => { const newG = [...formData.gifts]; newG[i].date = e.target.value; setFormData({...formData, gifts: newG}); }} />
                      <input className="input-field" style={{ flex: 1, padding: '0.5rem' }} placeholder="선물 내용" value={g.item} onChange={e => { const newG = [...formData.gifts]; newG[i].item = e.target.value; setFormData({...formData, gifts: newG}); }} />
                      <button type="button" onClick={() => { const newG = formData.gifts.filter(item => item.id !== g.id); setFormData({...formData, gifts: newG}); }}><X size={16} color="var(--danger)"/></button>
                    </div>
                    <input className="input-field" style={{ padding: '0.5rem' }} placeholder="CJ택배 송장번호 (숫자만)" value={g.trackingNumber || ''} onChange={e => { const newG = [...formData.gifts]; newG[i].trackingNumber = e.target.value; setFormData({...formData, gifts: newG}); }} />
                  </div>
                ))}
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '1rem', padding: '1rem' }} disabled={isSubmitting}>
                {isSubmitting ? '지도 좌표 불러오는 중...' : (editingClient ? '수정 완료' : '등록하기')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Address Search Modal */}
      {isAddressModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsAddressModalOpen(false)} style={{ zIndex: 3000 }}>
          <div className={styles.modalContent} style={{ height: '80vh', padding: '1rem', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>주소 검색</h2>
              <button onClick={() => setIsAddressModalOpen(false)}><X size={24} color="var(--text-muted)"/></button>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <DaumPostcode 
                onComplete={(data) => {
                  setFormData({ ...formData, address: data.roadAddress || data.jibunAddress });
                  setIsAddressModalOpen(false);
                }} 
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
