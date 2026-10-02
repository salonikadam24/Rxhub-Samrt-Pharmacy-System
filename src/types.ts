export type MedicineCategory = 
  | 'Tablet'
  | 'Capsule'
  | 'Syrup'
  | 'Injection'
  | 'Ointment / Cream'
  | 'Drops'
  | 'Inhaler'
  | 'Supplies / Medical Devices'
  | 'Ayurvedic / Herbal'
  | 'General Care';

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: MedicineCategory;
  manufacturer: string;
  batchNumber: string;
  stock: number;
  reorderLevel: number;
  costPrice: number;
  sellingPrice: number; // MRP or selling price
  expiryDate: string; // YYYY-MM-DD
  rackLocation: string; // e.g., A1-S2
  prescriptionRequired: boolean;
  unit: string; // e.g., "Strip of 10", "Bottle 100ml", "Vial", "Tube"
  barcode?: string;
  gstPercent: number; // e.g. 5, 12, 18
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalPurchases: number;
  outstandingBalance: number;
  createdDate: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  gstin?: string;
  address?: string;
  balanceOwed: number;
}

export interface BillItem {
  medicineId: string;
  medicineName: string;
  genericName: string;
  batchNumber: string;
  unitPrice: number;
  quantity: number;
  gstPercent: number;
  discountPercent: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  expiryDate: string;
}

export type PaymentMode = 'cash' | 'upi' | 'card' | 'credit';
export type PaymentStatus = 'paid' | 'due' | 'partial';

export interface SaleInvoice {
  id: string;
  invoiceNumber: string; // e.g. RX-2026-0042
  date: string; // ISO date or string YYYY-MM-DD HH:mm
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  doctorName?: string;
  prescriptionNo?: string;
  items: BillItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  paymentMode: PaymentMode;
  paymentStatus: PaymentStatus;
  paidAmount: number;
  dueAmount: number;
  notes?: string;
}

export interface PurchaseItem {
  medicineId?: string;
  medicineName: string;
  genericName: string;
  category: MedicineCategory;
  manufacturer: string;
  batchNumber: string;
  expiryDate: string;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  unit: string;
  rackLocation: string;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string; // e.g. PO-8812
  date: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paidAmount: number;
  dueAmount: number;
  notes?: string;
}

export interface ExpiryActionLog {
  id: string;
  medicineId: string;
  medicineName: string;
  batchNumber: string;
  quantity: number;
  costPrice: number;
  totalLoss: number;
  expiryDate: string;
  actionDate: string;
  action: 'returned_to_supplier' | 'disposed' | 'discounted_sale';
  supplierName?: string;
  notes?: string;
}

export interface PharmacyStoreInfo {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  dlNumber: string; // Drug License No.
  gstin: string; // GSTIN / Tax ID
}
