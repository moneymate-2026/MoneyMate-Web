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
    profileImage: '',
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
            profileImage: response.data.profileImage || '',
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
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('profileUpdated', { detail: { profileImage: formData.profileImage } }));
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
      <div className="flex-grow md:ml-[280px] flex flex-col">
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
            <div className="bg-surface-container backdrop-blur-md rounded-2xl p-6 md:p-8 border border-outline-variant/30 shadow-sm relative overflow-hidden animate-slide-in-left">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-2xl"></div>
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-6 flex items-center gap-2 text-xl">
                <span className="material-symbols-outlined text-primary">storefront</span>
                <span>Business Information</span>
              </h3>

              <form onSubmit={handleSave} className="space-y-8">
                <div className="flex flex-col-reverse md:flex-row gap-8">
                  {/* Left Column: Form Fields */}
                  <div className="flex-1 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="font-label-sm text-label-sm text-on-surface-variant ml-1 font-semibold">Legal Business Name</label>
                        <input 
                          type="text" 
                          name="businessName"
                          value={formData.businessName || ''}
                          onChange={handleChange}
                          required
                          className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-on-surface-variant/40 hover:bg-surface-container-low"
                          placeholder="Acme Corp LLC"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-label-sm text-label-sm text-on-surface-variant ml-1 font-semibold">Doing Business As (DBA)</label>
                        <input 
                          type="text" 
                          name="dbaName"
                          value={formData.dbaName || ''}
                          onChange={handleChange}
                          className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-on-surface-variant/40 hover:bg-surface-container-low"
                          placeholder="Acme Store"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-label-sm text-label-sm text-on-surface-variant ml-1 font-semibold">Registered Address</label>
                      <input 
                        type="text" 
                        name="address"
                        value={formData.address || ''}
                        onChange={handleChange}
                        required
                        className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-on-surface-variant/40 hover:bg-surface-container-low"
                        placeholder="123 Commerce St, Suite 100, City, State, ZIP"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="font-label-sm text-label-sm text-on-surface-variant ml-1 font-semibold">Business Type</label>
                        <select 
                          name="businessType"
                          value={formData.businessType || 'Limited Liability Company (LLC)'}
                          onChange={handleChange}
                          className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer hover:bg-surface-container-low"
                        >
                          <option value="Limited Liability Company (LLC)">Limited Liability Company (LLC)</option>
                          <option value="Corporation">Corporation</option>
                          <option value="Sole Proprietorship">Sole Proprietorship</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-label-sm text-label-sm text-on-surface-variant ml-1 font-semibold">Tax ID / EIN</label>
                        <input 
                          type="password" 
                          name="taxId"
                          value={formData.taxId || ''}
                          onChange={handleChange}
                          required
                          className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-on-surface-variant/40 hover:bg-surface-container-low"
                          placeholder="•••-••-••••"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Profile Image Upload */}
                  <div className="flex flex-col items-center md:items-end gap-3 md:w-1/3">
                    <div className="relative w-32 h-32 rounded-2xl bg-surface-container-high border-2 border-dashed border-outline-variant/50 flex flex-col items-center justify-center overflow-hidden shrink-0 group hover:border-primary transition-colors">
                      {formData.profileImage ? (
                        <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-on-surface-variant/50 group-hover:text-primary transition-colors">
                          <span className="material-symbols-outlined text-4xl">storefront</span>
                          <span className="text-xs mt-1 font-medium">Add Logo</span>
                        </div>
                      )}
                      <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-white backdrop-blur-sm">
                        <span className="material-symbols-outlined text-2xl">photo_camera</span>
                        <span className="text-xs font-semibold mt-1 tracking-wide">Upload Image</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setFormData({ ...formData, profileImage: reader.result });
                                if (typeof window !== 'undefined') {
                                  window.dispatchEvent(new CustomEvent('profileImagePreview', { detail: reader.result }));
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                    <div className="text-center md:text-right">
                      <h4 className="font-label-md text-label-md text-on-surface font-bold">Business Logo</h4>
                      <p className="font-body-sm text-[11px] text-on-surface-variant mt-1 max-w-[150px] leading-tight">Recommended size: 256x256px.</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-outline-variant/30 pt-8 mt-4">
                  <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-6 flex items-center gap-2 text-xl">
                    <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>account_circle</span>
                    <span>Primary Contact</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="font-label-sm text-label-sm text-on-surface-variant ml-1 font-semibold">Owner / Primary Contact Name</label>
                      <input 
                        type="text" 
                        name="ownerName"
                        value={formData.ownerName || ''}
                        onChange={handleChange}
                        required
                        className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md text-on-surface focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all placeholder:text-on-surface-variant/40 hover:bg-surface-container-low"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-label-sm text-label-sm text-on-surface-variant ml-1 font-semibold">Contact Email</label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email || ''}
                        onChange={handleChange}
                        required
                        className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md text-on-surface focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all placeholder:text-on-surface-variant/40 hover:bg-surface-container-low"
                        placeholder="john.doe@example.com"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-label-sm text-label-sm text-on-surface-variant ml-1 font-semibold">Mobile Number</label>
                      <input 
                        type="tel" 
                        name="mobile"
                        value={formData.mobile || ''}
                        onChange={handleChange}
                        required
                        className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md text-on-surface focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all placeholder:text-on-surface-variant/40 hover:bg-surface-container-low"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 flex justify-end gap-3 border-t border-outline-variant/30">
                  <button 
                    type="button"
                    onClick={() => {
                      navigate('/merchant/dashboard');
                    }}
                    className="px-6 py-3 rounded-xl font-label-md text-label-md text-primary hover:bg-primary/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-8 py-3 bg-primary text-on-primary rounded-xl font-label-md text-label-md font-bold hover:bg-primary/95 transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">save</span>
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>

        {/* Mobile bottom nav */}
        <MerchantBottomNav currentPath={currentPath} navigate={navigate} />
      </div>
    </div>
  );
}
