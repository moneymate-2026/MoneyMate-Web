import React, { useState } from 'react';
import MerchantSidebar from '../components/MerchantSidebar';
import MerchantNavbar from '../components/MerchantNavbar';
import MerchantBottomNav from '../components/MerchantBottomNav';
import { gatewayClient } from '../../api/gatewayClient';

export default function CreateOffer({ navigate, showToast }) {
  const currentPath = '/merchant/create-offer';
  const [formData, setFormData] = useState({
    campaignName: '',
    offerType: 'Double Cashback (4%)',
    rewardValue: '4',
    minPurchase: '10',
    startDate: '',
    endDate: '',
    targetAudience: 'All Customers',
  });
  const [loading, setLoading] = useState(false);
  const [launched, setLaunched] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await gatewayClient.createCampaign(formData);
      setLoading(false);
      setLaunched(true);
      if (showToast) showToast('Campaign launched successfully!', 'success');
      setTimeout(() => {
        navigate('/merchant/dashboard');
      }, 1500);
    } catch (error) {
      setLoading(false);
      if (showToast) showToast(error.message || 'Failed to launch campaign', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <MerchantSidebar currentPath={currentPath} navigate={navigate} />

      {/* Main Container */}
      <div className="flex-grow md:ml-64 flex flex-col">
        {/* Top Navbar */}
        <MerchantNavbar currentPath={currentPath} navigate={navigate} />

        {/* Page Content */}
        <main className="p-6 md:p-8 space-y-8 max-w-4xl w-full mx-auto pb-24 md:pb-8 flex-grow">
          {/* Header */}
          <div className="animate-fade-in">
            <h2 className="font-headline-lg text-headline-lg font-bold text-on-background text-3xl">
              Create New Offer
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Launch a new loyalty campaign to incentivize scan payments at checkout.
            </p>
          </div>

          {launched && (
            <div className="bg-tertiary/10 text-tertiary border border-tertiary/20 p-4 rounded-xl font-label-md text-label-md text-center animate-bounce">
              🎉 Campaign launched successfully! Redirecting to Dashboard...
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-outline-variant/30 p-6 md:p-8 shadow-sm relative overflow-hidden animate-scale-up delay-75">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-2xl"></div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant ml-1">Campaign Name</label>
                <input 
                  type="text" 
                  name="campaignName"
                  value={formData.campaignName}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Weekend double rewards, Summer Special"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant ml-1">Offer Type</label>
                  <select 
                    name="offerType"
                    value={formData.offerType}
                    onChange={handleChange}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none"
                  >
                    <option>Double Cashback (4%)</option>
                    <option>Flat Cashback Bonus ($2.00)</option>
                    <option>Custom Reward Rate</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant ml-1">Reward Value</label>
                  <input 
                    type="number" 
                    name="rewardValue"
                    value={formData.rewardValue}
                    onChange={handleChange}
                    required
                    min="1"
                    placeholder="e.g. 4 for 4%, 2 for $2"
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant ml-1">Minimum Bill Purchase ($)</label>
                  <input 
                    type="number" 
                    name="minPurchase"
                    value={formData.minPurchase}
                    onChange={handleChange}
                    required
                    min="0"
                    placeholder="e.g. 10"
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant ml-1">Target Audience</label>
                  <select 
                    name="targetAudience"
                    value={formData.targetAudience}
                    onChange={handleChange}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none"
                  >
                    <option>All Customers</option>
                    <option>VIP Members</option>
                    <option>First-Time Scanners Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant ml-1">Start Date</label>
                  <input 
                    type="date" 
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant ml-1">End Date</label>
                  <input 
                    type="date" 
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-6 flex justify-end gap-4 border-t border-outline-variant/30">
                <button 
                  type="button"
                  onClick={() => navigate('/merchant/dashboard')}
                  className="px-6 py-3 rounded-xl font-label-md text-label-md text-primary hover:bg-primary/5 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="bg-primary hover:bg-primary/95 text-on-primary font-label-md text-label-md px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                      <span>Launching Campaign...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">rocket_launch</span>
                      <span>Launch Campaign</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>

        {/* Mobile bottom nav */}
        <MerchantBottomNav currentPath={currentPath} navigate={navigate} />
      </div>
    </div>
  );
}
