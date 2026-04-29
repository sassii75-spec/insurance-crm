"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import DaumPostcode from 'react-daum-postcode';
import L from "leaflet";
import styles from "./MapComponent.module.css";
import { Shield, ShieldAlert, ShieldOff, Phone, ChevronRight, Edit2, X } from "lucide-react";

// Fix default marker icon issues in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Icons for 3 client types
const createPinIcon = (color: string, photoUrl?: string) => {
  const innerHtml = photoUrl 
    ? `<img src="${photoUrl}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />`
    : '';

  return L.divIcon({
    className: styles.pinMarker,
    html: `
      <div class="${styles.pin}" style="background-color: ${color}; border-color: ${color};">
        <div class="${styles.pinContent}" style="overflow: hidden;">${innerHtml}</div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};

const getIcon = (status: string, photoUrl?: string) => {
  const color = status === 'active' ? '#2563eb' : status === 'opportunity' ? '#f59e0b' : '#94a3b8';
  return createPinIcon(color, photoUrl);
};

import { useClients, Client } from "@/hooks/useClients";

function MapClickHandler({ onClick }: { onClick: () => void }) {
  useMapEvents({
    click: () => {
      onClick();
    }
  });
  return null;
}

function LocationMarker() {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const map = useMap();

  useEffect(() => {
    map.locate().on("locationfound", function (e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      map.flyTo(e.latlng, map.getZoom());
    });
  }, [map]);

  return position === null ? null : (
    <Marker position={position}>
      <Popup>현재 내 위치</Popup>
    </Marker>
  );
}

export default function MapComponent() {
  const { clients, isLoaded, updateClient } = useClients();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const defaultPosition: [number, number] = [37.4979, 127.0276];

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>(['active', 'opportunity', 'terminated']);
  const [formData, setFormData] = useState({
    name: '', age: '', gender: '남', address: '', phone: '', mobile: '', products: '', contractDate: '', contractAmount: 0, lastMeetingDate: '', status: 'active', photo: '',
    consultations: [] as { id: string, date: string, content: string }[],
    gifts: [] as { id: string, date: string, item: string, trackingNumber?: string }[]
  });

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

  const openEditModal = () => {
    if (selectedClient) {
      setFormData({
        name: selectedClient.name || '', 
        age: selectedClient.age || '', 
        gender: selectedClient.gender || '남', 
        address: selectedClient.address || '', 
        phone: selectedClient.phone || '', 
        mobile: selectedClient.mobile || '', 
        products: (selectedClient.products || []).join(', '), 
        contractDate: selectedClient.contractDate || '', 
        contractAmount: selectedClient.contractAmount || 0,
        lastMeetingDate: selectedClient.lastMeetingDate || '', 
        status: selectedClient.status || 'active',
        photo: selectedClient.photo || '',
        consultations: selectedClient.consultations || [],
        gifts: selectedClient.gifts || []
      });
      setIsEditModalOpen(true);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    setIsSubmitting(true);
    const submitData = {
      ...formData,
      products: formData.products.split(',').map(p => p.trim()).filter(p => p),
      status: formData.status as 'active' | 'opportunity' | 'terminated'
    };

    try {
      await updateClient(selectedClient.id, submitData);
      setSelectedClient({ ...selectedClient, ...submitData });
    } catch (err) {
      console.error(err);
    }
    
    setIsSubmitting(false);
    setIsEditModalOpen(false);
  };

  if (!isLoaded) return null;

  return (
    <div className={styles.mapWrapper}>
      <MapContainer 
        center={defaultPosition} 
        zoom={15} 
        style={{ height: '100%', width: '100%', zIndex: 1 }}
        zoomControl={false}
      >
        <MapClickHandler onClick={() => setSelectedClient(null)} />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <LocationMarker />
        
        {clients
          .filter(client => client.lat !== undefined && client.lng !== undefined && activeFilters.includes(client.status))
          .map(client => (
          <Marker 
            key={client.id} 
            position={[client.lat!, client.lng!]} 
            icon={getIcon(client.status, client.photo)}
            eventHandlers={{
              click: () => {
                setSelectedClient(client);
              }
            }}
          />
        ))}
      </MapContainer>

      {/* Bottom Sheet Card */}
      {selectedClient && (
        <div className={styles.bottomSheet} onClick={() => setSelectedClient(null)}>
          <div className={styles.sheetHandle}></div>
          <div className={styles.popupCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.popupHeader}>
              <div className={styles.popupTitleGroup}>
                {selectedClient.status === 'active' && <Shield size={20} color="#2563eb" />}
                {selectedClient.status === 'opportunity' && <ShieldAlert size={20} color="#f59e0b" />}
                {selectedClient.status === 'terminated' && <ShieldOff size={20} color="#94a3b8" />}
                <span className={styles.clientName}>{selectedClient.name} 고객</span>
              </div>
              <span className={`${styles.statusBadge} ${styles[selectedClient.status]}`}>
                {selectedClient.status === 'active' ? '계약중' : selectedClient.status === 'opportunity' ? '기회' : '해지'}
              </span>
            </div>
            
            <div className={styles.popupBody}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>보유 상품</span>
                <div className={styles.productTags}>
                  {selectedClient.products.length > 0 ? selectedClient.products.map((prod, idx) => (
                    <span key={idx} className={styles.productTag}>{prod}</span>
                  )) : <span className={styles.productTag} style={{color: 'var(--text-muted)'}}>등록된 상품 없음</span>}
                </div>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>주소</span>
                <span className={styles.infoValue}>{selectedClient.address || '주소 정보 없음'}</span>
              </div>
              
              {(selectedClient.consultations && selectedClient.consultations.length > 0) && (
                <div className={styles.infoRow} style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border)' }}>
                  <span className={styles.infoLabel}>최근 상담 내역 ({selectedClient.consultations.length}건)</span>
                  <span className={styles.infoValue} style={{ fontSize: '0.8rem' }}>
                    {selectedClient.consultations[selectedClient.consultations.length - 1].date}: {selectedClient.consultations[selectedClient.consultations.length - 1].content}
                  </span>
                </div>
              )}
              
              {(selectedClient.gifts && selectedClient.gifts.length > 0) && (
                <div className={styles.infoRow} style={{ marginTop: '0.25rem' }}>
                  <span className={styles.infoLabel}>최근 선물 발송 ({selectedClient.gifts.length}건)</span>
                  <span className={styles.infoValue} style={{ fontSize: '0.8rem' }}>
                    {selectedClient.gifts[selectedClient.gifts.length - 1].date}: {selectedClient.gifts[selectedClient.gifts.length - 1].item}
                  </span>
                </div>
              )}
            </div>

            <div className={styles.popupActions}>
              <button className={`${styles.actionBtn} ${styles.secondaryBtn}`} onClick={() => window.location.href = `tel:${selectedClient.mobile}`}>
                <Phone size={16} /> 전화걸기
              </button>
              <button className={`${styles.actionBtn} ${styles.primaryBtn}`} onClick={(e) => { e.stopPropagation(); openEditModal(); }}>
                <Edit2 size={16} /> 수정하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal / Bottom Sheet */}
      {isEditModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsEditModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>고객 정보 수정</h2>
              <button onClick={() => setIsEditModalOpen(false)}><X size={24} color="var(--text-muted)"/></button>
            </div>
            
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className={styles.formGroup} style={{ flex: 1 }}><label>이름</label><input required className="input-field" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} /></div>
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
                  <button type="button" onClick={() => setFormData({...formData, consultations: [...formData.consultations, { id: Date.now().toString(), date: new Date().toISOString().split('T')[0], content: '' }]})} style={{color: '#2563eb', fontSize: '0.8rem', fontWeight: 600}}>+ 추가</button>
                </div>
                {formData.consultations.map((c, i) => (
                  <div key={c.id} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input type="date" className="input-field" style={{ width: '120px', padding: '0.5rem' }} value={c.date} onChange={e => { const newC = [...formData.consultations]; newC[i].date = e.target.value; setFormData({...formData, consultations: newC}); }} />
                    <input className="input-field" style={{ flex: 1, padding: '0.5rem' }} placeholder="상담 내용" value={c.content} onChange={e => { const newC = [...formData.consultations]; newC[i].content = e.target.value; setFormData({...formData, consultations: newC}); }} />
                    <button type="button" onClick={() => { const newC = formData.consultations.filter(item => item.id !== c.id); setFormData({...formData, consultations: newC}); }}>삭제</button>
                  </div>
                ))}
              </div>

              <div className={styles.formGroup}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <label>선물 발송 내역</label>
                  <button type="button" onClick={() => setFormData({...formData, gifts: [...formData.gifts, { id: Date.now().toString(), date: new Date().toISOString().split('T')[0], item: '', trackingNumber: '' }]})} style={{color: '#2563eb', fontSize: '0.8rem', fontWeight: 600}}>+ 추가</button>
                </div>
                {formData.gifts.map((g, i) => (
                  <div key={g.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem', border: '1px solid #e2e8f0', padding: '0.75rem', borderRadius: '4px', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input type="date" className="input-field" style={{ width: '120px', padding: '0.5rem' }} value={g.date} onChange={e => { const newG = [...formData.gifts]; newG[i].date = e.target.value; setFormData({...formData, gifts: newG}); }} />
                      <input className="input-field" style={{ flex: 1, padding: '0.5rem' }} placeholder="선물 내용" value={g.item} onChange={e => { const newG = [...formData.gifts]; newG[i].item = e.target.value; setFormData({...formData, gifts: newG}); }} />
                      <button type="button" onClick={() => { const newG = formData.gifts.filter(item => item.id !== g.id); setFormData({...formData, gifts: newG}); }}>삭제</button>
                    </div>
                    <input className="input-field" style={{ padding: '0.5rem' }} placeholder="CJ택배 송장번호 (숫자만)" value={g.trackingNumber || ''} onChange={e => { const newG = [...formData.gifts]; newG[i].trackingNumber = e.target.value; setFormData({...formData, gifts: newG}); }} />
                  </div>
                ))}
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '1rem', padding: '1rem' }} disabled={isSubmitting}>
                {isSubmitting ? '지도 좌표 불러오는 중...' : '수정 완료'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Filter Panel (Bottom) */}
      {!selectedClient && (
        <div className={styles.filterPanel}>
          <div 
            className={`${styles.filterBtn} ${activeFilters.includes('active') ? styles.filterBtnActive : ''}`}
            onClick={() => setActiveFilters(prev => prev.includes('active') ? prev.filter(f => f !== 'active') : [...prev, 'active'])}
          >
            <div className={styles.dot} style={{ backgroundColor: '#2563eb' }}></div> 계약중
          </div>
          <div 
            className={`${styles.filterBtn} ${activeFilters.includes('opportunity') ? styles.filterBtnActive : ''}`}
            onClick={() => setActiveFilters(prev => prev.includes('opportunity') ? prev.filter(f => f !== 'opportunity') : [...prev, 'opportunity'])}
          >
            <div className={styles.dot} style={{ backgroundColor: '#f59e0b' }}></div> 기회
          </div>
          <div 
            className={`${styles.filterBtn} ${activeFilters.includes('terminated') ? styles.filterBtnActive : ''}`}
            onClick={() => setActiveFilters(prev => prev.includes('terminated') ? prev.filter(f => f !== 'terminated') : [...prev, 'terminated'])}
          >
            <div className={styles.dot} style={{ backgroundColor: '#94a3b8' }}></div> 해지
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
