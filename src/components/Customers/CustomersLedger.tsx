import React, { useState } from 'react';
import { Customer, SaleInvoice } from '../../types';
import { Users, Search, Plus, UserCheck, DollarSign, Phone, Mail, FileText, CheckCircle2, X } from 'lucide-react';

interface CustomersLedgerProps {
  customers: Customer[];
  invoices: SaleInvoice[];
  onAddCustomer: (customer: Customer) => void;
  onSettleCustomerBalance: (customerId: string, amountPaid: number) => void;
}

export const CustomersLedger: React.FC<CustomersLedgerProps> = ({
  customers,
  invoices,
  onAddCustomer,
  onSettleCustomerBalance,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCust, setSelectedCust] = useState<Customer | null>(null);

  // Settle Modal State
  const [payCust, setPayCust] = useState<Customer | null>(null);
  const [payAmount, setPayAmount] = useState<string>('');

  // Add Customer Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [cName, setCName] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cAddress, setCAddress] = useState('');

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName.trim()) return;
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: cName.trim(),
      phone: cPhone.trim() || 'N/A',
      email: cEmail.trim() || undefined,
      address: cAddress.trim() || undefined,
      totalPurchases: 0,
      outstandingBalance: 0,
      createdDate: new Date().toISOString().split('T')[0]
    };
    onAddCustomer(newCust);
    setCName('');
    setCPhone('');
    setCEmail('');
    setCAddress('');
    setShowAddModal(false);
  };

  const handleSettleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payCust) return;
    const amount = parseFloat(payAmount) || 0;
    if (amount <= 0) return;

    onSettleCustomerBalance(payCust.id, amount);
    setPayCust(null);
    setPayAmount('');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Users className="w-6 h-6 text-emerald-600" />
            <span>Customers & Credit Ledger</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track patient medical purchase history and outstanding credit balances
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Customer Profile</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer name or phone number..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs"
          />
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredCustomers.map((cust) => {
          const custInvoices = invoices.filter(inv => inv.customerId === cust.id || inv.customerName === cust.name);

          return (
            <div key={cust.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">{cust.name}</h4>
                  <p className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                    <Phone className="w-3 h-3" />
                    <span>{cust.phone}</span>
                  </p>
                </div>
                <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Spent</p>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">${cust.totalPurchases.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Credit Balance Due</p>
                  <p className={`font-bold text-sm ${cust.outstandingBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    ${cust.outstandingBalance.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-2 text-xs">
                <button
                  onClick={() => setSelectedCust(cust)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-xl text-center transition-colors cursor-pointer"
                >
                  View Invoices ({custInvoices.length})
                </button>

                {cust.outstandingBalance > 0 && (
                  <button
                    onClick={() => { setPayCust(cust); setPayAmount(cust.outstandingBalance.toString()); }}
                    className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Collect Due
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* View Customer Invoices Modal */}
      {selectedCust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border w-full max-w-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">{selectedCust.name}</h3>
                <p className="text-xs text-slate-500">Purchase History & Invoices Log</p>
              </div>
              <button onClick={() => setSelectedCust(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2 text-xs">
              {invoices.filter(i => i.customerId === selectedCust.id || i.customerName === selectedCust.name).length === 0 ? (
                <p className="text-slate-400 italic text-center py-6">No previous invoices logged for this customer.</p>
              ) : (
                invoices
                  .filter(i => i.customerId === selectedCust.id || i.customerName === selectedCust.name)
                  .map(inv => (
                    <div key={inv.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{inv.invoiceNumber} • {inv.date}</p>
                        <p className="text-[11px] text-slate-500">{inv.items.map(i => i.medicineName).join(', ')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600 text-sm">${inv.grandTotal.toFixed(2)}</p>
                        <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700">
                          {inv.paymentMode}
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Collect Due Payment Modal */}
      {payCust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border w-full max-w-sm space-y-4">
            <h3 className="font-bold text-base">Settle Customer Outstanding Balance</h3>
            <p className="text-xs text-slate-500">Customer: <strong className="text-slate-900 dark:text-white">{payCust.name}</strong></p>
            <form onSubmit={handleSettleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Amount Paid ($):</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={payAmount}
                  onChange={e => setPayAmount(e.target.value)}
                  className="w-full p-2.5 border rounded-xl font-bold text-emerald-600 text-base"
                />
              </div>
              <button type="submit" className="w-full py-2.5 bg-emerald-600 text-white font-bold rounded-xl">
                Update Customer Ledger
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border w-full max-w-md space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base">New Patient / Customer Profile</h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <input type="text" required placeholder="Full Name *" value={cName} onChange={e => setCName(e.target.value)} className="w-full p-2.5 border rounded-xl" />
              <input type="text" placeholder="Phone Number" value={cPhone} onChange={e => setCPhone(e.target.value)} className="w-full p-2.5 border rounded-xl" />
              <input type="email" placeholder="Email Address" value={cEmail} onChange={e => setCEmail(e.target.value)} className="w-full p-2.5 border rounded-xl" />
              <input type="text" placeholder="Home / Clinic Address" value={cAddress} onChange={e => setCAddress(e.target.value)} className="w-full p-2.5 border rounded-xl" />
              <button type="submit" className="w-full py-2.5 bg-emerald-600 text-white font-bold rounded-xl">Save Patient Profile</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
