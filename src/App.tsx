import React, { useState, useEffect } from 'react';
import { 
  MainTab, 
  SettingsSubTab, 
  Category, 
  Service, 
  Staff, 
  CompanyDetails, 
  ReceiptSettings, 
  ActivityLog,
  Transaction,
  PaymentMethodConfig,
  ThemeMode,
  Customer
} from './types';
import { 
  loadCategories, saveCategories,
  loadServices, saveServices,
  loadStaff, saveStaff,
  loadCompanyDetails, saveCompanyDetails,
  loadReceiptSettings, saveReceiptSettings,
  loadActivityLogs, createActivityLog,
  loadTransactions, saveTransactions,
  loadPaymentMethods, savePaymentMethods,
  loadCustomers, saveCustomers,
  loadTheme, saveTheme,
  exportBackupJSON, importBackupJSON, importLegacyJSON, resetToFactoryDefaults
} from './lib/storage';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { Dashboard } from './components/Dashboard';
import { ComingSoonView } from './components/ComingSoonView';
import { ServicesManager } from './components/ServicesManager';
import { SettingsManager } from './components/SettingsManager';
import { POSManager } from './components/POSManager';
import { TransactionsManager } from './components/TransactionsManager';
import { CustomersManager } from './components/CustomersManager';
import { LoginPage } from './components/LoginPage';
import { ChangePasswordModal } from './components/ChangePasswordModal';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; role: string } | null>(() => {
    try {
      const saved = localStorage.getItem('spaflow_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // Main Tab State
  const [activeTab, setActiveTab] = useState<MainTab>('dashboard');
  const [settingsSubTab, setSettingsSubTab] = useState<SettingsSubTab>('company');

  // Theme State (Enforced Light Mode)
  const [theme, setTheme] = useState<ThemeMode>('light');

  // Core Persistent State
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [company, setCompany] = useState<CompanyDetails>({
    businessName: 'Kyla Barber Shop',
    phone: '0700000000',
    email: 'info@kylabarber.co.ke',
    website: 'www.kylaspa.co.ke',
    address: 'Gitanga Road opposite Valley Archade',
    currency: 'KES',
    taxRate: 0,
  });
  const [receiptSettings, setReceiptSettings] = useState<ReceiptSettings>({
    headerNote: 'Welcome to Kyla Barber Shop & Spa!',
    footerNote: 'Thank you for your business! Please visit us again.',
    showLogo: true,
    showWebsite: true,
    showEmail: true,
    paperWidth: '80mm',
  });
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Load Initial Data from localStorage on Mount
  useEffect(() => {
    setCategories(loadCategories());
    setServices(loadServices());
    setStaff(loadStaff());
    setCompany(loadCompanyDetails());
    setReceiptSettings(loadReceiptSettings());
    setActivityLogs(loadActivityLogs());
    setPaymentMethods(loadPaymentMethods());
    setTransactions(loadTransactions());
    setCustomers(loadCustomers());

    // Enforce light mode
    document.documentElement.classList.remove('dark');
    setTheme('light');
    saveTheme('light');
  }, []);

  // Sync theme class on <html> element
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    saveTheme('light');
  }, [theme]);

  // Toggle Theme Handler (Light Mode Enforced)
  const handleToggleTheme = () => {
    document.documentElement.classList.remove('dark');
    setTheme('light');
    saveTheme('light');
  };

  // Handle Completed POS Checkout Transaction
  const handleCompleteTransaction = (newTx: Omit<Transaction, 'id' | 'receiptNo' | 'createdAt'>) => {
    const nextReceiptNum = `REC-2026-${String(transactions.length + 101).padStart(4, '0')}`;
    const completeTx: Transaction = {
      ...newTx,
      id: 'tx-' + Date.now(),
      receiptNo: nextReceiptNum,
      createdAt: new Date().toISOString(),
    };

    const updated = [completeTx, ...transactions];
    setTransactions(updated);
    saveTransactions(updated);

    const log = createActivityLog(
      'Sale Completed',
      `Processed ${completeTx.items.length} service(s) for ${completeTx.customerName || 'Walk-in'} via ${completeTx.paymentMethod.toUpperCase()} (${company.currency || 'KES'} ${completeTx.total.toLocaleString()})`,
      'pos'
    );
    setActivityLogs((prev) => [log, ...prev]);

    return completeTx;
  };

  // Transaction Management Handlers
  const handleEditTransaction = (updatedTx: Transaction) => {
    const updated = transactions.map((t) => (t.id === updatedTx.id ? updatedTx : t));
    setTransactions(updated);
    saveTransactions(updated);

    const log = createActivityLog(
      'Transaction Updated',
      `Updated transaction receipt #${updatedTx.receiptNo}`,
      'pos'
    );
    setActivityLogs((prev) => [log, ...prev]);
  };

  const handleDeleteTransaction = (transactionId: string) => {
    const target = transactions.find((t) => t.id === transactionId);
    const updated = transactions.filter((t) => t.id !== transactionId);
    setTransactions(updated);
    saveTransactions(updated);

    if (target) {
      const log = createActivityLog(
        'Transaction Deleted',
        `Deleted transaction receipt #${target.receiptNo}`,
        'pos'
      );
      setActivityLogs((prev) => [log, ...prev]);
    }
  };

  const handleDeleteAllTransactions = () => {
    setTransactions([]);
    saveTransactions([]);

    const log = createActivityLog(
      'All Transactions Cleared',
      'Cleared all transaction records from system ledger',
      'pos'
    );
    setActivityLogs((prev) => [log, ...prev]);
  };

  // Customer Management Handlers
  const handleAddCustomer = (newCustomerData: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer: Customer = {
      ...newCustomerData,
      id: 'cust-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    const updated = [newCustomer, ...customers];
    setCustomers(updated);
    saveCustomers(updated);

    const log = createActivityLog(
      'Customer Registered',
      `Registered new customer: ${newCustomer.name}`,
      'company'
    );
    setActivityLogs((prev) => [log, ...prev]);
  };

  const handleEditCustomer = (updatedCust: Customer) => {
    const updated = customers.map((c) => (c.id === updatedCust.id ? updatedCust : c));
    setCustomers(updated);
    saveCustomers(updated);

    const log = createActivityLog(
      'Customer Profile Updated',
      `Updated customer profile: ${updatedCust.name}`,
      'company'
    );
    setActivityLogs((prev) => [log, ...prev]);
  };

  const handleDeleteCustomer = (customerId: string) => {
    const target = customers.find((c) => c.id === customerId);
    const updated = customers.filter((c) => c.id !== customerId);
    setCustomers(updated);
    saveCustomers(updated);

    if (target) {
      const log = createActivityLog(
        'Customer Removed',
        `Removed customer: ${target.name}`,
        'company'
      );
      setActivityLogs((prev) => [log, ...prev]);
    }
  };

  // Handle Save Payment Methods
  const handleSavePaymentMethods = (updatedMethods: PaymentMethodConfig[]) => {
    setPaymentMethods(updatedMethods);
    savePaymentMethods(updatedMethods);

    const log = createActivityLog(
      'Payment Settings Updated',
      'Updated M-Pesa, Cash, and Card configurations',
      'company'
    );
    setActivityLogs((prev) => [log, ...prev]);
  };

  // Sync state helpers
  const handleAddService = (newServiceData: Omit<Service, 'id' | 'createdAt'>) => {
    const newService: Service = {
      ...newServiceData,
      id: 'srv-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    const updated = [newService, ...services];
    setServices(updated);
    saveServices(updated);

    const log = createActivityLog('Service Created', `Added "${newService.name}" (${newService.durationMinutes}m, ${company.currency || 'KES'} ${newService.price})`, 'service');
    setActivityLogs((prev) => [log, ...prev]);
  };

  const handleEditService = (updatedService: Service) => {
    const updated = services.map((s) => (s.id === updatedService.id ? updatedService : s));
    setServices(updated);
    saveServices(updated);

    const log = createActivityLog('Service Updated', `Updated service "${updatedService.name}"`, 'service');
    setActivityLogs((prev) => [log, ...prev]);
  };

  const handleDeleteService = (serviceId: string) => {
    const target = services.find((s) => s.id === serviceId);
    const updated = services.filter((s) => s.id !== serviceId);
    setServices(updated);
    saveServices(updated);

    if (target) {
      const log = createActivityLog('Service Deleted', `Removed service "${target.name}"`, 'service');
      setActivityLogs((prev) => [log, ...prev]);
    }
  };

  const handleAddCategory = (newCatData: Omit<Category, 'id' | 'createdAt'>) => {
    const newCat: Category = {
      ...newCatData,
      id: 'cat-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...categories, newCat];
    setCategories(updated);
    saveCategories(updated);

    const log = createActivityLog('Category Created', `Created category "${newCat.name}"`, 'category');
    setActivityLogs((prev) => [log, ...prev]);
  };

  const handleEditCategory = (updatedCat: Category) => {
    const updated = categories.map((c) => (c.id === updatedCat.id ? updatedCat : c));
    setCategories(updated);
    saveCategories(updated);

    const log = createActivityLog('Category Updated', `Updated category "${updatedCat.name}"`, 'category');
    setActivityLogs((prev) => [log, ...prev]);
  };

  const handleDeleteCategory = (categoryId: string): { success: boolean; message?: string } => {
    const assignedServices = services.filter((s) => s.categoryId === categoryId);
    if (assignedServices.length > 0) {
      return { 
        success: false, 
        message: `Cannot delete category. There are ${assignedServices.length} active service(s) assigned to it.` 
      };
    }

    const target = categories.find((c) => c.id === categoryId);
    const updated = categories.filter((c) => c.id !== categoryId);
    setCategories(updated);
    saveCategories(updated);

    if (target) {
      const log = createActivityLog('Category Deleted', `Deleted category "${target.name}"`, 'category');
      setActivityLogs((prev) => [log, ...prev]);
    }
    return { success: true };
  };

  const handleSaveCompany = (updatedCompany: CompanyDetails) => {
    setCompany(updatedCompany);
    saveCompanyDetails(updatedCompany);

    const log = createActivityLog('Company Details Saved', `Updated company info for "${updatedCompany.businessName}"`, 'company');
    setActivityLogs((prev) => [log, ...prev]);
  };

  const handleAddStaff = (newStaffData: Omit<Staff, 'id' | 'createdAt'>) => {
    const newMember: Staff = {
      ...newStaffData,
      id: 'stf-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...staff, newMember];
    setStaff(updated);
    saveStaff(updated);

    const log = createActivityLog('Staff Member Added', `Registered staff therapist "${newMember.name}" (${newMember.role})`, 'staff');
    setActivityLogs((prev) => [log, ...prev]);
  };

  const handleEditStaff = (updatedMember: Staff) => {
    const updated = staff.map((st) => (st.id === updatedMember.id ? updatedMember : st));
    setStaff(updated);
    saveStaff(updated);

    const log = createActivityLog('Staff Member Updated', `Updated staff member "${updatedMember.name}"`, 'staff');
    setActivityLogs((prev) => [log, ...prev]);
  };

  const handleDeleteStaff = (staffId: string) => {
    const target = staff.find((st) => st.id === staffId);
    const updated = staff.filter((st) => st.id !== staffId);
    setStaff(updated);
    saveStaff(updated);

    if (target) {
      const log = createActivityLog('Staff Member Removed', `Removed staff member "${target.name}"`, 'staff');
      setActivityLogs((prev) => [log, ...prev]);
    }
  };

  const handleSaveReceiptSettings = (updatedReceipt: ReceiptSettings) => {
    setReceiptSettings(updatedReceipt);
    saveReceiptSettings(updatedReceipt);

    const log = createActivityLog('Receipt Template Saved', 'Updated 80mm thermal receipt layout preferences', 'company');
    setActivityLogs((prev) => [log, ...prev]);
  };

  const handleExportBackup = () => {
    const jsonStr = exportBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spaflow-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    const log = createActivityLog('Backup Exported', 'Downloaded full system backup JSON file', 'backup');
    setActivityLogs((prev) => [log, ...prev]);
  };

  const handleImportBackup = (jsonStr: string) => {
    const res = importBackupJSON(jsonStr);
    if (res.success) {
      setCategories(loadCategories());
      setServices(loadServices());
      setStaff(loadStaff());
      setCompany(loadCompanyDetails());
      setReceiptSettings(loadReceiptSettings());
      setActivityLogs(loadActivityLogs());
      setPaymentMethods(loadPaymentMethods());
      setTransactions(loadTransactions());
      setCustomers(loadCustomers());
    }
    return res;
  };

  const handleImportLegacyBackup = (jsonStr: string) => {
    const res = importLegacyJSON(jsonStr);
    if (res.success) {
      setCategories(loadCategories());
      setServices(loadServices());
      setStaff(loadStaff());
      setCompany(loadCompanyDetails());
      setReceiptSettings(loadReceiptSettings());
      setActivityLogs(loadActivityLogs());
      setPaymentMethods(loadPaymentMethods());
      setTransactions(loadTransactions());
      setCustomers(loadCustomers());
    }
    return res;
  };

  const handleResetDefaults = () => {
    resetToFactoryDefaults();
    setCategories(loadCategories());
    setServices(loadServices());
    setStaff(loadStaff());
    setCompany(loadCompanyDetails());
    setReceiptSettings(loadReceiptSettings());
    setActivityLogs(loadActivityLogs());
    setPaymentMethods(loadPaymentMethods());
    setTransactions(loadTransactions());
    setCustomers(loadCustomers());
  };

  const handleLogin = (user: { id: string; name: string; role: string }) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('spaflow_current_user', JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
    createActivityLog('User Signed In', `${user.name} (${user.role}) logged in to system.`, 'company');
    setActivityLogs(loadActivityLogs());
  };

  const handleLogout = () => {
    // 1. Force automated full data backup download
    try {
      handleExportBackup();
    } catch (e) {
      console.error('Auto backup failed during logout:', e);
    }

    if (currentUser) {
      createActivityLog('User Signed Out', `${currentUser.name} signed out (Forced backup downloaded).`, 'company');
      setActivityLogs(loadActivityLogs());
    }
    setCurrentUser(null);
    try {
      localStorage.removeItem('spaflow_current_user');
    } catch (e) {
      console.error(e);
    }
  };

  // Render Login Page if User is not Authenticated
  if (!currentUser) {
    return (
      <LoginPage
        staff={staff}
        company={company}
        onLogin={handleLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-teal-500 selection:text-white transition-colors duration-200">
      
      {/* Top Header */}
      <Header 
        company={company}
        currentUser={currentUser}
        onNavigateToServices={() => setActiveTab('services')}
        onNavigateToPos={() => setActiveTab('pos')}
        onChangePassword={() => setShowChangePasswordModal(true)}
        onLogout={handleLogout}
      />

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <ChangePasswordModal
          currentUser={currentUser}
          onClose={() => setShowChangePasswordModal(false)}
        />
      )}

      {/* Main Body Layout: Sidebar + Main Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-[1600px] w-full mx-auto">
        
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          serviceCount={services.length}
          categoryCount={categories.length}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        {/* Main Workspace View Content */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto pb-24 lg:pb-8">
          
          {activeTab === 'dashboard' && (
            <Dashboard
              services={services}
              categories={categories}
              staff={staff}
              company={company}
              activityLogs={activityLogs}
              onNavigateToTab={setActiveTab}
              onNavigateToSettingsSubTab={(sub) => {
                setActiveTab('settings');
                setSettingsSubTab(sub);
              }}
            />
          )}

          {activeTab === 'pos' && (
            <POSManager
              services={services}
              categories={categories}
              staff={staff}
              company={company}
              paymentMethods={paymentMethods}
              receiptSettings={receiptSettings}
              onCompleteSale={handleCompleteTransaction}
              onCompleteTransaction={handleCompleteTransaction}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsManager
              transactions={transactions}
              staff={staff}
              company={company}
              receiptSettings={receiptSettings}
              paymentMethods={paymentMethods}
              onNavigateToPOS={() => setActiveTab('pos')}
              onEditTransaction={handleEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onDeleteAllTransactions={handleDeleteAllTransactions}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersManager
              customers={customers}
              transactions={transactions}
              company={company}
              onAddCustomer={handleAddCustomer}
              onEditCustomer={handleEditCustomer}
              onDeleteCustomer={handleDeleteCustomer}
            />
          )}

          {activeTab === 'services' && (
            <ServicesManager
              services={services}
              categories={categories}
              company={company}
              onAddService={handleAddService}
              onEditService={handleEditService}
              onDeleteService={handleDeleteService}
              onAddCategory={handleAddCategory}
              onEditCategory={handleEditCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsManager
              company={company}
              staff={staff}
              receiptSettings={receiptSettings}
              categories={categories}
              services={services}
              paymentMethods={paymentMethods}
              activeSubTab={settingsSubTab}
              onSelectSubTab={setSettingsSubTab}
              onSaveCompany={handleSaveCompany}
              onAddStaff={handleAddStaff}
              onEditStaff={handleEditStaff}
              onDeleteStaff={handleDeleteStaff}
              onSaveReceiptSettings={handleSaveReceiptSettings}
              onSavePaymentMethods={handleSavePaymentMethods}
              onExportBackup={handleExportBackup}
              onImportBackup={handleImportBackup}
              onImportLegacyBackup={handleImportLegacyBackup}
              onResetDefaults={handleResetDefaults}
            />
          )}

        </main>

      </div>

      {/* App-like Mobile Bottom Navigation Bar */}
      <MobileNav 
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        serviceCount={services.length}
        transactionCount={transactions.length}
      />

    </div>
  );
}

