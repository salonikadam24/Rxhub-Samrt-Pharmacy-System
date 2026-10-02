import { Medicine, Customer, Supplier, SaleInvoice, PurchaseOrder, ExpiryActionLog, PharmacyStoreInfo } from '../types';

export const initialStoreInfo: PharmacyStoreInfo = {
  name: "RxHub Meds & Wellness",
  tagline: "Smart Healthcare & Pharmacy Solutions",
  address: "Shop #14, Central Health Complex, MG Road, Metro District",
  phone: "+1 (800) 555-RXHUB / +91 98765 43210",
  email: "care@rxhubpharma.com",
  dlNumber: "DL-20B/MH-MUM-482019",
  gstin: "27AAACR1234F1Z9"
};

export const initialMedicines: Medicine[] = [
  {
    id: "med-001",
    name: "Dolo 650 Tablet",
    genericName: "Paracetamol (650mg)",
    category: "Tablet",
    manufacturer: "Micro Labs Ltd",
    batchNumber: "DL650-24B01",
    stock: 180,
    reorderLevel: 50,
    costPrice: 1.80,
    sellingPrice: 3.20,
    expiryDate: "2027-05-15",
    rackLocation: "Rack A1-S2",
    prescriptionRequired: false,
    unit: "Strip of 15",
    barcode: "890123456701",
    gstPercent: 12
  },
  {
    id: "med-002",
    name: "Augmentin 625 Duo",
    genericName: "Amoxicillin (500mg) + Clavulanic Acid (125mg)",
    category: "Tablet",
    manufacturer: "GlaxoSmithKline",
    batchNumber: "AUG625-23X89",
    stock: 14, // Low stock!
    reorderLevel: 25,
    costPrice: 12.50,
    sellingPrice: 18.50,
    expiryDate: "2026-08-20", // Expiring in ~20 days!
    rackLocation: "Rack B3-S1",
    prescriptionRequired: true,
    unit: "Strip of 10",
    barcode: "890123456702",
    gstPercent: 12
  },
  {
    id: "med-003",
    name: "Pantocid 40",
    genericName: "Pantoprazole (40mg)",
    category: "Tablet",
    manufacturer: "Sun Pharma",
    batchNumber: "PAN40-24A12",
    stock: 95,
    reorderLevel: 30,
    costPrice: 6.00,
    sellingPrice: 9.80,
    expiryDate: "2027-01-10",
    rackLocation: "Rack A2-S4",
    prescriptionRequired: false,
    unit: "Strip of 15",
    barcode: "890123456703",
    gstPercent: 12
  },
  {
    id: "med-004",
    name: "Benadryl Cough Syrup 100ml",
    genericName: "Diphenhydramine HCl + Ammonium Chloride",
    category: "Syrup",
    manufacturer: "Johnson & Johnson",
    batchNumber: "BEN100-23Z04",
    stock: 8, // Low stock!
    reorderLevel: 15,
    costPrice: 7.20,
    sellingPrice: 11.50,
    expiryDate: "2026-08-12", // Expiring very soon!
    rackLocation: "Rack C1-S1",
    prescriptionRequired: false,
    unit: "Bottle 100ml",
    barcode: "890123456704",
    gstPercent: 12
  },
  {
    id: "med-005",
    name: "Azithral 500mg",
    genericName: "Azithromycin (500mg)",
    category: "Tablet",
    manufacturer: "Alembic Pharma",
    batchNumber: "AZI500-23M09",
    stock: 0, // Out of stock!
    reorderLevel: 20,
    costPrice: 8.40,
    sellingPrice: 13.00,
    expiryDate: "2026-07-25", // Already EXPIRED!
    rackLocation: "Rack B1-S3",
    prescriptionRequired: true,
    unit: "Strip of 5",
    barcode: "890123456705",
    gstPercent: 12
  },
  {
    id: "med-006",
    name: "Insulin Glargine Penfill 100IU",
    genericName: "Recombinant Human Insulin",
    category: "Injection",
    manufacturer: "Sanofi India",
    batchNumber: "INS100-24K02",
    stock: 22,
    reorderLevel: 10,
    costPrice: 42.00,
    sellingPrice: 58.00,
    expiryDate: "2026-11-30",
    rackLocation: "Cold Storage Refrigerator #1",
    prescriptionRequired: true,
    unit: "3ml Penfill",
    barcode: "890123456706",
    gstPercent: 5
  },
  {
    id: "med-007",
    name: "Cetirizine 10mg (Alerid)",
    genericName: "Cetirizine Hydrochloride (10mg)",
    category: "Tablet",
    manufacturer: "Cipla Ltd",
    batchNumber: "CET10-24R88",
    stock: 240,
    reorderLevel: 40,
    costPrice: 1.20,
    sellingPrice: 2.20,
    expiryDate: "2027-09-30",
    rackLocation: "Rack A1-S1",
    prescriptionRequired: false,
    unit: "Strip of 10",
    barcode: "890123456707",
    gstPercent: 12
  },
  {
    id: "med-008",
    name: "Volini Pain Relief Gel 50g",
    genericName: "Diclofenac Diethylamine + Methyl Salicylate",
    category: "Ointment / Cream",
    manufacturer: "Sun Pharma",
    batchNumber: "VOL50-23Q11",
    stock: 35,
    reorderLevel: 12,
    costPrice: 9.50,
    sellingPrice: 14.20,
    expiryDate: "2026-09-15", // Expiring in 45 days
    rackLocation: "Rack C2-S3",
    prescriptionRequired: false,
    unit: "Tube 50g",
    barcode: "890123456708",
    gstPercent: 12
  },
  {
    id: "med-009",
    name: "Betadine Antiseptic Solution 100ml",
    genericName: "Povidone-Iodine (10% w/v)",
    category: "Supplies / Medical Devices",
    manufacturer: "Win-Medicare",
    batchNumber: "BET100-23P45",
    stock: 18,
    reorderLevel: 10,
    costPrice: 6.80,
    sellingPrice: 10.50,
    expiryDate: "2027-03-20",
    rackLocation: "Rack D1-S2",
    prescriptionRequired: false,
    unit: "Bottle 100ml",
    barcode: "890123456709",
    gstPercent: 12
  },
  {
    id: "med-010",
    name: "Asthalin Inhaler 100mcg",
    genericName: "Salbutamol Inhalation IP",
    category: "Inhaler",
    manufacturer: "Cipla Ltd",
    batchNumber: "AST100-24C77",
    stock: 19,
    reorderLevel: 8,
    costPrice: 11.00,
    sellingPrice: 16.50,
    expiryDate: "2027-08-10",
    rackLocation: "Rack B2-S4",
    prescriptionRequired: true,
    unit: "200 MDI Dose",
    barcode: "890123456710",
    gstPercent: 12
  },
  {
    id: "med-011",
    name: "Otrivin Adult Nasal Drops 10ml",
    genericName: "Xylometazoline Hydrochloride (0.1% w/v)",
    category: "Drops",
    manufacturer: "GSK Consumer",
    batchNumber: "OTR10-23Y33",
    stock: 45,
    reorderLevel: 15,
    costPrice: 4.50,
    sellingPrice: 7.00,
    expiryDate: "2026-07-10", // EXPIRED!
    rackLocation: "Rack C3-S2",
    prescriptionRequired: false,
    unit: "Bottle 10ml",
    barcode: "890123456711",
    gstPercent: 12
  },
  {
    id: "med-012",
    name: "Crocin Advance 500mg",
    genericName: "Paracetamol Fast Release (500mg)",
    category: "Tablet",
    manufacturer: "GSK Asia",
    batchNumber: "CRO500-24E01",
    stock: 310,
    reorderLevel: 60,
    costPrice: 1.10,
    sellingPrice: 2.00,
    expiryDate: "2028-01-15",
    rackLocation: "Rack A1-S3",
    prescriptionRequired: false,
    unit: "Strip of 15",
    barcode: "890123456712",
    gstPercent: 12
  },
  {
    id: "med-013",
    name: "Glycomet GP 1 Forte",
    genericName: "Metformin (1000mg) + Glimepiride (1mg)",
    category: "Tablet",
    manufacturer: "USV Private Ltd",
    batchNumber: "GLY100-24H55",
    stock: 120,
    reorderLevel: 35,
    costPrice: 7.50,
    sellingPrice: 12.00,
    expiryDate: "2027-04-30",
    rackLocation: "Rack B4-S1",
    prescriptionRequired: true,
    unit: "Strip of 15",
    barcode: "890123456713",
    gstPercent: 12
  },
  {
    id: "med-014",
    name: "Ecosprin 75mg",
    genericName: "Aspirin Gastro-resistant (75mg)",
    category: "Tablet",
    manufacturer: "USV Private Ltd",
    batchNumber: "ECO75-24J99",
    stock: 210,
    reorderLevel: 40,
    costPrice: 0.40,
    sellingPrice: 0.85,
    expiryDate: "2027-10-15",
    rackLocation: "Rack B4-S2",
    prescriptionRequired: true,
    unit: "Strip of 14",
    barcode: "890123456714",
    gstPercent: 12
  },
  {
    id: "med-015",
    name: "Cystone Ayurvedic Tablets",
    genericName: "Herbal Kidney & Urinary Care Formula",
    category: "Ayurvedic / Herbal",
    manufacturer: "Himalaya Wellness",
    batchNumber: "CYS60-23W01",
    stock: 60,
    reorderLevel: 15,
    costPrice: 8.00,
    sellingPrice: 12.50,
    expiryDate: "2027-12-01",
    rackLocation: "Rack E1-S1",
    prescriptionRequired: false,
    unit: "Bottle of 60 Tabs",
    barcode: "890123456715",
    gstPercent: 12
  },
  {
    id: "med-016",
    name: "Accu-Chek Active Blood Glucose Strips",
    genericName: "Test Strips for Blood Glucose Monitor",
    category: "Supplies / Medical Devices",
    manufacturer: "Roche Diabetes Care",
    batchNumber: "ACC50-24L08",
    stock: 12, // Low stock
    reorderLevel: 10,
    costPrice: 18.00,
    sellingPrice: 24.50,
    expiryDate: "2026-10-01",
    rackLocation: "Rack D2-S1",
    prescriptionRequired: false,
    unit: "Pack of 50 Strips",
    barcode: "890123456716",
    gstPercent: 18
  }
];

