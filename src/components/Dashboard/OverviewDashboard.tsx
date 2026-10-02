import React from 'react';
import { Medicine, SaleInvoice, PharmacyStoreInfo } from '../../types';
import { getExpiryStatus } from '../../utils/storage';
import { 
  DollarSign, 
  ReceiptText, 
  Pill, 
  AlertTriangle, 
  TrendingUp, 
  ArrowUpRight, 
  Plus, 
  Eye, 
  Sparkles,
  ShoppingBag,
  Clock,
  ShieldAlert
} from 'lucide-react';

interface OverviewDashboardProps {
  medicines: Medicine[];
  invoices: SaleInvoice[];
  storeInfo: PharmacyStoreInfo;
  onNavigateTab: (tab: string) => void;
  onViewInvoice: (invoice: SaleInvoice) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  medicines,
  invoices,
  storeInfo,
  onNavigateTab,
  onViewInvoice,
}) => {

  // Calculate Metrics
  const todayDateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const todayInvoices = invoices.filter(inv => inv.date.startsWith(todayDateStr) || inv.date.startsWith('2026-08-01'));
  const todayRevenue = todayInvoices.reduce((acc, inv) => acc + inv.grandTotal, 0);

  const totalMonthlySales = invoices.reduce((acc, inv) => acc + inv.grandTotal, 0);
  
  const lowStockItems = medicines.filter(m => m.stock <= m.reorderLevel);
  const outOfStockItems = medicines.filter(m => m.stock === 0);

  const expiringItems = medicines.filter(m => {
    const status = getExpiryStatus(m.expiryDate);
    return status.level === 'expired' || status.level === 'critical' || status.level === 'warning';
  });

  const expiredCount = medicines.filter(m => getExpiryStatus(m.expiryDate).level === 'expired').length;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Welcome Banner / Hero Bento Card */}
      <div className="bg-indigo-600 rounded-3xl p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg shadow-indigo-200 dark:shadow-indigo-950/50">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 bg-white/20 text-white rounded-full text-[10px] font-bold uppercase tracking-widest">
              RxHub Store Manager
            </span>
            <span className="text-indigo-200 text-xs font-medium">• Live Counter Operational</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">{storeInfo.name}</h2>
          <p className="text-xs text-indigo-100 max-w-xl">Manage medicine stock, instant POS billing, expiry dates & profit/loss tracking with Bento precision.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigateTab('pos')}
            className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-extrabold rounded-2xl text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <ReceiptText className="w-4 h-4" />
            <span>New Bill (POS)</span>
          </button>
          <button
            onClick={() => onNavigateTab('purchases')}
            className="flex items-center space-x-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-xs border border-white/20 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-indigo-200" />
            <span>Receive Stock In</span>
          </button>
        </div>
      </div>

      {/* High Priority Alerts (Bento Card Style) */}
      {(expiredCount > 0 || outOfStockItems.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {expiredCount > 0 && (
            <div className="p-5 bg-rose-50 border border-rose-100 dark:bg-rose-950/40 dark:border-rose-900/40 rounded-3xl flex items-center justify-between text-xs shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-rose-200 text-rose-800 dark:bg-rose-900 dark:text-rose-200 rounded-2xl">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-rose-900 dark:text-rose-200">{expiredCount} Medicine Batches Expired</p>
                  <p className="text-rose-700/80 dark:text-rose-400 text-[11px]">Needs immediate removal or return to supplier.</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('expiry')}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-[11px] shadow-sm transition-colors cursor-pointer"
              >
                Clear Stock
              </button>
            </div>
          )}

          {outOfStockItems.length > 0 && (
            <div className="p-5 bg-amber-50 border border-amber-100 dark:bg-amber-950/40 dark:border-amber-900/40 rounded-3xl flex items-center justify-between text-xs shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-200 rounded-2xl">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-amber-900 dark:text-amber-200">{outOfStockItems.length} Medicines Out of Stock</p>
                  <p className="text-amber-700/80 dark:text-amber-400 text-[11px]">Reorder from supplier to avoid customer loss.</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('purchases')}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-[11px] shadow-sm transition-colors cursor-pointer"
              >
                Order Stock
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bento Grid Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Today's Revenue */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Today's Sales</span>
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-2xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">${todayRevenue.toFixed(2)}</h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center mt-1">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              <span>{todayInvoices.length} Bills Generated Today</span>
            </p>
          </div>
        </div>

        {/* Metric 2: Total Inventory Medicines */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Active Inventory</span>
            <div className="p-2 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 rounded-2xl">
              <Pill className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{medicines.length} Products</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
              {medicines.reduce((acc, m) => acc + m.stock, 0)} Total Stock Units
            </p>
          </div>
        </div>

        {/* Metric 3: Low Stock Alerts */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Low Stock Warning</span>
            <div className="p-2 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 rounded-2xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{lowStockItems.length} Items</h3>
            <p className="text-xs text-rose-600 dark:text-rose-400 font-bold mt-1">Below Reorder Threshold</p>
          </div>
        </div>

        {/* Metric 4: Expiring Stock */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Expiry Watchlist</span>
            <div className="p-2 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 rounded-2xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{expiringItems.length} Batches</h3>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-bold mt-1">Expiring within 90 days</p>
          </div>
        </div>

      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Recent Invoices */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Recent Sales Invoices</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Live counter transactions and receipt log</p>
            </div>
            <button
              onClick={() => onNavigateTab('reports')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <span>View All Reports</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
                  <th className="py-2.5 px-3">Invoice #</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Mode</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {invoices.slice(0, 6).map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">{inv.invoiceNumber}</td>
                    <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">{inv.customerName}</td>
                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400 text-[11px]">{inv.date}</td>
                    <td className="py-3 px-3">
                      <span className="uppercase text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {inv.paymentMode}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-indigo-600 dark:text-indigo-400">
                      ${inv.grandTotal.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onViewInvoice(inv)}
                        className="p-1.5 bg-slate-100 hover:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-indigo-950 text-slate-600 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-300 rounded-xl transition-colors cursor-pointer"
                        title="View Receipt"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Low Stock & Expiry Watchlist Sidebar */}
        <div className="space-y-6">
          
          {/* Low Stock Items Box */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Reorder Attention Required</span>
              </h3>
              <button
                onClick={() => onNavigateTab('inventory')}
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Inventory
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {lowStockItems.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">All stock levels healthy!</p>
              ) : (
                lowStockItems.map(m => (
                  <div key={m.id} className="p-3 bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 rounded-2xl flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{m.name}</p>
                      <p className="text-[10px] text-slate-500">Rack: {m.rackLocation}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-rose-600 dark:text-rose-400">{m.stock} left</span>
                      <p className="text-[10px] text-slate-400">Reorder at {m.reorderLevel}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Category Bento Card */}
          <div className="bg-indigo-50 border border-indigo-100 dark:bg-indigo-950/30 dark:border-indigo-900/40 p-5 rounded-3xl shadow-sm space-y-3">
            <h3 className="font-bold text-indigo-950 dark:text-indigo-200 text-sm">Category Stock Distribution</h3>
            <div className="space-y-2 text-xs">
              {['Tablet', 'Syrup', 'Injection', 'Ointment / Cream', 'Supplies / Medical Devices'].map((cat, i) => {
                const catMeds = medicines.filter(m => m.category === cat);
                const count = catMeds.reduce((acc, m) => acc + m.stock, 0);
                return (
                  <div key={i} className="flex justify-between items-center py-1.5 border-b border-indigo-200/50 dark:border-indigo-900/40 text-indigo-900 dark:text-indigo-300">
                    <span className="font-medium">{cat}</span>
                    <span className="font-bold font-mono bg-white dark:bg-indigo-900/80 px-2 py-0.5 rounded-full text-[10px] shadow-xs">
                      {count} units
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
