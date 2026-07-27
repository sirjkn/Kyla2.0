import { Category, Service, Staff, CompanyDetails, ReceiptSettings, ActivityLog, PaymentMethodConfig, Transaction, Customer } from '../types';
import { KYLA_CATEGORIES, KYLA_SERVICES, KYLA_STAFF, KYLA_TRANSACTIONS } from './kylaPdfData';

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: "9ae8dd7d-9f71-4614-8b86-a2813ae106ea",
    name: "Walk-in Customer",
    email: "",
    phone: "",
    notes: "Default walk-in customer for quick register transactions.",
    joinDate: "2026-02-01T00:00:00.000Z",
    createdAt: "2026-02-01T00:00:00.000Z",
    isDefault: true
  }
];

export const INITIAL_CATEGORIES: Category[] = KYLA_CATEGORIES;

export const INITIAL_SERVICES: Service[] = KYLA_SERVICES;

export const INITIAL_STAFF: Staff[] = KYLA_STAFF;

export const INITIAL_COMPANY_DETAILS: CompanyDetails = {
  businessName: 'Kyla Barber Shop',
  phone: '0700000000',
  email: 'info@kylabarber.co.ke',
  website: 'www.kylabarber.co.ke',
  address: 'Gitanga Road opposite Valley Archade',
  currency: 'KES',
  taxRate: 0,
  logoUrl: '',
};

export const INITIAL_RECEIPT_SETTINGS: ReceiptSettings = {
  headerNote: 'Welcome to Kyla Barber Shop & Spa!',
  footerNote: 'Thank you for your business! Please visit us again.',
  showLogo: true,
  showWebsite: true,
  showEmail: true,
  paperWidth: '80mm',
};

export const INITIAL_PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    id: 'mpesa',
    name: 'M-Pesa Express',
    description: 'Safaricom M-Pesa till / paybill payment.',
    isEnabled: true,
    isDefault: true,
    mpesaType: 'till',
    mpesaNumber: '889900',
    mpesaAccountName: 'Kyla Barber Shop',
    instructions: 'Verify M-Pesa transaction reference upon payment.',
  },
  {
    id: 'cash',
    name: 'Cash Payment',
    description: 'Physical cash notes & change calculation.',
    isEnabled: true,
    isDefault: false,
    instructions: 'Collect exact cash or calculate client change.',
  },
  {
    id: 'card',
    name: 'Credit / Debit Card',
    description: 'Visa, Mastercard, or local POS card terminal.',
    isEnabled: true,
    isDefault: false,
    instructions: 'Swipe or tap card on PDQ terminal.',
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = KYLA_TRANSACTIONS;

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    action: 'Kyla PDF Data Loaded',
    details: 'Imported system database from Kyla Barber Shop PDF report including 24 services, 6 categories, staff users, and sales transactions.',
    timestamp: new Date().toISOString(),
    type: 'backup',
  },
  {
    id: 'log-2',
    action: 'System Initialized',
    details: 'Kyla Barber Shop & Spa POS System initialized',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    type: 'company',
  }
];
