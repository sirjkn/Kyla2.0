import { 
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
} from '../types';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_SERVICES, 
  INITIAL_STAFF, 
  INITIAL_COMPANY_DETAILS, 
  INITIAL_RECEIPT_SETTINGS,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_PAYMENT_METHODS,
  INITIAL_TRANSACTIONS,
  INITIAL_CUSTOMERS
} from '../data/initialData';

export const STORAGE_KEYS = {
  CATEGORIES: 'spaflow_categories_v1',
  SERVICES: 'spaflow_services_v1',
  STAFF: 'spaflow_staff_v1',
  COMPANY: 'spaflow_company_v1',
  RECEIPT: 'spaflow_receipt_v1',
  LOGS: 'spaflow_logs_v1',
  TRANSACTIONS: 'spaflow_transactions_v1',
  PAYMENT_METHODS: 'spaflow_payments_v1',
  THEME: 'spaflow_theme_v1',
  CUSTOMERS: 'spaflow_customers_v1',
  PASSWORDS: 'spaflow_user_passwords_v1',
};

// Cloud SQL Online Sync Helper
export async function syncToCloud(key: string, data: any): Promise<void> {
  try {
    await fetch('/api/store/set', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, data }),
    });
  } catch (e) {
    console.error(`Failed to sync key ${key} to Cloud SQL`, e);
  }
}

// Fetch all online state from Cloud SQL database
export async function loadAllFromCloud(): Promise<boolean> {
  try {
    const res = await fetch('/api/store/all');
    if (!res.ok) return false;
    const json = await res.json();
    if (json.success && json.data) {
      const keys = Object.keys(json.data);
      if (keys.length === 0) {
        // Seed initial data to cloud if database is empty
        const initialItems = [
          { key: STORAGE_KEYS.CATEGORIES, data: INITIAL_CATEGORIES },
          { key: STORAGE_KEYS.SERVICES, data: INITIAL_SERVICES },
          { key: STORAGE_KEYS.STAFF, data: INITIAL_STAFF },
          { key: STORAGE_KEYS.COMPANY, data: INITIAL_COMPANY_DETAILS },
          { key: STORAGE_KEYS.RECEIPT, data: INITIAL_RECEIPT_SETTINGS },
          { key: STORAGE_KEYS.LOGS, data: INITIAL_ACTIVITY_LOGS },
          { key: STORAGE_KEYS.PAYMENT_METHODS, data: INITIAL_PAYMENT_METHODS },
          { key: STORAGE_KEYS.TRANSACTIONS, data: INITIAL_TRANSACTIONS },
          { key: STORAGE_KEYS.CUSTOMERS, data: INITIAL_CUSTOMERS },
          { key: STORAGE_KEYS.PASSWORDS, data: {} },
        ];
        await fetch('/api/store/bulk-set', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: initialItems }),
        });
        return true;
      }

      Object.entries(json.data).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
        }
      });
      return true;
    }
  } catch (e) {
    console.error('Failed to sync from Cloud SQL', e);
  }
  return false;
}

// User Password Management (Online Synced across devices)
export function getUserPasswords(): Record<string, string> {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PASSWORDS);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

export function saveUserPassword(userId: string, newPass: string): void {
  try {
    const passwords = getUserPasswords();
    passwords[userId] = newPass;
    localStorage.setItem(STORAGE_KEYS.PASSWORDS, JSON.stringify(passwords));
    syncToCloud(STORAGE_KEYS.PASSWORDS, passwords);
  } catch (e) {
    console.error('Failed to save user password', e);
  }
}

export interface FullBackupData {
  version: string;
  exportedAt: string;
  categories: Category[];
  services: Service[];
  staff: Staff[];
  companyDetails: CompanyDetails;
  receiptSettings: ReceiptSettings;
  activityLogs: ActivityLog[];
  transactions?: Transaction[];
  paymentMethods?: PaymentMethodConfig[];
  customers?: Customer[];
}

export function loadTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    return (saved === 'light' || saved === 'dark') ? saved : 'light';
  } catch {
    return 'light';
  }
}

export function saveTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (e) {
    console.error('Failed to save theme', e);
  }
}

export function loadPaymentMethods(): PaymentMethodConfig[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS);
    return saved ? JSON.parse(saved) : INITIAL_PAYMENT_METHODS;
  } catch (e) {
    console.error('Failed to load payment methods', e);
    return INITIAL_PAYMENT_METHODS;
  }
}

