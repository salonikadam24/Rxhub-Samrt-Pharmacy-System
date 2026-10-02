import React, { useState } from 'react';
import { PharmacyStoreInfo, Medicine } from '../../types';
import { Pill, AlertTriangle, Sparkles, Search, RotateCcw, Settings, Building2, Bell, X } from 'lucide-react';
import { getExpiryStatus } from '../../utils/storage';

interface HeaderProps {
  storeInfo: PharmacyStoreInfo;
  medicines: Medicine[];
  onOpenScanner: () => void;
  onOpenSettings: () => void;
  onSelectTab: (tab: string) => void;
  onQuickSearchSelect: (med: Medicine) => void;
}

export const Header: React.FC<HeaderProps> = ({
  storeInfo,
  medicines,
  onOpenScanner,
  onOpenSettings,
  onSelectTab,
  onQuickSearchSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Compute alert counts
  const lowStockCount = medicines.filter(m => m.stock <= m.reorderLevel).length;
  const expiringCount = medicines.filter(m => {
    const status = getExpiryStatus(m.expiryDate);
    return status.level === 'expired' || status.level === 'critical' || status.level === 'warning';
  }).length;

  const searchResults = searchQuery.trim().length > 0
    ? medicines.filter(m => 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        m.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.batchNumber.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  return (
    <header className="sticky top-0 z-30 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-sm text-slate-900 dark:text-white">
        
        {/* Brand & Store Info */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-lg shadow-lg shadow-indigo-200 dark:shadow-indigo-950/50 shrink-0">
            Rx
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-base tracking-tight text-slate-900 dark:text-white flex items-center space-x-2">
              <span>{storeInfo.name}</span>
              <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                PRO
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center space-x-1 font-medium">
              <Building2 className="w-3 h-3 text-indigo-500" />
              <span>DL No: {storeInfo.dlNumber}</span>
            </p>
          </div>
        </div>

        {/* Global Quick Medicine Search */}
        <div className="relative flex-1 max-w-md">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              placeholder="Search medicine, generic formula, batch..."
              className="w-full pl-9 pr-8 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-full text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setShowSearchDropdown(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          {showSearchDropdown && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-slate-100 dark:divide-slate-700/60">
              {searchResults.map(med => {
                const exp = getExpiryStatus(med.expiryDate);
                return (
                  <div
                    key={med.id}
                    onClick={() => {
                      onQuickSearchSelect(med);
                      setShowSearchDropdown(false);
                      setSearchQuery('');
                    }}
                    className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/80 cursor-pointer flex justify-between items-center transition-colors text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{med.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{med.genericName} • Rack: {med.rackLocation}</p>
                    </div>
                    <div className="text-right space-y-0.5">
                      <p className="font-bold text-indigo-600 dark:text-indigo-400">${med.sellingPrice.toFixed(2)}</p>
                      <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded border ${exp.badgeClass}`}>
                        Stock: {med.stock}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Controls & Alerts */}
        <div className="flex items-center space-x-2 sm:space-x-2.5">
          
          {/* Smart AI Scanner Trigger */}
          <button
            onClick={onOpenScanner}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 dark:shadow-indigo-950/50 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-200 animate-pulse" />
            <span className="hidden md:inline">Rx AI Scanner</span>
          </button>

          {/* Expiry / Low Stock Alert Pills */}
          <button
            onClick={() => onSelectTab('expiry')}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
              expiringCount > 0
                ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
                : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
            }`}
            title="View Expiry Alerts"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="font-extrabold">{expiringCount}</span>
            <span className="hidden lg:inline text-[10px] uppercase tracking-wider">Expiring</span>
          </button>

          <button
            onClick={() => onSelectTab('inventory')}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
              lowStockCount > 0
                ? 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800'
                : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
            }`}
            title="View Low Stock Items"
          >
            <Pill className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span className="font-extrabold">{lowStockCount}</span>
            <span className="hidden lg:inline text-[10px] uppercase tracking-wider">Low Stock</span>
          </button>

          {/* Store Settings Modal Trigger */}
          <button
            onClick={onOpenSettings}
            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
            title="Store Settings & Data Backup"
          >
            <Settings className="w-4 h-4" />
          </button>

        </div>

      </div>
    </header>
  );
};
