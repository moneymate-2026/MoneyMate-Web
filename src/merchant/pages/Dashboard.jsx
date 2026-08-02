import React, { useState, useEffect } from 'react';
import MerchantSidebar from '../components/MerchantSidebar';
import MerchantNavbar from '../components/MerchantNavbar';
import MerchantBottomNav from '../components/MerchantBottomNav';
import StatCard from '../components/StatCard';
import { gatewayClient } from '../../api/gatewayClient';

export default function Dashboard({ navigate, showToast }) {
  const currentPath = '/merchant/dashboard';
  const [stats, setStats] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [businessName, setBusinessName] = useState('Your Business');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const response = await gatewayClient.getDashboardData();
        if (response.success && response.data) {
          setStats(response.data.stats || []);
          setTransactions(response.data.transactions || []);
          setCampaigns(response.data.campaigns || []);
        }
        
        const profileResponse = await gatewayClient.getProfile();
        if (profileResponse.success && profileResponse.data) {
          setBusinessName(profileResponse.data.businessName || 'Your Business');
        }
      } catch (error) {
        console.error('Error loading dashboard details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-on-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
          <p className="font-body-md text-on-surface-variant">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <MerchantSidebar currentPath={currentPath} navigate={navigate} />

      <div className="flex-grow md:ml-[280px] flex flex-col min-w-0">
        {/* Top Navbar */}
        <MerchantNavbar currentPath={currentPath} navigate={navigate} />

        {/* Page Content */}
        <main className="p-6 md:px-12 md:py-10 space-y-8 w-full pb-24 md:pb-8 flex-grow">
          {/* Welcome Banner */}
          <div className="bg-surface-container backdrop-blur-md p-6 rounded-2xl border border-outline-variant/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm animate-fade-in">
            <div>
              <h2 className="font-headline-lg text-headline-lg font-bold text-on-background text-2xl md:text-3xl">
                Welcome back, {businessName}
              </h2>
            </div>
            <button 
              onClick={() => navigate('/merchant/payment-qr')}
              className="bg-primary hover:bg-primary/95 text-on-primary font-label-md text-label-md px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-md">qr_code</span>
              <span>My Store QR</span>
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-scale-up delay-75">
            {stats.map((stat, idx) => (
              <StatCard key={idx} {...stat} />
            ))}
          </div>

          {/* Quick Actions & Recent transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Recent Scans Table */}
            <div className="lg:col-span-8 bg-surface-container backdrop-blur-md rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden flex flex-col animate-slide-in-left delay-150">
              <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
                <h3 className="font-headline-md text-headline-md text-on-background font-bold text-lg">Recent QR Scans</h3>
                <button 
                  onClick={() => navigate('/merchant/earnings-reports')}
                  className="text-primary font-label-sm text-label-sm hover:underline flex items-center gap-1"
                >
                  <span>View Reports</span>
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
              <div className="overflow-x-auto flex-grow">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-lowest font-label-sm text-label-sm text-on-surface-variant border-b border-outline-variant/20">
                      <th className="p-4 font-semibold">Date & Time</th>
                      <th className="p-4 font-semibold">Customer</th>
                      <th className="p-4 font-semibold text-right">Bill Amount</th>
                      <th className="p-4 font-semibold text-right">Cashback Issued</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-sm text-body-sm text-on-background">
                    {transactions.map((tx, idx) => (
                      <tr key={idx} className="border-b border-outline-variant/10 hover:bg-surface-container-lowest/50 transition-colors">
                        <td className="p-4">
                          <div>{tx.time}</div>
                        </td>
                        <td className="p-4 flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${tx.color}`}>
                            {tx.initial}
                          </div>
                          <span className="font-medium">{tx.customer}</span>
                        </td>
                        <td className="p-4 text-right font-semibold">{tx.amount}</td>
                        <td className="p-4 text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-xs border border-primary/20">
                            {tx.reward}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Campaign Quick Setup */}
            <div className="lg:col-span-4 bg-surface-container backdrop-blur-md rounded-2xl border border-outline-variant/30 p-6 shadow-sm flex flex-col justify-between animate-slide-in-right delay-150">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">campaign</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md font-bold text-on-background text-lg">Active Campaigns</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    Customers earn double cashback on weekends.
                  </p>
                </div>
                <div className="space-y-3 pt-4 border-t border-outline-variant/20">
                  {campaigns.length === 0 ? (
                    <div className="text-center py-4 text-on-surface-variant font-label-sm">No active campaigns</div>
                  ) : (
                    campaigns.map((camp, idx) => (
                      <div key={camp.id || idx} className="flex justify-between items-center py-2 bg-surface-container-low px-4 rounded-xl border border-outline-variant/20">
                        <span className="font-body-sm text-body-sm text-on-background font-medium">{camp.name}</span>
                        <span className={`font-bold text-xs px-2.5 py-0.5 rounded-full border ${camp.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-surface-container-highest text-on-surface-variant border-outline-variant/30'}`}>
                          {camp.status || 'Active'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <button 
                onClick={() => navigate('/merchant/create-offer')}
                className="w-full mt-6 bg-surface border-2 border-primary text-primary font-label-md text-label-md py-3 rounded-xl hover:bg-surface-container transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-md">add_circle</span>
                <span>Create New Campaign</span>
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
