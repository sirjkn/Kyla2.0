import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction, CompanyDetails, ReceiptSettings, PaymentMethodConfig, Staff } from '../types';
import { 
  Search, 
  ReceiptText, 
  Download, 
  Printer, 
  Eye, 
  Calendar, 
  DollarSign, 
  Smartphone, 
  Banknote, 
  CreditCard, 
  Filter, 
  X, 
  FileCheck2, 
  CheckCircle2, 
  Clock, 
  User,
  Trash2,
  AlertTriangle,
  Pencil,
  Plus,
  RotateCw,
  Save
} from 'lucide-react';

interface TransactionsManagerProps {
  transactions: Transaction[];
  staff?: Staff[];
  company: CompanyDetails;
  receiptSettings: ReceiptSettings;
  paymentMethods?: PaymentMethodConfig[];
  currentUser?: { id: string; name: string; role: string } | null;
  onNavigateToPOS?: () => void;
  onUpdateTransactionStatus?: (id: string, status: 'completed' | 'refunded' | 'cancelled') => void;
  onEditTransaction?: (updatedTx: Transaction) => void;
  onDeleteTransaction?: (id: string) => void;
  onDeleteAllTransactions?: () => void;
}

export const TransactionsManager: React.FC<TransactionsManagerProps> = ({
  transactions,
  staff = [],
  company,
  receiptSettings,
  paymentMethods = [],
  currentUser,
  onNavigateToPOS,
  onUpdateTransactionStatus,
  onEditTransaction,
  onDeleteTransaction,
  onDeleteAllTransactions,
}) => {
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isAdmin = 
    currentUser?.role?.toLowerCase().includes('admin') || 
    currentUser?.role?.toLowerCase().includes('owner') || 
    currentUser?.id === 'admin-owner';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState<string>('all');
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>(() => getTodayString());
  const [endDate, setEndDate] = useState<string>(() => getTodayString());

  const setPresetToday = () => {
    const today = getTodayString();
    setStartDate(today);
    setEndDate(today);
  };

  const setPresetYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const yest = `${year}-${month}-${day}`;
    setStartDate(yest);
    setEndDate(yest);
  };

  const setPresetThisMonth = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const today = getTodayString();
    setStartDate(`${year}-${month}-01`);
    setEndDate(today);
  };

  const setPresetAllTime = () => {
    setStartDate('');
    setEndDate('');
  };
  const [viewingTransaction, setViewingTransaction] = useState<Transaction | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTrx, setDeletingTrx] = useState<Transaction | null>(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [deleteAllPassword, setDeleteAllPassword] = useState('');
  const [deleteAllError, setDeleteAllError] = useState('');

  // Edit Form State
  const [editForm, setEditForm] = useState<{
    customerName: string;
    staffName: string;
    staffId: string;
    paymentMethod: string;
    createdAt: string;
    items: { serviceName: string; price: number; quantity: number; serviceId?: string }[];
    discountAmount: number;
  }>({
    customerName: '',
    staffName: '',
    staffId: '',
    paymentMethod: 'mpesa',
    createdAt: '',
    items: [],
    discountAmount: 0,
  });

  const currency = company.currency || 'KES';

  // Filter transactions
  const filteredTransactions = transactions.filter((trx) => {
    // 1. Search Query
    const matchesSearch =
      trx.receiptNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trx.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (trx.staffName && trx.staffName.toLowerCase().includes(searchQuery.toLowerCase()));

    // 2. Payment Method Filter
    const matchesPayment =
      selectedPaymentFilter === 'all' || trx.paymentMethod === selectedPaymentFilter;

    // 3. Employee Filter
    const matchesEmployee =
      selectedEmployeeFilter === 'all' ||
      trx.staffId === selectedEmployeeFilter ||
      trx.staffName === selectedEmployeeFilter;

    // 4. Date Range Filter
    let matchesDate = true;
    if (startDate) {
      const start = new Date(startDate + 'T00:00:00').getTime();
      const trxTime = new Date(trx.createdAt).getTime();
      if (trxTime < start) matchesDate = false;
    }
    if (endDate && matchesDate) {
      const end = new Date(endDate + 'T23:59:59').getTime();
      const trxTime = new Date(trx.createdAt).getTime();
      if (trxTime > end) matchesDate = false;
    }

    return matchesSearch && matchesPayment && matchesEmployee && matchesDate;
  });

  // Calculate Metrics based on filtered view
  const totalRevenue = filteredTransactions.reduce((acc, curr) => (curr.status === 'completed' ? acc + curr.total : acc), 0);
  const totalCount = filteredTransactions.length;

  const mpesaRevenue = filteredTransactions
    .filter((t) => t.paymentMethod === 'mpesa' && t.status === 'completed')
    .reduce((acc, curr) => acc + curr.total, 0);

  const cashRevenue = filteredTransactions
    .filter((t) => t.paymentMethod === 'cash' && t.status === 'completed')
    .reduce((acc, curr) => acc + curr.total, 0);

  const cardRevenue = filteredTransactions
    .filter((t) => t.paymentMethod === 'card' && t.status === 'completed')
    .reduce((acc, curr) => acc + curr.total, 0);

  // Start Edit Transaction
  const handleStartEdit = (trx: Transaction) => {
    if (!isAdmin) return;
    setEditingTransaction(trx);
    setEditForm({
      customerName: trx.customerName || '',
      staffName: trx.staffName || '',
      staffId: trx.staffId || '',
      paymentMethod: trx.paymentMethod || 'cash',
      createdAt: trx.createdAt ? new Date(trx.createdAt).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
      items: trx.items ? trx.items.map((i) => ({ ...i })) : [],
      discountAmount: trx.discountAmount || 0,
    });
  };

  // Save Edit Transaction
  const handleSaveEdit = () => {
    if (!isAdmin || !editingTransaction) return;

    const subtotal = editForm.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const total = Math.max(0, subtotal - editForm.discountAmount);

    const updatedTx: Transaction = {
      ...editingTransaction,
      customerName: editForm.customerName || 'Walk-in Customer',
      staffName: editForm.staffName,
      staffId: editForm.staffId,
      paymentMethod: editForm.paymentMethod,
      createdAt: editForm.createdAt ? new Date(editForm.createdAt).toISOString() : editingTransaction.createdAt,
      items: editForm.items,
      subtotal,
      discountAmount: editForm.discountAmount,
      total,
    };

    if (onEditTransaction) {
      onEditTransaction(updatedTx);
    }

    setEditingTransaction(null);
  };

  // Edit item helpers
  const handleItemChange = (index: number, field: 'serviceName' | 'price' | 'quantity', value: any) => {
    const updated = [...editForm.items];
    updated[index] = {
      ...updated[index],
      [field]: field === 'serviceName' ? value : parseFloat(value) || 0,
    };
    setEditForm({ ...editForm, items: updated });
  };

  const handleAddItem = () => {
    setEditForm({
      ...editForm,
      items: [
        ...editForm.items,
        { serviceName: 'New Treatment', price: 1000, quantity: 1 }
      ]
    });
  };

  const handleRemoveItem = (index: number) => {
    const updated = editForm.items.filter((_, i) => i !== index);
    setEditForm({ ...editForm, items: updated });
  };

  // Generate & Download Sales PDF File Directly (Without opening printer prompt)
  const handleExportPDFReport = () => {
    const doc = new jsPDF();
    const reportDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Company Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(company.businessName || 'Spa Business', 14, 20);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`${company.address || ''}`, 14, 26);
    doc.text(`Phone: ${company.phone || 'N/A'} | Email: ${company.email || 'N/A'}`, 14, 31);

    // Title & Date on Right
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(13, 148, 136); // teal-600
    doc.text('SALES & AUDIT REPORT', 196, 20, { align: 'right' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated: ${reportDate}`, 196, 26, { align: 'right' });

    // Teal Divider Line
    doc.setDrawColor(13, 148, 136);
    doc.setLineWidth(0.8);
    doc.line(14, 36, 196, 36);

    // Key Stats Background Box
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.roundedRect(14, 40, 182, 22, 2, 2, 'FD');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('TOTAL REVENUE', 18, 47);
    doc.text('TOTAL TRANSACTIONS', 65, 47);
    doc.text('M-PESA REVENUE', 112, 47);
    doc.text('CASH REVENUE', 155, 47);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`${currency} ${totalRevenue.toLocaleString()}`, 18, 56);
    doc.text(`${totalCount}`, 65, 56);
    doc.text(`${currency} ${mpesaRevenue.toLocaleString()}`, 112, 56);
    doc.text(`${currency} ${cashRevenue.toLocaleString()}`, 155, 56);

    // Table of Transactions
    const tableData = filteredTransactions.map((t) => [
      t.receiptNo,
      new Date(t.createdAt).toLocaleString(),
      t.staffName || 'N/A',
      t.items.map((i) => i.serviceName).join(', '),
      (t.paymentMethod || 'cash').toUpperCase(),
      `${currency} ${t.total.toLocaleString()}`,
    ]);

    autoTable(doc, {
      startY: 68,
      head: [['Receipt #', 'Date & Time', 'Therapist', 'Items Purchased', 'Method', 'Total Amount']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [30, 41, 59],
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 26 },
        1: { cellWidth: 36 },
        2: { cellWidth: 30 },
        3: { cellWidth: 46 },
        4: { fontStyle: 'bold', cellWidth: 20 },
        5: { fontStyle: 'bold', halign: 'right', cellWidth: 24 },
      },
      margin: { left: 14, right: 14 },
    });

    const fileName = `Sales_Audit_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
  };

  // CSV Export helper
  const handleExportCSV = () => {
    const headers = ['Receipt No', 'Date', 'Customer Name', 'Therapist', 'Items', 'Payment Method', 'Subtotal', 'Tax', 'Total Amount', 'Status'];
    const rows = filteredTransactions.map((t) => [
      t.receiptNo,
      new Date(t.createdAt).toLocaleString(),
      `"${t.customerName}"`,
      `"${t.staffName || ''}"`,
      `"${t.items.map((i) => i.serviceName).join('; ')}"`,
      t.paymentMethod,
      t.subtotal,
      t.taxAmount,
      t.total,
      t.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sales_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Single Receipt thermal printing
  const handlePrintThermalReceipt = (t: Transaction) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt ${t.receiptNo}</title>
          <style>
            @page { margin: 0; size: 80mm auto; }
            body { 
              font-family: 'Courier New', Courier, monospace; 
              width: 280px; 
              margin: 10px auto; 
              padding: 5px; 
              color: #000;
              font-size: 12px;
            }
            .text-center { text-align: center; }
            .bold { font-weight: bold; }
            .divider { border-bottom: 1px dashed #000; margin: 8px 0; }
            .flex-between { display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="text-center">
            <div class="bold" style="font-size:16px;">${company.businessName}</div>
            <div>${company.address || ''}</div>
            <div>Tel: ${company.phone || ''}</div>
          </div>
          <div class="divider"></div>
          <div class="flex-between"><span>Receipt No:</span><span class="bold">${t.receiptNo}</span></div>
          <div class="flex-between"><span>Date:</span><span>${new Date(t.createdAt).toLocaleString()}</span></div>
          <div class="flex-between"><span>Client:</span><span>${t.customerName}</span></div>
          ${t.staffName ? `<div class="flex-between"><span>Therapist:</span><span>${t.staffName}</span></div>` : ''}
          <div class="flex-between"><span>Payment:</span><span class="bold">${t.paymentMethod.toUpperCase()}</span></div>
          <div class="divider"></div>
          ${t.items
            .map(
              (i) => `
            <div class="flex-between">
              <span>${i.quantity}x ${i.serviceName}</span>
              <span>${currency} ${(i.price * i.quantity).toLocaleString()}</span>
            </div>
          `
            )
            .join('')}
          <div class="divider"></div>
          <div class="flex-between bold" style="font-size:14px;">
            <span>TOTAL:</span>
            <span>${currency} ${t.total.toLocaleString()}</span>
          </div>
          <div class="divider"></div>
          <div class="text-center">Thank you for visiting us!</div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Top Banner & Header (Compact 60% Size) */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-xl p-3.5 sm:p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.2 rounded-full font-bold uppercase tracking-wider">
              Sales Ledger & Audit
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
            <ReceiptText className="w-4 h-4 text-blue-400" />
            <span>Transactions & Revenue</span>
          </h2>
          <p className="text-slate-300 text-xs mt-0.5 max-w-xl">
            Audit all completed POS checkout receipts, filter by therapist or payment method, and export PDF reports.
          </p>
        </div>

        {/* Action Export & Delete Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {isAdmin && transactions.length > 0 && onDeleteAllTransactions && (
            <button
              onClick={() => {
                setDeleteAllPassword('');
                setDeleteAllError('');
                setShowDeleteAllModal(true);
              }}
              className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 font-bold text-xs transition-all shadow-xs flex items-center justify-center space-x-1.5"
              id="transactions-delete-all-btn"
              title="Delete all transactions"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete All</span>
            </button>
          )}

          <button
            onClick={handleExportPDFReport}
            className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center space-x-1.5"
            id="transactions-export-pdf-btn"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Sales PDF Report</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Total Sales</span>
            <DollarSign className="w-4 h-4 text-blue-500" />
          </div>
          <div 
            className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mt-2"
            style={{ fontFamily: "'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', sans-serif" }}
          >
            {currency} {totalRevenue.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">{totalCount} total receipts</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>M-Pesa Revenue</span>
            <Smartphone className="w-4 h-4 text-blue-500" />
          </div>
          <div 
            className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400 mt-2"
            style={{ fontFamily: "'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', sans-serif" }}
          >
            {currency} {mpesaRevenue.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Mobile Money</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Cash Revenue</span>
            <Banknote className="w-4 h-4 text-amber-500" />
          </div>
          <div 
            className="text-lg sm:text-xl font-bold text-amber-600 dark:text-amber-400 mt-2"
            style={{ fontFamily: "'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', sans-serif" }}
          >
            {currency} {cashRevenue.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Register Cash</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Card Revenue</span>
            <CreditCard className="w-4 h-4 text-purple-500" />
          </div>
          <div 
            className="text-lg sm:text-xl font-bold text-purple-600 dark:text-purple-400 mt-2"
            style={{ fontFamily: "'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', sans-serif" }}
          >
            {currency} {cardRevenue.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">PDQ / Terminal</span>
        </div>

      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search receipt #, client name, or therapist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium border border-transparent focus:border-blue-500 focus:outline-none"
              id="transactions-search-input"
            />
          </div>

          {/* Filters Group */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Employee Filter */}
            <div className="flex items-center space-x-1.5">
              <User className="w-4 h-4 text-slate-400 hidden sm:inline" />
              <select
                value={selectedEmployeeFilter}
                onChange={(e) => setSelectedEmployeeFilter(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700 focus:outline-none max-w-[160px] truncate"
                id="transactions-employee-filter"
              >
                <option value="all">All Employees</option>
                {staff.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Filter */}
            <div className="flex items-center space-x-1.5">
              <Filter className="w-4 h-4 text-slate-400 hidden sm:inline" />
              <select
                value={selectedPaymentFilter}
                onChange={(e) => setSelectedPaymentFilter(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700 focus:outline-none"
                id="transactions-method-filter"
              >
                <option value="all">All Payments</option>
                <option value="mpesa">M-Pesa Only</option>
                <option value="cash">Cash Only</option>
                <option value="card">Card Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Date Range Filter Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold flex items-center gap-1 text-slate-700 dark:text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              Date Range:
            </span>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1 mr-1">
              <button
                type="button"
                onClick={setPresetToday}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shadow-2xs ${
                  startDate === getTodayString() && endDate === getTodayString()
                    ? 'bg-blue-600 text-white shadow-blue-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                id="preset-today-btn"
              >
                Today
              </button>
              <button
                type="button"
                onClick={setPresetYesterday}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                id="preset-yesterday-btn"
              >
                Yesterday
              </button>
              <button
                type="button"
                onClick={setPresetThisMonth}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                id="preset-month-btn"
              >
                This Month
              </button>
              <button
                type="button"
                onClick={setPresetAllTime}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  !startDate && !endDate
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                id="preset-all-time-btn"
              >
                All Time
              </button>
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="text-[11px]">From</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium rounded-lg px-2.5 py-1 border border-slate-200 dark:border-slate-700 focus:outline-none"
                id="transactions-start-date"
              />
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="text-[11px]">To</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium rounded-lg px-2.5 py-1 border border-slate-200 dark:border-slate-700 focus:outline-none"
                id="transactions-end-date"
              />
            </div>

            {(startDate || endDate || selectedPaymentFilter !== 'all' || selectedEmployeeFilter !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  setSelectedPaymentFilter('all');
                  setSelectedEmployeeFilter('all');
                  setSearchQuery('');
                }}
                className="text-[11px] text-blue-600 hover:text-blue-700 dark:text-blue-400 font-bold underline px-2"
                id="transactions-clear-filters-btn"
              >
                Reset All Filters
              </button>
            )}
          </div>

          <div className="text-[11px] font-medium text-slate-400">
            Showing <strong className="text-slate-700 dark:text-slate-200 font-mono">{filteredTransactions.length}</strong> of {transactions.length} records
          </div>
        </div>

      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Receipt #</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Treatments</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4 text-right">Total Amount</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    No matching sales records found.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((trx) => (
                  <tr
                    key={trx.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {trx.receiptNo}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(trx.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-semibold">
                      {trx.customerName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {trx.staffName || 'Walk-in Staff'}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate">
                      {trx.items.map((i) => i.serviceName).join(', ')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          trx.paymentMethod === 'mpesa'
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                            : trx.paymentMethod === 'cash'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                            : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                        }`}
                      >
                        {trx.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {currency} {trx.total.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-1 sm:space-x-1.5">
                        <button
                          onClick={() => setViewingTransaction(trx)}
                          className="px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-500/20 text-slate-600 dark:text-slate-300 hover:text-blue-500 transition-colors flex items-center space-x-1"
                          title="View Receipt Details"
                          id={`view-trx-${trx.id}`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleStartEdit(trx)}
                            className="px-2 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-600 text-blue-600 dark:text-blue-400 hover:text-white border border-blue-200 dark:border-blue-800 font-bold text-xs transition-colors flex items-center space-x-1"
                            title="Edit Transaction"
                            id={`edit-trx-${trx.id}`}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                        )}
                        <button
                          onClick={() => handlePrintThermalReceipt(trx)}
                          className="px-2 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-600 text-blue-600 dark:text-blue-400 hover:text-white border border-blue-200 dark:border-blue-800 font-bold text-xs transition-colors flex items-center space-x-1"
                          title="Reprint Thermal Receipt"
                          id={`reprint-trx-${trx.id}`}
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Reprint</span>
                        </button>
                        {isAdmin && onDeleteTransaction && (
                          <button
                            onClick={() => setDeletingTrx(trx)}
                            className="px-2 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-600 text-rose-600 dark:text-rose-400 hover:text-white border border-rose-200 dark:border-rose-800 font-bold text-xs transition-colors flex items-center space-x-1"
                            title="Delete Transaction"
                            id={`delete-trx-${trx.id}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TRANSACTION RECEIPT MODAL */}
      {viewingTransaction && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative">
            
            <button
              onClick={() => setViewingTransaction(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                <ReceiptText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Transaction Receipt #{viewingTransaction.receiptNo}
                </h3>
                <p className="text-xs text-slate-400">
                  {new Date(viewingTransaction.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Receipt Content */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Client Name:</span>
                <strong className="text-slate-800 dark:text-slate-200">{viewingTransaction.customerName}</strong>
              </div>
              {viewingTransaction.staffName && (
                <div className="flex justify-between text-slate-500">
                  <span>Lead Therapist:</span>
                  <strong className="text-slate-800 dark:text-slate-200">{viewingTransaction.staffName}</strong>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Payment Method:</span>
                <strong className="text-blue-600 dark:text-blue-400 uppercase">{viewingTransaction.paymentMethod}</strong>
              </div>

              {viewingTransaction.paymentDetails?.mpesaRef && (
                <div className="flex justify-between text-slate-500">
                  <span>M-Pesa Reference:</span>
                  <strong className="text-slate-800 dark:text-slate-200">{viewingTransaction.paymentDetails.mpesaRef}</strong>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="font-bold text-[11px] text-slate-400 uppercase">Purchased Treatments</div>
                {viewingTransaction.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{item.quantity}x {item.serviceName}</span>
                    <span>{currency} {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span>{currency} {viewingTransaction.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>VAT ({viewingTransaction.taxRate}%):</span>
                  <span>{currency} {viewingTransaction.taxAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-slate-100 pt-1">
                  <span>Total Paid:</span>
                  <span className="text-blue-600 dark:text-blue-400 font-mono">{currency} {viewingTransaction.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <button
                onClick={() => handlePrintThermalReceipt(viewingTransaction)}
                className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center justify-center space-x-1.5"
                id="modal-print-single-trx-btn"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Reprint</span>
              </button>

              {isAdmin && (
                <button
                  onClick={() => {
                    const target = viewingTransaction;
                    setViewingTransaction(null);
                    handleStartEdit(target);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center justify-center space-x-1.5"
                  id="modal-edit-single-trx-btn"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              )}

              {isAdmin && onDeleteTransaction && (
                <button
                  onClick={() => {
                    const target = viewingTransaction;
                    setViewingTransaction(null);
                    setDeletingTrx(target);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all flex items-center justify-center space-x-1.5"
                  id="modal-delete-single-trx-btn"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              )}

              <button
                onClick={() => setViewingTransaction(null)}
                className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* SINGLE TRANSACTION DELETE CONFIRMATION MODAL */}
      {deletingTrx && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setDeletingTrx(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 text-rose-600 dark:text-rose-500">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Delete Transaction
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Receipt #{deletingTrx.receiptNo}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to delete transaction <strong>#{deletingTrx.receiptNo}</strong> for <strong>{deletingTrx.customerName}</strong> ({currency} {deletingTrx.total.toLocaleString()})?
              This action will permanently remove it from the sales ledger.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setDeletingTrx(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (isAdmin && onDeleteTransaction && deletingTrx) {
                    onDeleteTransaction(deletingTrx.id);
                  }
                  setDeletingTrx(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors shadow-md flex items-center space-x-1.5"
                id="confirm-delete-single-trx-btn"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Transaction</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE ALL TRANSACTIONS CONFIRMATION MODAL */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setShowDeleteAllModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 text-rose-600 dark:text-rose-500">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Delete All Transactions
                </h3>
                <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
                  Irreversible Action
                </p>
              </div>
            </div>

            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-3.5 text-xs text-rose-800 dark:text-rose-300 space-y-1">
              <p className="font-bold">
                Warning: You are about to wipe all {transactions.length} sales records!
              </p>
              <p className="text-[11px] opacity-90">
                This will clear total revenue calculations, M-Pesa/Cash/Card reports, and all receipt audit histories.
              </p>
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Enter Deletion Password
              </label>
              <input
                type="password"
                placeholder="Enter deletion password to confirm"
                value={deleteAllPassword}
                onChange={(e) => {
                  setDeleteAllPassword(e.target.value);
                  setDeleteAllError('');
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-mono font-bold border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-rose-500"
                id="delete-all-password-input"
              />
              {deleteAllError && (
                <p className="text-[11px] text-rose-600 dark:text-rose-400 font-bold">
                  {deleteAllError}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => {
                  setShowDeleteAllModal(false);
                  setDeleteAllPassword('');
                  setDeleteAllError('');
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteAllPassword.trim().toLowerCase() !== 'cat') {
                    setDeleteAllError('Incorrect deletion password.');
                    return;
                  }
                  if (onDeleteAllTransactions) {
                    onDeleteAllTransactions();
                  }
                  setShowDeleteAllModal(false);
                  setDeleteAllPassword('');
                  setDeleteAllError('');
                }}
                disabled={!deleteAllPassword.trim()}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-xs transition-colors shadow-md flex items-center space-x-1.5"
                id="confirm-delete-all-trx-btn"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Delete All Records</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT TRANSACTION MODAL */}
      {editingTransaction && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 relative my-8">
            <button
              onClick={() => setEditingTransaction(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                <Pencil className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Edit Transaction #{editingTransaction.receiptNo}
                </h3>
                <p className="text-xs text-slate-400">
                  Modify customer name, therapist, treatments, or payment details.
                </p>
              </div>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {/* Customer & Therapist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={editForm.customerName}
                    onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
                    placeholder="Walk-in Customer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Employee / Staff
                  </label>
                  {staff.length > 0 ? (
                    <select
                      value={editForm.staffName}
                      onChange={(e) => {
                        const selectedSt = staff.find((s) => s.name === e.target.value);
                        setEditForm({
                          ...editForm,
                          staffName: e.target.value,
                          staffId: selectedSt?.id || '',
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select Therapist</option>
                      {staff.map((st) => (
                        <option key={st.id} value={st.name}>
                          {st.name} ({st.role})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={editForm.staffName}
                      onChange={(e) => setEditForm({ ...editForm, staffName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
                      placeholder="Therapist Name"
                    />
                  )}
                </div>
              </div>

              {/* Payment Method & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={editForm.paymentMethod}
                    onChange={(e) => setEditForm({ ...editForm, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500 uppercase"
                  >
                    <option value="mpesa">M-Pesa</option>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="split">Split Payment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={editForm.createdAt}
                    onChange={(e) => setEditForm({ ...editForm, createdAt: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Treatments Items */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Treatments / Services
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold transition-all flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                {editForm.items.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <input
                      type="text"
                      value={item.serviceName}
                      onChange={(e) => handleItemChange(idx, 'serviceName', e.target.value)}
                      placeholder="Service Name"
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs border border-slate-200 dark:border-slate-700 focus:outline-none"
                    />
                    <div className="w-24">
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                        placeholder="Price"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs border border-slate-200 dark:border-slate-700 focus:outline-none font-mono"
                      />
                    </div>
                    <div className="w-16">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        placeholder="Qty"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs border border-slate-200 dark:border-slate-700 focus:outline-none font-mono"
                      />
                    </div>
                    {editForm.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Discount & Totals */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    Discount Amount ({currency})
                  </label>
                  <input
                    type="number"
                    value={editForm.discountAmount}
                    onChange={(e) => setEditForm({ ...editForm, discountAmount: parseFloat(e.target.value) || 0 })}
                    className="w-32 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-mono font-bold border border-slate-200 dark:border-slate-700 focus:outline-none text-right"
                  />
                </div>

                <div className="bg-slate-100 dark:bg-slate-800/80 p-3 rounded-xl flex items-center justify-between font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                  <span>Calculated Total:</span>
                  <span className="text-base text-blue-600 dark:text-blue-400">
                    {currency} {Math.max(0, editForm.items.reduce((a, b) => a + (b.price * b.quantity), 0) - editForm.discountAmount).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingTransaction(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-md flex items-center space-x-1.5"
                id="save-edit-trx-btn"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
