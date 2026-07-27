import React, { useState } from 'react';
import { 
  Service, 
  Category, 
  Staff, 
  CompanyDetails, 
  ReceiptSettings, 
  PaymentMethodConfig, 
  Transaction, 
  TransactionItem 
} from '../types';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CheckCircle2, 
  User, 
  Sparkles, 
  CreditCard, 
  Smartphone, 
  Banknote, 
  Printer, 
  FileText, 
  X, 
  Clock, 
  Check,
  Calendar
} from 'lucide-react';

interface POSManagerProps {
  services: Service[];
  categories: Category[];
  staff: Staff[];
  company: CompanyDetails;
  receiptSettings: ReceiptSettings;
  paymentMethods: PaymentMethodConfig[];
  onCompleteSale?: (newTransaction: Transaction) => void;
  onCompleteTransaction?: (newTransaction: Transaction) => void;
}

interface CartItem {
  service: Service;
  quantity: number;
  discount?: number;
}

export const POSManager: React.FC<POSManagerProps> = ({
  services,
  categories,
  staff,
  company,
  receiptSettings,
  paymentMethods,
  onCompleteSale,
  onCompleteTransaction,
}) => {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [customerName, setCustomerName] = useState('Walk-in Client');
  const [orderDate, setOrderDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [selectedStaffId, setSelectedStaffId] = useState<string>(() => {
    return staff.find((s) => s.status === 'active')?.id || staff[0]?.id || '';
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Payment Method state - default to mpesa or default method in config
  const defaultMethod = paymentMethods.find((m) => m.isDefault && m.isEnabled)?.id || 'mpesa';
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>(defaultMethod);
  
  // Payment Details input
  const [mpesaRef, setMpesaRef] = useState('');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [cardLast4, setCardLast4] = useState('');
  const [notes, setNotes] = useState('');

  // Sale Completion Modal State
  const [completedTransaction, setCompletedTransaction] = useState<Transaction | null>(null);

  // Filter active services
  const activeServices = services.filter((s) => s.isActive);

  const filteredServices = activeServices.filter((service) => {
    const matchesCategory = selectedCategoryId === 'all' || service.categoryId === selectedCategoryId;
    const matchesQuery = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  // Cart Functions
  const handleAddToCart = (service: Service) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.service.id === service.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      } else {
        return [
          ...prev,
          {
            service,
            quantity: 1,
            discount: 0,
          },
        ];
      }
    });
  };

  const handleUpdateQuantity = (serviceId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.service.id === serviceId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleItemDiscountChange = (serviceId: string, discount: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.service.id === serviceId
          ? { ...item, discount: Math.max(0, discount) }
          : item
      )
    );
  };

  const handleRemoveFromCart = (serviceId: string) => {
    setCart((prev) => prev.filter((item) => item.service.id !== serviceId));
  };

  // Calculations
  const subtotalGross = cart.reduce((sum, item) => sum + item.service.price * item.quantity, 0);
  const totalDiscount = cart.reduce((sum, item) => sum + (item.discount || 0) * item.quantity, 0);
  const subtotalNet = Math.max(0, subtotalGross - totalDiscount);

  const taxRate = company.taxRate || 0;
  const taxAmount = (subtotalNet * taxRate) / (100 + taxRate);
  const grandTotal = subtotalNet; // total payable

  const tenderedVal = parseFloat(cashTendered) || 0;
  const cashChange = Math.max(0, tenderedVal - grandTotal);

  // Complete Sale Handler
  const handleCheckout = () => {
    if (cart.length === 0) return;

    const selectedStaff = staff.find((s) => s.id === selectedStaffId);

    const receiptNo = 'REC-' + Math.floor(100000 + Math.random() * 900000);
    const transactionItems: TransactionItem[] = cart.map((item) => {
      const cat = categories.find((c) => c.id === item.service.categoryId);
      const effectivePrice = Math.max(0, item.service.price - (item.discount || 0));
      return {
        serviceId: item.service.id,
        serviceName: item.service.name,
        categoryName: cat?.name,
        price: effectivePrice,
        quantity: item.quantity,
        staffId: selectedStaffId || undefined,
        staffName: selectedStaff?.name || undefined,
      };
    });

    // Construct createdAt timestamp with orderDate (supports backdating)
    const now = new Date();
    const timePart = now.toTimeString().split(' ')[0]; // HH:mm:ss
    let customCreatedAt = now.toISOString();
    if (orderDate) {
      const parsed = new Date(`${orderDate}T${timePart}`);
      if (!isNaN(parsed.getTime())) {
        customCreatedAt = parsed.toISOString();
      }
    }

    const newTrx: Transaction = {
      id: 'trx-' + Date.now(),
      receiptNo,
      customerName: customerName.trim() || 'Walk-in Client',
      items: transactionItems,
      subtotal: Math.round((subtotalNet - taxAmount) * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      taxRate,
      discountAmount: totalDiscount,
      total: grandTotal,
      paymentMethod: selectedPaymentMethod,
      paymentDetails: {
        mpesaRef: selectedPaymentMethod === 'mpesa' ? (mpesaRef || 'MPESA-' + Date.now().toString().slice(-6)) : undefined,
        cashTendered: selectedPaymentMethod === 'cash' ? tenderedVal : undefined,
        cashChange: selectedPaymentMethod === 'cash' ? cashChange : undefined,
        cardLast4: selectedPaymentMethod === 'card' ? (cardLast4 || 'XXXX') : undefined,
      },
      staffId: selectedStaffId || undefined,
      staffName: selectedStaff?.name || undefined,
      status: 'completed',
      createdAt: customCreatedAt,
      notes: notes.trim() || undefined,
    };

    const completeCallback = onCompleteSale || onCompleteTransaction;
    if (completeCallback) {
      completeCallback(newTrx);
    }
    setCompletedTransaction(newTrx);

    // Reset Form
    setCart([]);
    setMpesaRef('');
    setCashTendered('');
    setCardLast4('');
    setNotes('');
    setOrderDate(new Date().toISOString().slice(0, 10));
  };

  // Thermal Print helper
  const handlePrintReceipt = (trx: Transaction) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const currency = company.currency || 'KES';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt ${trx.receiptNo}</title>
          <style>
            @page { margin: 0; size: ${receiptSettings.paperWidth || '80mm'} auto; }
            body { 
              font-family: 'Courier New', Courier, monospace; 
              width: 280px; 
              margin: 10px auto; 
              padding: 5px; 
              color: #000;
              font-size: 12px;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .bold { font-weight: bold; }
            .divider { border-bottom: 1px dashed #000; margin: 8px 0; }
            .flex-between { display: flex; justify-content: space-between; }
            .item-row { margin-bottom: 4px; }
            .header-title { font-size: 16px; font-weight: bold; margin-bottom: 2px; }
          </style>
        </head>
        <body>
          <div class="text-center">
            <div class="header-title">${company.businessName}</div>
            <div>${company.address || ''}</div>
            <div>Tel: ${company.phone || ''}</div>
            ${receiptSettings.showEmail && company.email ? `<div>Email: ${company.email}</div>` : ''}
            ${receiptSettings.headerNote ? `<div style="margin-top:4px; font-style:italic;">${receiptSettings.headerNote}</div>` : ''}
          </div>

          <div class="divider"></div>

          <div>
            <div class="flex-between"><span>Receipt No:</span><span class="bold">${trx.receiptNo}</span></div>
            <div class="flex-between"><span>Date:</span><span>${new Date(trx.createdAt).toLocaleString()}</span></div>
            <div class="flex-between"><span>Client:</span><span>${trx.customerName}</span></div>
            ${trx.staffName ? `<div class="flex-between"><span>Employee:</span><span>${trx.staffName}</span></div>` : ''}
            <div class="flex-between"><span>Payment:</span><span class="bold">${trx.paymentMethod.toUpperCase()}</span></div>
          </div>

          <div class="divider"></div>

          <div>
            <div class="bold flex-between" style="margin-bottom:4px;">
              <span>ITEM</span>
              <span>AMOUNT</span>
            </div>
            ${trx.items
              .map(
                (item) => `
              <div class="item-row">
                <div class="bold">${item.serviceName}</div>
                <div class="flex-between">
                  <span>${item.quantity} x ${currency} ${item.price.toLocaleString()}</span>
                  <span>${currency} ${(item.quantity * item.price).toLocaleString()}</span>
                </div>
              </div>
            `
              )
              .join('')}
          </div>

          <div class="divider"></div>

          <div>
            <div class="flex-between"><span>Subtotal:</span><span>${currency} ${trx.subtotal.toLocaleString()}</span></div>
            <div class="flex-between"><span>Tax (${trx.taxRate}%):</span><span>${currency} ${trx.taxAmount.toLocaleString()}</span></div>
            <div class="flex-between bold" style="font-size:14px; margin-top:4px;">
              <span>TOTAL:</span>
              <span>${currency} ${trx.total.toLocaleString()}</span>
            </div>
            ${
              trx.paymentDetails?.cashTendered
                ? `
              <div class="flex-between"><span>Cash Paid:</span><span>${currency} ${trx.paymentDetails.cashTendered.toLocaleString()}</span></div>
              <div class="flex-between"><span>Change:</span><span>${currency} ${trx.paymentDetails.cashChange?.toLocaleString()}</span></div>
            `
                : ''
            }
            ${
              trx.paymentDetails?.mpesaRef
                ? `<div class="flex-between"><span>M-Pesa Ref:</span><span>${trx.paymentDetails.mpesaRef}</span></div>`
                : ''
            }
          </div>

          <div class="divider"></div>

          <div class="text-center">
            <div>${receiptSettings.footerNote || 'Thank you for visiting us!'}</div>
            <div style="margin-top:6px; font-size:10px;">Powered by SpaFlow POS</div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-[1600px] mx-auto pb-10">
      
      {/* LEFT PANEL: SERVICES CATALOG GRID */}
      <div className="flex-1 flex flex-col space-y-4">
        
        {/* Top Filter & Search Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search for something... (e.g. massage, facial, manicure)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs font-medium border border-transparent focus:border-blue-500 focus:outline-none transition-all"
                id="pos-search-input"
              />
            </div>

            {/* Quick Service Count */}
            <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 font-medium px-1 flex-shrink-0">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span>Showing <strong>{filteredServices.length}</strong> treatments</span>
            </div>
          </div>

          {/* Category Filter Cards Grid (Boxy, Bigger, 3 per row) */}
          <div className="pt-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Select Category Filter
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
              <button
                onClick={() => setSelectedCategoryId('all')}
                className={`p-2.5 sm:p-3 rounded-xl border transition-all text-left flex flex-col justify-between min-h-[64px] sm:min-h-[72px] ${
                  selectedCategoryId === 'all'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-500/20 font-bold'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200 font-semibold'
                }`}
                id="pos-cat-all"
              >
                <div className="flex items-center justify-between w-full">
                  <Sparkles className={`w-4 h-4 ${selectedCategoryId === 'all' ? 'text-white' : 'text-blue-600'}`} />
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      selectedCategoryId === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {activeServices.length}
                  </span>
                </div>
                <span className="font-extrabold text-xs tracking-tight truncate mt-1">All Treatments</span>
              </button>

              {categories.map((cat) => {
                const catServiceCount = activeServices.filter((s) => s.categoryId === cat.id).length;
                const isSelected = selectedCategoryId === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`p-2.5 sm:p-3 rounded-xl border transition-all text-left flex flex-col justify-between min-h-[64px] sm:min-h-[72px] ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-500/20 font-bold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200 font-semibold'
                    }`}
                    id={`pos-cat-${cat.id}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className="w-3.5 h-3.5 rounded-full shadow-xs flex-shrink-0"
                        style={{ backgroundColor: cat.color }}
                      ></span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {catServiceCount}
                      </span>
                    </div>
                    <span className="font-extrabold text-xs tracking-tight truncate capitalize mt-1">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Service Cards Grid (Compact 60% Size, 3 per row) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {filteredServices.length === 0 ? (
            <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-2">
              <ShoppingCart className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">
                No matching treatments found
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try searching with a different keyword or selecting a different category filter.
              </p>
            </div>
          ) : (
            filteredServices.map((service) => {
              const cat = categories.find((c) => c.id === service.categoryId);
              const inCart = cart.find((item) => item.service.id === service.id);

              return (
                <div
                  key={service.id}
                  onClick={() => handleAddToCart(service)}
                  className={`group relative rounded-xl p-2.5 sm:p-3 transition-all duration-200 cursor-pointer flex flex-col justify-between hover:shadow-md border ${
                    inCart
                      ? 'border-blue-600 ring-2 ring-blue-600/20 bg-blue-50/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                  id={`pos-service-card-${service.id}`}
                >
                  {/* Category Pill Tag */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className="text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-white truncate max-w-[100px]"
                        style={{ backgroundColor: cat?.color || '#2563eb' }}
                      >
                        {cat?.name || 'Service'}
                      </span>
                      
                      <span className="text-[10px] text-slate-500 font-mono flex items-center gap-0.5 flex-shrink-0">
                        <Clock className="w-3 h-3 text-blue-600" />
                        {service.durationMinutes}m
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1 pt-0.5">
                      {service.name}
                    </h4>

                    <p className="text-[10px] text-slate-500 line-clamp-1 leading-tight">
                      {service.description || 'Standard service offering'}
                    </p>
                  </div>

                  {/* Price & Add Button */}
                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100">
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-mono leading-none">Price</span>
                      <span className="text-xs font-black text-blue-700 font-mono">
                        {company.currency || 'KES'} {service.price.toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(service);
                      }}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center space-x-1 ${
                        inCart
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-800 group-hover:bg-blue-600 group-hover:text-white'
                      }`}
                    >
                      {inCart ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Added ({inCart.quantity})</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* RIGHT PANEL: ORDER SUMMARY & PAYMENT */}
      <div className="w-full lg:w-96 xl:w-[420px] flex-shrink-0 space-y-4">
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between h-full sticky top-20">
          
          <div className="space-y-4">
            
            {/* Header / Client Input */}
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    Order Summary
                  </h3>
                </div>
                <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono font-bold px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                  {cart.reduce((a, b) => a + b.quantity, 0)} items
                </span>
              </div>

              {/* Customer details & Employee input */}
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Walk-in Client"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full pl-8 pr-2 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium border border-transparent focus:border-blue-500 focus:outline-none"
                      id="pos-customer-name-input"
                    />
                  </div>

                  <select
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium border border-transparent focus:border-blue-500 focus:outline-none truncate font-medium"
                    id="pos-employee-select"
                  >
                    <option value="">Employee: Unassigned</option>
                    {staff.map((st) => (
                      <option key={st.id} value={st.id}>
                        Employee: {st.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                  <Calendar className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex-shrink-0">Order Date:</span>
                  <input
                    type="date"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    className="w-full bg-transparent text-slate-900 dark:text-slate-100 text-xs font-semibold focus:outline-none cursor-pointer"
                    id="pos-order-date-input"
                  />
                </div>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="max-h-[280px] overflow-y-auto space-y-2 pr-1">
              {cart.length === 0 ? (
                <div className="py-8 text-center text-slate-400 space-y-2">
                  <ShoppingCart className="w-8 h-8 mx-auto opacity-40 text-slate-400" />
                  <p className="text-xs font-medium">Cart is empty.</p>
                  <p className="text-[11px] text-slate-400">Click treatments on the left to add to order.</p>
                </div>
              ) : (
                cart.map((item) => {
                  const effectivePrice = Math.max(0, item.service.price - (item.discount || 0));
                  return (
                    <div
                      key={item.service.id}
                      className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2"
                    >
                      {/* Left: Title & Price */}
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                          {item.service.name}
                        </div>
                        <div className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-bold">
                          {company.currency || 'KES'} {effectivePrice.toLocaleString()}
                          {item.discount && item.discount > 0 ? (
                            <span className="text-[10px] text-slate-400 line-through ml-1 font-normal">
                              {item.service.price.toLocaleString()}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {/* Right: Discount + Quantity + Trash */}
                      <div className="flex items-center space-x-1.5 flex-shrink-0">
                        {/* Discount Input */}
                        <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-1.5 py-0.5" title="Item Discount">
                          <span className="text-[9px] text-slate-400 font-bold mr-0.5">Disc:</span>
                          <input
                            type="number"
                            min="0"
                            max={item.service.price}
                            placeholder="0"
                            value={item.discount || ''}
                            onChange={(e) => handleItemDiscountChange(item.service.id, parseFloat(e.target.value) || 0)}
                            className="w-10 text-[10px] font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none bg-transparent"
                          />
                        </div>

                        {/* Quantity Selector */}
                        <div className="flex items-center space-x-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5">
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.service.id, -1)}
                            className="w-4.5 h-4.5 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-mono font-bold w-4 text-center text-slate-900 dark:text-slate-100">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.service.id, 1)}
                            className="w-4.5 h-4.5 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Trash */}
                        <button
                          type="button"
                          onClick={() => handleRemoveFromCart(item.service.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {company.currency || 'KES'} {subtotalGross.toLocaleString()}
                </span>
              </div>

              {totalDiscount > 0 && (
                <div className="flex justify-between text-amber-600 dark:text-amber-400 font-semibold">
                  <span>Item Discounts</span>
                  <span className="font-mono">
                    -{company.currency || 'KES'} {totalDiscount.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>VAT ({taxRate}%)</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {company.currency || 'KES'} {taxAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm font-black text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span>Total Payable</span>
                <span className="font-mono text-blue-600 dark:text-blue-400 text-base">
                  {company.currency || 'KES'} {grandTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Payment Method Selector at Bottom of Order Summary */}
            <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Payment Method (Default: M-Pesa)
              </label>

              <div className="grid grid-cols-3 gap-2">
                {paymentMethods.filter((m) => m.isEnabled).map((pm) => {
                  const isSelected = selectedPaymentMethod === pm.id;
                  const Icon = pm.id === 'mpesa' ? Smartphone : pm.id === 'cash' ? Banknote : CreditCard;

                  return (
                    <button
                      key={pm.id}
                      onClick={() => setSelectedPaymentMethod(pm.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                      id={`pos-pm-${pm.id}`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[11px] font-bold leading-tight truncate w-full">
                        {pm.id === 'mpesa' ? 'M-Pesa' : pm.id === 'cash' ? 'Cash' : 'Card'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Payment Method Details Input */}
              {selectedPaymentMethod === 'mpesa' && (
                <div className="bg-blue-500/10 border border-blue-500/20 p-2.5 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-blue-800 dark:text-blue-300 font-semibold">
                    <span>M-Pesa Till / Paybill:</span>
                    <strong className="font-mono">
                      {paymentMethods.find((m) => m.id === 'mpesa')?.mpesaNumber || '889900'}
                    </strong>
                  </div>
                  <input
                    type="text"
                    placeholder="M-Pesa Transaction Code (e.g. QGH829102K)"
                    value={mpesaRef}
                    onChange={(e) => setMpesaRef(e.target.value.toUpperCase())}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 text-slate-900 dark:text-slate-100 text-xs font-mono uppercase focus:outline-none"
                    id="pos-mpesa-ref-input"
                  />
                </div>
              )}

              {selectedPaymentMethod === 'cash' && (
                <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-amber-800 dark:text-amber-300 font-semibold">Amount Tendered</span>
                    <span className="text-amber-700 dark:text-amber-400 font-mono font-bold">
                      Change: {company.currency || 'KES'} {cashChange.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="number"
                    placeholder={`e.g. ${grandTotal}`}
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-slate-900 dark:text-slate-100 text-xs font-mono focus:outline-none"
                    id="pos-cash-tendered-input"
                  />
                </div>
              )}

              {selectedPaymentMethod === 'card' && (
                <div className="bg-purple-500/10 border border-purple-500/20 p-2.5 rounded-xl space-y-1.5 text-xs">
                  <input
                    type="text"
                    placeholder="Card Last 4 Digits or Auth Ref"
                    value={cardLast4}
                    onChange={(e) => setCardLast4(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-700 text-slate-900 dark:text-slate-100 text-xs font-mono focus:outline-none"
                    id="pos-card-ref-input"
                  />
                </div>
              )}
            </div>

          </div>

          {/* Checkout Button */}
          <div className="pt-4">
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className={`w-full py-3.5 px-4 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-lg ${
                cart.length > 0
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 active:scale-95 cursor-pointer'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
              }`}
              id="pos-checkout-btn"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Payment & Record Sale</span>
            </button>
          </div>

        </div>

      </div>

      {/* SALE COMPLETED / RECEIPT MODAL */}
      {completedTransaction && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 relative">
            
            <button
              onClick={() => setCompletedTransaction(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Payment Completed!
              </h3>
              <p className="text-xs text-slate-500">
                Transaction recorded successfully under receipt <strong className="text-slate-800 dark:text-slate-200 font-mono">{completedTransaction.receiptNo}</strong>.
              </p>
            </div>

            {/* Receipt Quick Preview Card */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl font-mono text-xs space-y-2 text-slate-800 dark:text-slate-200">
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span>Client:</span>
                <span className="font-bold">{completedTransaction.customerName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span>Payment Method:</span>
                <span className="font-bold uppercase text-blue-600 dark:text-blue-400">
                  {completedTransaction.paymentMethod}
                </span>
              </div>
              <div className="space-y-1 pt-1">
                {completedTransaction.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-[11px]">
                    <span>{item.quantity}x {item.serviceName}</span>
                    <span>{company.currency || 'KES'} {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800 font-bold text-sm text-slate-900 dark:text-slate-100">
                <span>Total Paid:</span>
                <span className="text-blue-600 dark:text-blue-400">
                  {company.currency || 'KES'} {completedTransaction.total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handlePrintReceipt(completedTransaction)}
                className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center justify-center space-x-2"
                id="pos-print-receipt-btn"
              >
                <Printer className="w-4 h-4" />
                <span>Print Thermal Receipt</span>
              </button>

              <button
                onClick={() => setCompletedTransaction(null)}
                className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all"
                id="pos-close-receipt-btn"
              >
                Start New Order
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
