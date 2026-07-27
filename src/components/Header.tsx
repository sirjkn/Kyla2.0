import React from 'react';
import { CompanyDetails } from '../types';
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  Building2, 
  Plus, 
  ShoppingBag,
  User,
  KeyRound,
  LogOut
} from 'lucide-react';

interface HeaderProps {
  company: CompanyDetails;
  currentUser?: { id: string; name: string; role: string } | null;
  onNavigateToServices: () => void;
  onNavigateToPos: () => void;
  onChangePassword?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  company, 
  currentUser,
  onNavigateToServices, 
  onNavigateToPos,
  onChangePassword,
  onLogout
}) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="bg-white border-b border-slate-200 text-slate-900 px-4 sm:px-6 py-3 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        {/* Brand & Company Details */}
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white font-bold shadow-md shadow-teal-600/20 flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-base sm:text-lg text-slate-900 tracking-tight truncate">
                {company.businessName || 'Kyla Barber Shop'}
              </h1>
              <span className="bg-teal-50 text-teal-700 border border-teal-200 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full flex-shrink-0 hidden sm:inline-block">
                POS System
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
              <Building2 className="w-3 h-3 text-slate-400 flex-shrink-0" />
              <span className="truncate">{company.address || 'Gitanga Road opposite Valley Archade'}</span>
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          
          {/* Time / Date Badge */}
          <div className="hidden lg:flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              <span>{currentDate}</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              <span>Currency: <strong className="text-teal-700 font-mono">{company.currency || 'KES'}</strong></span>
            </div>
          </div>

          {/* 1. Make a Sale Button */}
          <button
            onClick={onNavigateToPos}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-all shadow-xs active:scale-95"
            id="header-make-sale-btn"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Make a Sale</span>
            <span className="sm:hidden">Sale</span>
          </button>

          {/* 2. Logged in User Profile Badge */}
          {currentUser && (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs">
              <div className="w-7 h-7 rounded-md bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left pr-1 min-w-0 max-w-[120px]">
                <div className="font-bold text-slate-900 text-[11px] truncate">{currentUser.name}</div>
                <div className="text-[9px] text-slate-500 truncate">{currentUser.role}</div>
              </div>

              {onChangePassword && (
                <button
                  onClick={onChangePassword}
                  className="p-1.5 rounded-md text-slate-500 hover:text-teal-600 hover:bg-slate-200 transition-colors"
                  title="Change Password"
                  id="header-change-password-btn"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* 3. Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all active:scale-95"
              title="Sign Out / Logout"
              id="header-logout-btn"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
