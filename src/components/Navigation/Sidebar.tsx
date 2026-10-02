import React from 'react';
import { 
  LayoutDashboard, 
  ReceiptText, 
  Pill, 
  ShoppingBag, 
  Users, 
  AlertTriangle, 
  BarChart3, 
  Sparkles,
  Settings
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  lowStockCount: number;
  expiringCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  lowStockCount,
  expiringCount,
}) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'pos',
      label: 'POS Billing',
      icon: ReceiptText,
      badge: 'Fast',
      badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      id: 'inventory',
      label: 'Medicine Inventory',
      icon: Pill,
      badge: lowStockCount > 0 ? lowStockCount : null,
      badgeClass: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    },
    {
      id: 'purchases',
      label: 'Purchases & Stock In',
      icon: ShoppingBag,
      badge: null,
    },
    {
      id: 'customers',
      label: 'Customers & Ledger',
      icon: Users,
      badge: null,
    },
    {
      id: 'expiry',
      label: 'Expiry & Waste',
      icon: AlertTriangle,
      badge: expiringCount > 0 ? expiringCount : null,
      badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    },
    {
      id: 'reports',
      label: 'P&L Reports',
      icon: BarChart3,
      badge: null,
    },
  ];

  return (
    <aside className="w-full md:w-64 p-3 md:p-4 shrink-0">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex flex-col justify-between h-full space-y-6">
        <div className="space-y-2">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Navigation Grid
          </div>

          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-950/60'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && (
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${item.badgeClass || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Info Card */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 hidden md:block space-y-2">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-[11px] space-y-1 text-slate-500 dark:text-slate-400">
            <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
              <span>RxHub Sync Status</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </p>
            <p className="text-[10px] text-slate-400">Database encrypted & auto-synced locally.</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
