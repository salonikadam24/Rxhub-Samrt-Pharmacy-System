import React, { useState } from 'react';
import { Supplier, PurchaseOrder, Medicine, PurchaseItem, MedicineCategory } from '../../types';
import { 
  ShoppingBag, 
  Users, 
  Plus, 
  CheckCircle2, 
  DollarSign, 
  Building2, 
  FileText, 
  PackagePlus,
  Trash2,
  X,
  CreditCard
} from 'lucide-react';

interface PurchasesSuppliersProps {
  suppliers: Supplier[];
  purchases: PurchaseOrder[];
  medicines: Medicine[];
  onReceiveStock: (newPO: PurchaseOrder, updatedMeds: Medicine[], updatedSuppliers: Supplier[]) => void;
  onAddSupplier: (supplier: Supplier) => void;
  onSettleSupplierBalance: (supplierId: string, amountPaid: number) => void;
}

export const PurchasesSuppliers: React.FC<PurchasesSuppliersProps> = ({
  suppliers,
  purchases,
  medicines,
  onReceiveStock,
  onAddSupplier,
  onSettleSupplierBalance,
}) => {
  const [activeTab, setActiveTab] = useState<'inward' | 'history' | 'suppliers'>('inward');

  // New Supplier Modal
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [supName, setSupName] = useState('');
  const [supContact, setSupContact] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supGstin, setSupGstin] = useState('');

  // Settle Balance Modal
  const [settleSupplier, setSettleSupplier] = useState<Supplier | null>(null);
  const [payAmount, setPayAmount] = useState<string>('');

  // Inward Purchase Form State
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [poNotes, setPoNotes] = useState('');
  const [poItems, setPoItems] = useState<PurchaseItem[]>([]);

  // Item Form
  const [itemMedName, setItemMedName] = useState('');
  const [itemGeneric, setItemGeneric] = useState('');
  const [itemCategory, setItemCategory] = useState<MedicineCategory>('Tablet');
  const [itemManufacturer, setItemManufacturer] = useState('');
  const [itemBatch, setItemBatch] = useState('');
  const [itemExpiry, setItemExpiry] = useState('2027-12-31');
  const [itemCost, setItemCost] = useState<number>(2.5);
  const [itemSelling, setItemSelling] = useState<number>(5.0);
  const [itemQty, setItemQty] = useState<number>(100);
  const [itemRack, setItemRack] = useState('Rack A1');

  // Handle Select Existing Medicine fill
  const handleSelectExistingMedicine = (medId: string) => {
    const med = medicines.find(m => m.id === medId);
    if (!med) return;
    setItemMedName(med.name);
    setItemGeneric(med.genericName);
    setItemCategory(med.category);
    setItemManufacturer(med.manufacturer);
    setItemCost(med.costPrice);
    setItemSelling(med.sellingPrice);
    setItemRack(med.rackLocation);
    setItemBatch(`BATCH-${Math.floor(100 + Math.random() * 900)}`);
  };

  const handleAddItemToPO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemMedName.trim() || !itemBatch.trim() || itemQty <= 0) {
      alert("Please enter medicine name, batch number and valid quantity.");
      return;
    }

    const newItem: PurchaseItem = {
      medicineName: itemMedName.trim(),
      genericName: itemGeneric.trim() || 'Generic Composition',
      category: itemCategory,
      manufacturer: itemManufacturer.trim() || 'Pharma Vendor',
      batchNumber: itemBatch.trim(),
      expiryDate: itemExpiry,
      costPrice: itemCost,
      sellingPrice: itemSelling,
      quantity: itemQty,
      unit: 'Box / Strip',
      rackLocation: itemRack,
      total: itemCost * itemQty
    };

    setPoItems([...poItems, newItem]);

    // Clear item inputs
    setItemMedName('');
    setItemGeneric('');
    setItemBatch('');
  };

  const handleRemovePOItem = (idx: number) => {
    setPoItems(poItems.filter((_, i) => i !== idx));
  };

  const poTotalAmount = poItems.reduce((acc, item) => acc + item.total, 0);

  // Finalize Inward PO
  const handleFinalizePO = () => {
    if (poItems.length === 0) {
      alert("Please add at least one item to the inward stock purchase list.");
      return;
    }

    const supplier = suppliers.find(s => s.id === selectedSupplierId) || suppliers[0];

    const poNumber = `PO-2026-${Math.floor(100 + Math.random() * 900)}`;
    const todayStr = new Date().toISOString().split('T')[0];

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber,
      date: todayStr,
      supplierId: supplier.id,
      supplierName: supplier.name,
      items: poItems,
      totalAmount: poTotalAmount,
      paymentStatus: 'paid',
      paidAmount: poTotalAmount,
      dueAmount: 0,
      notes: poNotes
    };

    // Auto-update or add new medicines into inventory!
    const updatedMeds = [...medicines];

    poItems.forEach(pItem => {
      const existingIdx = updatedMeds.findIndex(m => m.name.toLowerCase() === pItem.medicineName.toLowerCase());
      if (existingIdx >= 0) {
        // Increase stock and update batch
        updatedMeds[existingIdx] = {
          ...updatedMeds[existingIdx],
          stock: updatedMeds[existingIdx].stock + pItem.quantity,
          batchNumber: pItem.batchNumber,
          costPrice: pItem.costPrice,
          sellingPrice: pItem.sellingPrice,
          expiryDate: pItem.expiryDate,
          rackLocation: pItem.rackLocation
        };
      } else {
        // Add new medicine to directory
        updatedMeds.push({
          id: `med-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: pItem.medicineName,
          genericName: pItem.genericName,
          category: pItem.category,
          manufacturer: pItem.manufacturer,
          batchNumber: pItem.batchNumber,
          stock: pItem.quantity,
          reorderLevel: 20,
          costPrice: pItem.costPrice,
          sellingPrice: pItem.sellingPrice,
          expiryDate: pItem.expiryDate,
          rackLocation: pItem.rackLocation,
          prescriptionRequired: false,
          unit: pItem.unit,
          gstPercent: 12
        });
      }
    });

    onReceiveStock(newPO, updatedMeds, suppliers);
    setPoItems([]);
    setPoNotes('');
    alert(`Stock Inward #${poNumber} received successfully! Inventory updated.`);
    setActiveTab('history');
  };

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName.trim()) return;
    const newSup: Supplier = {
      id: `sup-${Date.now()}`,
      name: supName.trim(),
      contactPerson: supContact.trim() || 'Manager',
      phone: supPhone.trim() || 'N/A',
      gstin: supGstin.trim() || undefined,
      balanceOwed: 0
    };
    onAddSupplier(newSup);
    setSupName('');
    setSupContact('');
    setSupPhone('');
    setSupGstin('');
    setShowSupplierModal(false);
  };

  const handleSettleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settleSupplier) return;
    const amount = parseFloat(payAmount) || 0;
    if (amount <= 0) return;

    onSettleSupplierBalance(settleSupplier.id, amount);
    setSettleSupplier(null);
    setPayAmount('');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <ShoppingBag className="w-6 h-6 text-emerald-600" />
            <span>Purchases & Vendor Management</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Receive inward stock, update inventory & manage supplier ledgers</p>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('inward')}
            className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'inward' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            + Receive Stock In
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'history' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            PO History
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'suppliers' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Suppliers ({suppliers.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Receive Stock Inward Form */}
      {activeTab === 'inward' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Add Item Panel (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
              <PackagePlus className="w-4 h-4 text-emerald-600" />
              <span>Inward Stock Entry</span>
            </h3>

            {/* Quick Fill Existing Medicine */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Select Existing Medicine to Refill:</label>
              <select
                onChange={(e) => handleSelectExistingMedicine(e.target.value)}
                className="w-full p-2 bg-white dark:bg-slate-900 border rounded-lg text-xs"
              >
                <option value="">-- Or enter new brand details below --</option>
                {medicines.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.genericName})</option>
                ))}
              </select>
            </div>

            <form onSubmit={handleAddItemToPO} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Medicine Name *</label>
                  <input
                    type="text"
                    required
                    value={itemMedName}
                    onChange={(e) => setItemMedName(e.target.value)}
                    placeholder="e.g. Paracetamol 500"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Generic Formula</label>
                  <input
                    type="text"
                    value={itemGeneric}
                    onChange={(e) => setItemGeneric(e.target.value)}
                    placeholder="e.g. Paracetamol"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Batch Number *</label>
                  <input
                    type="text"
                    required
                    value={itemBatch}
                    onChange={(e) => setItemBatch(e.target.value)}
                    placeholder="e.g. BATCH-881"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={itemExpiry}
                    onChange={(e) => setItemExpiry(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Unit Cost Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={itemCost}
                    onChange={(e) => setItemCost(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Unit Selling Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={itemSelling}
                    onChange={(e) => setItemSelling(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg font-mono text-emerald-600 font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Quantity Received *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={itemQty}
                    onChange={(e) => setItemQty(parseInt(e.target.value) || 1)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Rack / Storage Bin</label>
                  <input
                    type="text"
                    value={itemRack}
                    onChange={(e) => setItemRack(e.target.value)}
                    placeholder="Rack A1"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item to Purchase Invoice</span>
              </button>
            </form>
          </div>

          {/* PO Invoice Summary Panel (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Purchase Order Summary</h3>

              <div className="space-y-2 text-xs">
                <label className="font-semibold block text-slate-700 dark:text-slate-300">Supplier Vendor:</label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-semibold"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.contactPerson})</option>
                  ))}
                </select>
              </div>

              {/* Added Items List */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1 pt-2">
                {poItems.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-8">No items added to inward invoice yet.</p>
                ) : (
                  poItems.map((pi, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{pi.medicineName}</p>
                        <p className="text-[10px] text-slate-500 font-mono">Batch: {pi.batchNumber} • Exp: {pi.expiryDate}</p>
                        <p className="text-[11px] text-emerald-600 font-semibold">${pi.costPrice.toFixed(2)} x {pi.quantity} = ${pi.total.toFixed(2)}</p>
                      </div>
                      <button onClick={() => handleRemovePOItem(idx)} className="text-rose-500 hover:text-rose-700 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between items-center font-bold text-sm">
                <span>Total PO Amount:</span>
                <span className="text-emerald-600 font-mono">${poTotalAmount.toFixed(2)}</span>
              </div>

              <button
                onClick={handleFinalizePO}
                disabled={poItems.length === 0}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold rounded-xl shadow-md cursor-pointer"
              >
                Receive Stock & Update Inventory
              </button>
            </div>

          </div>

        </div>
      )}

      {/* Tab 2: Purchase Order History */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Inward Purchase Logs</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b">
                  <th className="py-3 px-4">PO Number</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Supplier Vendor</th>
                  <th className="py-3 px-3 text-center">Items Received</th>
                  <th className="py-3 px-3 text-right">Total Cost</th>
                  <th className="py-3 px-4 text-center">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {purchases.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">{po.poNumber}</td>
                    <td className="py-3 px-3 text-slate-500">{po.date}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">{po.supplierName}</td>
                    <td className="py-3 px-3 text-center font-bold">{po.items.length} Products</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600">${po.totalAmount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 uppercase">
                        {po.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Suppliers Directory */}
      {activeTab === 'suppliers' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowSupplierModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Supplier</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {suppliers.map((sup) => (
              <div key={sup.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-base text-slate-900 dark:text-white">{sup.name}</h4>
                    <p className="text-xs text-slate-500">{sup.contactPerson}</p>
                  </div>
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>

                <div className="text-xs space-y-1 text-slate-600 dark:text-slate-400">
                  <p>Phone: <span className="font-semibold text-slate-800 dark:text-slate-200">{sup.phone}</span></p>
                  {sup.gstin && <p>GSTIN: <span className="font-mono">{sup.gstin}</span></p>}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400">Balance Owed:</p>
                    <p className={`font-bold font-mono text-sm ${sup.balanceOwed > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      ${sup.balanceOwed.toFixed(2)}
                    </p>
                  </div>

                  {sup.balanceOwed > 0 && (
                    <button
                      onClick={() => { setSettleSupplier(sup); setPayAmount(sup.balanceOwed.toString()); }}
                      className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Settle Payment
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border w-full max-w-md space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base">Register Vendor / Supplier</h3>
              <button onClick={() => setShowSupplierModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateSupplier} className="space-y-3 text-xs">
              <input type="text" required placeholder="Supplier Company Name *" value={supName} onChange={e => setSupName(e.target.value)} className="w-full p-2.5 border rounded-xl" />
              <input type="text" placeholder="Contact Person Name" value={supContact} onChange={e => setSupContact(e.target.value)} className="w-full p-2.5 border rounded-xl" />
              <input type="text" placeholder="Phone Number" value={supPhone} onChange={e => setSupPhone(e.target.value)} className="w-full p-2.5 border rounded-xl" />
              <input type="text" placeholder="GSTIN / Tax ID" value={supGstin} onChange={e => setSupGstin(e.target.value)} className="w-full p-2.5 border rounded-xl" />
              <button type="submit" className="w-full py-2.5 bg-emerald-600 text-white font-bold rounded-xl">Save Supplier</button>
            </form>
          </div>
        </div>
      )}

      {/* Settle Balance Modal */}
      {settleSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border w-full max-w-sm space-y-4">
            <h3 className="font-bold text-base">Pay Supplier Owed Balance</h3>
            <p className="text-xs text-slate-500">Paying balance owed to {settleSupplier.name}</p>
            <form onSubmit={handleSettleSubmit} className="space-y-3 text-xs">
              <input type="number" step="0.01" required value={payAmount} onChange={e => setPayAmount(e.target.value)} className="w-full p-2.5 border rounded-xl font-bold text-emerald-600" />
              <button type="submit" className="w-full py-2.5 bg-emerald-600 text-white font-bold rounded-xl">Record Payment</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
