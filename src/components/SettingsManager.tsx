import React, { useState, useRef } from 'react';
import { 
  CompanyDetails, 
  Staff, 
  ReceiptSettings, 
  Category, 
  Service, 
  SettingsSubTab,
  PaymentMethodConfig
} from '../types';
import { PaymentSettings } from './PaymentSettings';
import { 
  Building2, 
  Users, 
  Printer, 
  Database, 
  Save, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Download, 
  Upload, 
  RefreshCw, 
  Eye, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle,
  UserPlus,
  ShieldAlert,
  Sparkles,
  FileText,
  Smartphone
} from 'lucide-react';

interface SettingsManagerProps {
  company: CompanyDetails;
  staff: Staff[];
  receiptSettings: ReceiptSettings;
  categories: Category[];
  services: Service[];
  paymentMethods: PaymentMethodConfig[];
  activeSubTab: SettingsSubTab;
  onSelectSubTab: (subTab: SettingsSubTab) => void;
  onSaveCompany: (updated: CompanyDetails) => void;
  onAddStaff: (member: Omit<Staff, 'id' | 'createdAt'>) => void;
  onEditStaff: (member: Staff) => void;
  onDeleteStaff: (staffId: string) => void;
  onSaveReceiptSettings: (updated: ReceiptSettings) => void;
  onSavePaymentMethods: (methods: PaymentMethodConfig[]) => void;
  onExportBackup: () => void;
  onImportBackup: (jsonStr: string) => { success: boolean; message: string };
  onImportLegacyBackup: (jsonStr: string) => { success: boolean; message: string };
  onResetDefaults: () => void;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({
  company,
  staff,
  receiptSettings,
  categories,
  services,
  paymentMethods,
  activeSubTab,
  onSelectSubTab,
  onSaveCompany,
  onAddStaff,
  onEditStaff,
  onDeleteStaff,
  onSaveReceiptSettings,
  onSavePaymentMethods,
  onExportBackup,
  onImportBackup,
  onImportLegacyBackup,
  onResetDefaults,
}) => {

  // Company Details Form State
  const [companyForm, setCompanyForm] = useState<CompanyDetails>({ ...company });
  const [companySavedMsg, setCompanySavedMsg] = useState(false);

  // Staff Form Modal State
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaffMember, setEditingStaffMember] = useState<Staff | null>(null);
  const [staffForm, setStaffForm] = useState<{
    name: string;
    role: string;
    phone: string;
    email: string;
    specializations: string[];
    status: 'active' | 'inactive';
  }>({
    name: '',
    role: 'Therapist',
    phone: '',
    email: '',
    specializations: [],
    status: 'active',
  });
  const [deletingStaffId, setDeletingStaffId] = useState<string | null>(null);

  // Receipt Settings State
  const [receiptForm, setReceiptForm] = useState<ReceiptSettings>({ ...receiptSettings });
  const [receiptSavedMsg, setReceiptSavedMsg] = useState(false);

  // Receipt Sample Data for Live Preview
  const [sampleReceiptNumber, setSampleReceiptNumber] = useState('REC-2026-0892');
  const [sampleCustomerName, setSampleCustomerName] = useState('Sarah Wambui');
  const [sampleEmployeeName, setSampleEmployeeName] = useState('Elena Rostova');
  const [samplePaymentMethod, setSamplePaymentMethod] = useState('M-Pesa (Ref: QK82910)');

  // Backup & Restore State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const legacyFileInputRef = useRef<HTMLInputElement>(null);
  const [backupMsg, setBackupMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Handle Save Company Form
  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCompany(companyForm);
    setCompanySavedMsg(true);
    setTimeout(() => setCompanySavedMsg(false), 3000);
  };

