import { useState, useEffect } from "react";
import KpiCard from "../components/KpiCard";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { adminUserService } from "../services/users";
import { adminMerchantService } from "../services/merchants";
import { adminAuditService } from "../services/audit";
import { Users, Store, Wallet, Activity, ArrowUpRight, Gift, Banknote, CreditCard } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const chartData = [];

export default function Overview() {
  const [stats, setStats] = useState({
    users: 0,
    merchants: 0,
    pendingKYC: 0,
    totalRevenue: "₹0",
    rewardPool: "₹0",
    systemWallet: "₹0",
    dailyTransactions: 0,
    recentTransactions: [],
    auditLogs: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [usersRes, merchantsRes, statsRes, auditRes] = await Promise.all([
          adminUserService.getUsers(),
          adminMerchantService.getMerchants(),
          adminMerchantService.getDashboardStats(),
          adminAuditService.getAuditLogs()
        ]);
        
        const pendingCount = merchantsRes.data.filter(m => m.kycStatus === "Pending").length;
        const dashboardStats = statsRes?.data?.data || {};
        
        setStats({
          users: usersRes.total || usersRes.data?.length || 0,
          merchants: merchantsRes.total || merchantsRes.data?.length || 0,
          pendingKYC: pendingCount,
          totalRevenue: `₹${(dashboardStats.total_revenue || 0).toLocaleString('en-IN')}`,
          rewardPool: `₹${(dashboardStats.reward_pool || 0).toLocaleString('en-IN')}`,
          systemWallet: `₹${(dashboardStats.system_wallet || 0).toLocaleString('en-IN')}`,
          dailyTransactions: dashboardStats.daily_transactions || 0,
          recentTransactions: dashboardStats.recent_transactions || [],
          auditLogs: Array.isArray(auditRes) ? auditRes.slice(0, 5) : []
        });
      } catch (error) {
        console.error("Failed to fetch dashboard overview data:", error);
      }
    };
    
    fetchDashboardData();
  }, []);

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KpiCard 
          title="Total Revenue" 
          value={stats.totalRevenue} 
          icon={Banknote} 
        />
        <KpiCard 
          title="Reward Pool" 
          value={stats.rewardPool} 
          icon={Gift} 
        />
        <KpiCard 
          title="System Wallet" 
          value={stats.systemWallet} 
          icon={Wallet} 
        />
        <KpiCard 
          title="Active Users" 
          value={stats.users.toLocaleString()} 
          icon={Users} 
        />
        <KpiCard 
          title="Total Merchants" 
          value={stats.merchants.toLocaleString()} 
          icon={Store} 
        />
        <KpiCard 
          title="Daily Transactions" 
          value={stats.dailyTransactions.toLocaleString()} 
          icon={Activity} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-admin-surface-container border border-admin-outline-variant rounded-xl p-6 shadow-lg flex flex-col">
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
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2b2f3a" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8b92a5', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8b92a5', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1b1e26', borderRadius: '8px', border: '1px solid #2b2f3a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)' }}
                  itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-admin-surface-container border border-admin-outline-variant rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-admin-on-surface mb-6">Recent Audit Logs</h3>
          <div className="space-y-4">
            {stats.auditLogs.length > 0 ? (
              stats.auditLogs.map((log, i) => (
                <div key={i} className="flex gap-4 items-start pb-4 border-b border-admin-outline-variant last:border-0 last:pb-0">
                  <div className="mt-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-admin-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-admin-on-surface leading-tight">
                      {log.admin_name} ({log.admin_role}) {log.action} in {log.module}
                    </p>
                    <p className="text-xs text-admin-on-surface-variant mt-1">
                      {new Date(log.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-admin-on-surface-variant">No recent audit logs found.</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-admin-surface-container border border-admin-outline-variant rounded-xl shadow-lg overflow-hidden flex flex-col">
        <div className="p-6 border-b border-admin-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-admin-on-surface">Recent Transactions</h3>

          </div>
          <button className="text-sm font-semibold text-admin-primary hover:bg-admin-surface-container px-4 py-2 rounded-lg transition-colors">
            View All
          </button>
        </div>
        <DataTable columns={columns} data={stats.recentTransactions} className="border-0 shadow-none rounded-none" />
      </div>
    </div>
  );
}