export const initialCustomers: Customer[] = [
  {
    id: "cust-101",
    name: "Rahul Sharma",
    phone: "+91 98201 11223",
    email: "rahul.sharma@example.com",
    address: "Apt 4B, Sunflower Heights, MG Road",
    totalPurchases: 245.50,
    outstandingBalance: 0.00,
    createdDate: "2026-01-12"
  },
  {
    id: "cust-102",
    name: "Priya Patel",
    phone: "+91 98334 55667",
    email: "priya.p@example.com",
    address: "Flat 12, Green Acres Society",
    totalPurchases: 512.00,
    outstandingBalance: 32.50, // Has credit due
    createdDate: "2026-02-05"
  },
  {
    id: "cust-103",
    name: "Dr. Anita Roy",
    phone: "+91 98112 33445",
    email: "anita.roy@cityclinic.org",
    address: "City Healthcare Clinic, Block B",
    totalPurchases: 1420.00,
    outstandingBalance: 120.00, // Has credit due
    createdDate: "2026-01-02"
  },
  {
    id: "cust-104",
    name: "Robert D'Souza",
    phone: "+91 99670 88990",
    email: "robert.d@example.com",
    address: "House 88, Hill View Colony",
    totalPurchases: 185.00,
    outstandingBalance: 0.00,
    createdDate: "2026-03-20"
  },
  {
    id: "cust-105",
    name: "Walk-in Customer",
    phone: "N/A",
    totalPurchases: 3240.00,
    outstandingBalance: 0.00,
    createdDate: "2026-01-01"
  }
];

