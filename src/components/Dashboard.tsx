import React from 'react';
import { 
  Category, 
  Service, 
  Staff, 
  CompanyDetails, 
  ActivityLog, 
  MainTab,
  SettingsSubTab 
} from '../types';
import { 
  Sparkles, 
  Layers, 
  Users, 
  Tag, 
  Clock, 
  ArrowUpRight, 
  CheckCircle2, 
  Building2, 
  Printer, 
  Database, 
  ShoppingBag,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  DollarSign
} from 'lucide-react';

interface DashboardProps {
  services: Service[];
  categories: Category[];
  staff: Staff[];
  company: CompanyDetails;
  activityLogs: ActivityLog[];
  onNavigateToTab: (tab: MainTab) => void;
  onNavigateToSettingsSubTab: (subTab: SettingsSubTab) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  services,
  categories,
  staff,
  company,
  activityLogs,
  onNavigateToTab,
  onNavigateToSettingsSubTab,
}) => {
  const activeServices = services.filter((s) => s.isActive);
  const activeStaff = staff.filter((s) => s.status === 'active');

  const avgPrice = services.length > 0
    ? Math.round(services.reduce((acc, curr) => acc + curr.price, 0) / services.length)
    : 0;

  const avgDuration = services.length > 0
    ? Math.round(services.reduce((acc, curr) => acc + curr.durationMinutes, 0) / services.length)
    : 0;

  // Calculate services per category count
  const categoryCounts = categories.map((cat) => {
    const count = services.filter((s) => s.categoryId === cat.id).length;
    return {
      ...cat,
      serviceCount: count,
      percentage: services.length > 0 ? Math.round((count / services.length) * 100) : 0,
    };
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      
      {/* Banner / Welcome Header (Compact 60% Size) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 rounded-xl p-3.5 sm:p-4 border border-slate-800 text-white shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 relative z-10">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-blue-400" />
                Operational Summary
              </span>
              <span className="text-slate-400 text-[11px] font-mono">{company.currency || 'KES'} Real-time Setup</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {company.businessName || 'Spa Management Console'}
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl mt-0.5 leading-normal">
              Manage treatment catalogs, service categories, staff rosters, company profile, and thermal receipt settings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onNavigateToTab('services')}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
              id="dash-manage-services-btn"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Manage Services ({services.length})</span>
            </button>
            <button
              onClick={() => {
                onNavigateToTab('settings');
                onNavigateToSettingsSubTab('receipt');
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
              id="dash-receipt-btn"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400" />
              <span>Receipt Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Services Card */}
        <div 
          onClick={() => onNavigateToTab('services')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          id="metric-card-services"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Spa Treatments
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-black text-slate-900 dark:text-slate-100 font-mono">
                {services.length}
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {activeServices.length} Active in catalog
              </p>
            </div>
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-1 rounded-md flex items-center gap-1">
              Active <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Categories Count Card */}
        <div 
          onClick={() => onNavigateToTab('services')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          id="metric-card-categories"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Service Categories
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-black text-slate-900 dark:text-slate-100 font-mono">
                {categories.length}
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Groupings configured
              </p>
            </div>
            <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-1 rounded-md flex items-center gap-1">
              Organized <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Staff Members Card */}
        <div 
          onClick={() => {
            onNavigateToTab('settings');
            onNavigateToSettingsSubTab('staff');
          }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          id="metric-card-staff"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Therapists & Staff
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-black text-slate-900 dark:text-slate-100 font-mono">
                {staff.length}
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {activeStaff.length} On duty / Active
              </p>
            </div>
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-1 rounded-md flex items-center gap-1">
              Roster <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Average Service Price Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Avg Treatment Price
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
                {company.currency || 'KES'} {avgPrice.toLocaleString()}
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Avg Duration: {avgDuration} mins
              </p>
            </div>
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-1 rounded-md">
              Rate
            </span>
          </div>
        </div>

      </div>

      {/* Main Content Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Category Distribution & Services List Preview */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Service Categories Breakdown Visual Chart */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-500" />
                  Service Breakdown by Category
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Distribution of spa treatments across categories
                </p>
              </div>
              <button
                onClick={() => onNavigateToTab('services')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                Manage Categories <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {categoryCounts.map((cat) => (
                <div key={cat.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span 
                        className="w-3 h-3 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: cat.color }}
                      ></span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {cat.name}
                      </span>
                    </div>
                    <span className="font-mono text-slate-500 dark:text-slate-400">
                      <strong>{cat.serviceCount}</strong> treatments ({cat.percentage}%)
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.max(cat.percentage, 5)}%`, 
                        backgroundColor: cat.color 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Featured / Catalog Quick List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-blue-500" />
                  Active Treatment Highlights
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Quick view of top configured spa treatments
                </p>
              </div>
              <button
                onClick={() => onNavigateToTab('services')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 px-3 py-1.5 rounded-lg transition-colors"
              >
                + Add / Edit Services
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {services.slice(0, 6).map((service) => {
                const category = categories.find((c) => c.id === service.categoryId);
                return (
                  <div 
                    key={service.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span 
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: category?.color || '#0ea5e9' }}
                        >
                          {category?.name || 'General'}
                        </span>
                        <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                          {company.currency || 'KES'} {service.price.toLocaleString()}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 mt-2">
                        {service.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {service.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {service.durationMinutes} minutes
                      </span>
                      <span className={`font-medium ${service.isActive ? 'text-blue-500' : 'text-slate-400'}`}>
                        {service.isActive ? '● Available' : '○ Inactive'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right 1 Column: Quick Action Cards & System Audit Trail */}
        <div className="space-y-6">
          
          {/* Quick Management Navigation Cards */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-xs">
              Management Shortcuts
            </h3>

            <div className="space-y-2">
              <button
                onClick={() => {
                  onNavigateToTab('settings');
                  onNavigateToSettingsSubTab('company');
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Company Profile</span>
                    <span className="text-[10px] text-slate-500">Name, phone, address, tax rate</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => {
                  onNavigateToTab('settings');
                  onNavigateToSettingsSubTab('staff');
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Staff Roster ({staff.length})</span>
                    <span className="text-[10px] text-slate-500 font-mono">Therapists & technicians</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => {
                  onNavigateToTab('settings');
                  onNavigateToSettingsSubTab('receipt');
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Printer className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Receipt Templates</span>
                    <span className="text-[10px] text-slate-500">80mm Thermal layout editor</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => {
                  onNavigateToTab('settings');
                  onNavigateToSettingsSubTab('backup');
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Backup & Restore</span>
                    <span className="text-[10px] text-slate-500">JSON export & reset</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Activity Audit Log Feed */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-500" />
                Recent Activity Audit
              </h3>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded font-mono">
                System Log
              </span>
            </div>

            <div className="space-y-3">
              {activityLogs.slice(0, 5).map((log) => (
                <div 
                  key={log.id} 
                  className="flex items-start space-x-3 text-xs border-b border-slate-100 dark:border-slate-800/60 pb-2.5 last:border-0 last:pb-0"
                >
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate mt-0.5">
                      {log.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
