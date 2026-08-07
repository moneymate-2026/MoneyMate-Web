import React, { useState, useEffect } from 'react';
import MerchantSidebar from '../components/MerchantSidebar';
import MerchantNavbar from '../components/MerchantNavbar';
import MerchantBottomNav from '../components/MerchantBottomNav';
import { gatewayClient } from '../../api/gatewayClient';

export default function Wallet({ navigate, showToast }) {
  const currentPath = '/merchant/wallet';
  const [balance, setBalance] = useState(0.00);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All'); // All, QR Scanned, Redeemed
  const [walletOverview, setWalletOverview] = useState({
    available_balance: 0,
    formatted_balance: '₹0.00',
    total_earnings: 0,
    formatted_total_earnings: '₹0.00',
    total_redeemed: 0,
    formatted_total_redeemed: '₹0.00'
  });

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setLoading(true);
        // Map UI filter to backend filter
        let backendFilter = 'all';
        if (activeFilter === 'QR Scanned') backendFilter = 'qr_scanned';
        if (activeFilter === 'Redeemed') backendFilter = 'redeemed';
        
        const response = await gatewayClient.getWalletData(backendFilter);
        if (response.success && response.data) {
          setWalletOverview(response.data.overview);
          
          // Map backend history format to UI format
          const formattedHistory = (response.data.transactions || []).map(txn => ({
            id: txn.transaction_id || txn.id,
            title: txn.title,
            type: txn.txn_type === 'redeem' ? 'redeem' : 'qr_scan', // simplifying for UI icon mapping
            subtitle: txn.subtitle,
            amount: txn.amount,
            formattedAmount: txn.formatted_amount,
            date: txn.date + ', ' + txn.time,
            status: 'Completed'
          }));
          
          setHistory(formattedHistory);
        }
      } catch (error) {
        console.error('Failed to load wallet data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWalletData();
  }, [activeFilter]);

  const filteredHistory = history; // Already filtered by backend

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-on-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
          <p className="font-body-md text-on-surface-variant">Loading Wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <MerchantSidebar currentPath={currentPath} navigate={navigate} />

      {/* Main Container */}
      <div className="flex-grow md:ml-[280px] flex flex-col">
        {/* Top Navbar */}
        <MerchantNavbar currentPath={currentPath} navigate={navigate} />

        {/* Page Content */}
        <main className="p-6 md:p-8 space-y-8 w-full pb-24 md:pb-8 flex-grow">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
            <div>
              <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface text-3xl">Wallet</h2>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-scale-up">
            {/* Balance Card */}
            <div className="bg-surface-container rounded-2xl p-6 md:p-8 border border-outline-variant/30 shadow-sm flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-on-surface">
                    <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface-variant font-bold text-lg">Available Balance</h3>
                </div>
                
                <div className="flex items-baseline gap-3 pt-2">
                  <span className="font-display-lg text-display-lg text-on-surface font-bold text-4xl lg:text-5xl tracking-tight">{walletOverview.formatted_balance}</span>
                </div>
              </div>
            </div>

            {/* Total Earnings */}
            <div className="bg-surface-container rounded-2xl p-6 md:p-8 border border-outline-variant/30 shadow-sm flex flex-col justify-between h-full">
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-xl">payments</span>
                  </div>
                  <h4 className="font-label-md text-on-surface-variant font-bold">Total Earnings</h4>
               </div>
               <p className="font-display-sm text-on-surface font-bold text-3xl">{walletOverview.formatted_total_earnings}</p>
            </div>

            {/* Total Redeemed */}
            <div className="bg-surface-container rounded-2xl p-6 md:p-8 border border-outline-variant/30 shadow-sm flex flex-col justify-between h-full">
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-xl">price_check</span>
                  </div>
                  <h4 className="font-label-md text-on-surface-variant font-bold">Total Redeemed</h4>
               </div>
               <p className="font-display-sm text-on-surface font-bold text-3xl">{walletOverview.formatted_total_redeemed}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 w-full overflow-x-auto pt-2 animate-fade-in delay-150">
            {['All', 'QR Scanned', 'Redeemed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`whitespace-nowrap px-6 py-2.5 rounded-full font-label-md text-label-md transition-colors ${
                  activeFilter === tab 
                    ? 'bg-on-surface text-surface shadow-sm font-bold' 
                    : 'bg-surface-container-low text-on-surface-variant border border-outline-variant/30 hover:bg-surface-variant'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Transaction History Table */}
          <div className="bg-surface-container rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden animate-slide-in-left delay-200">
            <div className="px-6 py-5 bg-surface-container-lowest flex justify-between items-center">
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface text-lg">Transaction History</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-y border-outline-variant/20">
                    <th className="px-6 py-4 font-label-md text-on-surface-variant font-bold text-sm uppercase tracking-wider">Transaction ID</th>
                    <th className="px-6 py-4 font-label-md text-on-surface-variant font-bold text-sm uppercase tracking-wider">Type / Details</th>
                    <th className="px-6 py-4 font-label-md text-on-surface-variant font-bold text-sm uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-4 font-label-md text-on-surface-variant font-bold text-sm uppercase tracking-wider text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {filteredHistory.length > 0 ? (
                    filteredHistory.map((item, idx) => (
                      <tr key={idx} className="hover:bg-surface-variant/20 transition-colors group">
                        <td className="px-6 py-4">
                          <span className="font-body-md text-on-surface font-medium">{item.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant">
                              <span className="material-symbols-outlined text-sm">
                                {item.type === 'redeem' ? 'account_balance' : 'qr_code_scanner'}
                              </span>
                            </div>
                            <div>
                              <p className="font-label-md text-on-surface font-bold">{item.title}</p>
                              <p className="font-body-sm text-on-surface-variant text-xs capitalize">{item.type.replace('_', ' ')}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-body-sm text-on-surface-variant">{item.date}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`font-headline-sm font-bold ${item.amount < 0 ? 'text-error' : 'text-on-surface'}`}>
                            {item.formattedAmount}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-on-surface-variant font-body-md">
                        No transactions found for the selected filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </main>

        {/* Mobile bottom nav */}
        <MerchantBottomNav currentPath={currentPath} navigate={navigate} />
      </div>
    </div>
  );
}
