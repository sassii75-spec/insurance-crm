"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface User {
  id: string; // The username (e.g., 'admin', 'user1')
  name: string;
  role: 'admin' | 'user';
  isActive: boolean;
  validUntil: string; // YYYY-MM-DD
  password?: string; // Hashed or plain (for prototype)
  email?: string;
  requirePasswordChange?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check session on mount and ensure admin exists
  useEffect(() => {
    const initAuth = async () => {
      try {
        // 1. Ensure admin account exists in DB
        const adminDocRef = doc(db, 'users', 'admin');
        const adminSnap = await getDoc(adminDocRef);
        
        if (!adminSnap.exists()) {
          const defaultAdmin: User = {
            id: 'admin',
            name: '최고관리자',
            role: 'admin',
            isActive: true,
            validUntil: '2099-12-31',
            password: 'admin1234' // Changed to match walkthrough
          };
          await setDoc(adminDocRef, defaultAdmin);
        }

        // 2. Check local session
        const storedUserId = localStorage.getItem('insurepro_session');
        if (storedUserId) {
          const userSnap = await getDoc(doc(db, 'users', storedUserId));
          if (userSnap.exists()) {
            const userData = userSnap.data() as User;
            
            // Check if active and valid
            const today = new Date().toISOString().split('T')[0];
            if (userData.isActive && userData.validUntil >= today) {
              setUser(userData);
            } else {
              localStorage.removeItem('insurepro_session'); // Invalidated
            }
          } else {
            localStorage.removeItem('insurepro_session');
          }
        }
      } catch (error) {
        console.error("Failed to init auth", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('insurepro_session', userData.id);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('insurepro_session');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
