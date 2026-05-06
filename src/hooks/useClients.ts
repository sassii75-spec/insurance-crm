"use client";

import { useState, useEffect } from 'react';
import { collection, getDocs, setDoc, doc, updateDoc, deleteDoc, writeBatch, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

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
  plannerAllocationMonth?: string;
  notes?: string;
  consultations?: ConsultationHistory[];
  gifts?: GiftHistory[];
  userId?: string;
  registrationDate?: string;
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
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setClients([]);
      setIsLoaded(true);
      return;
    }

    const fetchClients = async () => {
      try {
        let q;
        if (user.role === 'admin') {
          q = query(collection(db, 'clients')); // Admins fetch all clients
        } else {
          q = query(collection(db, 'clients'), where('userId', '==', user.id));
        }
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          // Initialize with default clients if DB is empty for this user
          const batch = writeBatch(db);
          const initialClients = DEFAULT_CLIENTS.map(c => ({...c, userId: user.id}));
          initialClients.forEach(client => {
            const docRef = doc(collection(db, 'clients'), client.id + '_' + user.id);
            batch.set(docRef, client);
          });
          await batch.commit();
          setClients(initialClients);
        } else {
          const loadedClients: Client[] = [];
          querySnapshot.forEach((doc) => {
            loadedClients.push(doc.data() as Client);
          });
          setClients(loadedClients);
        }
      } catch (error) {
        console.error("Error fetching clients: ", error);
        // Fallback to empty array if network error
      } finally {
        setIsLoaded(true);
      }
    };
    
    fetchClients();
  }, []);

  const getRandomLatLng = () => {
    const lat = 37.4979 + (Math.random() - 0.5) * 0.02;
    const lng = 127.0276 + (Math.random() - 0.5) * 0.02;
    return { lat, lng };
  };

  const geocodeAddress = async (address: string): Promise<{lat: number, lng: number} | null> => {
    if (!address) return null;
    
    if (typeof window === 'undefined' || !window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
      console.error("Kakao maps SDK not loaded");
      return null;
    }
    
    const geocoder = new window.kakao.maps.services.Geocoder();
    
    const searchKakao = (addr: string): Promise<{lat: number, lng: number} | null> => {
      return new Promise((resolve) => {
        try {
          geocoder.addressSearch(addr, function(result: any, status: any) {
            if (status === window.kakao.maps.services.Status.OK && result[0]) {
              resolve({ lat: parseFloat(result[0].y), lng: parseFloat(result[0].x) });
            } else {
              resolve(null);
            }
          });
        } catch (e) {
          console.error('Kakao Geocoder Error:', e);
          resolve(null);
        }
      });
    };

    try {
      let coords = await searchKakao(address);
      if (coords) return coords;

    // Fallback 1: Remove anything after comma
    const noComma = address.split(',')[0].trim();
    if (noComma !== address) {
      coords = await searchKakao(noComma);
      if (coords) return coords;
    }

    // Fallback 2: Remove anything after parenthesis
    const noParen = noComma.split('(')[0].trim();
    if (noParen !== noComma) {
      coords = await searchKakao(noParen);
      if (coords) return coords;
    }

    // Fallback 3: Progressively remove trailing words (like building names or exact room numbers)
    const parts = noParen.split(' ').filter(p => p.trim() !== '');
    while (parts.length > 2) {
      parts.pop(); 
      coords = await searchKakao(parts.join(' '));
      if (coords) return coords;
    }
    } catch (e) {
      console.error('Geocoder Exception:', e);
    }

    // If all fails, use random
    return null;
  };

  const addClient = async (client: Omit<Client, 'id'>) => {
    let coords = client.lat ? { lat: client.lat, lng: client.lng } : null;
    if (!coords && client.address) {
      coords = await geocodeAddress(client.address);
    }
    if (!coords) coords = getRandomLatLng();

    const newId = Date.now().toString() + '_' + (client.userId || user?.id || 'unknown');
    const today = new Date().toISOString().split('T')[0];
    
    // Firebase는 undefined를 허용하지 않으므로 빈 문자열이나 기본값으로 처리
    const safeClient = Object.fromEntries(
      Object.entries(client).map(([k, v]) => [k, v === undefined ? null : v])
    );
    
    const newClient: Client = { 
      ...(safeClient as any), 
      id: newId, 
      ...coords, 
      userId: client.userId || user?.id || 'unknown', 
      registrationDate: client.registrationDate || today 
    };
    
    try {
      await setDoc(doc(collection(db, 'clients'), newId), newClient);
      setClients(prev => [...prev, newClient]);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const updateClient = async (id: string, updatedData: Partial<Client>) => {
    let coords = undefined;
    if (updatedData.address) {
      const oldClient = clients.find(c => c.id === id);
      if (oldClient && oldClient.address !== updatedData.address) {
        let fetchedCoords = await geocodeAddress(updatedData.address);
        if (!fetchedCoords) fetchedCoords = getRandomLatLng();
        coords = fetchedCoords;
      }
    }

    try {
      const finalUpdateData = coords ? { ...updatedData, ...coords } : { ...updatedData };
      await updateDoc(doc(db, 'clients', id), finalUpdateData);
      
      setClients(prev => prev.map(c => {
        if (c.id === id) {
          return { ...c, ...finalUpdateData };
        }
        return c;
      }));
    } catch (e) {
      console.error("Error updating document: ", e);
    }
  };

  const deleteClient = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'clients', id));
      setClients(prev => prev.filter(c => c.id !== id));
    } catch (e) {
      console.error("Error deleting document: ", e);
    }
  };

  const addMultipleClients = async (newClients: Omit<Client, 'id'>[]) => {
    const clientsWithIds: Client[] = [];
    
    for (let i = 0; i < newClients.length; i++) {
      const c = newClients[i];
      let coords = null;
      if (c.address) {
        coords = await geocodeAddress(c.address);
        // Kakao API has rate limits but it's very high, short delay just in case
        if (i < newClients.length - 1) await new Promise(resolve => setTimeout(resolve, 200));
      }
      if (!coords) coords = getRandomLatLng();
      
      const today = new Date().toISOString().split('T')[0];
      const targetUserId = c.userId || user?.id;
      clientsWithIds.push({ ...c, id: Date.now().toString() + i + '_' + (targetUserId || 'unknown'), ...coords, userId: targetUserId, registrationDate: c.registrationDate || today });
    }
    
    try {
      const batch = writeBatch(db);
      clientsWithIds.forEach(client => {
        const docRef = doc(collection(db, 'clients'), client.id);
        batch.set(docRef, client);
      });
      await batch.commit();
      
      setClients(prev => [...prev, ...clientsWithIds]);
    } catch (e) {
      console.error("Error adding multiple documents: ", e);
    }
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
