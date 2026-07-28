import { createClient, SupabaseClient } from '@supabase/supabase-js';
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

// In-Memory Data Store (Primary Source of Truth in client)
const memoryStore: Record<string, any> = {};
let lastSyncTimestamp: string | null = null;
let cloudSyncStatus: 'online' | 'syncing' | 'offline' = 'online';

export interface SupabaseConfig {
  url: string;
  key: string;
  tableName: string;
}

let cachedSupabaseClient: SupabaseClient | null = null;
let cachedSupabaseConfig: SupabaseConfig | null = null;

export function getSupabaseConfig(): SupabaseConfig {
  try {
    const url = localStorage.getItem('spaflow_supabase_url') || (import.meta as any).env?.VITE_SUPABASE_URL || '';
    const key = localStorage.getItem('spaflow_supabase_key') || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
    const tableName = localStorage.getItem('spaflow_supabase_table') || 'spaflow_store';
    return { url: url.trim(), key: key.trim(), tableName: tableName.trim() || 'spaflow_store' };
  } catch {
    return { url: '', key: '', tableName: 'spaflow_store' };
  }
}

export function setSupabaseConfig(url: string, key: string, tableName = 'spaflow_store') {
  try {
    if (url.trim() && key.trim()) {
      localStorage.setItem('spaflow_supabase_url', url.trim());
      localStorage.setItem('spaflow_supabase_key', key.trim());
      localStorage.setItem('spaflow_supabase_table', tableName.trim() || 'spaflow_store');
    } else {
      localStorage.removeItem('spaflow_supabase_url');
      localStorage.removeItem('spaflow_supabase_key');
      localStorage.removeItem('spaflow_supabase_table');
    }
  } catch {}
  cachedSupabaseClient = null;
  cachedSupabaseConfig = null;
  notifyAppSync();
}

export function getSupabaseClient(): { client: SupabaseClient; tableName: string } | null {
  const config = getSupabaseConfig();
  if (!config.url || !config.key) return null;

  if (cachedSupabaseClient && cachedSupabaseConfig?.url === config.url && cachedSupabaseConfig?.key === config.key) {
    return { client: cachedSupabaseClient, tableName: config.tableName };
  }

  try {
    cachedSupabaseClient = createClient(config.url, config.key, {
      auth: { persistSession: false },
    });
    cachedSupabaseConfig = config;
    return { client: cachedSupabaseClient, tableName: config.tableName };
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export async function testSupabaseConnection(url: string, key: string, tableName = 'spaflow_store'): Promise<{ success: boolean; message: string }> {
  try {
    const trimmedUrl = url.trim();
    const trimmedKey = key.trim();
    const trimmedTable = tableName.trim() || 'spaflow_store';

    if (!trimmedUrl || !trimmedKey) {
      return { success: false, message: 'Please enter both your Supabase Project URL and Anon/Public Key.' };
    }

    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      return { success: false, message: 'Supabase URL must start with https:// (e.g. https://xyzcompany.supabase.co)' };
    }

    const testClient = createClient(trimmedUrl, trimmedKey, { auth: { persistSession: false } });
    const { error } = await testClient.from(trimmedTable).select('key').limit(1);

    if (error) {
      if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: false,
          message: `Connected to Supabase! Table "${trimmedTable}" is missing. Please run the provided SQL script in your Supabase SQL Editor to create it.`
        };
      }
      if (error.code === '42501' || error.message.includes('permission') || error.message.includes('policy')) {
        return {
          success: false,
          message: `Connected to Supabase, but Row Level Security (RLS) policies block public access on "${trimmedTable}". Enable anon policies using the SQL query below.`
        };
      }
      return { success: false, message: `Supabase database error: ${error.message}` };
    }

    return { success: true, message: `Successfully connected to Supabase table "${trimmedTable}"!` };
  } catch (err: any) {
    return { success: false, message: `Connection error: ${err?.message || err}` };
  }
}

export function getCloudSyncMetrics() {
  const sbConfig = getSupabaseConfig();
  const isSupabaseConnected = Boolean(sbConfig.url && sbConfig.key);
  return {
    lastSync: lastSyncTimestamp || new Date().toISOString(),
    status: cloudSyncStatus,
    keysCount: Object.keys(memoryStore).length,
    isSupabaseConnected,
    supabaseUrl: sbConfig.url,
    supabaseTable: sbConfig.tableName,
    memoryStore
  };
}

function notifyAppSync() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('spaflow-sync'));
  }
}

export function getApiBaseUrl(): string {
  // 1. Environment variable VITE_API_URL set in Vercel or environment
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  // 2. Custom API URL saved in localStorage
  try {
    const saved = localStorage.getItem('spaflow_api_url');
    if (saved && saved.trim()) {
      return saved.trim().replace(/\/+$/, '');
    }
  } catch {}

  return '';
}

