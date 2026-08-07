import React, { useState, useEffect } from 'react';
import MerchantSidebar from '../components/MerchantSidebar';
import MerchantNavbar from '../components/MerchantNavbar';
import MerchantBottomNav from '../components/MerchantBottomNav';
import { gatewayClient } from '../../api/gatewayClient';

export default function EarningsReports({ navigate, showToast }) {
  const currentPath = '/merchant/earnings-reports';
  const [totalScans, setTotalScans] = useState(0);
  const [totalEarned, setTotalEarned] = useState("₹0.00");
  const [loading, setLoading] = useState(true);
  
  // Track requested milestones
  const [requestedMilestones, setRequestedMilestones] = useState({});

  const milestones = [
    { scans: 100, reward: 1000, description: "Reach 100 total scans to unlock your first major bonus!" },
    { scans: 200, reward: 2500, description: "Keep it up! 200 scans gets you a larger cash reward." },
    { scans: 500, reward: 6000, description: "Incredible volume! Reach 500 scans for the massive bonus." }
  ];

  useEffect(() => {
    const fetchEarningsData = async () => {
      try {
        const response = await gatewayClient.getEarningsData();
        if (response.success && response.data) {
          setTotalScans(response.data.total_scans || 0); 
          setTotalEarned(response.data.formatted_total || "₹0.00");
          setRequestedMilestones(response.data.requested_milestones || {});
        }
      } catch (error) {
        console.error('Failed to load earnings data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEarningsData();
  }, []);

  const handleRedeemReward = async (milestone) => {
    if (totalScans < milestone.scans) {
      if (showToast) showToast(`You need ${milestone.scans - totalScans} more scans to unlock this reward.`, 'info');
      return;
    }
    
    try {
      const response = await gatewayClient.requestEarningsPayout(milestone.scans, milestone.reward);
      if (response.success) {
        setRequestedMilestones(prev => ({
          ...prev,
          [milestone.scans]: true
        }));
        
        // Update total earned locally
        const newTotal = parseFloat(totalEarned.replace(/[^0-9.-]+/g,"")) + milestone.reward;
        setTotalEarned(`₹${newTotal.toFixed(2)}`);

        if (showToast) {
          showToast(`Successfully redeemed ₹${milestone.reward}!`, 'success');
        }
      }
    } catch (error) {
       if (showToast) showToast(`Failed to redeem reward: ${error.message}`, 'error');
    }
  };

  // Calculate progress percentage for a specific milestone
  const calculateProgress = (requiredScans) => {
    const progress = (totalScans / requiredScans) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-on-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
          <p className="font-body-md text-on-surface-variant">Loading Earnings Data...</p>
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
              <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface text-3xl">Merchant Earnings</h2>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-scale-up">
            {/* Total Scanned Card */}
            <div className="bg-surface-container rounded-2xl p-6 md:p-8 border border-outline-variant/30 shadow-sm flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-on-surface">
                    <span className="material-symbols-outlined text-xl">qr_code_scanner</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface-variant font-bold text-lg">Total Scanned</h3>
                </div>
                
                <div className="flex items-baseline gap-3 pt-2">
                  <span className="font-display-lg text-display-lg text-on-surface font-bold text-4xl lg:text-5xl tracking-tight">{totalScans.toLocaleString()}</span>
                  <span className="font-body-md text-on-surface-variant font-medium ml-2">Lifetime</span>
                </div>
              </div>
            </div>



            {/* Total Earnings */}
            <div className="bg-surface-container rounded-2xl p-6 md:p-8 border border-outline-variant/30 shadow-sm flex flex-col justify-between h-full">
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-xl">workspace_premium</span>
                  </div>
                  <h4 className="font-label-md text-on-surface-variant font-bold">Total Earned</h4>
               </div>
               <p className="font-display-sm text-on-surface font-bold text-3xl">{totalEarned}</p>
               <p className="font-body-sm text-on-surface-variant mt-2">From unlocked milestones</p>
            </div>
          </div>

          {/* Milestones Grid */}
          <div className="space-y-6 animate-slide-in-left delay-100">
            <h3 className="font-headline-md font-bold text-on-surface text-xl">Earnings Milestones</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {milestones.map((milestone, idx) => {
                const progress = calculateProgress(milestone.scans);
                const isUnlocked = totalScans >= milestone.scans;
                const hasRequested = requestedMilestones[milestone.scans];
                
                return (
                  <div 
                    key={idx} 
                    className={`bg-surface-container rounded-2xl p-6 border transition-all duration-300 flex flex-col justify-between
                      ${isUnlocked && !hasRequested ? 'border-outline-variant shadow-md' : 'border-outline-variant/30 shadow-sm'}
                    `}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          isUnlocked ? 'bg-surface-variant text-on-surface' : 'bg-surface-variant/50 text-on-surface-variant'
                        }`}>
                          <span className="material-symbols-outlined text-2xl">
                            {isUnlocked ? 'workspace_premium' : 'lock'}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-1">Reward</p>
                          <p className={`font-bold text-2xl ${isUnlocked ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                            ₹{milestone.reward.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <h4 className="font-headline-sm font-bold text-on-surface mb-2">{milestone.scans} Scans Milestone</h4>
                      <p className="font-body-sm text-on-surface-variant mb-6 min-h-[40px]">
                        {milestone.description}
                      </p>
                      
                      {/* Progress Bar */}
                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-sm font-medium">
                          <span className="text-on-surface-variant">Progress</span>
                          <span className={isUnlocked ? 'text-on-surface font-bold' : 'text-on-surface-variant'}>
                            {Math.min(totalScans, milestone.scans)} / {milestone.scans}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${
                              isUnlocked ? 'bg-on-surface' : 'bg-outline-variant'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <button
                      onClick={() => handleRedeemReward(milestone)}
                      disabled={!isUnlocked || hasRequested}
                      className={`w-full py-3 px-4 rounded-xl font-label-md font-bold flex items-center justify-center gap-2 transition-all
                        ${hasRequested 
                          ? 'bg-surface-variant text-on-surface-variant border border-outline-variant cursor-default' 
                          : isUnlocked 
                            ? 'bg-on-surface text-surface shadow-md hover:opacity-90 hover:shadow-lg active:scale-95' 
                            : 'bg-surface-variant text-on-surface-variant cursor-not-allowed opacity-70'
                        }
                      `}
                    >
                      {hasRequested ? (
                        <>
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          Redeemed
                        </>
                      ) : isUnlocked ? (
                        <>
                          <span className="material-symbols-outlined text-sm">payments</span>
                          Redeem ₹{milestone.reward}
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-sm">lock</span>
                          Unlock at {milestone.scans} scans
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info banner */}
          <div className="bg-surface-variant/30 rounded-xl p-5 border border-outline-variant/30 flex items-start gap-4 animate-fade-in delay-200">
            <span className="material-symbols-outlined text-on-surface mt-0.5">info</span>
            <div>
              <h4 className="font-label-md font-bold text-on-surface mb-1">How payouts work</h4>
              <p className="font-body-sm text-on-surface-variant text-sm leading-relaxed">
                Once you reach a milestone, the &quot;Redeem&quot; button will unlock. Clicking it will instantly add the reward amount to your total earnings. You can manually redeem the reward for each milestone only once.
              </p>
            </div>
          </div>

        </main>

        {/* Mobile bottom nav */}
        <MerchantBottomNav currentPath={currentPath} navigate={navigate} />
      </div>
    </div>
  );
}