export function savePaymentMethods(methods: PaymentMethodConfig[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(methods));
    syncToCloud(STORAGE_KEYS.PAYMENT_METHODS, methods);
  } catch (e) {
    console.error('Failed to save payment methods', e);
  }
}

export function loadTransactions(): Transaction[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!saved) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
      return INITIAL_TRANSACTIONS;
    }
    const loaded: Transaction[] = JSON.parse(saved);
    if (!Array.isArray(loaded)) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
      return INITIAL_TRANSACTIONS;
    }
    return loaded;
  } catch (e) {
    console.error('Failed to load transactions', e);
    return INITIAL_TRANSACTIONS;
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    syncToCloud(STORAGE_KEYS.TRANSACTIONS, transactions);
  } catch (e) {
    console.error('Failed to save transactions', e);
  }
}

export function loadCustomers(): Customer[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  } catch (e) {
    console.error('Failed to load customers', e);
    return INITIAL_CUSTOMERS;
  }
}

export function saveCustomers(customers: Customer[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    syncToCloud(STORAGE_KEYS.CUSTOMERS, customers);
  } catch (e) {
    console.error('Failed to save customers', e);
  }
}


export function capitalizeWords(str: string): string {
  if (!str) return str;
  return str
    .trim()
    .split(/\s+/)
    .map(word => {
      if (!word) return '';
      if (word.toLowerCase() === 'n') return 'N';
      if (word === '&' || word === '+') return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

export function loadCategories(): Category[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    const cats: Category[] = saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    return cats.map(c => ({
      ...c,
      name: capitalizeWords(c.name)
    }));
  } catch (e) {
    console.error('Failed to load categories from localStorage', e);
    return INITIAL_CATEGORIES;
  }
}

export function saveCategories(categories: Category[]): void {
  try {
    const formatted = categories.map(c => ({
      ...c,
      name: capitalizeWords(c.name)
    }));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(formatted));
    syncToCloud(STORAGE_KEYS.CATEGORIES, formatted);
  } catch (e) {
    console.error('Failed to save categories', e);
  }
}

export function loadServices(): Service[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SERVICES);
    const rawServices: Service[] = saved ? JSON.parse(saved) : INITIAL_SERVICES;
    return rawServices.map(srv => ({
      ...srv,
      name: capitalizeWords(srv.name)
    }));
  } catch (e) {
    console.error('Failed to load services from localStorage', e);
    return INITIAL_SERVICES.map(srv => ({
      ...srv,
      name: capitalizeWords(srv.name)
    }));
  }
}

export function saveServices(services: Service[]): void {
  try {
    const formatted = services.map(srv => ({
      ...srv,
      name: capitalizeWords(srv.name)
    }));
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(formatted));
    syncToCloud(STORAGE_KEYS.SERVICES, formatted);
  } catch (e) {
    console.error('Failed to save services', e);
  }
}

export function deduplicateStaff(staffList: Staff[]): Staff[] {
  const seenNames = new Set<string>();
  const seenIds = new Set<string>();
  const result: Staff[] = [];

  for (const s of staffList) {
    if (!s || !s.name || !s.name.trim()) continue;
    const trimmedName = s.name.trim();
    const normName = trimmedName.toLowerCase();

    // Check if name is a system admin duplicate
    const isSystemAdmin =
      normName === 'system admin' ||
      normName === 'system admin / owner' ||
      normName === 'admin' ||
      normName === 'administrator';

    if (seenIds.has(s.id)) continue;
    if (seenNames.has(normName)) continue;
    if (isSystemAdmin && seenNames.has('system admin')) continue;

    seenIds.add(s.id);
    if (isSystemAdmin) {
      seenNames.add('system admin');
    } else {
      seenNames.add(normName);
    }

    result.push({
      ...s,
      name: capitalizeWords(trimmedName),
    });
  }

  return result;
}

export function loadStaff(): Staff[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.STAFF);
    const loaded: Staff[] = saved ? JSON.parse(saved) : INITIAL_STAFF;
    
    // Combine with INITIAL_STAFF to ensure default staff exist, then deduplicate
    const combined = [...loaded, ...INITIAL_STAFF];
    const deduplicated = deduplicateStaff(combined);
    
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(deduplicated));
    return deduplicated;
  } catch (e) {
    console.error('Failed to load staff from localStorage', e);
    return deduplicateStaff(INITIAL_STAFF);
  }
}

export function saveStaff(staff: Staff[]): void {
  try {
    const deduplicated = deduplicateStaff(staff);
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(deduplicated));
    syncToCloud(STORAGE_KEYS.STAFF, deduplicated);
  } catch (e) {
    console.error('Failed to save staff', e);
  }
}

