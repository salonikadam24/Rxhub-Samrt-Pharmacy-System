/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Medicine, 
  Customer, 
  Supplier, 
  SaleInvoice, 
  PurchaseOrder, 
  ExpiryActionLog, 
  PharmacyStoreInfo, 
  BillItem 
} from './types';
import { 
  loadStoredData, 
  saveToStorage, 
  STORAGE_KEYS, 
  resetAllDataToDefault 
} from './utils/storage';

import { Header } from './components/Navigation/Header';
import { Sidebar } from './components/Navigation/Sidebar';

import { OverviewDashboard } from './components/Dashboard/OverviewDashboard';
import { BillingPOS } from './components/POS/BillingPOS';
import { MedicineInventory } from './components/Inventory/MedicineInventory';
import { PurchasesSuppliers } from './components/Purchases/PurchasesSuppliers';
import { CustomersLedger } from './components/Customers/CustomersLedger';
import { ExpiryTracker } from './components/Expiry/ExpiryTracker';
import { ReportsAnalytics } from './components/Reports/ReportsAnalytics';

import { InvoiceModal } from './components/POS/InvoiceModal';
import { PrescriptionScannerModal } from './components/AIAssist/PrescriptionScannerModal';
import { StoreSettingsModal } from './components/Settings/StoreSettingsModal';

