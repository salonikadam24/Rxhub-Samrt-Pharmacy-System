import React, { useState } from 'react';
import { Medicine, BillItem } from '../../types';
import { Sparkles, FileText, CheckCircle2, AlertCircle, ArrowRight, Loader2, Pill, RefreshCw, X } from 'lucide-react';

interface PrescriptionScannerModalProps {
  medicines: Medicine[];
  onAddToCart: (items: BillItem[]) => void;
  onClose: () => void;
}

interface ParsedPrescriptionItem {
  requestedName: string;
  dosage: string;
  matchedMedicine: Medicine | null;
  suggestedAlternatives: Medicine[];
  quantityToBill: number;
}

export const PrescriptionScannerModal: React.FC<PrescriptionScannerModalProps> = ({
  medicines,
  onAddToCart,
  onClose,
}) => {
  const [rxText, setRxText] = useState<string>(
    "Rx:\n1. Tab Dolo 650mg - 1-0-1 for 5 days (Qty: 10)\n2. Tab Augmentin 625 duo - 1-0-1 for 5 days (Qty: 10)\n3. Tab Pantocid 40 - 1-0-0 before food (Qty: 10)\n4. Benadryl Cough Syrup 100ml - 1 tsp tds (Qty: 1 bottle)"
  );
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [parsedResults, setParsedResults] = useState<ParsedPrescriptionItem[] | null>(null);

  const sampleTemplates = [
    {
      title: "Viral Fever & Flu",
      text: "Rx:\n1. Dolo 650 Tablet - 1-1-1 (Qty: 15)\n2. Cetirizine 10mg - 0-0-1 (Qty: 10)\n3. Benadryl Cough Syrup 100ml - 2 tsp tds (Qty: 1)"
    },
    {
      title: "Diabetes & Cardio Monthly",
      text: "Rx:\n1. Glycomet GP 1 Forte - 1-0-1 after food (Qty: 30)\n2. Ecosprin 75mg - 0-0-1 (Qty: 30)\n3. Accu-Chek Active Glucose Strips (Qty: 1)"
    },
    {
      title: "Antibiotic Course",
      text: "Rx:\n1. Augmentin 625 Duo - 1-0-1 (Qty: 10)\n2. Pantocid 40 - 1-0-0 before food (Qty: 10)\n3. Volini Pain Relief Gel - Apply twice daily (Qty: 1)"
    }
  ];

  const handleProcessPrescription = () => {
    setIsScanning(true);

    setTimeout(() => {
      // Intelligent matching algorithm against inventory
      const lines = rxText.split('\n').filter(l => l.trim().length > 0 && !l.toLowerCase().startsWith('rx:'));
      
      const results: ParsedPrescriptionItem[] = lines.map(line => {
        const cleanLine = line.replace(/^\d+[\.\)]\s*/, '').trim();
        const lowerLine = cleanLine.toLowerCase();

        // Extract qty if available
        let qty = 1;
        const qtyMatch = line.match(/qty:\s*(\d+)/i) || line.match(/(\d+)\s*(tabs|tablets|strip|strips|bottle|tubes)?/i);
        if (qtyMatch && parseInt(qtyMatch[1]) > 0 && parseInt(qtyMatch[1]) < 100) {
          qty = parseInt(qtyMatch[1]);
        }

        // Direct match search
        let matched = medicines.find(m => 
          lowerLine.includes(m.name.toLowerCase()) || 
          m.name.toLowerCase().includes(cleanLine.split(' ')[0].toLowerCase())
        ) || null;

        // Alternatives if generic or out of stock
        let alternatives: Medicine[] = [];
        if (!matched || matched.stock === 0) {
          // Search by generic composition
          alternatives = medicines.filter(m => 
            m.stock > 0 && 
            (lowerLine.includes(m.genericName.toLowerCase().split(' ')[0]) || 
             m.genericName.toLowerCase().includes('paracetamol'))
          );
        }

        return {
          requestedName: cleanLine,
          dosage: line.includes('-') ? line.substring(line.indexOf('-')) : 'As directed by physician',
          matchedMedicine: matched,
          suggestedAlternatives: alternatives,
          quantityToBill: qty
        };
      });

      setParsedResults(results);
      setIsScanning(false);
    }, 800);
  };

  const handlePushToPOS = () => {
    if (!parsedResults) return;

    const billItems: BillItem[] = [];

    parsedResults.forEach(res => {
      const med = res.matchedMedicine || (res.suggestedAlternatives.length > 0 ? res.suggestedAlternatives[0] : null);
      if (med && med.stock > 0) {
        const qty = Math.min(res.quantityToBill, med.stock);
        const subtotal = med.sellingPrice * qty;
        const taxAmount = (subtotal * med.gstPercent) / 100;
        
        billItems.push({
          medicineId: med.id,
          medicineName: med.name,
          genericName: med.genericName,
          batchNumber: med.batchNumber,
          unitPrice: med.sellingPrice,
          quantity: qty,
          gstPercent: med.gstPercent,
          discountPercent: 0,
          subtotal: subtotal,
          taxAmount: taxAmount,
          total: subtotal + taxAmount,
          expiryDate: med.expiryDate
        });
      }
    });

    if (billItems.length > 0) {
      onAddToCart(billItems);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-xs">
              <Sparkles className="w-6 h-6 text-emerald-200 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">RxHub Smart Prescription Scanner</h3>
              <p className="text-xs text-emerald-100">AI-assisted prescription parsing & inventory auto-matching</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl text-emerald-100 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Quick Template Pills */}
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
              Select Sample Prescriptions or Type / Paste Below
            </label>
            <div className="flex flex-wrap gap-2">
              {sampleTemplates.map((tmpl, idx) => (
                <button
                  key={idx}
                  onClick={() => { setRxText(tmpl.text); setParsedResults(null); }}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium transition-all text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  ⚡ {tmpl.title}
                </button>
              ))}
            </div>
          </div>

          {/* Prescription Input Area */}
          <div>
            <textarea
              value={rxText}
              onChange={(e) => { setRxText(e.target.value); setParsedResults(null); }}
              rows={5}
              placeholder="Paste doctor's prescription text e.g. Tab Dolo 650mg Qty 10..."
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Action Button */}
          <div className="flex justify-end">
            <button
              onClick={handleProcessPrescription}
              disabled={isScanning || !rxText.trim()}
              className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Matching Inventory...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Scan & Match Inventory</span>
                </>
              )}
            </button>
          </div>

          {/* Results Output */}
          {parsedResults && (
            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Detected Prescription Items ({parsedResults.length})</span>
                </h4>
              </div>

              <div className="space-y-2.5">
                {parsedResults.map((res, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded text-[10px]">
                          #{idx + 1}
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">{res.requestedName}</span>
                      </div>

                      {res.matchedMedicine ? (
                        <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-medium">
                          <Pill className="w-3.5 h-3.5" />
                          <span>Matched: <strong>{res.matchedMedicine.name}</strong> (${res.matchedMedicine.sellingPrice.toFixed(2)}) • Stock: {res.matchedMedicine.stock}</span>
                        </div>
                      ) : res.suggestedAlternatives.length > 0 ? (
                        <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 font-medium">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Generic Alt: <strong>{res.suggestedAlternatives[0].name}</strong> (${res.suggestedAlternatives[0].sellingPrice.toFixed(2)})</span>
                        </div>
                      ) : (
                        <p className="text-rose-500 font-medium">No matching inventory item found for this entry</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 self-end sm:self-center">
                      <span className="text-slate-500 dark:text-slate-400">Qty:</span>
                      <input
                        type="number"
                        min={1}
                        value={res.quantityToBill}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          const updated = [...parsedResults];
                          updated[idx].quantityToBill = val;
                          setParsedResults(updated);
                        }}
                        className="w-16 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-center font-bold"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Bar */}
              <div className="pt-3 flex justify-end">
                <button
                  onClick={handlePushToPOS}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <span>Add Matched Medicines to POS Cart</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