export const initialSuppliers: Supplier[] = [
  {
    id: "sup-201",
    name: "Apex Pharma Wholesalers",
    contactPerson: "Mr. Suresh Kulkarni",
    phone: "+91 98220 44556",
    email: "orders@apexpharma.com",
    gstin: "27APXPH9876K1Z2",
    address: "Wholesale Market Gate #3, Industrial Area",
    balanceOwed: 450.00
  },
  {
    id: "sup-202",
    name: "MedPlus Logistics & Dist",
    contactPerson: "Vikram Mehta",
    phone: "+91 98991 22334",
    email: "supply@medplusdist.com",
    gstin: "27MEDPL5432M1Z8",
    address: "Plot 42, Health Tech Park, Sector 5",
    balanceOwed: 0.00
  },
  {
    id: "sup-203",
    name: "Sun Health Supplies",
    contactPerson: "Anand Verma",
    phone: "+91 98770 11223",
    email: "anand@sunhealth.co",
    gstin: "27SUNHL1122S1Z4",
    address: "Building B, Pharma City Hub",
    balanceOwed: 180.00
  }
];

export const initialInvoices: SaleInvoice[] = [
  {
    id: "inv-001",
    invoiceNumber: "RX-2026-0081",
    date: "2026-08-01 10:15",
    customerId: "cust-101",
    customerName: "Rahul Sharma",
    customerPhone: "+91 98201 11223",
    doctorName: "Dr. K. V. Rao",
    prescriptionNo: "PR-9012",
    items: [
      {
        medicineId: "med-001",
        medicineName: "Dolo 650 Tablet",
        genericName: "Paracetamol (650mg)",
        batchNumber: "DL650-24B01",
        unitPrice: 3.20,
        quantity: 2,
        gstPercent: 12,
        discountPercent: 0,
        subtotal: 6.40,
        taxAmount: 0.77,
        total: 7.17,
        expiryDate: "2027-05-15"
      },
      {
        medicineId: "med-003",
        medicineName: "Pantocid 40",
        genericName: "Pantoprazole (40mg)",
        batchNumber: "PAN40-24A12",
        unitPrice: 9.80,
        quantity: 1,
        gstPercent: 12,
        discountPercent: 5,
        subtotal: 9.31,
        taxAmount: 1.12,
        total: 10.43,
        expiryDate: "2027-01-10"
      }
    ],
    subtotal: 15.71,
    discountTotal: 0.49,
    taxTotal: 1.89,
    grandTotal: 17.60,
    paymentMode: "upi",
    paymentStatus: "paid",
    paidAmount: 17.60,
    dueAmount: 0,
    notes: "Regular prescription refill"
  },
  {
    id: "inv-002",
    invoiceNumber: "RX-2026-0082",
    date: "2026-08-01 11:30",
    customerId: "cust-102",
    customerName: "Priya Patel",
    customerPhone: "+91 98334 55667",
    doctorName: "Dr. Anita Roy",
    prescriptionNo: "PR-9044",
    items: [
      {
        medicineId: "med-002",
        medicineName: "Augmentin 625 Duo",
        genericName: "Amoxicillin + Clavulanic",
        batchNumber: "AUG625-23X89",
        unitPrice: 18.50,
        quantity: 2,
        gstPercent: 12,
        discountPercent: 0,
        subtotal: 37.00,
        taxAmount: 4.44,
        total: 41.44,
        expiryDate: "2026-08-20"
      },
      {
        medicineId: "med-007",
        medicineName: "Cetirizine 10mg (Alerid)",
        genericName: "Cetirizine HCl",
        batchNumber: "CET10-24R88",
        unitPrice: 2.20,
        quantity: 1,
        gstPercent: 12,
        discountPercent: 0,
        subtotal: 2.20,
        taxAmount: 0.26,
        total: 2.46,
        expiryDate: "2027-09-30"
      }
    ],
    subtotal: 39.20,
    discountTotal: 0,
    taxTotal: 4.70,
    grandTotal: 43.90,
    paymentMode: "credit",
    paymentStatus: "partial",
    paidAmount: 11.40,
    dueAmount: 32.50,
    notes: "Partial payment, remaining added to account ledger"
  },
  {
    id: "inv-003",
    invoiceNumber: "RX-2026-0080",
    date: "2026-07-31 16:45",
    customerId: "cust-105",
    customerName: "Walk-in Customer",
    items: [
      {
        medicineId: "med-008",
        medicineName: "Volini Pain Relief Gel 50g",
        genericName: "Diclofenac Diethylamine",
        batchNumber: "VOL50-23Q11",
        unitPrice: 14.20,
        quantity: 1,
        gstPercent: 12,
        discountPercent: 0,
        subtotal: 14.20,
        taxAmount: 1.70,
        total: 15.90,
        expiryDate: "2026-09-15"
      },
      {
        medicineId: "med-012",
        medicineName: "Crocin Advance 500mg",
        genericName: "Paracetamol",
        batchNumber: "CRO500-24E01",
        unitPrice: 2.00,
        quantity: 2,
        gstPercent: 12,
        discountPercent: 0,
        subtotal: 4.00,
        taxAmount: 0.48,
        total: 4.48,
        expiryDate: "2028-01-15"
      }
    ],
    subtotal: 18.20,
    discountTotal: 0,
    taxTotal: 2.18,
    grandTotal: 20.38,
    paymentMode: "cash",
    paymentStatus: "paid",
    paidAmount: 20.38,
    dueAmount: 0
  },
  {
    id: "inv-004",
    invoiceNumber: "RX-2026-0079",
    date: "2026-07-30 14:10",
    customerId: "cust-103",
    customerName: "Dr. Anita Roy",
    customerPhone: "+91 98112 33445",
    items: [
      {
        medicineId: "med-006",
        medicineName: "Insulin Glargine Penfill 100IU",
        genericName: "Recombinant Human Insulin",
        batchNumber: "INS100-24K02",
        unitPrice: 58.00,
        quantity: 2,
        gstPercent: 5,
        discountPercent: 10,
        subtotal: 104.40,
        taxAmount: 5.22,
        total: 109.62,
        expiryDate: "2026-11-30"
      },
      {
        medicineId: "med-016",
        medicineName: "Accu-Chek Active Blood Glucose Strips",
        genericName: "Test Strips",
        batchNumber: "ACC50-24L08",
        unitPrice: 24.50,
        quantity: 2,
        gstPercent: 18,
        discountPercent: 5,
        subtotal: 46.55,
        taxAmount: 8.38,
        total: 54.93,
        expiryDate: "2026-10-01"
      }
    ],
    subtotal: 150.95,
    discountTotal: 14.05,
    taxTotal: 13.60,
    grandTotal: 164.55,
    paymentMode: "card",
    paymentStatus: "paid",
    paidAmount: 164.55,
    dueAmount: 0
  }
];

