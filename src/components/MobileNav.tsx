import React from 'react';
import { MainTab } from '../types';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  FileText, 
  Scissors, 
  Users, 
  Settings 
} from 'lucide-react';

interface MobileNavProps {
  activeTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
  serviceCount?: number;
  transactionCount?: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onSelectTab,
  serviceCount = 0,
  transactionCount = 0,
}) => {
  const navItems = [
    { id: 'dashboard' as MainTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pos' as MainTab, label: 'POS Checkout', icon: ShoppingBag, badge: null },
    { id: 'transactions' as MainTab, label: 'Sales Log', icon: FileText, badge: transactionCount > 0 ? transactionCount : null },
    { id: 'services' as MainTab, label: 'Services', icon: Scissors, badge: serviceCount > 0 ? serviceCount : null },
    { id: 'customers' as MainTab, label: 'Clients', icon: Users },
    { id: 'settings' as MainTab, label: 'Settings', icon: Settings },
  ];

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-2 select-none"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              id={`mobile-nav-${item.id}`}
              className={`relative flex flex-col items-center justify-center py-1.5 px-2.5 rounded-2xl transition-all duration-200 min-w-[54px] min-h-[48px] ${
                isActive
                  ? 'text-blue-600 bg-blue-50 font-bold scale-105'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5px] text-blue-600' : 'stroke-[1.75px]'}`} />
                {item.badge !== null && item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 px-1.5 py-0.2 min-w-[16px] text-[10px] font-extrabold text-white bg-blue-600 rounded-full text-center shadow-xs">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 tracking-tight truncate max-w-[60px] ${isActive ? 'font-bold text-blue-700' : 'font-medium text-slate-500'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
