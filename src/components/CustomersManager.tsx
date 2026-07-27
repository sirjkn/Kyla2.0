import React, { useState, useMemo } from 'react';
import { Customer, Transaction, CompanyDetails } from '../types';
import { 
  Users, 
  UserPlus, 
  Search, 
  Phone, 
  Mail, 
  Calendar, 
  ShoppingBag, 
  DollarSign, 
  Receipt, 
  Edit, 
  Trash2, 
  UserCheck, 
  Clock, 
  Sparkles,
  X,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

interface CustomersManagerProps {
  customers: Customer[];
  transactions: Transaction[];
  company: CompanyDetails;
  onAddCustomer: (newCustomer: Omit<Customer, 'id' | 'createdAt'>) => void;
  onEditCustomer: (updatedCustomer: Customer) => void;
  onDeleteCustomer: (customerId: string) => void;
}

export const CustomersManager: React.FC<CustomersManagerProps> = ({
  customers,
  transactions,
  company,
  onAddCustomer,
  onEditCustomer,
  onDeleteCustomer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [historyCustomer, setHistoryCustomer] = useState<Customer | null>(null);

  // Add/Edit Form state
  const [formData, setFormState] = useState<{
    name: string;
    phone: string;
    email: string;
    notes: string;
  }>({
    name: '',
    phone: '',
    email: '',
    notes: '',
  });

  // Calculate customer purchase statistics from transactions
  const customerStats = useMemo(() => {
    const map: Record<string, { totalSpent: number; visitCount: number; lastVisit?: string; transactions: Transaction[] }> = {};

    transactions.forEach((tx) => {
      const cName = tx.customerName || 'Walk-in Customer';
      if (!map[cName]) {
        map[cName] = { totalSpent: 0, visitCount: 0, transactions: [] };
      }
      map[cName].totalSpent += tx.total;
      map[cName].visitCount += 1;
      map[cName].transactions.push(tx);

      if (!map[cName].lastVisit || new Date(tx.createdAt) > new Date(map[cName].lastVisit!)) {
        map[cName].lastVisit = tx.createdAt;
      }
    });

    return map;
  }, [transactions]);

  // Total summary numbers
  const totalCustomers = customers.length;
  const totalRevenue = useMemo(() => {
    return transactions.reduce((acc, t) => acc + t.total, 0);
  }, [transactions]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = searchTerm.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.phone && c.phone.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q))
      );
    });
  }, [customers, searchTerm]);

  const handleOpenAddModal = () => {
    setFormState({ name: '', phone: '', email: '', notes: '' });
    setEditingCustomer(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setFormState({
      name: c.name,
      phone: c.phone || '',
      email: c.email || '',
      notes: c.notes || '',
    });
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingCustomer) {
      onEditCustomer({
        ...editingCustomer,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        notes: formData.notes.trim(),
      });
    } else {
      onAddCustomer({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        notes: formData.notes.trim(),
        joinDate: new Date().toISOString(),
      });
    }

    setIsAddModalOpen(false);
  };

  // Get customer transaction history
  const historyTxs = useMemo(() => {
    if (!historyCustomer) return [];
    return (
      customerStats[historyCustomer.name]?.transactions ||
      transactions.filter(
        (t) => t.customerName?.toLowerCase() === historyCustomer.name.toLowerCase()
      )
    );
  }, [historyCustomer, customerStats, transactions]);

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-500" />
            <span>Customers Directory</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage registered clientele, track total spending, and inspect purchase history logs.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
          id="add-customer-btn"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Customer</span>
        </button>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Customers</p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{totalCustomers}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Customer Lifetime Sales</p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {company.currency || 'KES'} {totalRevenue.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Transactions Recorded</p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{transactions.length}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name or phone..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none"
            id="search-customers-input"
          />
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Showing <span className="font-bold text-slate-900 dark:text-white">{filteredCustomers.length}</span> of {customers.length} clients
        </p>
      </div>

      {/* Customers List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((c) => {
          const stats = customerStats[c.name] || { totalSpent: 0, visitCount: 0 };

          return (
            <div
              key={c.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              id={`customer-card-${c.id}`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-black text-base flex items-center justify-center shadow-sm">
                      {c.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <span>{c.name}</span>
                        {c.isDefault && (
                          <span className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold">
                            Default
                          </span>
                        )}
                      </h3>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>Joined {c.joinDate ? new Date(c.joinDate).toLocaleDateString() : 'N/A'}</span>
                      </p>
                    </div>
                  </div>

                  {!c.isDefault && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenEditModal(c)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                        title="Edit Customer"
                        id={`edit-cust-${c.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteCustomer(c.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                        title="Delete Customer"
                        id={`delete-cust-${c.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Contact info */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-xs space-y-1.5 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center text-slate-600 dark:text-slate-300 gap-2">
                    <Phone className="w-3.5 h-3.5 text-blue-500" />
                    <span>{c.phone || 'No phone recorded'}</span>
                  </div>
                  <div className="flex items-center text-slate-600 dark:text-slate-300 gap-2">
                    <Mail className="w-3.5 h-3.5 text-purple-500" />
                    <span>{c.email || 'No email recorded'}</span>
                  </div>
                  {c.notes && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                      "{c.notes}"
                    </p>
                  )}
                </div>

                {/* Spent statistics */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-2.5 text-center">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Total Spent</p>
                    <p className="font-black text-blue-600 dark:text-blue-400 mt-0.5 text-sm">
                      {company.currency || 'KES'} {stats.totalSpent.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-2.5 text-center">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Visits Count</p>
                    <p className="font-black text-purple-600 dark:text-purple-400 mt-0.5 text-sm">
                      {stats.visitCount} Order(s)
                    </p>
                  </div>
                </div>
              </div>

              {/* View History CTA */}
              <button
                onClick={() => setHistoryCustomer(c)}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 font-bold text-xs text-slate-700 dark:text-slate-200 transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                id={`history-cust-${c.id}`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>View Purchase History ({stats.visitCount})</span>
                <ChevronRight className="w-3.5 h-3.5 ml-auto" />
              </button>
            </div>
          );
        })}
      </div>

      {/* ADD / EDIT CUSTOMER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-500" />
                <span>{editingCustomer ? 'Edit Customer Info' : 'Register New Client'}</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Client Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormState({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sarah Kimani"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl px-3.5 py-2.5 font-bold focus:outline-none focus:border-blue-500"
                  id="cust-name-input"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormState({ ...formData, phone: e.target.value })}
                  placeholder="e.g. 0712 345 678"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl px-3.5 py-2.5 font-medium focus:outline-none focus:border-blue-500"
                  id="cust-phone-input"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormState({ ...formData, email: e.target.value })}
                  placeholder="e.g. sarah@example.com"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl px-3.5 py-2.5 font-medium focus:outline-none focus:border-blue-500"
                  id="cust-email-input"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Client Notes & Preferences
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormState({ ...formData, notes: e.target.value })}
                  placeholder="Special preferences, allergies, hair style notes..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl px-3.5 py-2.5 font-medium focus:outline-none focus:border-blue-500 resize-none"
                  id="cust-notes-input"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
                  id="save-cust-btn"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingCustomer ? 'Update Info' : 'Save Customer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOMER PURCHASE HISTORY MODAL */}
      {historyCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 font-bold flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{historyCustomer.name}</span>
                    <span className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold">
                      {historyTxs.length} Purchase(s)
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Lifetime History Logs & POS Receipts
                  </p>
                </div>
              </div>

              <button
                onClick={() => setHistoryCustomer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="overflow-y-auto space-y-4 pr-1 flex-1">
              {historyTxs.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Clock className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No Purchase History Found</p>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    This client has not completed any register sales yet.
                  </p>
                </div>
              ) : (
                historyTxs.map((tx) => (
                  <div
                    key={tx.id}
                    className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                      <div>
                        <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100 mr-2">
                          {tx.receiptNo}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {new Date(tx.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          {tx.paymentMethod.toUpperCase()}
                        </span>
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {company.currency || 'KES'} {tx.total.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Items table */}
                    <div className="space-y-1.5">
                      {tx.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="text-slate-700 dark:text-slate-300 font-medium">
                            {item.quantity}x {item.serviceName}
                          </span>
                          <span className="font-mono text-slate-600 dark:text-slate-400">
                            {company.currency || 'KES'} {(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    {tx.staffName && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 flex items-center justify-between">
                        <span>Served by: <strong className="text-slate-700 dark:text-slate-200">{tx.staffName}</strong></span>
                        {tx.discountAmount > 0 && (
                          <span className="text-amber-500 font-bold">Discount: {company.currency} {tx.discountAmount}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setHistoryCustomer(null)}
                className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
              >
                Close History
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