export const initialPurchaseOrders: PurchaseOrder[] = [
  {
    id: "po-101",
    poNumber: "PO-2026-041",
    date: "2026-07-25",
    supplierId: "sup-201",
    supplierName: "Apex Pharma Wholesalers",
    items: [
      {
        medicineId: "med-001",
        medicineName: "Dolo 650 Tablet",
        genericName: "Paracetamol (650mg)",
        category: "Tablet",
        manufacturer: "Micro Labs Ltd",
        batchNumber: "DL650-24B01",
        expiryDate: "2027-05-15",
        costPrice: 1.80,
        sellingPrice: 3.20,
        quantity: 200,
        unit: "Strip of 15",
        rackLocation: "Rack A1-S2",
        total: 360.00
      },
      {
        medicineId: "med-003",
        medicineName: "Pantocid 40",
        genericName: "Pantoprazole (40mg)",
        category: "Tablet",
        manufacturer: "Sun Pharma",
        batchNumber: "PAN40-24A12",
        expiryDate: "2027-01-10",
        costPrice: 6.00,
        sellingPrice: 9.80,
        quantity: 100,
        unit: "Strip of 15",
        rackLocation: "Rack A2-S4",
        total: 600.00
      }
    ],
    totalAmount: 960.00,
    paymentStatus: "partial",
    paidAmount: 510.00,
    dueAmount: 450.00,
    notes: "Stock refill for tablets"
  },
  {
    id: "po-102",
    poNumber: "PO-2026-042",
    date: "2026-07-10",
    supplierId: "sup-202",
    supplierName: "MedPlus Logistics & Dist",
    items: [
      {
        medicineId: "med-006",
        medicineName: "Insulin Glargine Penfill 100IU",
        genericName: "Recombinant Human Insulin",
        category: "Injection",
        manufacturer: "Sanofi India",
        batchNumber: "INS100-24K02",
        expiryDate: "2026-11-30",
        costPrice: 42.00,
        sellingPrice: 58.00,
        quantity: 15,
        unit: "3ml Penfill",
        rackLocation: "Cold Storage Refrigerator #1",
        total: 630.00
      }
    ],
    totalAmount: 630.00,
    paymentStatus: "paid",
    paidAmount: 630.00,
    dueAmount: 0.00,
    notes: "Cold chain shipment received"
  }
];

