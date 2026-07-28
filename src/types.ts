export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
  joinDate?: string;
  createdAt: string;
  isDefault?: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  iconName: string;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  categoryId: string;
  durationMinutes: number;
  price: number;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  specializations: string[]; // category IDs or specialization names
  status: 'active' | 'inactive';
  avatarColor: string;
  createdAt: string;
  isAdmin?: boolean;
}

export interface CompanyDetails {
  businessName: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  currency: string; // e.g. "KES", "USD", "EUR"
  taxRate: number; // percentage e.g. 16
  logoUrl?: string;
}

export interface ReceiptSettings {
  headerNote: string;
  footerNote: string;
  showLogo: boolean;
  showWebsite: boolean;
  showEmail: boolean;
  paperWidth: '80mm' | '58mm';
  customCSS?: string;
}

export interface PaymentMethodConfig {
  id: 'mpesa' | 'cash' | 'card';
  name: string;
  description: string;
  isEnabled: boolean;
  isDefault: boolean;
  mpesaType?: 'till' | 'paybill';
  mpesaNumber?: string;
  mpesaAccountName?: string;
  instructions?: string;
}

export interface TransactionItem {
  serviceId: string;
  serviceName: string;
  categoryName?: string;
  price: number;
  quantity: number;
  staffId?: string;
  staffName?: string;
}

export interface Transaction {
  id: string;
  receiptNo: string;
  customerName: string;
  customerPhone?: string;
  items: TransactionItem[];
  subtotal: number;
  taxAmount: number;
  taxRate: number;
  discountAmount: number;
  total: number;
  paymentMethod: 'mpesa' | 'cash' | 'card' | string;
  paymentDetails?: {
    mpesaRef?: string;
    cashTendered?: number;
    cashChange?: number;
    cardLast4?: string;
  };
  staffId?: string;
  staffName?: string;
  status: 'completed' | 'refunded' | 'cancelled';
  createdAt: string;
  notes?: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  type: 'service' | 'category' | 'staff' | 'company' | 'backup' | 'pos' | 'payment';
}

export type ThemeMode = 'light' | 'dark';

export type MainTab = 
  | 'dashboard' 
  | 'pos' 
  | 'transactions' 
  | 'customers' 
  | 'services' 
  | 'settings';

export type SettingsSubTab = 
  | 'company' 
  | 'staff' 
  | 'receipt' 
  | 'payment' 
  | 'backup'
  | 'import'
  | 'password';

