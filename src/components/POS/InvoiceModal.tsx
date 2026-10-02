import React from 'react';
import { SaleInvoice, PharmacyStoreInfo } from '../../types';
import { Printer, Download, CheckCircle2, X, Phone, Mail, Building2, FileText, CreditCard } from 'lucide-react';

interface InvoiceModalProps {
  invoice: SaleInvoice | null;
  storeInfo: PharmacyStoreInfo;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ invoice, storeInfo, onClose }) => {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Bar */}
        <div className="bg-slate-900 text-white p-4 sm:p-6 flex items-center justify-between no-print">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">Invoice Generated</h3>
              <p className="text-xs text-slate-400">Invoice #{invoice.invoiceNumber} • {invoice.date}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div id="printable-invoice" className="p-6 sm:p-8 bg-white text-slate-900 space-y-6">
          
          {/* Pharmacy Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-200 pb-6 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
                  Rx
                </div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">{storeInfo.name}</h2>
              </div>
              <p className="text-xs text-slate-500 font-medium">{storeInfo.tagline}</p>
              <p className="text-xs text-slate-600 max-w-sm">{storeInfo.address}</p>
              <div className="flex flex-wrap text-xs text-slate-500 gap-x-4 gap-y-1 pt-1">
                <span>Phone: {storeInfo.phone}</span>
                <span>Email: {storeInfo.email}</span>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1 sm:self-auto bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl w-full sm:w-auto border sm:border-0 border-slate-200">
              <div className="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-md text-xs font-bold uppercase tracking-wider mb-1">
                Tax Invoice
              </div>
              <p className="text-sm font-bold text-slate-900">{invoice.invoiceNumber}</p>
              <p className="text-xs text-slate-600">Date: {invoice.date}</p>
              <p className="text-xs text-slate-600">DL No: <span className="font-mono">{storeInfo.dlNumber}</span></p>
              <p className="text-xs text-slate-600">GSTIN: <span className="font-mono">{storeInfo.gstin}</span></p>
            </div>
          </div>

          {/* Customer & Prescription Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs">
            <div>
              <p className="text-slate-400 uppercase font-bold text-[10px] tracking-wider mb-1">Patient / Customer</p>
              <p className="font-bold text-sm text-slate-900">{invoice.customerName}</p>
              {invoice.customerPhone && <p className="text-slate-600">Phone: {invoice.customerPhone}</p>}
              <p className="text-slate-600">Payment Method: <span className="font-semibold uppercase text-emerald-700">{invoice.paymentMode}</span></p>
            </div>
            <div>
              <p className="text-slate-400 uppercase font-bold text-[10px] tracking-wider mb-1">Medical Reference</p>
              {invoice.doctorName ? (
                <p className="text-slate-700 font-medium">Doctor: <span className="font-semibold text-slate-900">{invoice.doctorName}</span></p>
              ) : (
                <p className="text-slate-500 italic">No doctor reference logged</p>
              )}
              {invoice.prescriptionNo && (
                <p className="text-slate-700">Rx No: <span className="font-mono font-semibold">{invoice.prescriptionNo}</span></p>
              )}
              <p className="text-slate-700">Status: 
                <span className={`ml-1 font-bold ${invoice.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {invoice.paymentStatus.toUpperCase()}
                </span>
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Medicine Item</th>
                  <th className="py-2.5 px-3">Batch</th>
                  <th className="py-2.5 px-3">Exp</th>
                  <th className="py-2.5 px-3 text-right">MRP</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">GST</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-medium">
                      <p className="text-slate-900 font-semibold">{item.medicineName}</p>
                      <p className="text-[11px] text-slate-500 font-normal">{item.genericName}</p>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{item.batchNumber}</td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">{item.expiryDate}</td>
                    <td className="py-2.5 px-3 text-right">${item.unitPrice.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-center font-bold">{item.quantity}</td>
                    <td className="py-2.5 px-3 text-right text-slate-600">{item.gstPercent}%</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">${item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Breakdown */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pt-2">
            <div className="text-xs text-slate-500 space-y-1 max-w-sm">
              <p className="font-semibold text-slate-700">Important Note:</p>
              <p>• Medicines once sold cannot be returned without original batch receipt.</p>
              <p>• Check expiry date and seal before leaving the pharmacy counter.</p>
            </div>

            <div className="w-full sm:w-64 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>${invoice.subtotal.toFixed(2)}</span>
              </div>
              {invoice.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount:</span>
                  <span>-${invoice.discountTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Tax / GST Included:</span>
                <span>${invoice.taxTotal.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-300 pt-2 flex justify-between font-bold text-sm text-slate-900">
                <span>Grand Total:</span>
                <span className="text-emerald-600">${invoice.grandTotal.toFixed(2)}</span>
              </div>
              {invoice.dueAmount > 0 && (
                <div className="flex justify-between text-rose-600 font-semibold pt-1 border-t border-slate-200">
                  <span>Pending Due:</span>
                  <span>${invoice.dueAmount.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Signature & Barcode Simulation */}
          <div className="border-t border-slate-200 pt-6 flex justify-between items-center text-xs text-slate-500">
            <div className="font-mono text-[10px] bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              BARCODE: *{invoice.invoiceNumber}*
            </div>
            <div className="text-right">
              <p className="font-semibold text-slate-800">Authorized Pharmacist</p>
              <p className="text-[11px] text-slate-500">{storeInfo.name}</p>
            </div>
          </div>

        </div>

        {/* Footer Bar */}
        <div className="bg-slate-100 dark:bg-slate-800/80 p-4 flex justify-end space-x-3 no-print border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
};