  // Handle Open Staff Modal
  const handleOpenStaffModal = (member?: Staff) => {
    if (member) {
      setEditingStaffMember(member);
      setStaffForm({
        name: member.name,
        role: member.role,
        phone: member.phone,
        email: member.email,
        specializations: member.specializations,
        status: member.status,
      });
    } else {
      setEditingStaffMember(null);
      setStaffForm({
        name: '',
        role: 'Spa Therapist',
        phone: '',
        email: '',
        specializations: [],
        status: 'active',
      });
    }
    setIsStaffModalOpen(true);
  };

  // Save Staff
  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name.trim()) return;

    if (editingStaffMember) {
      onEditStaff({
        ...editingStaffMember,
        ...staffForm,
      });
    } else {
      onAddStaff({
        ...staffForm,
        avatarColor: 'bg-emerald-500',
      });
    }
    setIsStaffModalOpen(false);
  };

  // Toggle staff specialization category
  const toggleStaffSpecialization = (catId: string) => {
    setStaffForm((prev) => {
      const exists = prev.specializations.includes(catId);
      if (exists) {
        return { ...prev, specializations: prev.specializations.filter((id) => id !== catId) };
      } else {
        return { ...prev, specializations: [...prev.specializations, catId] };
      }
    });
  };

  // Save Receipt Settings
  const handleReceiptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveReceiptSettings(receiptForm);
    setReceiptSavedMsg(true);
    setTimeout(() => setReceiptSavedMsg(false), 3000);
  };

  // Print Thermal Receipt Function
  const handlePrintReceiptWindow = () => {
    const printWindow = window.open('', '_blank', 'width=450,height=700');
    if (!printWindow) return;

    const sampleItems = services.slice(0, 3);
    const subtotal = sampleItems.reduce((acc, curr) => acc + curr.price, 0);

    const itemsHtml = sampleItems.map(item => `
      <tr class="item-row">
        <td>${item.name}<br/><span style="font-size: 9px; color: #555;">${item.durationMinutes} mins</span></td>
        <td class="right">${companyForm.currency || 'KES'} ${item.price.toLocaleString()}</td>
      </tr>
    `).join('');

    const templateHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt ${sampleReceiptNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Courier New', monospace;
            width: ${receiptForm.paperWidth || '80mm'};
            margin: 0 auto;
            padding: 12px;
            font-size: 12px;
            color: #000;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .divider { border-top: 1px dashed #000; margin: 8px 0; }
          .row { display: flex; justify-content: space-between; margin: 4px 0; }
          .total-row { font-size: 14px; font-weight: bold; margin-top: 8px; }
          table { width: 100%; margin: 8px 0; border-collapse: collapse; }
          td { padding: 4px 0; vertical-align: top; }
          .right { text-align: right; }
          @media print {
            body { width: ${receiptForm.paperWidth || '80mm'}; }
          }
        </style>
      </head>
      <body>
        <div class="center bold" style="font-size: 16px; margin-bottom: 4px;">
          ${companyForm.businessName || 'Serenity Luxe Spa'}
        </div>
        
        <div class="center" style="font-size: 10px; margin-bottom: 2px;">
          ${companyForm.phone || ''}
        </div>
        ${receiptForm.showEmail && companyForm.email ? `<div class="center" style="font-size: 10px; margin-bottom: 2px;">${companyForm.email}</div>` : ''}
        ${receiptForm.showWebsite && companyForm.website ? `<div class="center" style="font-size: 10px; margin-bottom: 2px;">${companyForm.website}</div>` : ''}
        <div class="center" style="font-size: 10px;">
          ${companyForm.address || ''}
        </div>
        
        <div class="divider"></div>

        ${receiptForm.headerNote ? `<div class="center bold" style="font-size: 11px; margin: 4px 0;">${receiptForm.headerNote}</div><div class="divider"></div>` : ''}
        
        <div class="row">
          <span>Receipt No:</span>
          <span class="bold">${sampleReceiptNumber}</span>
        </div>
        <div class="row">
          <span>Date:</span>
          <span>${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div class="row">
          <span>Customer:</span>
          <span>${sampleCustomerName}</span>
        </div>
        <div class="row">
          <span>Served by:</span>
          <span>${sampleEmployeeName}</span>
        </div>
        
        <div class="divider"></div>
        
        <table>
          <thead>
            <tr>
              <td class="bold">Service</td>
              <td class="bold right">Price</td>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <div class="divider"></div>
        
        <div class="row">
          <span>Subtotal:</span>
          <span>${companyForm.currency || 'KES'} ${subtotal.toLocaleString()}</span>
        </div>
        
        <div class="divider"></div>
        
        <div class="row total-row">
          <span>TOTAL:</span>
          <span>${companyForm.currency || 'KES'} ${subtotal.toLocaleString()}</span>
        </div>
        
        <div class="row" style="margin-top: 8px;">
          <span>Payment Method:</span>
          <span class="bold">${samplePaymentMethod}</span>
        </div>
        
        <div class="divider"></div>
        
        <div class="center" style="margin-top: 12px; font-size: 11px;">
          ${receiptForm.footerNote || 'Thank you for your business!'}
        </div>
        <div class="center" style="font-size: 10px; margin-top: 4px;">
          Please visit us again
        </div>
        
        <div class="center" style="margin-top: 16px; font-size: 9px; opacity: 0.8;">
          Powered by SpaFlow Management System
        </div>
        
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(templateHtml);
    printWindow.document.close();
  };

  // Import JSON Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = onImportBackup(content);
        if (res.success) {
          setBackupMsg({ type: 'success', text: res.message });
        } else {
          setBackupMsg({ type: 'error', text: res.message });
        }
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  // Import Legacy JSON Handler
  const handleLegacyFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = onImportLegacyBackup(content);
        if (res.success) {
          setBackupMsg({ type: 'success', text: res.message });
        } else {
          setBackupMsg({ type: 'error', text: res.message });
        }
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Sub-tab Navigation Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            System Settings & Operations
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage company info, staff therapist roster, thermal receipt layout, and database backup/restore.
          </p>
        </div>

        {/* Sub-tab Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-full md:w-auto">
          <button
            onClick={() => onSelectSubTab('company')}
            className={`flex-1 md:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === 'company'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            id="subtab-company"
          >
            <Building2 className="w-3.5 h-3.5 text-indigo-500" />
            <span>Company Details</span>
          </button>

          <button
            onClick={() => onSelectSubTab('staff')}
            className={`flex-1 md:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === 'staff'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            id="subtab-staff"
          >
            <Users className="w-3.5 h-3.5 text-blue-500" />
            <span>Staff ({staff.length})</span>
          </button>

          <button
            onClick={() => onSelectSubTab('receipt')}
            className={`flex-1 md:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === 'receipt'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            id="subtab-receipt"
          >
            <Printer className="w-3.5 h-3.5 text-teal-500" />
            <span>Receipt Templates</span>
          </button>

          <button
            onClick={() => onSelectSubTab('payment')}
            className={`flex-1 md:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === 'payment'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            id="subtab-payment"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
            <span>Payment Methods</span>
          </button>

          <button
            onClick={() => onSelectSubTab('backup')}
            className={`flex-1 md:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === 'backup'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            id="subtab-backup"
          >
            <Database className="w-3.5 h-3.5 text-amber-500" />
            <span>Backup / Restore</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* PAYMENT METHODS SUBTAB */}
      {/* ========================================================= */}
      {activeSubTab === 'payment' && (
        <PaymentSettings
          paymentMethods={paymentMethods}
          onSavePaymentMethods={onSavePaymentMethods}
        />
      )}


      {/* ========================================================= */}
      {/* 1. COMPANY DETAILS SUBTAB */}
      {/* ========================================================= */}
      {activeSubTab === 'company' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Company Form */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-500" />
                Spa & Business Information
              </h3>
              {companySavedMsg && (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1 animate-fadeIn">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Company profile saved!
                </span>
              )}
            </div>

            <form onSubmit={handleCompanySubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Business Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={companyForm.businessName}
                    onChange={(e) => setCompanyForm({ ...companyForm, businessName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Currency Symbol */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Currency Symbol (e.g. KES, USD, EUR) *
                  </label>
                  <input
                    type="text"
                    required
                    value={companyForm.currency}
                    onChange={(e) => setCompanyForm({ ...companyForm, currency: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Business Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={companyForm.phone}
                      onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Business Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="email"
                      value={companyForm.email}
                      onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Website */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Website URL
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={companyForm.website}
                      onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Tax Rate % */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Default Tax / VAT Rate (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={companyForm.taxRate}
                    onChange={(e) => setCompanyForm({ ...companyForm, taxRate: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

              </div>

              {/* Physical Address */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Physical Location Address
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <textarea
                    rows={2}
                    value={companyForm.address}
                    onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  ></textarea>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-2 active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Company Details</span>
                </button>
              </div>

            </form>
          </div>

          {/* Company Card Preview */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Live Business Profile Card
            </h3>

            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-lg border border-slate-800 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 font-bold">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-lg text-white">
                    {companyForm.businessName || 'Business Name'}
                  </h4>
                  <p className="text-xs text-indigo-200">
                    Currency: <span className="font-mono font-bold text-emerald-400">{companyForm.currency || 'KES'}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{companyForm.phone || 'Phone not set'}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{companyForm.email || 'Email not set'}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{companyForm.website || 'Website not set'}</span>
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{companyForm.address || 'Address not set'}</span>
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* 2. STAFF MANAGEMENT SUBTAB */}
      {/* ========================================================= */}
      {activeSubTab === 'staff' && (
        <div className="space-y-5">
          
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Staff Therapists & Technicians Roster
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage therapists, beauty technicians, front desk employees, and their specializations.
              </p>
            </div>

            <button
              onClick={() => handleOpenStaffModal()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-95"
              id="add-staff-member-btn"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Staff Member</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staff.map((member) => (
              <div
                key={member.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full ${member.avatarColor || 'bg-blue-500'} text-white font-black text-sm flex items-center justify-center shadow-xs`}>
                        {member.name.split(' ').map(n=>n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                          {member.name}
                        </h4>
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 block">
                          {member.role}
                        </span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      member.status === 'active' 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}>
                      {member.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{member.phone || 'No phone'}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{member.email || 'No email'}</span>
                    </p>
                  </div>

                  {/* Specializations list */}
                  <div className="mt-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Specializations
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {member.specializations.map((specId) => {
                        const cat = categories.find((c) => c.id === specId);
                        return (
                          <span
                            key={specId}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white"
                            style={{ backgroundColor: cat?.color || '#3b82f6' }}
                          >
                            {cat?.name || specId}
                          </span>
                        );
                      })}
                      {member.specializations.length === 0 && (
                        <span className="text-[11px] text-slate-400 italic">All Treatments</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-1">
                  <button
                    onClick={() => handleOpenStaffModal(member)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition-colors"
                    title="Edit Staff Member"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingStaffId(member.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/60 transition-colors"
                    title="Delete Staff Member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* 3. RECEIPT TEMPLATES SUBTAB */}
      {/* ========================================================= */}
      {activeSubTab === 'receipt' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Controls & Options Editor */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Printer className="w-5 h-5 text-teal-500" />
                Thermal Receipt Template Options
              </h3>
              {receiptSavedMsg && (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1 animate-fadeIn">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Template saved!
                </span>
              )}
            </div>

            <form onSubmit={handleReceiptSubmit} className="space-y-4">
              
              {/* Header Note */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Top Header Greeting / Note
                </label>
                <input
                  type="text"
                  value={receiptForm.headerNote}
                  onChange={(e) => setReceiptForm({ ...receiptForm, headerNote: e.target.value })}
                  placeholder="e.g. Welcome to Serenity Luxe Spa!"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Footer Note */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Bottom Footer Gratitude / Note
                </label>
                <input
                  type="text"
                  value={receiptForm.footerNote}
                  onChange={(e) => setReceiptForm({ ...receiptForm, footerNote: e.target.value })}
                  placeholder="e.g. Thank you for your business! Please visit us again."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Display Options Checkboxes */}
              <div className="space-y-2 pt-1">
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Header Display Elements
                </span>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="receipt-show-email"
                    checked={receiptForm.showEmail}
                    onChange={(e) => setReceiptForm({ ...receiptForm, showEmail: e.target.checked })}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                  />
                  <label htmlFor="receipt-show-email" className="text-xs text-slate-700 dark:text-slate-300">
                    Include Business Email on Receipt
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="receipt-show-website"
                    checked={receiptForm.showWebsite}
                    onChange={(e) => setReceiptForm({ ...receiptForm, showWebsite: e.target.checked })}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                  />
                  <label htmlFor="receipt-show-website" className="text-xs text-slate-700 dark:text-slate-300">
                    Include Website URL on Receipt
                  </label>
                </div>
              </div>

              {/* Paper Width Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Thermal Paper Width Standard
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setReceiptForm({ ...receiptForm, paperWidth: '80mm' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      receiptForm.paperWidth === '80mm'
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    80mm Standard POS Thermal
                  </button>
                  <button
                    type="button"
                    onClick={() => setReceiptForm({ ...receiptForm, paperWidth: '58mm' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      receiptForm.paperWidth === '58mm'
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    58mm Compact Thermal
                  </button>
                </div>
              </div>

              {/* Interactive Sample Data Inputs for Live Preview */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <span className="block text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  Sample Variables for Preview
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Receipt No:</label>
                    <input
                      type="text"
                      value={sampleReceiptNumber}
                      onChange={(e) => setSampleReceiptNumber(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Customer Name:</label>
                    <input
                      type="text"
                      value={sampleCustomerName}
                      onChange={(e) => setSampleCustomerName(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Served By:</label>
                    <input
                      type="text"
                      value={sampleEmployeeName}
                      onChange={(e) => setSampleEmployeeName(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Payment Method:</label>
                    <input
                      type="text"
                      value={samplePaymentMethod}
                      onChange={(e) => setSamplePaymentMethod(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePrintReceiptWindow}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-teal-400 font-bold rounded-xl text-xs border border-slate-700 flex items-center gap-2 active:scale-95"
                  id="print-sample-receipt-btn"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt Sample</span>
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-2 active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Template</span>
                </button>
              </div>

            </form>
          </div>

          {/* Live Thermal Receipt 80mm Preview Container */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-teal-500" />
                Live 80mm Thermal Receipt Layout
              </span>
              <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono px-2 py-0.5 rounded font-bold">
                {receiptForm.paperWidth || '80mm'}
              </span>
            </div>

            {/* Exact Thermal Paper Styled Wrapper */}
            <div className="bg-slate-200 dark:bg-slate-950 p-4 sm:p-6 rounded-3xl flex justify-center shadow-inner overflow-x-auto">
              
              <div 
                className="bg-white text-black font-mono shadow-2xl p-4 text-xs select-none border border-slate-300"
                style={{ width: receiptForm.paperWidth === '58mm' ? '58mm' : '80mm', minHeight: '400mm' }}
              >
                
                {/* Company Name */}
                <div className="text-center font-bold text-sm tracking-tight mb-1">
                  {company.businessName || 'Serenity Luxe Spa & Wellness'}
                </div>

                {/* Company Info */}
                <div className="text-center text-[10px] mb-0.5">
                  {company.phone || '+254 712 345 678'}
                </div>
                {receiptForm.showEmail && company.email && (
                  <div className="text-center text-[10px] mb-0.5">{company.email}</div>
                )}
                {receiptForm.showWebsite && company.website && (
                  <div className="text-center text-[10px] mb-0.5">{company.website}</div>
                )}
                <div className="text-center text-[10px] mb-2 leading-tight">
                  {company.address || 'Suite 402, Rose Avenue, Nairobi'}
                </div>

                <div className="border-t border-dashed border-black my-2"></div>

                {/* Header note if provided */}
                {receiptForm.headerNote && (
                  <>
                    <div className="text-center font-bold text-[11px] my-1">
                      {receiptForm.headerNote}
                    </div>
                    <div className="border-t border-dashed border-black my-2"></div>
                  </>
                )}

                {/* Receipt Details */}
                <div className="flex justify-between my-1">
                  <span>Receipt No:</span>
                  <span className="font-bold">{sampleReceiptNumber}</span>
                </div>
                <div className="flex justify-between my-1">
                  <span>Date:</span>
                  <span>{new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex justify-between my-1">
                  <span>Customer:</span>
                  <span>{sampleCustomerName}</span>
                </div>
                <div className="flex justify-between my-1">
                  <span>Served by:</span>
                  <span>{sampleEmployeeName}</span>
                </div>

                <div className="border-t border-dashed border-black my-2"></div>

                {/* Service Items Table */}
                <table className="w-full text-left my-2 border-collapse">
                  <thead>
                    <tr className="border-b border-black font-bold">
                      <td className="py-1">Service</td>
                      <td className="py-1 text-right">Price</td>
                    </tr>
                  </thead>
                  <tbody>
                    {services.slice(0, 3).map((srv) => (
                      <tr key={srv.id} className="align-top">
                        <td className="py-1">
                          <div className="font-bold">{srv.name}</div>
                          <div className="text-[9px] text-neutral-600">{srv.durationMinutes} mins</div>
                        </td>
                        <td className="py-1 text-right whitespace-nowrap">
                          {company.currency || 'KES'} {srv.price.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="border-t border-dashed border-black my-2"></div>

                {/* Subtotal */}
                <div className="flex justify-between my-1">
                  <span>Subtotal:</span>
                  <span>
                    {company.currency || 'KES'} {(services.slice(0, 3).reduce((acc, curr) => acc + curr.price, 0)).toLocaleString()}
                  </span>
                </div>

                <div className="border-t border-dashed border-black my-2"></div>

                {/* Total */}
                <div className="flex justify-between font-bold text-sm my-2">
                  <span>TOTAL:</span>
                  <span>
                    {company.currency || 'KES'} {(services.slice(0, 3).reduce((acc, curr) => acc + curr.price, 0)).toLocaleString()}
                  </span>
                </div>

                {/* Payment Method */}
                <div className="flex justify-between my-2">
                  <span>Payment Method:</span>
                  <span className="font-bold">{samplePaymentMethod}</span>
                </div>

                <div className="border-t border-dashed border-black my-2"></div>

                {/* Footer Message */}
                <div className="text-center mt-3 text-[11px]">
                  {receiptForm.footerNote || 'Thank you for your business!'}
                </div>
                <div className="text-center text-[10px] mt-1">
                  Please visit us again
                </div>

                <div className="text-center mt-4 text-[9px] text-neutral-500">
                  Powered by SpaFlow Management System
                </div>

              </div>

            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* 4. BACKUP AND RESTORE SUBTAB */}
      {/* ========================================================= */}
      {activeSubTab === 'backup' && (
        <div className="max-w-4xl mx-auto space-y-6">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Database className="w-6 h-6 text-amber-500" />
                System Backup, Export & Restore
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Download a JSON backup of your entire spa catalog, categories, staff roster, company settings, and activity logs. You can restore your system from a backup at any time.
              </p>
            </div>

            {backupMsg && (
              <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between ${
                backupMsg.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                  : 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-500/30'
              }`}>
                <span>{backupMsg.text}</span>
                <button onClick={() => setBackupMsg(null)} className="p-1 hover:opacity-75">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              
              {/* Export Card */}
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-3">
                    <Download className="w-5 h-5" />
                  </div>
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                    Export JSON Backup
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Save a full snapshot of your current Spa database ({services.length} services, {categories.length} categories, {staff.length} staff members).
                  </p>
                </div>

                <button
                  onClick={onExportBackup}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
                  id="export-backup-btn"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .JSON Backup</span>
                </button>
              </div>

              {/* Import Card */}
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                    <Upload className="w-5 h-5" />
                  </div>
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                    Restore from JSON
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Upload a previously exported `.json` file to restore services, categories, and settings.
                  </p>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".json"
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
                  id="import-backup-btn"
                >
                  <Upload className="w-4 h-4" />
                  <span>Select & Upload JSON File</span>
                </button>
              </div>

              {/* Legacy V1 Import Card */}
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                    <Database className="w-5 h-5" />
                  </div>
                  <h4 className="font-extrabold text-base text-amber-900 dark:text-amber-100">
                    Import Legacy V1 Data
                  </h4>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                    Upgrade from a previous SpaFlow v1 system. Upload your legacy database `.json` file to map and restore old data.
                  </p>
                </div>

                <input
                  type="file"
                  ref={legacyFileInputRef}
                  onChange={handleLegacyFileUpload}
                  accept=".json"
                  className="hidden"
                />

                <button
                  onClick={() => legacyFileInputRef.current?.click()}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
                  id="import-legacy-btn"
                >
                  <Upload className="w-4 h-4" />
                  <span>Select Legacy JSON</span>
                </button>
              </div>

            </div>

            {/* Factory Reset Section */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  Reset to Default Sample Data
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Revert all services, categories, staff, and company info back to the default sample dataset.
                </p>
              </div>

              <button
                onClick={() => setIsResetConfirmOpen(true)}
                className="px-4 py-2.5 bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white border border-red-500/30 rounded-xl text-xs font-bold transition-all"
                id="reset-factory-defaults-btn"
              >
                Reset System
              </button>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* STAFF MODAL (ADD / EDIT) */}
      {/* ========================================================= */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-scaleUp space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                {editingStaffMember ? 'Edit Staff Member' : 'Add Staff Member'}
              </h3>
              <button
                onClick={() => setIsStaffModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    value={staffForm.name}
                    onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Role / Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Therapist"
                    value={staffForm.role}
                    onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+254 700 000 000"
                    value={staffForm.phone}
                    onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="staff@spaflow.com"
                    value={staffForm.email}
                    onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Specializations Category selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Treatment Specializations
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const isSelected = staffForm.specializations.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleStaffSpecialization(cat.id)}
                        className={`text-xs px-3 py-1.5 rounded-xl font-bold border transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '} {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Active Status
                </label>
                <select
                  value={staffForm.status}
                  onChange={(e) => setStaffForm({ ...staffForm, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active (Available on schedule)</option>
                  <option value="inactive">Inactive (Off duty)</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md active:scale-95"
                >
                  {editingStaffMember ? 'Save Staff' : 'Create Staff Member'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* DELETE STAFF CONFIRMATION MODAL */}
      {deletingStaffId && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-scaleUp text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Remove Staff Member?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to remove this staff profile from your roster?
              </p>
            </div>
            <div className="flex items-center justify-center space-x-2 pt-2">
              <button
                onClick={() => setDeletingStaffId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteStaff(deletingStaffId);
                  setDeletingStaffId(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white transition-all shadow-md"
              >
                Delete Staff
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM SYSTEM RESET MODAL */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-scaleUp text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Reset System to Defaults?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                This will reset services, categories, staff, and settings back to default sample state. Any custom services added will be cleared.
              </p>
            </div>
            <div className="flex items-center justify-center space-x-2 pt-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onResetDefaults();
                  setIsResetConfirmOpen(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white transition-all shadow-md"
              >
                Yes, Reset System
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
