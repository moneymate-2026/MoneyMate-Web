import React, { useState, useEffect } from 'react';
import MerchantSidebar from '../components/MerchantSidebar';
import MerchantNavbar from '../components/MerchantNavbar';
import MerchantBottomNav from '../components/MerchantBottomNav';
import StatCard from '../components/StatCard';
import { gatewayClient } from '../../api/gatewayClient';

export default function PaymentQR({ navigate, showToast }) {
  const currentPath = '/merchant/payment-qr';
  const [merchantId, setMerchantId] = useState('');
  const [qrCodeBase64, setQrCodeBase64] = useState('');
  const [copiedId, setCopiedId] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [stats, setStats] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQRDetails = async () => {
      try {
        const response = await gatewayClient.getDashboardData();
        const profileResp = await gatewayClient.getProfile();
        
        if (profileResp.success && profileResp.data) {
          const pData = profileResp.data.data || profileResp.data;
          setMerchantId(pData.vpa || pData.displayId || pData.storeId || '');
          if (pData.qr_code_base64) {
             setQrCodeBase64(pData.qr_code_base64);
          } else {
             // Fallback to local storage if API didn't return it but we saved it at registration
             setQrCodeBase64(localStorage.getItem('merchant_qr') || '');
          }
        }

        if (response.success && response.data) {
          const dData = response.data.data || response.data;
          const txs = dData.transactions || [];
          const mappedTxs = txs.map(tx => ({
            date: tx.time ? tx.time.split(',')[0] : '',
            time: tx.time && tx.time.includes(',') ? tx.time.split(',')[1] : '',
            customer: tx.customer,
            avatar: tx.initial,
            avatarBg: tx.color,
            amount: tx.amount,
            reward: tx.reward,
          }));
          setRecentTransactions(mappedTxs);

          const volumeVal = txs.reduce((acc, tx) => acc + parseFloat((tx.amount || '0').replace('$', '')), 0);
          
          let scansStat = dData.stats?.find(s => s.title === 'Customers Rewarded');
          let volumeStat = dData.stats?.find(s => s.title === 'Total QR Scan Volume');

          setStats([
            {
              title: "Total Scans",
              value: scansStat ? `${scansStat.value} Scans` : `${txs.length} Scans`,
              icon: "qr_code_scanner",
              iconColorClass: "text-primary bg-primary/10",
              borderClass: "border-l-primary",
              trend: { 
                text: scansStat ? scansStat.trend.text : "Real-time from DB", 
                type: scansStat ? scansStat.trend.type : "neutral" 
              }
            },
            {
              title: "Scan Volume",
              value: volumeStat ? volumeStat.value : `$${volumeVal.toFixed(2)}`,
              icon: "payments",
              iconColorClass: "text-tertiary bg-tertiary/10",
              borderClass: "border-l-tertiary",
              trend: { 
                text: volumeStat ? volumeStat.trend.text : "Real-time from DB", 
                type: volumeStat ? volumeStat.trend.type : "neutral" 
              }
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

  const handleShareLink = async () => {
    const shareUrl = `https://moneymate.com/pay/${merchantId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Pay via MoneyMate',
          text: 'Scan my QR code or tap the link to pay me via MoneyMate!',
          url: shareUrl,
        });
        if (showToast) showToast('Shared successfully!', 'success');
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      if (showToast) showToast('Payment link copied to clipboard!', 'success');
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleDownloadQR = () => {
    if (!qrCodeBase64) return;
    const link = document.createElement('a');
    link.href = qrCodeBase64.startsWith('data:image') || qrCodeBase64.startsWith('http') ? qrCodeBase64 : `data:image/png;base64,${qrCodeBase64}`;
    link.download = `moneymate-qr-${merchantId || 'merchant'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (showToast) showToast('QR Code downloaded successfully!', 'success');
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
      <div className="flex-grow md:ml-[280px] flex flex-col">
        {/* Top Navbar */}
        <MerchantNavbar currentPath={currentPath} navigate={navigate} />

        {/* Page Content */}
        <main className="p-6 md:px-12 md:py-10 space-y-8 w-full pb-24 md:pb-8 flex-grow">
          {/* Header */}
          <div className="animate-fade-in">
            <h2 className="font-headline-lg text-headline-lg font-bold text-on-background text-3xl">My QR Code</h2>
          
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* QR Card (Left Side) */}
            <div className="lg:col-span-4 flex flex-col gap-6 animate-scale-up">
              <div className="bg-surface-container rounded-[24px] p-8 flex flex-col items-center justify-center border border-outline-variant/40 relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
                {/* Decorative gradients */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/5 rounded-full blur-2xl -ml-16 -mb-16 pointer-events-none"></div>
                
                {/* QR Image Container */}
                <div className="w-full max-w-[160px] aspect-square bg-white rounded-2xl shadow-sm border border-outline-variant/30 p-2.5 mb-5 flex items-center justify-center relative">
                  {qrCodeBase64 ? (
                    <img 
                      alt="Merchant QR Code" 
                      className="w-full h-full object-contain mix-blend-multiply" 
                      src={qrCodeBase64.startsWith('data:image') || qrCodeBase64.startsWith('http') ? qrCodeBase64 : `data:image/png;base64,${qrCodeBase64}`}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant bg-surface-container-low rounded-xl">
                      <span className="material-symbols-outlined text-4xl mb-2 opacity-50">qr_code_2</span>
                      <p className="font-label-md text-sm opacity-80">QR Code not generated yet</p>
                    </div>
                  )}
                  {/* Central Logo Overlay */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-surface-container rounded-full p-1.5 shadow-md">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">M</div>
                  </div>
                </div>

                <div className="text-center w-full space-y-3 relative z-10">
                  <h3 className="font-headline-md text-headline-md text-on-background font-bold text-xl">MoneyMate Merchant</h3>
                  <div className="flex items-center justify-center gap-2">
                    <span className="bg-surface-variant text-on-surface-variant font-label-sm text-label-sm px-3.5 py-1.5 rounded-full font-mono select-all select-none">
                      {merchantId.includes('@') ? 'VPA' : 'ID'}: {merchantId}
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
              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={handleDownloadQR}
                  className="bg-primary text-on-primary font-label-md text-label-md py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  <span>Download</span>
                </button>
                <button 
                  onClick={handleShareLink}
                  className="bg-surface-container border border-outline-variant text-on-surface font-label-md text-label-md py-3.5 rounded-xl hover:bg-surface-container transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">
                    {copiedLink ? 'check' : 'share'}
                  </span>
                  <span>{copiedLink ? 'Link Copied!' : 'Share Digital Pay Link'}</span>
                </button>
              </div>


            </div>

            {/* Stats & Transactions (Right Side) */}
            <div className="lg:col-span-8 space-y-6 flex flex-col h-full animate-slide-in-right delay-100">
              {/* Quick stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stats.map((stat, idx) => (
                  <StatCard key={idx} {...stat} />
                ))}
              </div>

              {/* Recent QR Transactions Card */}
              <div className="bg-surface-container rounded-xl border border-outline-variant/40 shadow-sm overflow-hidden flex flex-col flex-grow min-h-[400px] hover:shadow-md transition-shadow">
                <div className="p-6 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low">
                  <h3 className="font-headline-md text-headline-md font-bold text-on-background text-xl">Recent QR Transactions</h3>
                  <button 
                    onClick={() => navigate('/merchant/earnings-reports')}
                    className="text-primary font-label-sm text-label-sm hover:underline flex items-center gap-1"
                  >
                    <span>View All</span>
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>

                <div className="overflow-x-auto flex-grow">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-lowest font-label-md text-label-md text-on-surface-variant border-b border-outline-variant/20">
                        <th className="px-6 py-5 font-semibold">Date &amp; Time</th>
                        <th className="px-6 py-5 font-semibold">Customer</th>
                        <th className="px-6 py-5 font-semibold text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="font-body-md text-body-md text-on-background">
                      {recentTransactions.map((tx, idx) => (
                        <tr key={idx} className="border-b border-outline-variant/10 hover:bg-surface-container-lowest/50 transition-colors">
                          <td className="px-6 py-5">
                            <div className="font-medium">{tx.date}</div>
                            <div className="text-on-surface-variant text-sm mt-0.5">{tx.time}</div>
                          </td>
                          <td className="px-6 py-5 flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${tx.avatarBg}`}>
                              {tx.avatar}
                            </div>
                            <span className="font-medium">{tx.customer}</span>
                          </td>
                          <td className="px-6 py-5 text-right font-semibold text-lg">{tx.amount}</td>
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
