'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile } from '@/types';
import { LoginModal } from './LoginModal';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  openLoginModal: (mode?: 'login' | 'onboarding') => void;
  closeLoginModal: () => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize synchronously from localStorage if available to avoid any loading flicker
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('stylemate_active_user');
        if (cached) return JSON.parse(cached);
      } catch {
        // Fall through
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'login' | 'onboarding'>('onboarding');

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        if (typeof window !== 'undefined') {
          localStorage.setItem('stylemate_active_user', JSON.stringify(data.user));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const openLoginModal = useCallback((mode: 'login' | 'onboarding' = 'onboarding') => {
    setModalMode(mode);
    setModalOpen(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const logout = useCallback(async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('stylemate_active_user');
      }
      setUser(null);
      await fetch('/api/auth/logout', { method: 'POST' });
      await refreshUser();
    } catch (err) {
      console.error(err);
    }
  }, [refreshUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        openLoginModal,
        closeLoginModal,
        logout,
        refreshUser,
      }}
    >
      {children}
      <LoginModal
        isOpen={modalOpen}
        onClose={closeLoginModal}
        initialMode={modalMode}
        onAuthSuccess={(u) => {
          setUser(u);
          if (typeof window !== 'undefined') {
            localStorage.setItem('stylemate_active_user', JSON.stringify(u));
          }
          window.location.reload();
        }}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
