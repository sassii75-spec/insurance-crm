"use client";

import { useState, useEffect } from 'react';

export interface ConsultationHistory {
  id: string;
  date: string;
  content: string;
}

export interface GiftHistory {
  id: string;
  date: string;
  item: string;
  trackingNumber?: string;
}

export interface Client {
  id: string;
  name: string;
  age: string;
  gender: string;
  address: string;
  phone: string;
  mobile: string;
  products: string[];
  contractDate: string;
  contractAmount?: number;
  lastMeetingDate: string;
  status: 'active' | 'opportunity' | 'terminated';
  lat?: number;
  lng?: number;
  photo?: string;
  consultations?: ConsultationHistory[];
  gifts?: GiftHistory[];
}

const DEFAULT_CLIENTS: Client[] = [
  { id: '1', name: "이동국", age: '45', gender: '남', status: "active", address: "서울 강남구 테헤란로", phone: "02-123-4567", mobile: "010-1234-5678", products: ["종신보험 1건", "실손의료비 1건"], contractDate: "2023-01-15", lastMeetingDate: "2024-04-10", lat: 37.4979, lng: 127.0276, consultations: [], gifts: [] },
  { id: '2', name: "박지성", age: '43', gender: '남', status: "opportunity", address: "서울 강남구 역삼동", phone: "", mobile: "010-9876-5432", products: ["연금보험 가입 문의"], contractDate: "", lastMeetingDate: "2024-04-20", lat: 37.5000, lng: 127.0300, consultations: [], gifts: [] },
  { id: '3', name: "유재석", age: '52', gender: '남', status: "terminated", address: "서울 서초구 서초대로", phone: "", mobile: "010-1111-2222", products: ["자동차보험 (해지)"], contractDate: "2020-05-20", lastMeetingDate: "2023-12-01", lat: 37.4950, lng: 127.0250, consultations: [], gifts: [] },
  { id: '4', name: "아이유", age: '31', gender: '여', status: "active", address: "서울 강남구 강남대로", phone: "02-999-8888", mobile: "010-3333-4444", products: ["운전자보험 1건", "암보험 1건"], contractDate: "2024-02-10", lastMeetingDate: "2024-04-25", lat: 37.5020, lng: 127.0280, consultations: [], gifts: [] },
];

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('insurepro_clients');
    if (stored) {
      setClients(JSON.parse(stored));
    } else {
      setClients(DEFAULT_CLIENTS);
      localStorage.setItem('insurepro_clients', JSON.stringify(DEFAULT_CLIENTS));
    }
    setIsLoaded(true);
  }, []);

  const saveClients = (newClients: Client[]) => {
    setClients(newClients);
    localStorage.setItem('insurepro_clients', JSON.stringify(newClients));
  };

  const getRandomLatLng = () => {
    const lat = 37.4979 + (Math.random() - 0.5) * 0.02;
    const lng = 127.0276 + (Math.random() - 0.5) * 0.02;
    return { lat, lng };
  };

  const geocodeAddress = async (address: string): Promise<{lat: number, lng: number} | null> => {
    if (!address) return null;
    
    const search = async (query: string) => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`, {
          headers: { 'User-Agent': 'InsurePro/1.0' }
        });
        const data = await res.json();
        if (data && data.length > 0) {
          return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        }
      } catch (e) {
        console.error("Geocoding failed", e);
      }
      return null;
    };

    let result = await search(address);
    if (result) return result;

    // Fallback: Try with just the first two parts (e.g. "안양시 동안구")
    const parts = address.split(' ').filter(p => p.trim() !== '');
    if (parts.length >= 2) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Respect rate limit
      result = await search(`${parts[0]} ${parts[1]}`);
      if (result) return result;
    }
    
    return null;
  };

  const addClient = async (client: Omit<Client, 'id'>) => {
    let coords = client.lat ? { lat: client.lat, lng: client.lng } : null;
    if (!coords && client.address) {
      coords = await geocodeAddress(client.address);
    }
    if (!coords) coords = getRandomLatLng();

    const newClient = { ...client, id: Date.now().toString(), ...coords };
    saveClients([...clients, newClient]);
  };

  const updateClient = async (id: string, updatedData: Partial<Client>) => {
    let coords = undefined;
    if (updatedData.address) {
      // Find old client
      const oldClient = clients.find(c => c.id === id);
      if (oldClient && oldClient.address !== updatedData.address) {
        let fetchedCoords = await geocodeAddress(updatedData.address);
        if (!fetchedCoords) fetchedCoords = getRandomLatLng(); // Force coordinate update
        coords = fetchedCoords;
      }
    }

    const newClients = clients.map(c => {
      if (c.id === id) {
        return coords ? { ...c, ...updatedData, ...coords } : { ...c, ...updatedData };
      }
      return c;
    });
    saveClients(newClients);
  };

  const deleteClient = (id: string) => {
    const newClients = clients.filter(c => c.id !== id);
    saveClients(newClients);
  };

  // 엑셀에서 추출한 데이터 일괄 추가 (Geocoding 처리 포함 - API 제한 때문에 delay 필요)
  const addMultipleClients = async (newClients: Omit<Client, 'id'>[]) => {
    const clientsWithIds: Client[] = [];
    
    for (let i = 0; i < newClients.length; i++) {
      const c = newClients[i];
      let coords = null;
      if (c.address) {
        coords = await geocodeAddress(c.address);
        // Rate limit for Nominatim (1 req per sec)
        if (i < newClients.length - 1) await new Promise(resolve => setTimeout(resolve, 1000));
      }
      if (!coords) coords = getRandomLatLng();
      
      clientsWithIds.push({ ...c, id: Date.now().toString() + i, ...coords });
    }
    
    // 이전에 있던 상태(클로저 문제 방지)를 최신으로 가져오기 위해 로컬스토리지 다시 읽기
    const stored = localStorage.getItem('insurepro_clients');
    const currentClients = stored ? JSON.parse(stored) : clients;
    saveClients([...currentClients, ...clientsWithIds]);
  };

  return {
    clients,
    isLoaded,
    addClient,
    updateClient,
    deleteClient,
    addMultipleClients
  };
}
