import React, { useState } from 'react';
import { Wallet, Banknote, ArrowDownCircle, CheckCircle, Clock, Gift } from "lucide-react";
import KpiCard from "../components/KpiCard";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";

export default function Wallets() {
  const [systemWallet, setSystemWallet] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [rewardPool, setRewardPool] = useState(0);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [rechargeAmount, setRechargeAmount] = useState('');
  
  const [history, setHistory] = useState([]);

  const handleWithdraw = (e) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) return;
    if (amount > totalRevenue) {
      alert("Insufficient funds in Total Revenue");
      return;
    }

    // Process withdrawal
    setTotalRevenue(prev => prev - amount);
    setSystemWallet(prev => prev - amount);
    
    // Add to history
    const newRecord = {
      id: `WD${Math.floor(Math.random() * 1000) + 105}`,
      amount: `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      date: new Date().toISOString().split('T')[0],
      method: "Razorpay",
      status: "Completed",
      type: "Withdrawal"
    };
    
    setHistory([newRecord, ...history]);
    setIsModalOpen(false);
    setWithdrawAmount('');
  };

  const handleRecharge = (e) => {
    e.preventDefault();
    const amount = parseFloat(rechargeAmount);
    if (isNaN(amount) || amount <= 0) return;

    setRewardPool(prev => prev + amount);
    
    const newRecord = {
      id: `RC${Math.floor(Math.random() * 1000) + 105}`,
      amount: `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      date: new Date().toISOString().split('T')[0],
      method: "Bank Transfer",
      status: "Completed",
      type: "Recharge"
    };
    
    setHistory([newRecord, ...history]);
    setIsRechargeModalOpen(false);
    setRechargeAmount('');
  };

  const columns = [
    { header: "Transaction ID", accessor: "id" },
    { header: "Type", accessor: "type" },
    { header: "Amount", accessor: "amount" },
    { header: "Date", accessor: "date" },
    { header: "Method", accessor: "method" },
    { 
      header: "Status", 
      render: (row) => (
        <StatusBadge 
          status={row.status} 
          variant={row.status === "Completed" ? "success" : "warning"} 
        />
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-[24px] font-bold text-admin-on-surface tracking-tight">Wallets</h2>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsRechargeModalOpen(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold shadow-md shadow-green-600/20 hover:bg-green-700 transition-all flex items-center gap-2"
          >
            Recharge Reward Pool <CheckCircle className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            Withdraw Funds <ArrowDownCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard 
          title="System Wallet" 
          value={`₹${systemWallet.toLocaleString('en-IN')}`}
          trend="up" 
          trendValue="3.1%" 
          icon={Wallet} 
        />
        <KpiCard 
          title="Total Revenue" 
          value={`₹${totalRevenue.toLocaleString('en-IN')}`} 
          trend="up" 
          trendValue="12.5%" 
          icon={Banknote} 
        />
        <KpiCard 
          title="Reward Pool" 
          value={`₹${rewardPool.toLocaleString('en-IN')}`} 
          trend="up" 
          trendValue="0.0%" 
          icon={Gift} 
        />
      </div>

      <div className="bg-admin-surface-container border border-admin-outline-variant rounded-xl shadow-lg overflow-hidden flex flex-col">
        <div className="p-6 border-b border-admin-outline-variant flex items-center justify-between">
          <h3 className="text-lg font-semibold text-admin-on-surface">Transaction History</h3>
        </div>
        {history.length === 0 ? (
          <div className="p-8 text-center text-admin-on-surface-variant font-medium">No transactions found.</div>
        ) : (
          <DataTable columns={columns} data={history} className="border-0 shadow-none rounded-none" />
        )}
      </div>

      {/* Withdrawal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-admin-surface-container border border-admin-outline-variant rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] ring-1 ring-white/10 w-full max-w-md p-8 transform animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold text-admin-on-surface mb-6">Withdraw to Bank</h3>

            <form onSubmit={handleWithdraw}>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-admin-on-surface mb-2">Amount to Withdraw (INR)</label>
                <input 
                  type="number" 
                  step="0.01"
                  max={totalRevenue}
                  required
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full bg-admin-surface border border-admin-outline-variant rounded-lg px-4 py-3 text-admin-on-surface text-lg outline-none focus:border-admin-primary focus:ring-1 focus:ring-admin-primary transition-all placeholder:text-admin-on-surface-variant/50"
                  placeholder="e.g. 1500.00"
                />
                <p className="text-xs text-admin-on-surface-variant mt-2 flex justify-between">
                  <span>Available balance:</span>
                  <span className="font-bold text-admin-on-surface">₹{totalRevenue.toLocaleString('en-IN')}</span>
                </p>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg font-semibold text-admin-on-surface hover:bg-admin-surface transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-admin-primary hover:bg-admin-primary-container text-admin-on-primary rounded-lg font-semibold shadow-lg shadow-admin-primary/20 transition-all flex items-center gap-2"
                >
                  Withdraw via Razorpay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recharge Modal */}
      {isRechargeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-admin-surface-container border border-admin-outline-variant rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] ring-1 ring-white/10 w-full max-w-md p-8 transform animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold text-admin-on-surface mb-6">Recharge Reward Pool</h3>

            <form onSubmit={handleRecharge}>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-admin-on-surface mb-2">Amount to Add (INR)</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(e.target.value)}
                  className="w-full bg-admin-surface border border-admin-outline-variant rounded-lg px-4 py-3 text-admin-on-surface text-lg outline-none focus:border-admin-primary focus:ring-1 focus:ring-admin-primary transition-all placeholder:text-admin-on-surface-variant/50"
                  placeholder="e.g. 10000.00"
                />
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button 
                  type="button"
                  onClick={() => setIsRechargeModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg font-semibold text-admin-on-surface hover:bg-admin-surface transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow-lg shadow-green-600/20 transition-all flex items-center gap-2"
                >
                  Confirm Recharge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}