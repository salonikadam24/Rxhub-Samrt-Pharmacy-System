import React, { useState } from 'react';
import { Medicine, Customer, BillItem, SaleInvoice, PaymentMode, PharmacyStoreInfo } from '../../types';
import { getExpiryStatus } from '../../utils/storage';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  User, 
  UserPlus, 
  CreditCard, 
  QrCode, 
  DollarSign, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Pill, 
  Receipt,
  Printer,
  ChevronRight,
  X
} from 'lucide-react';

interface BillingPOSProps {
  medicines: Medicine[];
  customers: Customer[];
  storeInfo: PharmacyStoreInfo;
  onCompleteSale: (invoice: SaleInvoice, updatedMedicines: Medicine[], updatedCustomers: Customer[]) => void;
  onOpenScanner: () => void;
  onAddCustomer: (customer: Customer) => void;
  externalCartItems?: BillItem[];
  onClearExternalCart?: () => void;
}

export const BillingPOS: React.FC<BillingPOSProps> = ({
  medicines,
  customers,
  storeInfo,
  onCompleteSale,
  onOpenScanner,
  onAddCustomer,
  externalCartItems,
  onClearExternalCart,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Active Cart State
  const [cart, setCart] = useState<BillItem[]>([]);

  // Customer State
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(customers[4] || customers[0] || null); // Default to Walk-in
  const [doctorName, setDoctorName] = useState('');
  const [prescriptionNo, setPrescriptionNo] = useState('');
  
  // Payment State
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('upi');
  const [overallDiscountPercent, setOverallDiscountPercent] = useState<number>(0);
  const [paidAmountInput, setPaidAmountInput] = useState<string>('');

  // Customer Modal State
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');

  // Sync external scanner items if provided
  React.useEffect(() => {
    if (externalCartItems && externalCartItems.length > 0) {
      setCart(prev => {
        const merged = [...prev];
        externalCartItems.forEach(item => {
          const idx = merged.findIndex(i => i.medicineId === item.medicineId);
          if (idx >= 0) {
            merged[idx].quantity += item.quantity;
            merged[idx].subtotal = merged[idx].quantity * merged[idx].unitPrice;
            merged[idx].total = merged[idx].subtotal + (merged[idx].subtotal * merged[idx].gstPercent) / 100;
          } else {
            merged.push(item);
          }
        });
        return merged;
      });
      if (onClearExternalCart) onClearExternalCart();
    }
  }, [externalCartItems]);

  const categories = ['All', 'Tablet', 'Syrup', 'Injection', 'Ointment / Cream', 'Supplies / Medical Devices'];

  // Filter medicines for POS grid
  const filteredMedicines = medicines.filter(m => {
    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.barcode && m.barcode.includes(searchQuery));
    return matchesCategory && matchesSearch;
  });

  // Add Medicine to Cart
  const handleAddToCart = (med: Medicine) => {
    if (med.stock <= 0) return;

    const expiryStatus = getExpiryStatus(med.expiryDate);
    if (expiryStatus.level === 'expired') {
      alert(`Cannot sell ${med.name}: Batch is expired (${med.expiryDate})!`);
      return;
    }

    setCart(prevCart => {
      const existingIdx = prevCart.findIndex(item => item.medicineId === med.id);
      if (existingIdx >= 0) {
        const item = prevCart[existingIdx];
        if (item.quantity >= med.stock) {
          alert(`Only ${med.stock} units available in stock for ${med.name}`);
          return prevCart;
        }
        const updated = [...prevCart];
        const newQty = item.quantity + 1;
        const subtotal = med.sellingPrice * newQty;
        const taxAmount = (subtotal * med.gstPercent) / 100;
        updated[existingIdx] = {
          ...item,
          quantity: newQty,
          subtotal,
          taxAmount,
          total: subtotal + taxAmount
        };
        return updated;
      } else {
        const subtotal = med.sellingPrice * 1;
        const taxAmount = (subtotal * med.gstPercent) / 100;
        return [
          ...prevCart,
          {
            medicineId: med.id,
            medicineName: med.name,
            genericName: med.genericName,
            batchNumber: med.batchNumber,
            unitPrice: med.sellingPrice,
            quantity: 1,
            gstPercent: med.gstPercent,
            discountPercent: 0,
            subtotal,
            taxAmount,
            total: subtotal + taxAmount,
            expiryDate: med.expiryDate
          }
        ];
      }
    });
  };

  // Update Item Qty
  const handleUpdateQty = (medicineId: string, delta: number) => {
    const med = medicines.find(m => m.id === medicineId);
    if (!med) return;

    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.medicineId === medicineId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return item;
          if (newQty > med.stock) {
            alert(`Maximum available stock reached (${med.stock})`);
            return item;
          }
          const subtotal = item.unitPrice * newQty;
          const taxAmount = (subtotal * item.gstPercent) / 100;
          return {
            ...item,
            quantity: newQty,
            subtotal,
            taxAmount,
            total: subtotal + taxAmount
          };
        }
        return item;
      });
    });
  };

  // Remove Item
  const handleRemoveFromCart = (medicineId: string) => {
    setCart(prev => prev.filter(i => i.medicineId !== medicineId));
  };

  // Calculations
  const rawSubtotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
  const discountTotal = (rawSubtotal * overallDiscountPercent) / 100;
  const discountedSubtotal = rawSubtotal - discountTotal;
  const taxTotal = cart.reduce((acc, item) => acc + item.taxAmount, 0);
  const grandTotal = discountedSubtotal + taxTotal;

  // Finalize Sale & Checkout
  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Please add at least one medicine to the POS cart.");
      return;
    }

    const paidVal = paymentMode === 'credit' 
      ? (parseFloat(paidAmountInput) || 0) 
      : grandTotal;

    const dueVal = Math.max(0, grandTotal - paidVal);

    // Create Invoice
    const invoiceNum = `RX-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const newInvoice: SaleInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invoiceNum,
      date: nowStr,
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name || 'Walk-in Customer',
      customerPhone: selectedCustomer?.phone,
      doctorName: doctorName.trim() || undefined,
      prescriptionNo: prescriptionNo.trim() || undefined,
      items: cart,
      subtotal: rawSubtotal,
      discountTotal,
      taxTotal,
      grandTotal,
      paymentMode,
      paymentStatus: dueVal === 0 ? 'paid' : (paidVal > 0 ? 'partial' : 'due'),
      paidAmount: paidVal,
      dueAmount: dueVal
    };

    // Update Medicine Stock Levels
    const updatedMedicines = medicines.map(m => {
      const cartItem = cart.find(ci => ci.medicineId === m.id);
      if (cartItem) {
        return {
          ...m,
          stock: Math.max(0, m.stock - cartItem.quantity)
        };
      }
      return m;
    });

    // Update Customer Outstanding Ledger if credit due
    const updatedCustomers = customers.map(c => {
      if (selectedCustomer && c.id === selectedCustomer.id) {
        return {
          ...c,
          totalPurchases: c.totalPurchases + grandTotal,
          outstandingBalance: c.outstandingBalance + dueVal
        };
      }
      return c;
    });

    onCompleteSale(newInvoice, updatedMedicines, updatedCustomers);
    setCart([]);
    setDoctorName('');
    setPrescriptionNo('');
    setPaidAmountInput('');
  };

  const handleCreateNewCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: newCustName.trim(),
      phone: newCustPhone.trim() || 'N/A',
      totalPurchases: 0,
      outstandingBalance: 0,
      createdDate: new Date().toISOString().split('T')[0]
    };
    onAddCustomer(newCust);
    setSelectedCustomer(newCust);
    setNewCustName('');
    setNewCustPhone('');
    setShowAddCustomerModal(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
      
      {/* Left Column: Product Discovery Grid (7 cols) */}
      <div className="lg:col-span-7 space-y-4">
        
        {/* Search & AI Scan Bar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Medicine, Generic, Batch # or Scan Barcode..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            
            <button
              onClick={onOpenScanner}
              className="flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer shrink-0"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>Rx AI Prescription</span>
            </button>
          </div>

          {/* Category Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white dark:bg-emerald-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Medicines List Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[620px] overflow-y-auto pr-1">
          {filteredMedicines.map((med) => {
            const exp = getExpiryStatus(med.expiryDate);
            const isOutOfStock = med.stock === 0;
            const inCart = cart.some(item => item.medicineId === med.id);

            return (
              <div
                key={med.id}
                onClick={() => !isOutOfStock && handleAddToCart(med)}
                className={`p-4 bg-white dark:bg-slate-900 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                  isOutOfStock 
                    ? 'opacity-60 border-slate-200 dark:border-slate-800 cursor-not-allowed'
                    : inCart 
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md' 
                    : 'border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-xs'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                      {med.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium line-clamp-1">
                      {med.genericName}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border whitespace-nowrap ${exp.badgeClass}`}>
                    {exp.label}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <p className="text-[10px] text-slate-400">Rack: <span className="font-semibold text-slate-700 dark:text-slate-300">{med.rackLocation}</span></p>
                    <p className="text-[10px] text-slate-400">Batch: <span className="font-mono text-slate-700 dark:text-slate-300">{med.batchNumber}</span></p>
                  </div>

                  <div className="text-right">
                    <p className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                      ${med.sellingPrice.toFixed(2)}
                    </p>
                    <p className={`text-[10px] font-semibold ${isOutOfStock ? 'text-rose-500 font-bold' : 'text-slate-500'}`}>
                      {isOutOfStock ? 'OUT OF STOCK' : `Stock: ${med.stock} ${med.unit.split(' ')[0]}`}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Right Column: Billing Cart & Checkout Panel (5 cols) */}
      <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-lg flex flex-col justify-between space-y-5">
        
        <div className="space-y-4">
          
          {/* Header */}
          <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <Receipt className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Active Billing Cart</h3>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
              {cart.reduce((a, c) => a + c.quantity, 0)} items
            </span>
          </div>

          {/* Customer & Prescription Header */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">Customer:</span>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedCustomer?.id || ''}
                  onChange={(e) => {
                    const cust = customers.find(c => c.id === e.target.value) || null;
                    setSelectedCustomer(cust);
                  }}
                  className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.outstandingBalance > 0 ? `(Due: $${c.outstandingBalance.toFixed(2)})` : ''}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setShowAddCustomerModal(true)}
                  className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 cursor-pointer"
                  title="Add New Customer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Doctor & Prescription Inputs */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200 dark:border-slate-700/60">
              <input
                type="text"
                placeholder="Doctor Name (Optional)"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
              />
              <input
                type="text"
                placeholder="Rx No. (Optional)"
                value={prescriptionNo}
                onChange={(e) => setPrescriptionNo(e.target.value)}
                className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Cart Items List Table */}
          <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
            {cart.length === 0 ? (
              <div className="text-center py-10 space-y-2 text-slate-400">
                <Pill className="w-8 h-8 mx-auto opacity-40" />
                <p className="text-xs font-medium">Cart is empty. Select medicines from inventory list.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.medicineId}
                  className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs gap-2"
                >
                  <div className="space-y-0.5 flex-1">
                    <p className="font-bold text-slate-900 dark:text-white">{item.medicineName}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      Batch: {item.batchNumber} • GST: {item.gstPercent}%
                    </p>
                    <p className="font-semibold text-emerald-600 dark:text-emerald-400 text-xs">
                      ${item.unitPrice.toFixed(2)} x {item.quantity} = ${item.total.toFixed(2)}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-1.5 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => handleUpdateQty(item.medicineId, -1)}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300 cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-bold px-1.5 text-slate-900 dark:text-white">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQty(item.medicineId, 1)}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleRemoveFromCart(item.medicineId)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

        </div>

        {/* Calculation & Checkout Footer */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
          
          {/* Payment Method Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Payment Method</label>
            <div className="grid grid-cols-4 gap-2 text-xs">
              {[
                { id: 'upi', label: 'UPI / QR', icon: QrCode },
                { id: 'cash', label: 'Cash', icon: DollarSign },
                { id: 'card', label: 'Card', icon: CreditCard },
                { id: 'credit', label: 'Customer Due', icon: User },
              ].map(mode => {
                const Icon = mode.icon;
                const isSel = paymentMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setPaymentMode(mode.id as PaymentMode)}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                      isSel
                        ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-md'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-[10px]">{mode.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Customer Due Amount Input if Credit Chosen */}
          {paymentMode === 'credit' && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1.5 text-xs">
              <label className="font-semibold text-amber-800 dark:text-amber-300 block">Amount Paid Now ($):</label>
              <input
                type="number"
                min={0}
                max={grandTotal}
                placeholder={`0 to ${grandTotal.toFixed(2)}`}
                value={paidAmountInput}
                onChange={(e) => setPaidAmountInput(e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-amber-300 rounded-lg text-slate-900 dark:text-white font-bold"
              />
              <p className="text-[10px] text-amber-700 dark:text-amber-400">
                Remaining due (${(grandTotal - (parseFloat(paidAmountInput) || 0)).toFixed(2)}) will be logged to customer's credit balance.
              </p>
            </div>
          )}

          {/* Price Breakdown */}
          <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-medium text-slate-900 dark:text-white">${rawSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (GST Included):</span>
              <span className="font-medium text-slate-900 dark:text-white">${taxTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center font-bold text-slate-900 dark:text-white text-base pt-2 border-t border-slate-200 dark:border-slate-800">
              <span>Grand Total:</span>
              <span className="text-emerald-600 dark:text-emerald-400">${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Submit Checkout */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-600/30 text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Complete Sale & Print Receipt</span>
          </button>

        </div>

      </div>

      {/* Add Customer Quick Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 w-full max-w-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Add New Customer</h3>
              <button onClick={() => setShowAddCustomerModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewCustomer} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Customer Full Name</label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 text-white font-bold rounded-xl"
              >
                Save & Select Customer
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