export const initialExpiryLogs: ExpiryActionLog[] = [
  {
    id: "exp-001",
    medicineId: "med-005",
    medicineName: "Azithral 500mg",
    batchNumber: "AZI500-23M09",
    quantity: 10,
    costPrice: 8.40,
    totalLoss: 84.00,
    expiryDate: "2026-07-25",
    actionDate: "2026-07-28",
    action: "returned_to_supplier",
    supplierName: "Apex Pharma Wholesalers",
    notes: "Returned expired batch for 80% vendor credit"
  }
];

export const monthlySalesChartData = [
  { month: 'Feb', sales: 4200, profit: 1250, cogs: 2950, prescriptions: 180 },
  { month: 'Mar', sales: 4850, profit: 1420, cogs: 3430, prescriptions: 210 },
  { month: 'Apr', sales: 5100, profit: 1580, cogs: 3520, prescriptions: 225 },
  { month: 'May', sales: 5600, profit: 1750, cogs: 3850, prescriptions: 250 },
  { month: 'Jun', sales: 6100, profit: 1910, cogs: 4190, prescriptions: 280 },
  { month: 'Jul', sales: 6450, profit: 2050, cogs: 4400, prescriptions: 305 },
  { month: 'Aug (Est)', sales: 6900, profit: 2210, cogs: 4690, prescriptions: 330 }
];
