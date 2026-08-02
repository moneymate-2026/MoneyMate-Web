import React, { useState, useEffect } from 'react';
import MerchantSidebar from '../components/MerchantSidebar';
import MerchantNavbar from '../components/MerchantNavbar';
import MerchantBottomNav from '../components/MerchantBottomNav';
import { gatewayClient } from '../../api/gatewayClient';

export default function CreateOffer({ navigate, showToast }) {
  const currentPath = '/merchant/create-offer';
  
  // States
  const [view, setView] = useState('list'); // 'list' | 'create' | 'edit'
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  // Selected campaign for edit
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);

  const initialForm = {
    campaignName: '',
    offerType: 'Double Cashback (4%)',
    minPurchase: '10',
    startDate: '',
    endDate: '',
    targetAudience: 'All Customers',
    bannerFile: null,
  };
  
  const [formData, setFormData] = useState(initialForm);

  const fetchCampaigns = async () => {
    setFetching(true);
    try {
      const response = await gatewayClient.getCampaigns();
      setCampaigns(response.data || []);
    } catch (err) {
      if (showToast) showToast('Failed to load campaigns', 'error');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.files[0] ? e.target.files[0].name : null,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await gatewayClient.createCampaign(formData);
      if (showToast) showToast('Campaign launched successfully!', 'success');
      setView('list');
      fetchCampaigns();
    } catch (error) {
      if (showToast) showToast(error.message || 'Action failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (campaign) => {
    const campaignId = campaign.id || campaign.ID;
    const newStatus = !campaign.is_active;
    
    try {
      await gatewayClient.updateCampaignStatus(campaignId, newStatus);
      if (showToast) showToast(`Campaign ${newStatus ? 'resumed' : 'paused'} successfully!`, 'success');
      fetchCampaigns();
    } catch (error) {
      if (showToast) showToast('Failed to update campaign status', 'error');
    }
  };

  const renderForm = () => (
    <div className="bg-surface-container backdrop-blur-md rounded-2xl border border-outline-variant/30 p-6 md:p-8 shadow-sm relative overflow-hidden animate-scale-up delay-75">
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
              <option>Flat Cashback Bonus (₹20.00)</option>
              <option>Percentage Cashback</option>
              <option>Custom Reward Rate</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="font-label-sm text-label-sm text-on-surface-variant ml-1">Minimum Bill Purchase (₹)</label>
            <input 
              type="number" 
              name="minPurchase"
              value={formData.minPurchase}
              onChange={handleChange}
              required
              min="0"
              step="any"
              placeholder="e.g. 500"
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-label-sm text-label-sm text-on-surface-variant ml-1">Offer Banner Image (Optional)</label>
          <div className="border-2 border-dashed border-outline-variant rounded-xl p-4 bg-surface-container-lowest flex flex-col items-center justify-center relative hover:bg-primary/5 transition-colors cursor-pointer group">
            <input 
              type="file" 
              name="bannerFile"
              onChange={handleFileChange}
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <span className="material-symbols-outlined text-outline group-hover:text-primary text-3xl mb-1 transition-colors">image</span>
            <p className="font-label-sm text-label-sm text-on-surface-variant text-center">
              {formData.bannerFile ? (
                <span className="text-primary font-bold">{formData.bannerFile}</span>
              ) : (
                <span>Click or Drag to Upload Banner Image</span>
              )}
            </p>
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

        <div className="pt-6 flex justify-end gap-4 border-t border-outline-variant/30">
          <button 
            type="button"
            onClick={() => setView('list')}
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
                <span>Launching...</span>
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
  );

  const renderList = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-background text-2xl md:text-3xl">Offers & Campaigns</h2>
        </div>
        <button 
          onClick={() => {
            setFormData(initialForm);
            setView('create');
          }}
          className="bg-primary hover:bg-primary/95 text-on-primary font-label-md text-label-md px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Create New Offer
        </button>
      </div>

      {fetching ? (
        <div className="text-center py-12">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
          <p className="mt-4 text-on-surface-variant">Loading campaigns...</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16 bg-surface-container rounded-2xl border border-outline-variant/30">
          <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">local_offer</span>
          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">No Active Campaigns</h3>
          <p className="text-on-surface-variant mt-2 max-w-sm mx-auto mb-6">You haven&apos;t launched any promotional offers or cashback campaigns yet.</p>
          <button 
            onClick={() => {
              setFormData(initialForm);
              setView('create');
            }}
            className="bg-primary hover:bg-primary/95 text-on-primary font-label-md px-6 py-2.5 rounded-xl shadow-sm transition-all inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">rocket_launch</span>
            Launch First Campaign
          </button>
        </div>
      ) : (
        <div className="bg-surface-container rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sm animate-fade-in delay-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-highest border-b border-outline-variant/30 text-on-surface-variant font-label-md">
                  <th className="px-6 py-5 font-semibold whitespace-nowrap">Campaign</th>
                  <th className="px-6 py-5 font-semibold whitespace-nowrap">Min Bill</th>
                  <th className="px-6 py-5 font-semibold whitespace-nowrap">Duration</th>
                  <th className="px-6 py-5 font-semibold whitespace-nowrap">Status</th>
                  <th className="px-6 py-5 font-semibold whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {campaigns.map((camp) => (
                  <tr key={camp.id || camp.ID} className="hover:bg-primary/5 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col min-w-[120px]">
                        <span className="font-bold text-on-surface text-base">{camp.name || camp.title}</span>
                        <span className="text-xs text-primary font-bold mt-1">{camp.offer_type || camp.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-semibold text-on-surface">
                      ₹{camp.min_bill_amount || camp.minPurchase || 0}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col text-sm text-on-surface-variant whitespace-nowrap">
                        <span>{camp.start_date || camp.startDate ? new Date(camp.start_date || camp.startDate).toLocaleDateString() : 'N/A'}</span>
                        <span className="text-xs opacity-80 mt-0.5">to {camp.end_date || camp.endDate ? new Date(camp.end_date || camp.endDate).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wide inline-block ${
                        camp.is_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-surface-container-highest text-on-surface-variant'
                      }`}>
                        {camp.is_active ? 'Active' : 'Paused'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleToggleStatus(camp)}
                          className={`p-2.5 rounded-xl transition-colors flex items-center justify-center ${camp.is_active ? 'bg-error/10 text-error hover:bg-error hover:text-on-error' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'}`}
                          title={camp.is_active ? "Pause Campaign" : "Resume Campaign"}
                        >
                          <span className="material-symbols-outlined text-sm">{camp.is_active ? 'pause' : 'play_arrow'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col md:flex-row">
      <MerchantSidebar currentPath={currentPath} navigate={navigate} />
      <div className="flex-grow md:ml-[280px] flex flex-col min-w-0">
        <MerchantNavbar currentPath={currentPath} navigate={navigate} />
        <main className="p-6 md:px-12 md:py-10 space-y-8 w-full pb-24 md:pb-8 flex-grow">
          {view === 'list' ? renderList() : (
            <>
              <div className="animate-fade-in mb-6">
                <button 
                  onClick={() => setView('list')}
                  className="flex items-center gap-1 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors mb-4"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  Back to Offers
                </button>
                <h2 className="font-headline-lg text-headline-lg font-bold text-on-background text-3xl">
                  Create New Offer
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                  Launch a new loyalty campaign to incentivize scan payments at checkout.
                </p>
              </div>
              {renderForm()}
            </>
          )}
        </main>
        <MerchantBottomNav currentPath={currentPath} navigate={navigate} />
      </div>
    </div>
  );
}
