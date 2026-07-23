import React, { useState, useEffect } from 'react';
import MerchantSidebar from '../components/MerchantSidebar';
import MerchantNavbar from '../components/MerchantNavbar';
import MerchantBottomNav from '../components/MerchantBottomNav';
import { gatewayClient } from '../../api/gatewayClient';

export default function Profile({ navigate, showToast }) {
  const currentPath = '/merchant/profile';

  const [formData, setFormData] = useState({
    businessName: '',
    dbaName: '',
    address: '',
    businessType: 'Limited Liability Company (LLC)',
    taxId: '',
    ownerName: '',
    email: '',
    mobile: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await gatewayClient.getProfile();
        if (response.success && response.data) {
          setFormData({
            businessName: response.data.businessName || '',
            dbaName: response.data.dbaName || '',
            address: response.data.address || '',
            businessType: response.data.businessType || 'Limited Liability Company (LLC)',
            taxId: response.data.taxId || '',
            ownerName: response.data.ownerName || '',
            email: response.data.email || '',
            mobile: response.data.mobile || '',
          });
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const response = await gatewayClient.updateProfile(formData);
      if (response.success) {
        if (showToast) {
          showToast('Business profile updated successfully!', 'success');
        }
      }
    } catch (error) {
      if (showToast) {
        showToast(error.message || 'Failed to update profile', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-on-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
          <p className="font-body-md text-on-surface-variant">Loading Profile...</p>
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
        <main className="p-6 md:p-8 space-y-8 max-w-4xl w-full mx-auto pb-24 md:pb-8 flex-grow">
          {/* Header */}
          <div className="animate-fade-in">
            <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface text-3xl">Business Profile</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">Manage your merchant profile details and contact information.</p>
          </div>

          <div className="space-y-8">
            {/* Business details form */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-outline-variant/30 shadow-sm relative overflow-hidden animate-slide-in-left">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-2xl"></div>
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-6 flex items-center gap-2 text-xl">
                <span className="material-symbols-outlined text-primary">storefront</span>
                <span>Business Information</span>
              </h3>

              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="font-label-sm text-label-sm text-on-surface-variant ml-1">Legal Business Name</label>
                    <input 
                      type="text" 
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      required
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-label-sm text-label-sm text-on-surface-variant ml-1">Doing Business As (DBA)</label>
                    <input 
                      type="text" 
                      name="dbaName"
                      value={formData.dbaName}
                      onChange={handleChange}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant ml-1">Registered Address</label>
                  <input 
                    type="text" 
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="font-label-sm text-label-sm text-on-surface-variant ml-1">Business Type</label>
                    <select 
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleChange}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none"
                    >
                      <option>Limited Liability Company (LLC)</option>
                      <option>Corporation</option>
                      <option>Sole Proprietorship</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-label-sm text-label-sm text-on-surface-variant ml-1">Tax ID / EIN</label>
                    <input 
                      type="password" 
                      name="taxId"
                      value={formData.taxId}
                      onChange={handleChange}
                      required
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant/30">
                  <button 
                    type="button"
                    onClick={() => navigate('/merchant/dashboard')}
                    className="px-6 py-2.5 rounded-lg font-label-md text-label-md text-primary hover:bg-primary/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary/90 transition-colors shadow-sm hover:shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>

            {/* Primary Contact card */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-outline-variant/30 shadow-sm relative overflow-hidden animate-slide-in-left delay-75">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary rounded-l-2xl"></div>
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-4 flex items-center gap-2 text-xl">
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>account_circle</span>
                <span>Primary Contact</span>
              </h3>
              <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-outline-variant/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg animate-float">
                    {formData.ownerName ? formData.ownerName.split(' ').map(n => n[0]).join('').toUpperCase() : 'JD'}
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface font-bold">{formData.ownerName || 'John Doe'}</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {formData.email || 'john.doe@apextech.com'} • {formData.mobile || '(555) 123-4567'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => showToast && showToast('Contact editing options are coming soon!', 'info')}
                  className="text-primary hover:bg-primary/10 p-2.5 rounded-full transition-colors"
                >
                  <span className="material-symbols-outlined text-md">edit</span>
                </button>
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
