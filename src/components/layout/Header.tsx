'use client';

import React, { useState, useEffect } from 'react';
import { Menu, CloudSun, Sparkles, User, LogIn, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthContext';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
}

export function Header({ onOpenMobileSidebar }: HeaderProps) {
  const { user, loading: authLoading, openLoginModal } = useAuth();
  const [greeting, setGreeting] = useState('Welcome');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-[#FAF8F5]/85 backdrop-blur-md border-b border-[#EAE4D7]">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 -ml-2 text-[#686561] hover:text-[#151413] lg:hidden rounded-lg hover:bg-[#F3EFE6] transition"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          {authLoading && !user ? (
            <div className="h-4 w-32 bg-[#EAE4D7] animate-pulse rounded-md" />
          ) : (
            <>
              <span className="text-xs font-medium text-[#78716C] hidden sm:inline-block">
                {greeting}, <strong className="text-[#151413] font-semibold">{user?.name || 'Style Enthusiast'}</strong> 👋
              </span>
              <span className="text-sm font-semibold text-[#151413] sm:hidden">
                {user?.name || 'My Closet'}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Weather capsule indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFFFFF] border border-[#EAE4D7] text-xs font-medium text-[#4A4845] shadow-xs">
          <CloudSun className="w-4 h-4 text-[#C76A52]" />
          <span>24°C Mild</span>
        </div>

        {/* Login / Profile Questionnaire Button */}
        <button
          type="button"
          onClick={() => openLoginModal('onboarding')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#F3EFE6] border border-[#DDD5C7] text-xs font-semibold text-[#151413] transition shadow-2xs group"
          title="Login or update styling questionnaire"
        >
          <User className="w-3.5 h-3.5 text-[#47583D]" />
          <span className="hidden sm:inline">Profile / Login</span>
        </button>

        {/* Quick Generate Action */}
        <Link
          href="/generate"
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#47583D] hover:bg-[#384630] text-white rounded-xl text-xs sm:text-sm font-semibold transition shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Generate</span>
        </Link>
      </div>
    </header>
  );
}
