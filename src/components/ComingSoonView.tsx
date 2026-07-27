import React from 'react';
import { MainTab, CompanyDetails, Service } from '../types';
import { 
  ShoppingCart, 
  ReceiptText, 
  Users, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Bell,
  CreditCard,
  UserPlus,
  ShieldCheck,
  Search
} from 'lucide-react';

interface ComingSoonViewProps {
  tab: 'pos' | 'transactions' | 'customers';
  company: CompanyDetails;
  services: Service[];
  onNavigateToServices: () => void;
  onNavigateToDashboard: () => void;
}

export const ComingSoonView: React.FC<ComingSoonViewProps> = ({
  tab,
  company,
  services,
  onNavigateToServices,
  onNavigateToDashboard,
}) => {
  const [notifySubscribed, setNotifySubscribed] = React.useState(false);

  const meta = {
    pos: {
      title: 'Point of Sale (POS) Terminal',
      subtitle: 'Fast, touch-friendly checkout for walk-in and appointment clients.',
      icon: ShoppingCart,
      color: 'from-amber-500 to-orange-600',
      badgeBg: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
      features: [
        'Instant multi-service item cart & tip calculator',
        'Direct thermal receipt printing with live layout',
        'M-Pesa, Cash, Card, and Split Payment support',
        'Staff therapist commission & tip allocation',
        'Gift card & discount voucher processing',
      ],
      wireframeTitle: 'Live POS Register Preview',
    },
    transactions: {
      title: 'Transactions & Audit Ledger',
      subtitle: 'Detailed revenue tracking, payment logs, and daily closeout reporting.',
      icon: ReceiptText,
      color: 'from-teal-500 to-emerald-600',
      badgeBg: 'bg-teal-500/10 text-teal-500 border-teal-500/30',
      features: [
        'Filter transactions by staff therapist, payment method & date',
        'Export daily closing reports to Excel / PDF / CSV',
        'Reissue and reprint past thermal receipts in one click',
        'Split transaction refund & reversal workflows',
        'Comprehensive tax and discount breakdown analytics',
      ],
      wireframeTitle: 'Recent Sales Audit Stream Preview',
    },
    customers: {
      title: 'Customer Relationship Management (CRM)',
      subtitle: 'Client history, medical/allergy notes, visit frequency, and loyalty points.',
      icon: Users,
      color: 'from-purple-500 to-indigo-600',
      badgeBg: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
      features: [
        'Detailed client profiles with preferred therapists & history',
        'Custom health notes (e.g. pressure preferences, skin allergies)',
        'Automated SMS / Email appointment reminders',
        'Spa Membership packages & recurring subscription passes',
        'VIP client rewards and birthday treatment discounts',
      ],
      wireframeTitle: 'Client Profile & Membership Directory Preview',
    },
  }[tab];

  const Icon = meta.icon;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn pb-12">
      
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider border ${meta.badgeBg}`}>
                Feature Roadmap • Coming Soon
              </span>
              <span className="text-slate-400 text-xs flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Planned Release
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${meta.color} flex items-center justify-center text-white shadow-lg`}>
                <Icon className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {meta.title}
              </h2>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed">
              {meta.subtitle} In the meantime, you can manage your full Spa service catalog, category structure, company details, staff, and receipt template configuration.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto flex-shrink-0">
            <button
              onClick={onNavigateToServices}
              className="w-full px-5 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Manage Services Catalog</span>
            </button>
            <button
              onClick={onNavigateToDashboard}
              className="w-full px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-2"
            >
              <span>Back to Dashboard</span>
            </button>
          </div>

        </div>
      </div>

      {/* Planned Capabilities & Interactive Teaser Wireframe */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Planned Features list */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Planned Capabilities
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              What to expect when this module goes live:
            </p>
          </div>

          <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
            {meta.features.map((feat, idx) => (
              <li key={idx} className="flex items-start space-x-2.5 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold font-mono text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed font-medium">{feat}</span>
              </li>
            ))}
          </ul>

          <div className="pt-2">
            <button
              onClick={() => setNotifySubscribed(!notifySubscribed)}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                notifySubscribed
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>{notifySubscribed ? 'Subscribed to Module Updates ✓' : 'Notify Me Upon Release'}</span>
            </button>
          </div>
        </div>

        {/* Wireframe Mockup Teaser */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                {meta.wireframeTitle}
              </h4>
              <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded font-mono font-bold">
                PROTOTYPE LAYOUT
              </span>
            </div>

            {/* Simulated UI Mockup */}
            <div className="mt-4 bg-slate-950 rounded-2xl p-4 border border-slate-800 text-slate-300 font-sans space-y-3 opacity-90">
              
              {tab === 'pos' && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-400 font-mono">Cart (#POS-9041)</span>
                    <span className="text-emerald-400 font-bold">Client: Walk-in Guest</span>
                  </div>
                  <div className="space-y-2">
                    {services.slice(0, 2).map((srv) => (
                      <div key={srv.id} className="flex justify-between items-center bg-slate-900 p-2 rounded-lg">
                        <div>
                          <div className="font-semibold text-white">{srv.name}</div>
                          <div className="text-[10px] text-slate-400">{srv.durationMinutes} mins • Therapist: Sarah J.</div>
                        </div>
                        <div className="font-mono font-bold text-emerald-400">
                          {company.currency || 'KES'} {srv.price.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-white text-sm">
                    <span>Subtotal:</span>
                    <span className="font-mono text-emerald-400">
                      {company.currency || 'KES'} {(services.slice(0,2).reduce((a,b)=>a+b.price,0)).toLocaleString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="bg-emerald-600/20 text-emerald-300 text-center py-2 rounded-lg text-[11px] font-bold border border-emerald-500/30">
                      Pay Cash
                    </div>
                    <div className="bg-teal-600/20 text-teal-300 text-center py-2 rounded-lg text-[11px] font-bold border border-teal-500/30">
                      Pay M-Pesa / Card
                    </div>
                  </div>
                </div>
              )}

              {tab === 'transactions' && (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400 text-[11px] border-b border-slate-800 pb-1">
                    <span>Receipt No</span>
                    <span>Service</span>
                    <span>Total</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/50">
                    <span className="font-mono text-teal-400">#REC-8801</span>
                    <span className="text-slate-200">Deep Tissue Massage</span>
                    <span className="font-mono text-emerald-400">KES 4,500</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/50">
                    <span className="font-mono text-teal-400">#REC-8802</span>
                    <span className="text-slate-200">Botanical Facial</span>
                    <span className="font-mono text-emerald-400">KES 3,500</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="font-mono text-teal-400">#REC-8803</span>
                    <span className="text-slate-200">Spa Pedicure</span>
                    <span className="font-mono text-emerald-400">KES 2,500</span>
                  </div>
                </div>
              )}

              {tab === 'customers' && (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-lg">
                    <Search className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-slate-500 text-[11px]">Search client name or phone...</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">Claire Wanjiku</div>
                      <div className="text-[10px] text-slate-400">+254 712 999 888 • 8 Visits</div>
                    </div>
                    <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded text-[10px] font-bold">
                      VIP Gold
                    </span>
                  </div>
                </div>
              )}

            </div>
          </div>

          <div className="pt-4 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Need assistance setting up current features? Head over to <strong className="text-teal-600 dark:text-teal-400">Services</strong> or <strong className="text-teal-600 dark:text-teal-400">Settings</strong>.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
