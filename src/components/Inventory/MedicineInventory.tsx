import React, { useState } from 'react';
import { Medicine, MedicineCategory } from '../../types';
import { getExpiryStatus } from '../../utils/storage';
import { 
  Pill, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Barcode, 
  AlertTriangle, 
  Filter, 
  X, 
  Check, 
  Printer, 
  PackageCheck,
  ShieldCheck,
  Building2
} from 'lucide-react';

interface MedicineInventoryProps {
  medicines: Medicine[];
  onSaveMedicine: (medicine: Medicine) => void;
  onDeleteMedicine: (id: string) => void;
}

export const MedicineInventory: React.FC<MedicineInventoryProps> = ({
  medicines,
  onSaveMedicine,
  onDeleteMedicine,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [expiryFilter, setExpiryFilter] = useState<'all' | 'expired' | 'critical' | 'warning'>('all');

  // Modal State
  const [editingMed, setEditingMed] = useState<Medicine | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [barcodeMed, setBarcodeMed] = useState<Medicine | null>(null);

  // Form State
  const initialFormState: Partial<Medicine> = {
    name: '',
    genericName: '',
    category: 'Tablet',
    manufacturer: '',
    batchNumber: '',
    stock: 50,
    reorderLevel: 15,
    costPrice: 2.0,
    sellingPrice: 4.0,
    expiryDate: '2027-12-31',
    rackLocation: 'Rack A1-S1',
    prescriptionRequired: false,
    unit: 'Strip of 10',
    barcode: '',
    gstPercent: 12
  };

  const [formData, setFormData] = useState<Partial<Medicine>>(initialFormState);

  const categories = [
    'All',
    'Tablet',
    'Capsule',
    'Syrup',
    'Injection',
    'Ointment / Cream',
    'Drops',
    'Inhaler',
    'Supplies / Medical Devices',
    'Ayurvedic / Herbal'
  ];

  // Filtering
  const filteredMedicines = medicines.filter(m => {
    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
    
    const matchesSearch = searchQuery === '' || 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.rackLocation.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesStock = true;
    if (stockFilter === 'low') matchesStock = m.stock <= m.reorderLevel;
    if (stockFilter === 'out') matchesStock = m.stock === 0;

    let matchesExpiry = true;
    const expStatus = getExpiryStatus(m.expiryDate).level;
    if (expiryFilter === 'expired') matchesExpiry = expStatus === 'expired';
    if (expiryFilter === 'critical') matchesExpiry = expStatus === 'critical';
    if (expiryFilter === 'warning') matchesExpiry = expStatus === 'warning';

    return matchesCategory && matchesSearch && matchesStock && matchesExpiry;
  });

  const handleOpenAddModal = () => {
    setEditingMed(null);
    setFormData({
      ...initialFormState,
      batchNumber: `BATCH-${Math.floor(100 + Math.random() * 900)}`,
      barcode: `890123${Math.floor(100000 + Math.random() * 900000)}`
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (med: Medicine) => {
    setEditingMed(med);
    setFormData({ ...med });
    setIsModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.batchNumber) {
      alert("Please fill in Medicine Name and Batch Number.");
      return;
    }

    const medicineToSave: Medicine = {
      id: editingMed ? editingMed.id : `med-${Date.now()}`,
      name: formData.name || '',
      genericName: formData.genericName || '',
      category: (formData.category as MedicineCategory) || 'Tablet',
      manufacturer: formData.manufacturer || 'Generic Pharma',
      batchNumber: formData.batchNumber || '',
      stock: Number(formData.stock) || 0,
      reorderLevel: Number(formData.reorderLevel) || 10,
      costPrice: Number(formData.costPrice) || 0,
      sellingPrice: Number(formData.sellingPrice) || 0,
      expiryDate: formData.expiryDate || '2027-12-31',
      rackLocation: formData.rackLocation || 'Rack A1',
      prescriptionRequired: Boolean(formData.prescriptionRequired),
      unit: formData.unit || 'Box',
      barcode: formData.barcode || `890${Math.floor(100000000 + Math.random() * 900000000)}`,
      gstPercent: Number(formData.gstPercent) || 12
    };

    onSaveMedicine(medicineToSave);
    setIsModalOpen(false);
  };

  const handleQuickStockAdd = (med: Medicine, amount: number) => {
    const updated = { ...med, stock: med.stock + amount };
    onSaveMedicine(updated);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Pill className="w-6 h-6 text-emerald-600" />
            <span>Medicine Inventory Directory</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Total {medicines.length} products • Manage batch numbers, rack locations & selling prices
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Medicine</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Name, Formula, Rack, Batch..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>Category: {cat}</option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
          >
            <option value="all">Stock: All Items</option>
            <option value="low">Stock: Low Stock Warning</option>
            <option value="out">Stock: Out of Stock (0)</option>
          </select>

          {/* Expiry Filter */}
          <select
            value={expiryFilter}
            onChange={(e) => setExpiryFilter(e.target.value as any)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
          >
            <option value="all">Expiry: All Batches</option>
            <option value="expired">Expiry: Expired Items</option>
            <option value="critical">Expiry: Expiring &lt; 30 Days</option>
            <option value="warning">Expiry: Expiring &lt; 90 Days</option>
          </select>

        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4">Medicine & Formula</th>
                <th className="py-3 px-3">Batch & Rack</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3 text-right">Cost Price</th>
                <th className="py-3 px-3 text-right">MRP / Selling</th>
                <th className="py-3 px-3 text-center">Stock</th>
                <th className="py-3 px-3 text-center">Expiry</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredMedicines.map((med) => {
                const exp = getExpiryStatus(med.expiryDate);
                const isLowStock = med.stock <= med.reorderLevel;

                return (
                  <tr key={med.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    
                    {/* Medicine Name */}
                    <td className="py-3 px-4 font-medium">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{med.name}</span>
                        {med.prescriptionRequired && (
                          <span className="text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded border border-rose-500/20">
                            Rx
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{med.genericName}</p>
                      <p className="text-[10px] text-slate-400">{med.manufacturer} • {med.unit}</p>
                    </td>

                    {/* Batch & Location */}
                    <td className="py-3 px-3">
                      <p className="font-mono font-bold text-slate-800 dark:text-slate-200 text-[11px]">{med.batchNumber}</p>
                      <p className="text-[10px] text-slate-500">Rack: <span className="font-semibold text-slate-700 dark:text-slate-300">{med.rackLocation}</span></p>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3">
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-[10px] font-semibold">
                        {med.category}
                      </span>
                    </td>

                    {/* Cost Price */}
                    <td className="py-3 px-3 text-right font-mono text-slate-500 dark:text-slate-400">
                      ${med.costPrice.toFixed(2)}
                    </td>

                    {/* Selling Price */}
                    <td className="py-3 px-3 text-right font-extrabold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                      ${med.sellingPrice.toFixed(2)}
                    </td>

                    {/* Stock Units */}
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block font-extrabold px-2.5 py-1 rounded-lg text-xs ${
                        med.stock === 0 
                          ? 'bg-rose-500/10 text-rose-600 border border-rose-500/30' 
                          : isLowStock 
                          ? 'bg-amber-500/10 text-amber-600 border border-amber-500/30' 
                          : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                      }`}>
                        {med.stock}
                      </span>
                    </td>

                    {/* Expiry Badge */}
                    <td className="py-3 px-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${exp.badgeClass}`}>
                        {exp.label}
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        
                        <button
                          onClick={() => handleQuickStockAdd(med, 20)}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-lg text-[10px] font-bold cursor-pointer"
                          title="Add +20 Stock Units"
                        >
                          +20 Stock
                        </button>

                        <button
                          onClick={() => setBarcodeMed(med)}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                          title="Print Barcode Label"
                        >
                          <Barcode className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(med)}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Delete ${med.name} from inventory?`)) {
                              onDeleteMedicine(med.id);
                            }
                          }}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add / Edit Medicine */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden my-8">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <h3 className="font-bold text-base text-white">
                {editingMed ? 'Edit Medicine Entry' : 'Add New Medicine to Stock'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Brand / Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Dolo 650 Tablet"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Generic / Chemical Composition</label>
                  <input
                    type="text"
                    value={formData.genericName || ''}
                    onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                    placeholder="e.g. Paracetamol (650mg)"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Manufacturer</label>
                  <input
                    type="text"
                    value={formData.manufacturer || ''}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    placeholder="e.g. Micro Labs Ltd"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Batch Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.batchNumber || ''}
                    onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                    placeholder="e.g. DL650-24B01"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Rack Location</label>
                  <input
                    type="text"
                    value={formData.rackLocation || ''}
                    onChange={(e) => setFormData({ ...formData, rackLocation: e.target.value })}
                    placeholder="e.g. Rack A1-S2"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Reorder Alert Level</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.reorderLevel}
                    onChange={(e) => setFormData({ ...formData, reorderLevel: parseInt(e.target.value) || 10 })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Cost Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">MRP / Selling Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono font-bold text-emerald-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Unit Packaging</label>
                  <input
                    type="text"
                    value={formData.unit || ''}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="e.g. Strip of 15"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="rxReq"
                  checked={formData.prescriptionRequired}
                  onChange={(e) => setFormData({ ...formData, prescriptionRequired: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <label htmlFor="rxReq" className="font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                  Prescription Mandatory (Rx Doctor Note Required)
                </label>
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-800 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md"
                >
                  Save Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Barcode Shelf Label Preview */}
      {barcodeMed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl p-6 border w-full max-w-sm text-slate-900 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm">Shelf Barcode Label</h3>
              <button onClick={() => setBarcodeMed(null)} className="text-slate-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl text-center space-y-2 bg-slate-50">
              <p className="font-extrabold text-base">{barcodeMed.name}</p>
              <p className="text-xs text-slate-500">{barcodeMed.genericName}</p>
              <div className="font-mono text-2xl tracking-widest font-bold py-2 border-y my-2 border-slate-300">
                |||| ||| |||||| | ||||
              </div>
              <p className="font-mono text-xs text-slate-600">* {barcodeMed.barcode || barcodeMed.batchNumber} *</p>
              <div className="flex justify-between items-center pt-2 text-xs font-bold">
                <span>RACK: {barcodeMed.rackLocation}</span>
                <span className="text-emerald-700 text-sm">${barcodeMed.sellingPrice.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => { window.print(); setBarcodeMed(null); }}
              className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print Shelf Sticker</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