export function formatApiUrl(input: string): string {
  let cleaned = input.trim().replace(/\/+$/, '');
  if (!cleaned) return '';
  
  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
    return cleaned;
  }
  
  if (cleaned.includes('.') || cleaned.startsWith('localhost')) {
    return `https://${cleaned}`;
  }

  return cleaned;
}

export function setApiBaseUrl(url: string) {
  try {
    const formatted = formatApiUrl(url);
    if (formatted) {
      localStorage.setItem('spaflow_api_url', formatted);
    } else {
      localStorage.removeItem('spaflow_api_url');
    }
  } catch {}
  notifyAppSync();
}

// Online Sync Helper (Syncs to Supabase if configured, or clean local store)
export async function syncToCloud(key: string, data: any): Promise<void> {
  memoryStore[key] = data;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    // Ignore quota errors
  }
  notifyAppSync();

  // Check Supabase connection
  const sb = getSupabaseClient();
  if (sb) {
    cloudSyncStatus = 'syncing';
    try {
      const { error } = await sb.client.from(sb.tableName).upsert(
        { key, data, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );
      if (!error) {
        cloudSyncStatus = 'online';
        lastSyncTimestamp = new Date().toISOString();
        return;
      } else {
        console.warn('[Supabase Sync Warning]', error.message);
        cloudSyncStatus = 'offline';
        return;
      }
    } catch (e) {
      console.error('[Supabase Sync Error]', e);
      cloudSyncStatus = 'offline';
      return;
    }
  }

  // If external custom API endpoint is configured
  const baseUrl = getApiBaseUrl();
  if (baseUrl) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        cloudSyncStatus = 'syncing';
        const res = await fetch(`${baseUrl}/api/store/set`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, data }),
        });
        if (res.ok) {
          cloudSyncStatus = 'online';
          lastSyncTimestamp = new Date().toISOString();
          return;
        }
      } catch (e) {
        if (attempt < 3) {
          await new Promise(r => setTimeout(r, 400 * attempt));
        }
      }
    }
    cloudSyncStatus = 'offline';
    return;
  }

  // Pure clean local mode
  cloudSyncStatus = 'online';
  lastSyncTimestamp = new Date().toISOString();
}