export default function App() {
  // Load Initial Stored State
  const initialData = loadStoredData();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  const [storeInfo, setStoreInfo] = useState<PharmacyStoreInfo>(initialData.storeInfo);
  const [medicines, setMedicines] = useState<Medicine[]>(initialData.medicines);
  const [customers, setCustomers] = useState<Customer[]>(initialData.customers);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialData.suppliers);
  const [invoices, setInvoices] = useState<SaleInvoice[]>(initialData.invoices);
  const [purchases, setPurchases] = useState<PurchaseOrder[]>(initialData.purchases);
  const [expiryLogs, setExpiryLogs] = useState<ExpiryActionLog[]>(initialData.expiryLogs);

  // Modals & Triggers
  const [activeInvoiceForModal, setActiveInvoiceForModal] = useState<SaleInvoice | null>(null);
  const [showScannerModal, setShowScannerModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  
  // Scanner items passed to POS
  const [pushedCartItems, setPushedCartItems] = useState<BillItem[]>([]);

  // Keyboard shortcut listener (Ctrl + B for POS)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setActiveTab('pos');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Save changes to localStorage
  const updateMedicines = (newMeds: Medicine[]) => {
    setMedicines(newMeds);
    saveToStorage(STORAGE_KEYS.MEDICINES, newMeds);
  };

  const updateCustomers = (newCusts: Customer[]) => {
    setCustomers(newCusts);
    saveToStorage(STORAGE_KEYS.CUSTOMERS, newCusts);
  };

  const updateSuppliers = (newSups: Supplier[]) => {
    setSuppliers(newSups);
    saveToStorage(STORAGE_KEYS.SUPPLIERS, newSups);
  };

  const updateInvoices = (newInvs: SaleInvoice[]) => {
    setInvoices(newInvs);
    saveToStorage(STORAGE_KEYS.INVOICES, newInvs);
  };

  const updatePurchases = (newPO: PurchaseOrder[]) => {
    setPurchases(newPO);
    saveToStorage(STORAGE_KEYS.PURCHASES, newPO);
  };

  const updateExpiryLogs = (newLogs: ExpiryActionLog[]) => {
    setExpiryLogs(newLogs);
    saveToStorage(STORAGE_KEYS.EXPIRY_LOGS, newLogs);
  };

  const updateStoreInfo = (newInfo: PharmacyStoreInfo) => {
    setStoreInfo(newInfo);
    saveToStorage(STORAGE_KEYS.STORE_INFO, newInfo);
  };

  // Actions
  const handleCompleteSale = (
    invoice: SaleInvoice, 
    updatedMeds: Medicine[], 
    updatedCusts: Customer[]
  ) => {
    const newInvoices = [invoice, ...invoices];
    updateInvoices(newInvoices);
    updateMedicines(updatedMeds);
    updateCustomers(updatedCusts);
    setActiveInvoiceForModal(invoice);
  };

  const handleSaveMedicine = (med: Medicine) => {
    const idx = medicines.findIndex(m => m.id === med.id);
    let updated: Medicine[];
    if (idx >= 0) {
      updated = [...medicines];
      updated[idx] = med;
    } else {
      updated = [med, ...medicines];
    }
    updateMedicines(updated);
  };

  const handleDeleteMedicine = (id: string) => {
    updateMedicines(medicines.filter(m => m.id !== id));
  };

  const handleReceiveStock = (
    newPO: PurchaseOrder, 
    updatedMeds: Medicine[], 
    updatedSups: Supplier[]
  ) => {
    updatePurchases([newPO, ...purchases]);
    updateMedicines(updatedMeds);
    updateSuppliers(updatedSups);
  };

  const handleAddSupplier = (sup: Supplier) => {
    updateSuppliers([...suppliers, sup]);
  };

  const handleSettleSupplierBalance = (supplierId: string, amountPaid: number) => {
    const updated = suppliers.map(s => {
      if (s.id === supplierId) {
        return { ...s, balanceOwed: Math.max(0, s.balanceOwed - amountPaid) };
      }
      return s;
    });
    updateSuppliers(updated);
  };

  const handleAddCustomer = (cust: Customer) => {
    updateCustomers([...customers, cust]);
  };

  const handleSettleCustomerBalance = (customerId: string, amountPaid: number) => {
    const updated = customers.map(c => {
      if (c.id === customerId) {
        return { ...c, outstandingBalance: Math.max(0, c.outstandingBalance - amountPaid) };
      }
      return c;
    });
    updateCustomers(updated);
  };

  const handleLogExpiryAction = (updatedMed: Medicine, actionLog: ExpiryActionLog) => {
    handleSaveMedicine(updatedMed);
    updateExpiryLogs([actionLog, ...expiryLogs]);
  };

  const handleResetData = () => {
    const defaultData = resetAllDataToDefault();
    setMedicines(defaultData.medicines);
    setCustomers(defaultData.customers);
    setSuppliers(defaultData.suppliers);
    setInvoices(defaultData.invoices);
    setPurchases(defaultData.purchases);
    setExpiryLogs(defaultData.expiryLogs);
    setStoreInfo(defaultData.storeInfo);
  };

  const handleScannerAddCart = (items: BillItem[]) => {
    setPushedCartItems(items);
    setActiveTab('pos');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Top Application Header */}
      <Header
        storeInfo={storeInfo}
        medicines={medicines}
        onOpenScanner={() => setShowScannerModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onSelectTab={(tab) => setActiveTab(tab)}
        onQuickSearchSelect={(med) => {
          setActiveTab('inventory');
        }}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          lowStockCount={medicines.filter(m => m.stock <= m.reorderLevel).length}
          expiringCount={medicines.filter(m => new Date(m.expiryDate) <= new Date(Date.now() + 90 * 86400000)).length}
        />

        {/* Content View Routing */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <OverviewDashboard
              medicines={medicines}
              invoices={invoices}
              storeInfo={storeInfo}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onViewInvoice={(inv) => setActiveInvoiceForModal(inv)}
            />
          )}

          {activeTab === 'pos' && (
            <BillingPOS
              medicines={medicines}
              customers={customers}
              storeInfo={storeInfo}
              onCompleteSale={handleCompleteSale}
              onOpenScanner={() => setShowScannerModal(true)}
              onAddCustomer={handleAddCustomer}
              externalCartItems={pushedCartItems}
              onClearExternalCart={() => setPushedCartItems([])}
            />
          )}

          {activeTab === 'inventory' && (
            <MedicineInventory
              medicines={medicines}
              onSaveMedicine={handleSaveMedicine}
              onDeleteMedicine={handleDeleteMedicine}
            />
          )}

          {activeTab === 'purchases' && (
            <PurchasesSuppliers
              suppliers={suppliers}
              purchases={purchases}
              medicines={medicines}
              onReceiveStock={handleReceiveStock}
              onAddSupplier={handleAddSupplier}
              onSettleSupplierBalance={handleSettleSupplierBalance}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersLedger
              customers={customers}
              invoices={invoices}
              onAddCustomer={handleAddCustomer}
              onSettleCustomerBalance={handleSettleCustomerBalance}
            />
          )}

          {activeTab === 'expiry' && (
            <ExpiryTracker
              medicines={medicines}
              suppliers={suppliers}
              expiryLogs={expiryLogs}
              onLogExpiryAction={handleLogExpiryAction}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsAnalytics
              invoices={invoices}
              medicines={medicines}
              expiryLogs={expiryLogs}
            />
          )}
        </main>

      </div>

      {/* Printable Receipt Invoice Modal */}
      {activeInvoiceForModal && (
        <InvoiceModal
          invoice={activeInvoiceForModal}
          storeInfo={storeInfo}
          onClose={() => setActiveInvoiceForModal(null)}
        />
      )}

      {/* AI Prescription Scanner Modal */}
      {showScannerModal && (
        <PrescriptionScannerModal
          medicines={medicines}
          onAddToCart={handleScannerAddCart}
          onClose={() => setShowScannerModal(false)}
        />
      )}

      {/* Store Settings & Backup Modal */}
      {showSettingsModal && (
        <StoreSettingsModal
          storeInfo={storeInfo}
          onSaveStoreInfo={updateStoreInfo}
          onResetData={handleResetData}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

    </div>
  );
}
