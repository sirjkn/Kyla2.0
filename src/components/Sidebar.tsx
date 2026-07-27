import React from 'react';
import { MainTab, ThemeMode } from '../types';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  ReceiptText, 
  Users, 
  Sparkles, 
  Settings,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
  serviceCount: number;
  categoryCount: number;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  serviceCount,
  categoryCount,
  theme,
  onToggleTheme,
}) => {
  const menuItems: {
    id: MainTab;
    label: string;
    icon: React.ElementType;
    badge?: string;
    badgeColor?: string;
    description?: string;
    count?: number;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'App summary & metrics',
    },
    {
      id: 'pos',
      label: 'Point of Sale',
      icon: ShoppingCart,
      description: 'Checkout & register',
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: ReceiptText,
      description: 'Sales & audit logs',
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
      description: 'Client profiles & history',
    },
    {
      id: 'services',
      label: 'Services & Categories',
      icon: Sparkles,
      count: serviceCount,
      description: 'Manage treatments & groups',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'Company, Staff, Receipts, Payment',
    },
  ];

  return (
    <aside className="hidden lg:flex lg:w-64 bg-white border-r border-slate-200 flex-shrink-0 flex-col justify-between">
      <div className="p-4 space-y-6">
        
        {/* Navigation Section Title */}
        <div>
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Main Navigation
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  id={`nav-item-${item.id}`}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left font-medium text-sm transition-all group ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <Icon className={`w-5 h-5 flex-shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'
                    }`} />
                    <div className="truncate">
                      <div className="font-semibold leading-tight flex items-center gap-1.5">
                        <span>{item.label}</span>
                      </div>
                      <p className={`text-[11px] truncate ${
                        isActive ? 'text-blue-100' : 'text-slate-500'
                      }`}>
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Badge or Counter */}
                  <div className="flex items-center space-x-1.5 flex-shrink-0 ml-2">
                    {item.badge && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold tracking-tight border ${
                        isActive
                          ? 'bg-white/20 text-white border-white/30'
                          : 'bg-amber-500/10 text-amber-600 border-amber-300'
                      }`}>
                        {item.badge}
                      </span>
                    )}

                    {item.count !== undefined && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-blue-700 border border-slate-200'
                      }`}>
                        {item.count}
                      </span>
                    )}

                    <ChevronRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${
                      isActive ? 'opacity-100 text-white' : 'text-slate-400'
                    }`} />
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Summary Card in Sidebar */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-700 font-semibold">
            <span>Quick System Stats</span>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-slate-500 pt-1">
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="block text-[10px] uppercase text-slate-500">Services</span>
              <strong className="text-sm font-bold text-slate-900 font-mono">{serviceCount}</strong>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="block text-[10px] uppercase text-slate-400">Categories</span>
              <strong className="text-sm font-bold text-slate-900 font-mono">{categoryCount}</strong>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Area: Footer */}
      <div className="p-4 border-t border-slate-200 space-y-2">
        <div className="text-center">
          <p className="text-[11px] font-medium text-slate-500">
            Kyla Barber Shop &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </aside>
  );
};

