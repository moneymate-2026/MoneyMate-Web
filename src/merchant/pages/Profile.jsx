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
    createdAt: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      // First, try loading whatever is in local storage as a fallback
      try {
        const localDataStr = localStorage.getItem('merchant_data');
        if (localDataStr) {
          const localData = JSON.parse(localDataStr);
          setFormData(prev => ({
            ...prev,
            businessName: localData.legal_name || localData.LegalName || localData.businessName || prev.businessName,
            email: localData.contact_email || localData.email || prev.email,
            dbaName: localData.dba_name || localData.dbaName || prev.dbaName,
            address: localData.registered_address || localData.address || prev.address,
            ownerName: localData.owner_name || localData.ownerName || prev.ownerName,
            mobile: localData.mobile_number || localData.mobile || prev.mobile,
          }));
        }
      } catch (e) {}

      try {
        const response = await gatewayClient.getProfile().catch(e => ({ success: false }));
        if (response && response.success && response.data) {
          const pData = response.data.data || response.data;
          setFormData(prev => ({
            ...prev,
            businessName: pData.businessName || pData.legal_name || prev.businessName,
            dbaName: pData.dbaName || pData.dba_name || prev.dbaName,
            address: pData.address || pData.registered_address || prev.address,
            businessType: pData.businessType || pData.business_type || prev.businessType,
            taxId: pData.taxId || pData.tax_id || prev.taxId,
            ownerName: pData.ownerName || pData.owner_name || prev.ownerName,
            email: pData.email || pData.contact_email || prev.email,
            mobile: pData.mobile || pData.mobile_number || prev.mobile,
            profileImage: pData.profileImage || prev.profileImage,
            createdAt: pData.createdAt || pData.created_at || prev.createdAt,
          }));
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
        <main className="p-6 md:p-8 space-y-8 w-full pb-24 md:pb-8 flex-grow">
          {/* Header */}
          <div className="animate-fade-in">
            <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface text-3xl">Business Profile</h2>
          </div>

          <form onSubmit={handleSave} className="space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-slide-in-left">
              
              {/* Business Information */}
              <div className="bg-surface-container rounded-2xl p-6 md:p-8 border border-outline-variant/30 shadow-sm flex flex-col">
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-6 flex items-center gap-2 text-xl">
                  <span className="material-symbols-outlined text-on-surface-variant">storefront</span>
                  <span>Business Information</span>
                </h3>

                <div className="flex flex-col-reverse lg:flex-row gap-8 mb-6">
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

                    <div className="space-y-1.5">
                      <label className="font-label-sm text-label-sm text-on-surface-variant ml-1 font-semibold">Registered At</label>
                      <input 
                        type="text" 
                        value={formData.createdAt ? new Date(formData.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                        disabled
                        className="w-full bg-surface-variant/30 border border-outline-variant/30 rounded-xl px-4 py-3 font-body-md text-on-surface-variant outline-none cursor-not-allowed placeholder:text-on-surface-variant/40"
                        placeholder="N/A"
                      />
                    </div>
                  </div>

                  {/* Right Column: Profile Image Upload */}
                  <div className="flex flex-col items-center lg:items-end gap-3 lg:w-32 shrink-0">
                    <div className="relative w-24 h-24 lg:w-32 lg:h-32 rounded-2xl bg-surface-container-high border-2 border-dashed border-outline-variant/50 flex flex-col items-center justify-center overflow-hidden shrink-0 group hover:border-primary transition-colors">
                      {formData.profileImage ? (
                        <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-on-surface-variant/50 group-hover:text-primary transition-colors">
                          <span className="material-symbols-outlined text-3xl lg:text-4xl">storefront</span>
                          <span className="text-[10px] lg:text-xs mt-1 font-medium">Add Logo</span>
                        </div>
                      )}
                      <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-white backdrop-blur-sm">
                        <span className="material-symbols-outlined text-xl lg:text-2xl">photo_camera</span>
                        <span className="text-[10px] lg:text-xs font-semibold mt-1 tracking-wide text-center">Upload<br/>Image</span>
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
                    <div className="text-center lg:text-right">
                      <h4 className="font-label-md text-label-md text-on-surface font-bold">Business Logo</h4>
                      <p className="font-body-sm text-[11px] text-on-surface-variant mt-1 max-w-[150px] leading-tight">Recommended: 256x256px</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Primary Contact */}
              <div className="bg-surface-container rounded-2xl p-6 md:p-8 border border-outline-variant/30 shadow-sm flex flex-col h-full">
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-6 flex items-center gap-2 text-xl">
                  <span className="material-symbols-outlined text-on-surface-variant">account_circle</span>
                  <span>Primary Contact</span>
                </h3>
                
                <div className="flex-1 space-y-5">
                  <div className="space-y-1.5">
                    <label className="font-label-sm text-label-sm text-on-surface-variant ml-1 font-semibold">Owner / Primary Contact Name</label>
                    <input 
                      type="text" 
                      name="ownerName"
                      value={formData.ownerName || ''}
                      onChange={handleChange}
                      required
                      className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-on-surface-variant/40 hover:bg-surface-container-low"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="font-label-sm text-label-sm text-on-surface-variant ml-1 font-semibold">Contact Email</label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email || ''}
                        onChange={handleChange}
                        required
                        className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-on-surface-variant/40 hover:bg-surface-container-low"
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
                        className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-on-surface-variant/40 hover:bg-surface-container-low"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions inside the contact card or at the bottom of the grid */}
                <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-outline-variant/20">
                  <button 
                    type="button"
                    onClick={() => navigate('/merchant/dashboard')}
                    className="px-6 py-2.5 rounded-full font-label-md text-label-md text-on-surface-variant border border-outline-variant/30 hover:bg-surface-variant transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-2.5 bg-on-surface text-surface rounded-full font-label-md text-label-md font-bold hover:opacity-90 transition-all shadow-sm active:scale-95 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">save</span>
                    Save Changes
                  </button>
                </div>
              </div>

            </div>
          </form>
        </main>
        {/* Mobile bottom nav */}
        <MerchantBottomNav currentPath={currentPath} navigate={navigate} />
      </div>
    </div>
  );
}
