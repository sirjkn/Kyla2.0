import React, { useState } from 'react';
import { PaymentMethodConfig } from '../types';
import { Smartphone, Banknote, CreditCard, Save, CheckCircle2, ShieldCheck } from 'lucide-react';

interface PaymentSettingsProps {
  paymentMethods: PaymentMethodConfig[];
  onSavePaymentMethods: (updated: PaymentMethodConfig[]) => void;
}

export const PaymentSettings: React.FC<PaymentSettingsProps> = ({
  paymentMethods,
  onSavePaymentMethods,
}) => {
  const [methods, setMethods] = useState<PaymentMethodConfig[]>(paymentMethods);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleToggleEnable = (id: string) => {
    setMethods((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isEnabled: !m.isEnabled } : m))
    );
  };

  const handleSetDefault = (id: string) => {
    setMethods((prev) =>
      prev.map((m) => ({
        ...m,
        isDefault: m.id === id,
      }))
    );
  };

  const handleFieldChange = (id: string, field: keyof PaymentMethodConfig, value: any) => {
    setMethods((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePaymentMethods(methods);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-blue-500" />
            Payment Methods Configuration
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure accepted payment channels, M-Pesa till/paybill credentials, cash defaults, and PDQ card settings.
          </p>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md flex items-center space-x-2"
          id="save-payment-methods-btn"
        >
          <Save className="w-4 h-4" />
          <span>Save Payment Settings</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 p-3 rounded-xl text-xs font-bold flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Payment methods updated successfully! Changes applied to Point of Sale register.</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        
        {/* M-Pesa Configuration Card */}
        {methods.map((pm) => {
          const isMpesa = pm.id === 'mpesa';
          const isCash = pm.id === 'cash';
          const isCard = pm.id === 'card';
          const Icon = isMpesa ? Smartphone : isCash ? Banknote : CreditCard;

          return (
            <div
              key={pm.id}
              className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm space-y-4 transition-all ${
                pm.isEnabled
                  ? 'border-slate-200 dark:border-slate-800'
                  : 'border-slate-200/50 dark:border-slate-800/50 opacity-60'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${
                      isMpesa
                        ? 'bg-blue-600'
                        : isCash
                        ? 'bg-amber-600'
                        : 'bg-purple-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <span>{pm.name}</span>
                      {pm.isDefault && (
                        <span className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold">
                          Default POS Method
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{pm.description}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Default Radio */}
                  {pm.isEnabled && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(pm.id)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                        pm.isDefault
                          ? 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400'
                          : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {pm.isDefault ? '✓ Default' : 'Set as Default'}
                    </button>
                  )}

                  {/* Enable Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pm.isEnabled}
                      onChange={() => handleToggleEnable(pm.id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* M-Pesa Specific Credentials */}
              {isMpesa && pm.isEnabled && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      M-Pesa Type
                    </label>
                    <select
                      value={pm.mpesaType || 'till'}
                      onChange={(e) => handleFieldChange(pm.id, 'mpesaType', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none"
                    >
                      <option value="till">Buy Goods Till Number</option>
                      <option value="paybill">Paybill Number</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Till / Paybill Number
                    </label>
                    <input
                      type="text"
                      value={pm.mpesaNumber || ''}
                      onChange={(e) => handleFieldChange(pm.id, 'mpesaNumber', e.target.value)}
                      placeholder="e.g. 889900"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-mono rounded-xl px-3 py-2 font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Registered Store Account Name
                    </label>
                    <input
                      type="text"
                      value={pm.mpesaAccountName || ''}
                      onChange={(e) => handleFieldChange(pm.id, 'mpesaAccountName', e.target.value)}
                      placeholder="e.g. Serenity Luxe Spa"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Instructions text */}
              {pm.isEnabled && (
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Cashier Display Instructions / Notes
                  </label>
                  <input
                    type="text"
                    value={pm.instructions || ''}
                    onChange={(e) => handleFieldChange(pm.id, 'instructions', e.target.value)}
                    placeholder="Instructions shown on register screen..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none"
                  />
                </div>
              )}

            </div>
          );
        })}

      </div>

    </form>
  );
};
