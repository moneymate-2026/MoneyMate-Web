import React, { useState, useEffect } from 'react';
import MerchantSidebar from '../components/MerchantSidebar';
import MerchantNavbar from '../components/MerchantNavbar';
import MerchantBottomNav from '../components/MerchantBottomNav';
import { gatewayClient } from '../../api/gatewayClient';

export default function EarningsReports({ navigate, showToast }) {
  const currentPath = '/merchant/earnings-reports';
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [balance, setBalance] = useState(0.00);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [history, setHistory] = useState([]);
  const [totalScans, setTotalScans] = useState(1204);
  const [premiumPoints, setPremiumPoints] = useState(850);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarningsData = async () => {
      try {
        const response = await gatewayClient.getDashboardData();
        if (response.success && response.data) {
          setBalance(response.data.balance || 0);
          
          const txs = response.data.transactions || [];
          const mappedHistory = txs.map((tx, idx) => ({
            title: tx.reward === '$2.40' ? 'Premium VIP Scan' : 'Storefront Scan Campaign',
            id: `#QR-882${idx}`,
            time: tx.time,
            amount: parseFloat(tx.amount.replace('$', '')),
            status: tx.status,
            icon: tx.reward === '$2.40' ? 'star' : 'qr_code',
            premium: tx.reward === '$2.40',
          }));
          setHistory(mappedHistory);

          const customerStat = response.data.stats?.find(s => s.title === "Customers Rewarded");
          if (customerStat) {
            setTotalScans(parseInt(customerStat.value.replace(/,/g, '')) || 1204);
          }
        }
      } catch (error) {
        console.error('Failed to load earnings data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEarningsData();
  }, []);

  const handleRedeem = async () => {
    if (balance <= 0) {
      if (showToast) showToast('Available balance is $0.00. Earn more rewards to redeem!', 'error');
      return;
    }
    if (!isConfirmed) {
      if (showToast) showToast('Please check the confirmation box to authorize bank transfer.', 'info');
      return;
    }
    try {
      await gatewayClient.redeemBalance();
      if (showToast) {
        showToast(`Successfully initiated redemption of $${balance.toFixed(2)}! Funds will settle in 1-2 business days.`, 'success');
      }
      setBalance(0);
      setIsConfirmed(false);
    } catch (error) {
      if (showToast) showToast(error.message || 'Failed to process bank transfer', 'error');
    }
  };

  const filteredHistory = history.filter((item) => {
    // Filter by search query
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by date range tabs
    if (!matchesSearch) return false;
    if (activeFilter === 'All') return true;
    if (activeFilter === 'This Week') return item.time.includes('Today') || item.time.includes('Yesterday');
    if (activeFilter === 'This Month') return !item.time.includes('Oct 23');
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-on-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
          <p className="font-body-md text-on-surface-variant">Loading Rewards Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <MerchantSidebar currentPath={currentPath} navigate={navigate} />

      {/* Main Container */}
      <div className="flex-grow md:ml-64 flex flex-col">
        {/* Top Navbar */}
        <MerchantNavbar currentPath={currentPath} navigate={navigate} />

        {/* Page Content */}
        <main className="p-6 md:p-8 space-y-8 max-w-7xl w-full mx-auto pb-24 md:pb-8 flex-grow">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
            <div>
              <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface text-3xl">Rewards Center</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Manage and track your QR scan earnings.</p>
            </div>
            <div className="flex flex-col sm:items-end gap-2">
              <label className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={isConfirmed}
                  onChange={(e) => setIsConfirmed(e.target.checked)}
                  className="rounded border-outline-variant text-primary focus:ring-primary w-4.5 h-4.5 transition-all cursor-pointer"
                />
                <span>Confirm bank transfer authorization</span>
              </label>
              <button 
                onClick={handleRedeem}
                disabled={!isConfirmed && balance > 0}
                className={`bg-primary hover:bg-primary/95 text-on-primary font-label-md text-label-md px-6 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 flex items-center gap-2 ${!isConfirmed && balance > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="material-symbols-outlined text-sm">account_balance</span>
                <span>Redeem to Bank</span>
              </button>
            </div>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-scale-up delay-75">
            {/* Balance Hero Card (8 cols) */}
            <div className="lg:col-span-8 bg-white/70 backdrop-blur-md rounded-2xl p-8 border border-outline-variant/30 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[180px]">
              <div className="absolute -right-10 -top-10 w-48 h-48 bg-primary-container rounded-full blur-[80px] opacity-40 pointer-events-none"></div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">payments</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface-variant font-bold text-lg">Available Balance</h3>
                </div>
                
                <div className="flex items-baseline gap-3 pt-2">
                  <span className="font-display-lg text-display-lg text-primary font-bold text-4xl">${balance.toFixed(2)}</span>
                  <span className="font-body-md text-body-md text-tertiary font-semibold bg-tertiary-fixed/30 px-2 py-1 rounded-lg flex items-center gap-1 text-sm">
                    <span className="material-symbols-outlined text-xs">trending_up</span>
                    <span>+12% this week</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats Mini Card (4 cols) */}
            <div className="lg:col-span-4 bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-outline-variant/30 shadow-sm flex flex-col justify-between">
              <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-bold">Quick Stats</h3>
              <div className="space-y-4 mt-4">
                <div className="flex justify-between items-center border-b border-outline-variant/10 pb-3">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm">qr_code_scanner</span>
                    <span className="font-body-sm text-body-sm">Total Scans</span>
                  </div>
                  <span className="font-headline-md text-headline-md font-bold text-on-surface">{totalScans.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm">star_rate</span>
                    <span className="font-body-sm text-body-sm">Premium Points</span>
                  </div>
                  <span className="font-headline-md text-headline-md font-bold text-secondary">{premiumPoints.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="bg-white/70 backdrop-blur-md rounded-xl p-3 border border-outline-variant/30 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 animate-fade-in delay-150">
            <div className="flex items-center bg-surface-container-low rounded-lg px-3 py-2 w-full md:w-auto border border-outline-variant/20 focus-within:border-primary transition-all">
              <span className="material-symbols-outlined text-outline text-lg">search</span>
              <input 
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-body-md font-body-md text-on-surface placeholder:text-outline w-full md:w-64 outline-none ml-2"
              />
            </div>
            
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
              {['All', 'This Month', 'This Week'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`whitespace-nowrap px-4 py-2 rounded-lg font-label-sm text-label-sm border transition-colors ${
                    activeFilter === tab 
                      ? 'bg-primary-container text-on-primary-container border-primary/20' 
                      : 'bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:bg-surface-variant'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Transactions List */}
          <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden animate-slide-in-left delay-200">
            <div className="px-6 py-4 border-b border-outline-variant/20 bg-surface-container-lowest flex justify-between items-center">
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface text-lg">Reward History</h3>
            </div>
            <div className="flex flex-col">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center justify-between p-5 border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors group relative ${
                      item.premium ? 'border-l-4 border-l-secondary-container bg-secondary-fixed/5' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform ${
                        item.premium ? 'bg-secondary-fixed/20 text-secondary border border-secondary/30' : 'bg-primary/10 text-primary'
                      }`}>
                        <span className="material-symbols-outlined">{item.icon}</span>
                      </div>
                      <div>
                        <p className="font-label-md text-label-md text-on-surface font-bold flex items-center gap-1.5">
                          {item.title}
                          {item.premium && (
                            <span className="material-symbols-outlined text-[16px] text-secondary">workspace_premium</span>
                          )}
                        </p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                          {item.time} • ID: {item.id}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <span className={`font-label-sm text-label-sm px-2.5 py-1 rounded-md hidden sm:inline-block ${
                        item.status === 'Settled' 
                          ? 'bg-tertiary-fixed/30 text-tertiary-container' 
                          : 'bg-surface-variant text-on-surface-variant'
                      }`}>
                        {item.status}
                      </span>
                      <span className={`font-headline-md text-headline-md font-bold text-lg ${item.premium ? 'text-secondary' : 'text-on-surface'}`}>
                        +${item.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-on-surface-variant">
                  No reward transactions found matching search filters.
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-outline-variant/20 flex justify-center">
              <button 
                onClick={() => showToast && showToast('Loading older transactions page...', 'info')}
                className="text-primary font-label-md text-label-md hover:bg-primary/5 px-4 py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2"
              >
                <span>View Older Transactions</span>
                <span className="material-symbols-outlined text-sm">arrow_downward</span>
              </button>
            </div>
          </div>
        </main>

        {/* Mobile bottom nav */}
        <MerchantBottomNav currentPath={currentPath} navigate={navigate} />
      </div>
    </div>
  );
}
