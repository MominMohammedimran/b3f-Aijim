import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ModernAdminLayout from "../../components/admin/ModernAdminLayout";
import {
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  IndianRupee,
  Clock,
  CheckCircle2,
  RefreshCw,
  BarChart2,
  Award,
  Wallet2,
  Download,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>({});
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const { data: ordersData } = await supabase.from("orders").select("*");
      const { count: productsCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });
      const { count: customersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      let totalRevenue = 0,
        pendingAmount = 0,
        paidAmount = 0,
        refunds = 0;

      ordersData?.forEach((order) => {
        totalRevenue += order.total;
        if (order.payment_status === "paid") paidAmount += order.total;
        if (order.payment_status === "pending") pendingAmount += order.total;
        if (order.payment_status?.includes("refund")) refunds += order.total;
      });

      const avgOrderValue =
        ordersData?.length > 0 ? totalRevenue / ordersData.length : 0;
      const conversionRate = Math.min(
        100,
        Math.round((ordersData.length / ((customersCount || 1) + 1)) * 100)
      );

      setStats({
        orders: ordersData?.length || 0,
        products: productsCount || 0,
        customers: customersCount || 0,
        totalRevenue,
        pendingAmount,
        paidAmount,
        refunds,
        avgOrderValue,
        conversionRate,
      });

      setTopProducts(computeTopProducts(ordersData || []));
      setTopCustomers(computeTopCustomers(ordersData || []));
    } finally {
      setLoading(false);
    }
  };

  const computeTopProducts = (orders: any[]) => {
    const map: Record<string, { name: string; count: number }> = {};
    orders.forEach((order) =>
      order.items?.forEach((item: any) => {
        map[item.name] = map[item.name] || { name: item.name, count: 0 };
        map[item.name].count += item.sizes?.reduce((a, s) => a + s.quantity, 0);
      })
    );
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 5);
  };

  const computeTopCustomers = (orders: any[]) => {
    const map: Record<string, { email: string; total: number }> = {};
    orders.forEach((order) => {
      const email = order.user_email || "unknown";
      map[email] = map[email] || { email, total: 0 };
      map[email].total += order.total;
    });
    return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 5);
  };

  /** -------- PDF EXPORT -------- **/
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("AIJIM - Monthly Business Report", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

    autoTable(doc, {
      startY: 35,
      head: [["Metric", "Value"]],
      body: [
        ["Total Orders", stats.orders],
        ["Total Products", stats.products],
        ["Total Customers", stats.customers],
        ["Total Revenue", `₹${stats.totalRevenue.toLocaleString()}`],
        ["Pending Amount", `₹${stats.pendingAmount.toLocaleString()}`],
        ["Paid Amount", `₹${stats.paidAmount.toLocaleString()}`],
        ["Refunds", `₹${stats.refunds.toLocaleString()}`],
        ["Average Order Value", `₹${stats.avgOrderValue.toFixed(2)}`],
        ["Conversion Rate", `${stats.conversionRate}%`],
      ],
    });

    let currentY = 60;
    
    autoTable(doc, {
      startY: currentY,
      head: [["Top Products", "Units Sold"]],
      body: topProducts.map((p) => [p.name, p.count]),
    });

    currentY = (doc as any).lastAutoTable?.finalY || currentY + 40;

    autoTable(doc, {
      startY: currentY + 10,
      head: [["Top Customers", "Total Spent"]],
      body: topCustomers.map((c) => [c.email, `₹${c.total}`]),
    });

    doc.save("AIJIM_Monthly_Report.pdf");
  };

  /** -------- CSV EXPORT -------- **/
  const exportCSV = () => {
    const headers = [
      "Metric,Value",
      "Total Orders," + stats.orders,
      "Total Products," + stats.products,
      "Total Customers," + stats.customers,
      "Total Revenue,₹" + stats.totalRevenue,
      "Pending Amount,₹" + stats.pendingAmount,
      "Paid Amount,₹" + stats.paidAmount,
      "Refunds,₹" + stats.refunds,
      "Average Order Value,₹" + stats.avgOrderValue.toFixed(2),
      "Conversion Rate," + stats.conversionRate + "%",
      "",
      "Top Products,Units Sold",
      ...topProducts.map((p) => `${p.name},${p.count}`),
      "",
      "Top Customers,Total Spent",
      ...topCustomers.map((c) => `${c.email},₹${c.total}`),
    ].join("\n");

    const blob = new Blob([headers], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "AIJIM_Monthly_Report.csv");
    link.click();
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
  }: {
    title: string;
    value: string | number;
    icon: any;
    color: string;
  }) => (
    <div className="p-1 bg-gray-900 border border-gray-700 rounded-none">
      <div className="flex justify-between">
        <p className="text-xs text-gray-400 uppercase">{title}</p>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </div>
  );

 return (
  <ModernAdminLayout title="Dashboard">
    <div className="bg-black min-h-screen p-1 text-white space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-yellow-400">
            Admin Dashboard
          </h1>
          <p className="text-xs md:text-sm text-gray-400">
            Real-time analytics, trends & exportable reports
          </p>
        </div>

        <div className="flex gap-2 md:gap-3 w-full md:w-auto">
          <button
            onClick={exportPDF}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 text-xs md:text-sm font-semibold rounded-none"
          >
            <Download className="w-4 h-4" /> PDF
          </button>

          <button
            onClick={exportCSV}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-xs md:text-sm font-semibold rounded-none"
          >
            <Download className="w-4 h-4" /> CSV
          </button>
        </div>
      </div>

      {/* Quick Stats - Scroll horizontal on mobile */}
      <div className="flex md:grid md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto snap-x snap-mandatory pb-2">
        {[
          { title: "Orders", value: stats.orders, icon: ShoppingCart, color: "text-blue-400" },
          { title: "Products", value: stats.products, icon: Package, color: "text-green-400" },
          { title: "Customers", value: stats.customers, icon: Users, color: "text-pink-400" },
          { title: "Revenue", value: `₹${stats.totalRevenue}`, icon: IndianRupee, color: "text-yellow-400" },
          { title: "Pending", value: `₹${stats.pendingAmount}`, icon: Clock, color: "text-red-400" },
        ].map((stat, i) => (
          <div
            key={i}
            className="snap-center min-w-[150px] p-4 bg-gray-900 border border-gray-700 rounded-none flex-none md:flex-auto"
          >
            <div className="flex justify-between">
              <p className="text-[10px] md:text-xs text-gray-400 uppercase">
                {stat.title}
              </p>
              <stat.icon className={`h-4 w-4 md:h-5 md:w-5 ${stat.color}`} />
            </div>
            <p className="text-lg md:text-2xl font-bold text-white mt-1 whitespace-nowrap">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Top Products */}
      <div className="bg-gray-900 border border-gray-700 p-4 md:p-6 rounded-none">
        <h2 className="text-base md:text-lg font-semibold mb-3">Top Products</h2>

        <ul className="text-sm space-y-2 text-gray-300 max-h-40 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-600">
          {topProducts.map((p, i) => (
            <li key={i} className="flex justify-between">
              <span className="truncate text-xs md:text-md">{p.name}</span>
              <span className="text-yellow-400 text-xs md:text-md">{p.count} sold</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Top Customers */}
      <div className="bg-gray-900 border border-gray-700 p-4 md:p-6 rounded-none">
        <h2 className="text-base md:text-lg font-semibold mb-3">Top Customers</h2>
        <ul className="text-sm space-y-2 text-gray-300 max-h-40 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-600">
          {topCustomers.map((c, i) => (
            <li key={i} className="flex justify-between">
              <span className="truncate">{c.email}</span>
              <span className="text-yellow-400">₹{c.total}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </ModernAdminLayout>
);

};

export default AdminDashboard;
