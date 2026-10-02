import React, { useState } from 'react';
import { SaleInvoice, Medicine, ExpiryActionLog } from '../../types';
import { monthlySalesChartData } from '../../data/mockData';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  FileSpreadsheet, 
  Printer, 
  PieChart as PieIcon, 
  ArrowUpRight,
  ArrowDownRight,
  Calendar
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface ReportsAnalyticsProps {
  invoices: SaleInvoice[];
  medicines: Medicine[];
  expiryLogs: ExpiryActionLog[];
}

export const ReportsAnalytics: React.FC<ReportsAnalyticsProps> = ({
  invoices,
  medicines,
  expiryLogs,
}) => {
  const [reportPeriod, setReportPeriod] = useState<'current' | 'last_month' | 'quarter'>('current');

  // Calculate Real-Time Monthly P&L Numbers
  const totalRevenue = invoices.reduce((acc, inv) => acc + inv.grandTotal, 0);
  const totalDiscounts = invoices.reduce((acc, inv) => acc + inv.discountTotal, 0);
  
  // Estimate COGS (approx 65% of subtotal based on pharmacy margins)
  const estimatedCOGS = totalRevenue * 0.62;
  const grossProfit = totalRevenue - estimatedCOGS;

  // Expiry losses
  const expiryLossTotal = expiryLogs.reduce((acc, log) => acc + log.totalLoss, 0);

  // Net Profit
  const netProfit = grossProfit - totalDiscounts - expiryLossTotal;
  const profitMarginPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Top Sold Items Ranking
  const medicineSalesMap: Record<string, { name: string; qty: number; revenue: number }> = {};
  invoices.forEach(inv => {
    inv.items.forEach(item => {
      if (!medicineSalesMap[item.medicineName]) {
        medicineSalesMap[item.medicineName] = { name: item.medicineName, qty: 0, revenue: 0 };
      }
      medicineSalesMap[item.medicineName].qty += item.quantity;
      medicineSalesMap[item.medicineName].revenue += item.total;
    });
  });

  const topSellingMedicines = Object.values(medicineSalesMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const pieColors = ['#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6'];

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "RxHub Pharmacy Monthly P&L Report\n\n";
    csvContent += `Gross Revenue,${totalRevenue.toFixed(2)}\n`;
    csvContent += `Cost of Goods Sold,${estimatedCOGS.toFixed(2)}\n`;
    csvContent += `Gross Profit,${grossProfit.toFixed(2)}\n`;
    csvContent += `Expiry Loss,${expiryLossTotal.toFixed(2)}\n`;
    csvContent += `Net Profit,${netProfit.toFixed(2)}\n`;
    csvContent += `Profit Margin %,${profitMarginPercent.toFixed(1)}%\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `RxHub_PL_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            <span>Monthly Sales & Profit / Loss Statements</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Financial analytics, COGS margin breakdown and top revenue generating pharmaceuticals
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gross Sales Revenue</p>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">${totalRevenue.toFixed(2)}</h3>
          <p className="text-xs text-emerald-600 font-medium flex items-center mt-1">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            <span>{invoices.length} Total Sales Invoices</span>
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cost of Goods Sold (COGS)</p>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">${estimatedCOGS.toFixed(2)}</h3>
          <p className="text-xs text-slate-500 mt-1">Stock purchase wholesale cost</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Profit</p>
          <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">${netProfit.toFixed(2)}</h3>
          <p className="text-xs text-emerald-600 font-semibold mt-1">
            {profitMarginPercent.toFixed(1)}% Net Profit Margin
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Disposal & Expiry Loss</p>
          <h3 className="text-2xl font-extrabold text-rose-600 mt-1">${expiryLossTotal.toFixed(2)}</h3>
          <p className="text-xs text-slate-500 mt-1">Deducted from gross profit</p>
        </div>

      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales & Profit Area Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Monthly Revenue & Net Profit Trend</h3>
              <p className="text-xs text-slate-500">Historical performance across recent months</p>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySalesChartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="sales" name="Gross Sales ($)" stroke="#10b981" fillOpacity={1} fill="url(#colorSales)" strokeWidth={2} />
                <Area type="monotone" dataKey="profit" name="Net Profit ($)" stroke="#3b82f6" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Itemized Profit & Loss Breakdown Card (1 col) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base border-b border-slate-100 dark:border-slate-800 pb-3">
            P&L Financial Statement
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-300 font-semibold">Gross Sales Revenue:</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono">${totalRevenue.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800 text-rose-600">
              <span>Less: Cost of Goods (COGS):</span>
              <span className="font-bold font-mono">-${estimatedCOGS.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800 font-bold text-slate-900 dark:text-white">
              <span>Gross Profit Margin:</span>
              <span className="font-mono">${grossProfit.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800 text-slate-500">
              <span>Less: Patient Discounts Allowed:</span>
              <span className="font-mono">-${totalDiscounts.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800 text-rose-600">
              <span>Less: Expired Goods Disposal Loss:</span>
              <span className="font-mono">-${expiryLossTotal.toFixed(2)}</span>
            </div>

            <div className="pt-2 flex justify-between items-center font-extrabold text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
              <span>Final Net Profit:</span>
              <span className="font-mono text-base">${netProfit.toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Top Selling Products Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
        <h3 className="font-bold text-slate-900 dark:text-white text-base">Top Revenue Generating Medicines</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Medicine Product</th>
                <th className="py-2.5 px-3 text-center">Units Sold</th>
                <th className="py-2.5 px-3 text-right">Total Revenue Contribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {topSellingMedicines.map((med, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                  <td className="py-2.5 px-3 font-mono text-slate-400">0{idx + 1}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{med.name}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-slate-700 dark:text-slate-300">{med.qty} Units</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">${med.revenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
