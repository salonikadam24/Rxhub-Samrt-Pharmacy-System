import { Medicine, Customer, Supplier, SaleInvoice, PurchaseOrder, ExpiryActionLog, PharmacyStoreInfo } from '../types';
import { initialMedicines, initialCustomers, initialSuppliers, initialInvoices, initialPurchaseOrders, initialExpiryLogs, initialStoreInfo } from '../data/mockData';

const STORAGE_KEYS = {
  MEDICINES: 'rxhub_medicines_v1',
  CUSTOMERS: 'rxhub_customers_v1',
  SUPPLIERS: 'rxhub_suppliers_v1',
  INVOICES: 'rxhub_invoices_v1',
  PURCHASES: 'rxhub_purchases_v1',
  EXPIRY_LOGS: 'rxhub_expirylogs_v1',
  STORE_INFO: 'rxhub_storeinfo_v1',
};

export const loadStoredData = () => {
  try {
    const medicines = localStorage.getItem(STORAGE_KEYS.MEDICINES);
    const customers = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    const suppliers = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
    const invoices = localStorage.getItem(STORAGE_KEYS.INVOICES);
    const purchases = localStorage.getItem(STORAGE_KEYS.PURCHASES);
    const expiryLogs = localStorage.getItem(STORAGE_KEYS.EXPIRY_LOGS);
    const storeInfo = localStorage.getItem(STORAGE_KEYS.STORE_INFO);

    return {
      medicines: medicines ? JSON.parse(medicines) : initialMedicines,
      customers: customers ? JSON.parse(customers) : initialCustomers,
      suppliers: suppliers ? JSON.parse(suppliers) : initialSuppliers,
      invoices: invoices ? JSON.parse(invoices) : initialInvoices,
      purchases: purchases ? JSON.parse(purchases) : initialPurchaseOrders,
      expiryLogs: expiryLogs ? JSON.parse(expiryLogs) : initialExpiryLogs,
      storeInfo: storeInfo ? JSON.parse(storeInfo) : initialStoreInfo,
    };
  } catch (error) {
    console.error("Failed to load RxHub data from localStorage:", error);
    return {
      medicines: initialMedicines,
      customers: initialCustomers,
      suppliers: initialSuppliers,
      invoices: initialInvoices,
      purchases: initialPurchaseOrders,
      expiryLogs: initialExpiryLogs,
      storeInfo: initialStoreInfo,
    };
  }
};

export const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage`, e);
  }
};

export const resetAllDataToDefault = () => {
  localStorage.removeItem(STORAGE_KEYS.MEDICINES);
  localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
  localStorage.removeItem(STORAGE_KEYS.SUPPLIERS);
  localStorage.removeItem(STORAGE_KEYS.INVOICES);
  localStorage.removeItem(STORAGE_KEYS.PURCHASES);
  localStorage.removeItem(STORAGE_KEYS.EXPIRY_LOGS);
  localStorage.removeItem(STORAGE_KEYS.STORE_INFO);
  return {
    medicines: initialMedicines,
    customers: initialCustomers,
    suppliers: initialSuppliers,
    invoices: initialInvoices,
    purchases: initialPurchaseOrders,
    expiryLogs: initialExpiryLogs,
    storeInfo: initialStoreInfo,
  };
};

export { STORAGE_KEYS };

// Date Utility Helpers
export const getDaysDifferenceFromToday = (targetDateStr: string): number => {
  if (!targetDateStr) return 999;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDateStr);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getExpiryStatus = (expiryDateStr: string) => {
  const days = getDaysDifferenceFromToday(expiryDateStr);
  if (days < 0) {
    return { level: 'expired', label: 'Expired', badgeClass: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' };
  } else if (days <= 30) {
    return { level: 'critical', label: `Expires in ${days}d`, badgeClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' };
  } else if (days <= 90) {
    return { level: 'warning', label: `Expires in ${days}d`, badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
  } else {
    return { level: 'healthy', label: `Valid (${days}d)`, badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
  }
};
