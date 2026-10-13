'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Shirt,
  Sparkles,
  History,
  Calendar,
  BarChart3,
  Download,
  Settings,
  PlusCircle,
  X,
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const navItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'My Closet', href: '/closet', icon: Shirt },
  { name: 'Generate Outfit', href: '/generate', icon: Sparkles, highlight: true },
  { name: 'Outfit History', href: '/history', icon: History },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Export', href: '/export', icon: Download },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar({ mobileOpen = false, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { user, loading: authLoading, openLoginModal } = useAuth();

  const isNavActive = (href: string) => {
    if (href === '/') return pathname === '/' || pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#FAF8F5] border-r border-[#EAE4D7] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-[#F0EBE1]">
          <Link href="/" className="flex flex-col group" onClick={onCloseMobile}>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#47583D] flex items-center justify-center text-white text-sm font-semibold tracking-wider shadow-sm">
                S
              </span>
              <span className="text-xl font-bold tracking-tight text-[#151413]">StyleMate</span>
            </div>
            <span className="text-[11px] font-medium tracking-wide text-[#78716C] mt-1">
              Virtual Closet & AI Styling
            </span>
          </Link>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-[#78716C] hover:text-[#151413] rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Quick CTA */}
        <div className="px-4 pt-4 pb-2">
          <Link
            href="/closet?action=new"
            onClick={onCloseMobile}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#FFFFFF] hover:bg-[#F5F2EB] text-[#151413] border border-[#DDD5C7] rounded-xl text-sm font-medium transition shadow-xs group"
          >
            <PlusCircle className="w-4 h-4 text-[#47583D] group-hover:scale-110 transition-transform" />
            <span>Add New Item</span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isNavActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-[#E7ECE3] text-[#2A3524] font-semibold shadow-xs'
                    : 'text-[#686561] hover:bg-[#F3EFE6] hover:text-[#151413]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      active ? 'text-[#47583D]' : item.highlight ? 'text-[#47583D]' : 'text-[#8C8984]'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>

                {item.highlight && !active && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-[#E7ECE3] text-[#47583D]">
                    AI
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User profile footer */}
        <div className="p-4 border-t border-[#F0EBE1] bg-[#F7F4EE]/60">
          <button
            type="button"
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              openLoginModal('onboarding');
            }}
            className="w-full flex items-center gap-3 text-left p-1 rounded-xl hover:bg-[#EAE4D7]/50 transition group"
            title="Click to switch profile or edit styling questionnaire"
          >
            <div className="relative">
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-[#EAE4D7] border border-[#DDD5C7] flex items-center justify-center text-sm font-semibold text-[#47583D] overflow-hidden group-hover:scale-105 transition-transform">
                {user?.name ? (
                  user.name.charAt(0).toUpperCase()
                ) : authLoading ? (
                  <span className="w-4 h-4 rounded-full bg-[#D5CDBD] animate-pulse" />
                ) : (
                  'U'
                )}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#47583D] ring-2 ring-[#FAF8F5]" />
            </div>
            <div className="flex-1 min-w-0">
              {authLoading && !user ? (
                <div className="h-3.5 w-24 bg-[#EAE4D7] animate-pulse rounded-md mb-1" />
              ) : (
                <p className="text-xs font-semibold text-[#151413] truncate group-hover:text-[#47583D] transition">
                  {user?.name || 'Sign In / Profile'}
                </p>
              )}
              <p className="text-[11px] text-[#78716C] truncate">
                {user?.gender?.split(' ')[0] || (user ? 'Active' : 'Guest')} • Styling Profile
              </p>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}
