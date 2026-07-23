import React, { useState, useEffect } from 'react';
import MerchantSidebar from '../components/MerchantSidebar';
import MerchantNavbar from '../components/MerchantNavbar';
import MerchantBottomNav from '../components/MerchantBottomNav';
import StatCard from '../components/StatCard';
import { gatewayClient } from '../../api/gatewayClient';

export default function PaymentQR({ navigate, showToast }) {
  const currentPath = '/merchant/payment-qr';
  const [merchantId, setMerchantId] = useState('MM-9823-XA');
  const [copiedId, setCopiedId] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [stats, setStats] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQRDetails = async () => {
      try {
        const response = await gatewayClient.getDashboardData();
        if (response.success && response.data) {
          setMerchantId(response.data.merchantId || 'MM-9823-XA');
          
          const txs = response.data.transactions || [];
          const mappedTxs = txs.map(tx => ({
            date: tx.time.split(',')[0],
            time: tx.time.split(',')[1] || '',
            customer: tx.customer,
            avatar: tx.initial,
            avatarBg: tx.color,
            amount: tx.amount,
            reward: tx.reward,
          }));
          setRecentTransactions(mappedTxs);

          const volumeVal = txs.reduce((acc, tx) => acc + parseFloat(tx.amount.replace('$', '')), 0);
          setStats([
            {
              title: "Today's Scans",
              value: `${txs.length} Scans`,
              icon: "qr_code_scanner",
              iconColorClass: "text-primary bg-primary/10",
              borderClass: "border-l-primary",
              trend: { text: "+12% from yesterday", type: "up" }
            },
            {
              title: "Scan Volume",
              value: `$${volumeVal.toFixed(2)}`,
              icon: "payments",
              iconColorClass: "text-tertiary bg-tertiary/10",
              borderClass: "border-l-tertiary",
              trend: { text: "+5% from yesterday", type: "up" }
            }
          ]);
        }
      } catch (error) {
        console.error('Failed to load QR details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQRDetails();
  }, []);

  const handleCopyId = () => {
    navigator.clipboard.writeText(merchantId);
    setCopiedId(true);
    if (showToast) showToast('Merchant ID copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(`https://moneymate.com/pay/${merchantId}`);
    setCopiedLink(true);
    if (showToast) showToast('Payment link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-on-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
          <p className="font-body-md text-on-surface-variant">Loading QR Details...</p>
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
          <div className="animate-fade-in">
            <h2 className="font-headline-lg text-headline-lg font-bold text-on-background text-3xl">My QR Code</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Display this QR code at checkout or share it digitally to accept quick payments and reward your customers.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* QR Card (Left Side) */}
            <div className="lg:col-span-5 flex flex-col gap-6 animate-scale-up">
              <div className="bg-white rounded-[24px] p-8 flex flex-col items-center justify-center shadow-lg border border-outline-variant/30 relative overflow-hidden group">
                {/* Decorative gradients */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/5 rounded-full blur-2xl -ml-16 -mb-16 pointer-events-none"></div>
                
                {/* QR Image Container */}
                <div className="w-full max-w-[280px] aspect-square bg-white rounded-2xl shadow-sm border border-outline-variant/20 p-4 mb-8 flex items-center justify-center relative">
                  <img 
                    alt="Merchant QR Code" 
                    className="w-full h-full object-contain mix-blend-multiply" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAvl5_YVgFLWnrbPpOqi2wFK0PrV0vldKnaUb8Ggd1GAj50QQzTqlvXDTRnFo6WjHaVlRh63PdwNCqD6_lhgAAAc0XNXBFOkgUQVcNGXkJsAqD0BoJbkHafvIYblYjLy0Z86_a_yhEHJRT7hWBOtgSlhm_X5VjFw0b9QH_TuN_iwKDdZJPoLherznUnp7evyli8edXylOkpxMES5vpUzpgHHVk4sVri_etsi3nNZuWwz4cGUc4IuAgK"
                  />
                  {/* Central Logo Overlay */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-1.5 shadow-md">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">M</div>
                  </div>
                </div>

                <div className="text-center w-full space-y-3 relative z-10">
                  <h3 className="font-headline-md text-headline-md text-on-background font-bold text-xl">MoneyMate Merchant</h3>
                  <div className="flex items-center justify-center gap-2">
                    <span className="bg-surface-variant text-on-surface-variant font-label-sm text-label-sm px-3.5 py-1.5 rounded-full font-mono select-all select-none">
                      ID: {merchantId}
                    </span>
                    <button 
                      onClick={handleCopyId}
                      className="text-primary hover:text-primary-fixed-variant transition-colors p-1.5 rounded-lg hover:bg-primary/5" 
                      title="Copy ID"
                    >
                      <span className="material-symbols-outlined text-sm">
                        {copiedId ? 'check' : 'content_copy'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Action grid */}
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => showToast && showToast('Downloading high-resolution PNG QR print asset...', 'success')}
                  className="bg-primary text-on-primary font-label-md text-label-md py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  <span>Download</span>
                </button>
                <button 
                  onClick={() => window.print()}
                  className="bg-white border-2 border-primary text-primary font-label-md text-label-md py-3.5 rounded-xl hover:bg-surface-container transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">print</span>
                  <span>Print Standee</span>
                </button>
                <button 
                  onClick={handleShareLink}
                  className="col-span-2 bg-white border border-outline-variant text-on-surface font-label-md text-label-md py-3.5 rounded-xl hover:bg-surface-container transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">
                    {copiedLink ? 'check' : 'share'}
                  </span>
                  <span>{copiedLink ? 'Link Copied!' : 'Share Digital Pay Link'}</span>
                </button>
              </div>

              {/* How Customer Earn */}
              <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/20 shadow-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 h-full w-1 bg-tertiary"></div>
                <h4 className="font-headline-sm text-headline-sm text-on-background font-bold mb-4 flex items-center gap-2 text-md">
                  <span className="material-symbols-outlined text-tertiary">info</span>
                  <span>How Customers Earn</span>
                </h4>
                <ol className="space-y-3 font-body-sm text-body-sm text-on-surface-variant list-decimal list-inside marker:text-primary marker:font-bold">
                  <li>Customer scans QR code using their MoneyMate app.</li>
                  <li>They enter the total bill amount and confirm payment.</li>
                  <li>Payment is settled instantly; they earn 2% cashback.</li>
                </ol>
              </div>
            </div>

            {/* Stats & Transactions (Right Side) */}
            <div className="lg:col-span-7 space-y-6 flex flex-col h-full animate-slide-in-right delay-100">
              {/* Quick stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stats.map((stat, idx) => (
                  <StatCard key={idx} {...stat} />
                ))}
              </div>

              {/* Recent QR Transactions Card */}
              <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden flex flex-col flex-grow">
                <div className="p-6 border-b border-outline-variant/20 flex items-center justify-between bg-white/40">
                  <h3 className="font-headline-md text-headline-md font-bold text-on-background text-lg">Recent QR Transactions</h3>
                  <button 
                    onClick={() => navigate('/merchant/earnings-reports')}
                    className="text-primary font-label-sm text-label-sm hover:underline flex items-center gap-1"
                  >
                    <span>View All</span>
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-lowest font-label-sm text-label-sm text-on-surface-variant border-b border-outline-variant/20">
                        <th className="p-4 font-semibold">Date &amp; Time</th>
                        <th className="p-4 font-semibold">Customer</th>
                        <th className="p-4 font-semibold text-right">Amount</th>
                        <th className="p-4 font-semibold text-right">Reward Issued</th>
                      </tr>
                    </thead>
                    <tbody className="font-body-sm text-body-sm text-on-background">
                      {recentTransactions.map((tx, idx) => (
                        <tr key={idx} className="border-b border-outline-variant/10 hover:bg-surface-container-lowest/50 transition-colors">
                          <td className="p-4">
                            <div className="font-medium">{tx.date}</div>
                            <div className="text-on-surface-variant text-xs mt-0.5">{tx.time}</div>
                          </td>
                          <td className="p-4 flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${tx.avatarBg}`}>
                              {tx.avatar}
                            </div>
                            <span className="font-medium">{tx.customer}</span>
                          </td>
                          <td className="p-4 text-right font-semibold">{tx.amount}</td>
                          <td className="p-4 text-right">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-tertiary/10 text-tertiary font-label-sm text-label-sm font-semibold">
                              {tx.reward}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Mobile bottom nav */}
        <MerchantBottomNav currentPath={currentPath} navigate={navigate} />
      </div>
    </div>
  );
}
