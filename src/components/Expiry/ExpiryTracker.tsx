import React, { useState } from 'react';
import { Medicine, ExpiryActionLog, Supplier } from '../../types';
import { getExpiryStatus, getDaysDifferenceFromToday } from '../../utils/storage';
import { AlertTriangle, Clock, ShieldAlert, RotateCcw, Trash2, Tag, DollarSign, CheckCircle2, Building2 } from 'lucide-react';

interface ExpiryTrackerProps {
  medicines: Medicine[];
  suppliers: Supplier[];
  expiryLogs: ExpiryActionLog[];
  onLogExpiryAction: (updatedMedicine: Medicine, actionLog: ExpiryActionLog) => void;
}

export const ExpiryTracker: React.FC<ExpiryTrackerProps> = ({
  medicines,
  suppliers,
  expiryLogs,
  onLogExpiryAction,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'expired' | 'critical' | 'warning'>('expired');

  // Modal State for Action
  const [selectedMed, setSelectedMed] = useState<Medicine | null>(null);
  const [actionType, setActionType] = useState<'returned_to_supplier' | 'disposed' | 'discounted_sale'>('returned_to_supplier');
  const [actionQty, setActionQty] = useState<number>(10);
  const [actionSupplier, setActionSupplier] = useState<string>(suppliers[0]?.name || 'Vendor Wholesaler');
  const [actionNotes, setActionNotes] = useState<string>('');

  const expiryFilteredMeds = medicines.filter(m => {
    const status = getExpiryStatus(m.expiryDate).level;
    if (filterType === 'expired') return status === 'expired';
    if (filterType === 'critical') return status === 'critical';
    if (filterType === 'warning') return status === 'warning';
    return status === 'expired' || status === 'critical' || status === 'warning';
  });

  const totalLossFromExpiries = expiryLogs.reduce((acc, log) => acc + log.totalLoss, 0);

  const handleOpenActionModal = (med: Medicine, defaultAction: 'returned_to_supplier' | 'disposed' | 'discounted_sale') => {
    setSelectedMed(med);
    setActionType(defaultAction);
    setActionQty(med.stock || 1);
    setActionNotes(defaultAction === 'returned_to_supplier' ? 'Returned to wholesaler for credit note' : 'Safely destroyed as per medical disposal protocol');
  };

  const handleConfirmAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMed) return;

    const qtyToProcess = Math.min(actionQty, selectedMed.stock);
    const lossValue = selectedMed.costPrice * qtyToProcess;
    const todayStr = new Date().toISOString().split('T')[0];

    const newLog: ExpiryActionLog = {
      id: `exp-${Date.now()}`,
      medicineId: selectedMed.id,
      medicineName: selectedMed.name,
      batchNumber: selectedMed.batchNumber,
      quantity: qtyToProcess,
      costPrice: selectedMed.costPrice,
      totalLoss: lossValue,
      expiryDate: selectedMed.expiryDate,
      actionDate: todayStr,
      action: actionType,
      supplierName: actionType === 'returned_to_supplier' ? actionSupplier : undefined,
      notes: actionNotes
    };

    let updatedMed = { ...selectedMed };
    if (actionType === 'discounted_sale') {
      // Reduce selling price by 40% to clear before expiry
      updatedMed.sellingPrice = Math.max(selectedMed.costPrice, selectedMed.sellingPrice * 0.6);
    } else {
      // Deduct stock for return or disposal
      updatedMed.stock = Math.max(0, selectedMed.stock - qtyToProcess);
    }

    onLogExpiryAction(updatedMed, newLog);
    setSelectedMed(null);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            <span>Expiry & Waste Control Center</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitor batch expiry timelines, return expired stock to vendors & minimize waste loss
          </p>
        </div>

        <div className="bg-rose-500/10 border border-rose-500/20 px-4 py-2 rounded-xl text-xs flex items-center space-x-3">
          <div>
            <p className="text-[10px] text-rose-500 uppercase font-bold">Logged Expiry Loss</p>
            <p className="font-extrabold text-slate-900 dark:text-rose-300 text-sm font-mono">${totalLossFromExpiries.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-x-2 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setFilterType('expired')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            filterType === 'expired'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Already Expired ({medicines.filter(m => getExpiryStatus(m.expiryDate).level === 'expired').length})
        </button>

        <button
          onClick={() => setFilterType('critical')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            filterType === 'critical'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Expiring &lt; 30 Days ({medicines.filter(m => getExpiryStatus(m.expiryDate).level === 'critical').length})
        </button>

        <button
          onClick={() => setFilterType('warning')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            filterType === 'warning'
              ? 'bg-amber-500/80 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Expiring &lt; 90 Days ({medicines.filter(m => getExpiryStatus(m.expiryDate).level === 'warning').length})
        </button>

        <button
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            filterType === 'all'
              ? 'bg-slate-900 text-white dark:bg-slate-700'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All Watchlist Items
        </button>
      </div>

      {/* Main Expiry Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b">
                <th className="py-3 px-4">Medicine & Batch</th>
                <th className="py-3 px-3">Rack Bin</th>
                <th className="py-3 px-3 text-center">In Stock</th>
                <th className="py-3 px-3 text-right">Cost Loss Value</th>
                <th className="py-3 px-3 text-center">Expiry Date</th>
                <th className="py-3 px-4 text-center">Action Options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {expiryFilteredMeds.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 italic">
                    No medicines match this expiry criteria! Stock is safe.
                  </td>
                </tr>
              ) : (
                expiryFilteredMeds.map((med) => {
                  const exp = getExpiryStatus(med.expiryDate);
                  const totalValue = med.costPrice * med.stock;

                  return (
                    <tr key={med.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-medium">
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{med.name}</p>
                        <p className="text-[11px] text-slate-500">{med.genericName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">Batch: {med.batchNumber}</p>
                      </td>

                      <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                        {med.rackLocation}
                      </td>

                      <td className="py-3 px-3 text-center font-extrabold text-sm text-slate-900 dark:text-white">
                        {med.stock} units
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-rose-600">
                        ${totalValue.toFixed(2)}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-lg border ${exp.badgeClass}`}>
                          {exp.label} ({med.expiryDate})
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => handleOpenActionModal(med, 'returned_to_supplier')}
                            className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded-lg text-[10px] font-bold border border-amber-500/20 cursor-pointer"
                          >
                            Return to Vendor
                          </button>

                          <button
                            onClick={() => handleOpenActionModal(med, 'disposed')}
                            className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 rounded-lg text-[10px] font-bold border border-rose-500/20 cursor-pointer"
                          >
                            Dispose & Log Loss
                          </button>

                          {exp.level !== 'expired' && (
                            <button
                              onClick={() => handleOpenActionModal(med, 'discounted_sale')}
                              className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-lg text-[10px] font-bold border border-emerald-500/20 cursor-pointer"
                            >
                              40% Off Sale
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Logged Action History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-3">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">Logged Expiry Actions History</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Medicine & Batch</th>
                <th className="py-2.5 px-3">Action Type</th>
                <th className="py-2.5 px-3 text-center">Qty</th>
                <th className="py-2.5 px-3 text-right">Financial Loss</th>
                <th className="py-2.5 px-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {expiryLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 text-slate-500">{log.actionDate}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">{log.medicineName} ({log.batchNumber})</td>
                  <td className="py-2.5 px-3">
                    <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold">{log.quantity}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600">${log.totalLoss.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-slate-500 text-[11px]">{log.notes || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Process Expiry Action Modal */}
      {selectedMed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border w-full max-w-md space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Record Expiry Action</h3>
            <p className="text-xs text-slate-500">Medicine: <strong className="text-slate-900 dark:text-white">{selectedMed.name}</strong> ({selectedMed.batchNumber})</p>

            <form onSubmit={handleConfirmAction} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Action Type:</label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-semibold"
                >
                  <option value="returned_to_supplier">Return Stock to Wholesaler Vendor</option>
                  <option value="disposed">Safely Destroy / Dispose & Record Financial Loss</option>
                  <option value="discounted_sale">Apply 40% Clearance Sale Discount</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Units Quantity:</label>
                <input
                  type="number"
                  min={1}
                  max={selectedMed.stock}
                  value={actionQty}
                  onChange={(e) => setActionQty(parseInt(e.target.value) || 1)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                />
              </div>

              {actionType === 'returned_to_supplier' && (
                <div>
                  <label className="font-semibold block mb-1">Select Supplier Vendor:</label>
                  <select
                    value={actionSupplier}
                    onChange={(e) => setActionSupplier(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  >
                    {suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="font-semibold block mb-1">Notes / Reason:</label>
                <input
                  type="text"
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button type="button" onClick={() => setSelectedMed(null)} className="px-4 py-2 bg-slate-200 rounded-xl font-semibold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl">Confirm Action</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
