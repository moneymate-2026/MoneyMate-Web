import KpiCard from "../components/KpiCard";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { Users, Store, Wallet, Activity, ArrowUpRight } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const chartData = [
  { name: "Mon", revenue: 4000 },
  { name: "Tue", revenue: 3000 },
  { name: "Wed", revenue: 2000 },
  { name: "Thu", revenue: 2780 },
  { name: "Fri", revenue: 1890 },
  { name: "Sat", revenue: 2390 },
  { name: "Sun", revenue: 3490 },
];

const recentTransactions = [
  { id: "TXN-001", user: "Alice Smith", amount: "$1,200.00", date: "2026-07-23", status: "Completed" },
  { id: "TXN-002", user: "Bob Jones", amount: "$450.00", date: "2026-07-23", status: "Pending" },
  { id: "TXN-003", user: "Charlie Davis", amount: "$3,400.00", date: "2026-07-22", status: "Completed" },
  { id: "TXN-004", user: "Diana Evans", amount: "$150.00", date: "2026-07-22", status: "Failed" },
  { id: "TXN-005", user: "Ethan Hall", amount: "$890.00", date: "2026-07-21", status: "Completed" },
];

export default function Overview() {
  const columns = [
    { header: "Transaction ID", accessor: "id" },
    { header: "User", accessor: "user" },
    { header: "Amount", accessor: "amount" },
    { header: "Date", accessor: "date" },
    { 
      header: "Status", 
      render: (row) => (
        <StatusBadge 
          status={row.status} 
          variant={
            row.status === "Completed" ? "success" : 
            row.status === "Pending" ? "warning" : "error"
          } 
        />
      )
    },
    {
      header: "Action",
      render: () => (
        <button className="text-admin-primary font-semibold hover:underline">View</button>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-[24px] font-bold text-admin-on-surface tracking-tight">Dashboard Overview</h2>
        <button className="px-4 py-2 bg-admin-primary text-admin-on-primary rounded-lg font-semibold shadow-md shadow-admin-primary/20 hover:bg-admin-primary-container transition-all flex items-center gap-2">
          Generate Report <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          title="Total Revenue" 
          value="$124,500" 
          trend="up" 
          trendValue="12.5%" 
          icon={Wallet} 
        />
        <KpiCard 
          title="Active Users" 
          value="45,231" 
          trend="up" 
          trendValue="8.2%" 
          icon={Users} 
        />
        <KpiCard 
          title="Total Merchants" 
          value="1,240" 
          trend="up" 
          trendValue="4.1%" 
          icon={Store} 
        />
        <KpiCard 
          title="Daily Transactions" 
          value="8,432" 
          trend="down" 
          trendValue="2.4%" 
          icon={Activity} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-admin-outline-variant rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-admin-on-surface">Revenue Trend</h3>
            <select className="bg-admin-surface-container text-admin-on-surface text-sm rounded-md px-3 py-1.5 border border-admin-outline-variant outline-none focus:border-admin-primary">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3525cd" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3525cd" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e1ee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#777587', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#777587', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e4e1ee', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#3525cd', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3525cd" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-admin-outline-variant rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-admin-on-surface mb-6">Action Items</h3>
          <div className="space-y-4">
            {[
              { title: "Review 14 Pending KYC requests", time: "2 hours ago", type: "warning" },
              { title: "Approve Merchant payout batches", time: "4 hours ago", type: "info" },
              { title: "System configuration update required", time: "1 day ago", type: "error" },
              { title: "New admin account created", time: "2 days ago", type: "success" }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 items-start pb-4 border-b border-admin-outline-variant last:border-0 last:pb-0">
                <div className="mt-1">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    item.type === 'warning' ? 'bg-amber-500' :
                    item.type === 'error' ? 'bg-admin-error' :
                    item.type === 'success' ? 'bg-green-500' :
                    'bg-admin-primary'
                  }`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-admin-on-surface leading-tight">{item.title}</p>
                  <p className="text-xs text-admin-on-surface-variant mt-1">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-admin-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-admin-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-admin-on-surface">Recent Transactions</h3>
            <p className="text-sm text-admin-on-surface-variant mt-1">Latest financial activities across the platform.</p>
          </div>
          <button className="text-sm font-semibold text-admin-primary hover:bg-admin-surface-container px-4 py-2 rounded-lg transition-colors">
            View All
          </button>
        </div>
        <DataTable columns={columns} data={recentTransactions} className="border-0 shadow-none rounded-none" />
      </div>
    </div>
  );
}