export function loadCompanyDetails(): CompanyDetails {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.COMPANY);
    return saved ? JSON.parse(saved) : INITIAL_COMPANY_DETAILS;
  } catch (e) {
    console.error('Failed to load company details from localStorage', e);
    return INITIAL_COMPANY_DETAILS;
  }
}

export function saveCompanyDetails(company: CompanyDetails): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(company));
    syncToCloud(STORAGE_KEYS.COMPANY, company);
  } catch (e) {
    console.error('Failed to save company details', e);
  }
}

export function loadReceiptSettings(): ReceiptSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.RECEIPT);
    return saved ? JSON.parse(saved) : INITIAL_RECEIPT_SETTINGS;
  } catch (e) {
    console.error('Failed to load receipt settings from localStorage', e);
    return INITIAL_RECEIPT_SETTINGS;
  }
}

export function saveReceiptSettings(receipt: ReceiptSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.RECEIPT, JSON.stringify(receipt));
    syncToCloud(STORAGE_KEYS.RECEIPT, receipt);
  } catch (e) {
    console.error('Failed to save receipt settings', e);
  }
}

export function loadActivityLogs(): ActivityLog[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_LOGS;
  } catch (e) {
    console.error('Failed to load activity logs from localStorage', e);
    return INITIAL_ACTIVITY_LOGS;
  }
}

export function saveActivityLogs(logs: ActivityLog[]): void {
  try {
    const sliced = logs.slice(0, 50);
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(sliced));
    syncToCloud(STORAGE_KEYS.LOGS, sliced);
  } catch (e) {
    console.error('Failed to save activity logs', e);
  }
}

export function createActivityLog(
  action: string, 
  details: string, 
  type: ActivityLog['type']
): ActivityLog {
  const newLog: ActivityLog = {
    id: 'log-' + Date.now(),
    action,
    details,
    timestamp: new Date().toISOString(),
    type,
  };
  const current = loadActivityLogs();
  const updated = [newLog, ...current];
  saveActivityLogs(updated);
  return newLog;
}

export function resetToFactoryDefaults(): void {
  localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
  localStorage.removeItem(STORAGE_KEYS.SERVICES);
  localStorage.removeItem(STORAGE_KEYS.STAFF);
  localStorage.removeItem(STORAGE_KEYS.COMPANY);
  localStorage.removeItem(STORAGE_KEYS.RECEIPT);
  localStorage.removeItem(STORAGE_KEYS.LOGS);
  localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
  localStorage.removeItem(STORAGE_KEYS.PAYMENT_METHODS);
  localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
}

export function exportBackupJSON(): string {
  const backupData: FullBackupData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    categories: loadCategories(),
    services: loadServices(),
    staff: loadStaff(),
    companyDetails: loadCompanyDetails(),
    receiptSettings: loadReceiptSettings(),
    activityLogs: loadActivityLogs(),
    transactions: loadTransactions(),
    paymentMethods: loadPaymentMethods(),
    customers: loadCustomers(),
  };
  return JSON.stringify(backupData, null, 2);
}

export function importBackupJSON(jsonString: string): { success: boolean; message: string } {
  try {
    const parsed = JSON.parse(jsonString) as FullBackupData;
    if (!parsed) {
      return { success: false, message: 'Invalid backup format.' };
    }

    if (parsed.categories) saveCategories(parsed.categories);
    if (parsed.services) saveServices(parsed.services);
    if (parsed.staff) saveStaff(parsed.staff);
    if (parsed.companyDetails) saveCompanyDetails(parsed.companyDetails);
    if (parsed.receiptSettings) saveReceiptSettings(parsed.receiptSettings);
    if (parsed.activityLogs) saveActivityLogs(parsed.activityLogs);
    if (parsed.transactions) saveTransactions(parsed.transactions);
    if (parsed.paymentMethods) savePaymentMethods(parsed.paymentMethods);
    if (parsed.customers) saveCustomers(parsed.customers);

    createActivityLog('Backup Restored', 'Restored system database from JSON backup file.', 'backup');

    return { success: true, message: 'Backup imported successfully!' };
  } catch (e) {
    return { success: false, message: 'Failed to parse JSON file: ' + (e as Error).message };
  }
}

