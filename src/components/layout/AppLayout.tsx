'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastProvider } from '@/components/ui/Toast';
import { AuthProvider } from '@/components/auth/AuthContext';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ToastProvider>
      <AuthProvider>
        <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917] flex">
          {/* Sidebar */}
          <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
            <Header onOpenMobileSidebar={() => setMobileOpen(true)} />

            <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
              {children}
            </main>
          </div>
        </div>
      </AuthProvider>
    </ToastProvider>
  );
}