// Fetch all online state from Supabase database or local state
export async function loadAllFromCloud(): Promise<boolean> {
  // Check Supabase connection
  const sb = getSupabaseClient();
  if (sb) {
    cloudSyncStatus = 'syncing';
    try {
      const { data, error } = await sb.client.from(sb.tableName).select('key, data');
      if (error) {
        console.warn('[Supabase Fetch Error]', error.message);
        cloudSyncStatus = 'offline';
        return false;
      }

      if (data) {
        if (data.length === 0) {
          // Seed initial data to Supabase if table is empty
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

          const upsertPayload = initialItems.map(item => ({
            key: item.key,
            data: item.data,
            updated_at: new Date().toISOString()
          }));

          initialItems.forEach(item => {
            memoryStore[item.key] = item.data;
            try { localStorage.setItem(item.key, JSON.stringify(item.data)); } catch {}
          });

          await sb.client.from(sb.tableName).upsert(upsertPayload, { onConflict: 'key' });
          cloudSyncStatus = 'online';
          lastSyncTimestamp = new Date().toISOString();
          notifyAppSync();
          return true;
        }

        let hasChanges = false;
        data.forEach((row: any) => {
          if (row.key && row.data !== undefined && row.data !== null) {
            const parsed = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
            const currentStr = JSON.stringify(memoryStore[row.key]);
            const newStr = JSON.stringify(parsed);
            if (currentStr !== newStr) {
              hasChanges = true;
            }
            memoryStore[row.key] = parsed;
            try {
              localStorage.setItem(row.key, typeof row.data === 'string' ? row.data : JSON.stringify(row.data));
            } catch {}
          }
        });

        cloudSyncStatus = 'online';
        lastSyncTimestamp = new Date().toISOString();
        if (hasChanges) {
          notifyAppSync();
        }
        return hasChanges;
      }
    } catch (e) {
      console.error('[Supabase Load Error]', e);
      cloudSyncStatus = 'offline';
      return false;
    }
  }

  // Check custom API URL
  const baseUrl = getApiBaseUrl();
  if (baseUrl) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        cloudSyncStatus = 'syncing';
        const res = await fetch(`${baseUrl}/api/store/all?_t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        if (!res.ok) {
          if (attempt < 3) {
            await new Promise(r => setTimeout(r, 300 * attempt));
            continue;
          }
          cloudSyncStatus = 'offline';
          return false;
        }
        const json = await res.json();
        if (json.success && json.data) {
          const keys = Object.keys(json.data);
          if (keys.length === 0) {
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
            
            initialItems.forEach(item => {
              memoryStore[item.key] = item.data;
              try { localStorage.setItem(item.key, JSON.stringify(item.data)); } catch {}
            });

            await fetch(`${baseUrl}/api/store/bulk-set`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ items: initialItems }),
            });
            cloudSyncStatus = 'online';
            lastSyncTimestamp = new Date().toISOString();
            notifyAppSync();
            return true;
          }

          let hasChanges = false;
          Object.entries(json.data).forEach(([key, val]) => {
            if (val !== undefined && val !== null) {
              const parsed = typeof val === 'string' ? JSON.parse(val) : val;
              const currentStr = JSON.stringify(memoryStore[key]);
              const newStr = JSON.stringify(parsed);
              if (currentStr !== newStr) {
                hasChanges = true;
              }
              memoryStore[key] = parsed;
              try {
                localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
              } catch {}
            }
          });

          cloudSyncStatus = 'online';
          lastSyncTimestamp = new Date().toISOString();
          if (hasChanges) {
            notifyAppSync();
          }
          return hasChanges;
        }
      } catch (e) {
        if (attempt < 3) {
          await new Promise(r => setTimeout(r, 400 * attempt));
          continue;
        }
        cloudSyncStatus = 'offline';
      }
    }
    return false;
  }

  // Pure local mode
  cloudSyncStatus = 'online';
  lastSyncTimestamp = new Date().toISOString();
  return false;
}

// User Password Management (Online Synced across devices)
export function getUserPasswords(): Record<string, string> {
  if (memoryStore[STORAGE_KEYS.PASSWORDS]) {
    return memoryStore[STORAGE_KEYS.PASSWORDS];
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PASSWORDS);
    const parsed = saved ? JSON.parse(saved) : {};
    memoryStore[STORAGE_KEYS.PASSWORDS] = parsed;
    return parsed;
  } catch {
    return {};
  }
}

export function saveUserPassword(userId: string, newPass: string): void {
  try {
    const passwords = getUserPasswords();
    passwords[userId] = newPass;
    saveToMemoryAndCloud(STORAGE_KEYS.PASSWORDS, passwords);
  } catch (e) {
    console.error('Failed to save user password', e);
  }
}

function saveToMemoryAndCloud(key: string, data: any): void {
  memoryStore[key] = data;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
  syncToCloud(key, data);
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
  if (memoryStore[STORAGE_KEYS.PAYMENT_METHODS]) {
    return memoryStore[STORAGE_KEYS.PAYMENT_METHODS];
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS);
    const parsed = saved ? JSON.parse(saved) : INITIAL_PAYMENT_METHODS;
    memoryStore[STORAGE_KEYS.PAYMENT_METHODS] = parsed;
    return parsed;
  } catch (e) {
    console.error('Failed to load payment methods', e);
    return INITIAL_PAYMENT_METHODS;
  }
}

export function savePaymentMethods(methods: PaymentMethodConfig[]): void {
  try {
    saveToMemoryAndCloud(STORAGE_KEYS.PAYMENT_METHODS, methods);
  } catch (e) {
    console.error('Failed to save payment methods', e);
  }
}

export function loadTransactions(): Transaction[] {
  if (memoryStore[STORAGE_KEYS.TRANSACTIONS] && Array.isArray(memoryStore[STORAGE_KEYS.TRANSACTIONS])) {
    return memoryStore[STORAGE_KEYS.TRANSACTIONS];
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!saved) {
      memoryStore[STORAGE_KEYS.TRANSACTIONS] = INITIAL_TRANSACTIONS;
      return INITIAL_TRANSACTIONS;
    }
    const loaded: Transaction[] = JSON.parse(saved);
    if (!Array.isArray(loaded)) {
      memoryStore[STORAGE_KEYS.TRANSACTIONS] = INITIAL_TRANSACTIONS;
      return INITIAL_TRANSACTIONS;
    }
    memoryStore[STORAGE_KEYS.TRANSACTIONS] = loaded;
    return loaded;
  } catch (e) {
    console.error('Failed to load transactions', e);
    return INITIAL_TRANSACTIONS;
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  try {
    saveToMemoryAndCloud(STORAGE_KEYS.TRANSACTIONS, transactions);
  } catch (e) {
    console.error('Failed to save transactions', e);
  }
}

export function loadCustomers(): Customer[] {
  if (memoryStore[STORAGE_KEYS.CUSTOMERS]) {
    return memoryStore[STORAGE_KEYS.CUSTOMERS];
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    const parsed = saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
    memoryStore[STORAGE_KEYS.CUSTOMERS] = parsed;
    return parsed;
  } catch (e) {
    console.error('Failed to load customers', e);
    return INITIAL_CUSTOMERS;
  }
}

export function saveCustomers(customers: Customer[]): void {
  try {
    saveToMemoryAndCloud(STORAGE_KEYS.CUSTOMERS, customers);
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
  if (memoryStore[STORAGE_KEYS.CATEGORIES]) {
    return memoryStore[STORAGE_KEYS.CATEGORIES];
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    const cats: Category[] = saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    const formatted = cats.map(c => ({
      ...c,
      name: capitalizeWords(c.name)
    }));
    memoryStore[STORAGE_KEYS.CATEGORIES] = formatted;
    return formatted;
  } catch (e) {
    console.error('Failed to load categories', e);
    return INITIAL_CATEGORIES;
  }
}

export function saveCategories(categories: Category[]): void {
  try {
    const formatted = categories.map(c => ({
      ...c,
      name: capitalizeWords(c.name)
    }));
    saveToMemoryAndCloud(STORAGE_KEYS.CATEGORIES, formatted);
  } catch (e) {
    console.error('Failed to save categories', e);
  }
}

export function loadServices(): Service[] {
  if (memoryStore[STORAGE_KEYS.SERVICES]) {
    return memoryStore[STORAGE_KEYS.SERVICES];
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SERVICES);
    const rawServices: Service[] = saved ? JSON.parse(saved) : INITIAL_SERVICES;
    const formatted = rawServices.map(srv => ({
      ...srv,
      name: capitalizeWords(srv.name)
    }));
    memoryStore[STORAGE_KEYS.SERVICES] = formatted;
    return formatted;
  } catch (e) {
    console.error('Failed to load services', e);
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
    saveToMemoryAndCloud(STORAGE_KEYS.SERVICES, formatted);
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
  if (memoryStore[STORAGE_KEYS.STAFF]) {
    return memoryStore[STORAGE_KEYS.STAFF];
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.STAFF);
    const loaded: Staff[] = saved ? JSON.parse(saved) : INITIAL_STAFF;
    
    // Combine with INITIAL_STAFF to ensure default staff exist, then deduplicate
    const combined = [...loaded, ...INITIAL_STAFF];
    const deduplicated = deduplicateStaff(combined);
    
    memoryStore[STORAGE_KEYS.STAFF] = deduplicated;
    return deduplicated;
  } catch (e) {
    console.error('Failed to load staff', e);
    return deduplicateStaff(INITIAL_STAFF);
  }
}

export function saveStaff(staff: Staff[]): void {
  try {
    const deduplicated = deduplicateStaff(staff);
    saveToMemoryAndCloud(STORAGE_KEYS.STAFF, deduplicated);
  } catch (e) {
    console.error('Failed to save staff', e);
  }
}

export function loadCompanyDetails(): CompanyDetails {
  if (memoryStore[STORAGE_KEYS.COMPANY]) {
    return memoryStore[STORAGE_KEYS.COMPANY];
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.COMPANY);
    const parsed = saved ? JSON.parse(saved) : INITIAL_COMPANY_DETAILS;
    memoryStore[STORAGE_KEYS.COMPANY] = parsed;
    return parsed;
  } catch (e) {
    console.error('Failed to load company details', e);
    return INITIAL_COMPANY_DETAILS;
  }
}

export function saveCompanyDetails(company: CompanyDetails): void {
  try {
    saveToMemoryAndCloud(STORAGE_KEYS.COMPANY, company);
  } catch (e) {
    console.error('Failed to save company details', e);
  }
}

export function loadReceiptSettings(): ReceiptSettings {
  if (memoryStore[STORAGE_KEYS.RECEIPT]) {
    return memoryStore[STORAGE_KEYS.RECEIPT];
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.RECEIPT);
    const parsed = saved ? JSON.parse(saved) : INITIAL_RECEIPT_SETTINGS;
    memoryStore[STORAGE_KEYS.RECEIPT] = parsed;
    return parsed;
  } catch (e) {
    console.error('Failed to load receipt settings', e);
    return INITIAL_RECEIPT_SETTINGS;
  }
}

export function saveReceiptSettings(receipt: ReceiptSettings): void {
  try {
    saveToMemoryAndCloud(STORAGE_KEYS.RECEIPT, receipt);
  } catch (e) {
    console.error('Failed to save receipt settings', e);
  }
}

export function loadActivityLogs(): ActivityLog[] {
  if (memoryStore[STORAGE_KEYS.LOGS]) {
    return memoryStore[STORAGE_KEYS.LOGS];
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    const parsed = saved ? JSON.parse(saved) : INITIAL_ACTIVITY_LOGS;
    memoryStore[STORAGE_KEYS.LOGS] = parsed;
    return parsed;
  } catch (e) {
    console.error('Failed to load activity logs', e);
    return INITIAL_ACTIVITY_LOGS;
  }
}

export function saveActivityLogs(logs: ActivityLog[]): void {
  try {
    const sliced = logs.slice(0, 50);
    saveToMemoryAndCloud(STORAGE_KEYS.LOGS, sliced);
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