export function importLegacyJSON(jsonString: string): { success: boolean; message: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || !parsed.data) {
      return { success: false, message: 'Invalid legacy backup format.' };
    }

    const { data } = parsed;

    // 1. Map Categories
    const categories: Category[] = (data.categories || []).map((cat: any) => ({
      id: cat.id || `cat-${Date.now()}-${Math.random()}`,
      name: cat.name || 'Unnamed Category',
      description: '',
      color: '#3b82f6',
      iconName: 'Sparkles',
      createdAt: cat.createdAt || new Date().toISOString()
    }));

    // 2. Map Services
    const services: Service[] = (data.services || []).map((srv: any) => {
      // Find category by name
      const category = categories.find(c => c.name.trim().toLowerCase() === (srv.category || '').trim().toLowerCase());
      const categoryId = category ? category.id : (categories[0]?.id || 'default');
      return {
        id: srv.id || `srv-${Date.now()}-${Math.random()}`,
        name: srv.name || 'Unnamed Service',
        categoryId: categoryId,
        durationMinutes: parseInt(srv.duration, 10) || 30,
        price: parseFloat(srv.price) || 0,
        description: srv.description || '',
        isActive: true,
        createdAt: srv.createdAt || new Date().toISOString()
      };
    });

    // 3. Map Staff
    const staff: Staff[] = (data.staff || []).map((st: any) => ({
      id: st.id || `stf-${Date.now()}-${Math.random()}`,
      name: st.name || 'Unknown Staff',
      role: st.role || 'Therapist',
      phone: st.phone || '',
      email: st.email || '',
      specializations: [],
      status: st.status === 'Active' ? 'active' : 'inactive',
      avatarColor: 'bg-emerald-500',
      createdAt: st.createdAt || new Date().toISOString()
    }));

    // 4. Map Customers
    const customers: Customer[] = (data.customers || []).map((c: any) => ({
      id: c.id || `cust-${Date.now()}-${Math.random()}`,
      name: c.name || 'Unknown Customer',
      email: c.email || '',
      phone: c.phone || '',
      joinDate: c.joinDate || new Date().toISOString(),
      createdAt: c.createdAt || new Date().toISOString(),
      isDefault: c.isDefault || false
    }));

    // 5. Map Settings -> Company Details & Receipt Settings
    const companyDetails: CompanyDetails = {
      businessName: data.settings?.businessName || data.settings?.name || '',
      phone: data.settings?.phone || data.settings?.businessPhone || '',
      email: data.settings?.email || data.settings?.businessEmail || '',
      website: data.settings?.businessWebsite || '',
      address: data.settings?.address || data.settings?.businessAddress || '',
      currency: data.settings?.currency || 'KES',
      taxRate: data.settings?.taxRate || 0,
      logoUrl: data.settings?.businessLogo || data.settings?.logo || ''
    };

    const receiptSettings: ReceiptSettings = {
      headerNote: 'Welcome!',
      footerNote: 'Thank you for your business!',
      showLogo: false,
      showWebsite: true,
      showEmail: true,
      paperWidth: '80mm',
    };

    // 6. Map Transactions
    const transactions: Transaction[] = (data.transactions || []).map((t: any) => ({
      id: t.id || `tx-${Date.now()}-${Math.random()}`,
      receiptNo: `REC-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      customerName: t.customerName || 'Walk-in',
      customerPhone: '',
      items: (t.items || []).map((item: any) => ({
        serviceId: item.serviceId,
        serviceName: item.serviceName,
        price: parseFloat(item.price) || 0,
        quantity: parseInt(item.quantity, 10) || 1
      })),
      subtotal: parseFloat(t.subtotal) || 0,
      taxAmount: parseFloat(t.tax) || 0,
      taxRate: 0,
      discountAmount: parseFloat(t.totalDiscount) || 0,
      total: parseFloat(t.total) || 0,
      paymentMethod: t.paymentMethod ? String(t.paymentMethod).toLowerCase() : 'cash',
      paymentDetails: {},
      staffId: t.employeeId,
      staffName: t.employeeName,
      status: 'completed',
      createdAt: t.createdAt || t.date || new Date().toISOString()
    }));

    // Save all to local storage
    if (categories.length) saveCategories(categories);
    if (services.length) saveServices(services);
    if (staff.length) saveStaff(staff);
    if (customers.length) saveCustomers(customers);
    if (transactions.length) saveTransactions(transactions);
    
    saveCompanyDetails(companyDetails);
    saveReceiptSettings(receiptSettings);

    createActivityLog('Legacy Data Restored', 'Imported data from legacy JSON file.', 'backup');

    return { success: true, message: 'Legacy data imported successfully!' };
  } catch (e) {
    return { success: false, message: 'Failed to parse legacy JSON file: ' + (e as Error).message };
  }
}

