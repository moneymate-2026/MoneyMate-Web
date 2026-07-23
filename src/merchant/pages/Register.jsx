import React, { useState } from 'react';
import { gatewayClient } from '../../api/gatewayClient';

export default function Register({ navigate, showToast }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    dbaName: '',
    businessType: 'Limited Liability Company (LLC)',
    taxId: '',
    address: '',
    ownerName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    aadharNumber: '',
    aadharFile: null,
    shopLicenseFile: null,
  });

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

  const handleNext1 = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleNext2 = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      if (showToast) showToast("Passwords do not match!", "error");
      return;
    }
    setStep(3);
  };

  const handlePrev = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.aadharNumber.length !== 12) {
      if (showToast) showToast("Please enter a valid 12-digit Aadhaar Card Number!", "error");
      return;
    }
    if (!formData.aadharFile) {
      if (showToast) showToast("Please upload your Aadhaar Card document!", "error");
      return;
    }
    if (!formData.shopLicenseFile) {
      if (showToast) showToast("Please upload your Shop License document!", "error");
      return;
    }
    
    try {
      await gatewayClient.register(formData);
      if (showToast) showToast('Registration submitted successfully!', 'success');
      navigate('/merchant/verification-pending');
    } catch (error) {
      if (showToast) showToast(error.message || 'Registration failed', 'error');
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex items-center justify-center py-12 px-6 relative overflow-hidden font-body-md">
      {/* Decorative gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] -ml-60 -mb-60 pointer-events-none"></div>

      <div className="max-w-2xl w-full bg-white rounded-3xl p-8 md:p-12 border border-outline-variant/30 shadow-2xl relative z-10 animate-scale-up">
        {/* Top Header */}
        <div className="text-center mb-8">
          <div 
            onClick={() => navigate('/merchant/welcome')}
            className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto shadow-md cursor-pointer mb-4"
          >
            M
          </div>
          <h2 className="font-headline-lg text-headline-lg text-on-background font-bold text-3xl">Merchant Registration</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
            Set up your store account in three simple steps.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-center gap-2 md:gap-4 mb-8 overflow-x-auto py-2">
          {/* Step 1 indicator */}
          <div className="flex items-center gap-2 shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
              step >= 1 ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'
            }`}>
              1
            </div>
            <span className={`font-label-md text-label-md transition-colors ${step >= 1 ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
              Business Details
            </span>
          </div>
          <div className="w-6 md:w-10 h-0.5 bg-outline-variant/50 shrink-0"></div>
          
          {/* Step 2 indicator */}
          <div className="flex items-center gap-2 shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
              step >= 2 ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'
            }`}>
              2
            </div>
            <span className={`font-label-md text-label-md transition-colors ${step >= 2 ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
              Owner Info
            </span>
          </div>
          <div className="w-6 md:w-10 h-0.5 bg-outline-variant/50 shrink-0"></div>

          {/* Step 3 indicator */}
          <div className="flex items-center gap-2 shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
              step === 3 ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'
            }`}>
              3
            </div>
            <span className={`font-label-md text-label-md transition-colors ${step === 3 ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
              KYC Documents
            </span>
          </div>
        </div>

        {step === 1 && (
          /* Step 1 Form: Business details */
          <form onSubmit={handleNext1} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant ml-1">Legal Business Name</label>
                <input 
                  type="text" 
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Apex Innovations LLC"
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
                  placeholder="e.g. Apex Tech"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
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
                  type="text" 
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleChange}
                  required
                  placeholder="XX-XXXXXXX"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant ml-1">Registered Address</label>
              <textarea 
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows="3"
                placeholder="Full address details..."
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
              ></textarea>
            </div>

            <div className="pt-4 flex justify-between items-center border-t border-outline-variant/30">
              <button 
                type="button"
                onClick={() => navigate('/merchant/welcome')}
                className="font-label-md text-label-md text-primary hover:bg-primary/5 px-6 py-3 rounded-xl transition-colors"
              >
                Back to Welcome
              </button>
              <button 
                type="submit"
                className="bg-primary hover:bg-primary/95 text-on-primary font-label-md text-label-md px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 flex items-center gap-2"
              >
                <span>Continue</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          /* Step 2 Form: Credentials & owner details */
          <form onSubmit={handleNext2} className="space-y-6">
            <div className="space-y-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant ml-1">Primary Owner / Director Name</label>
              <input 
                type="text" 
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                required
                placeholder="Full Legal Name"
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant ml-1">Contact Email</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="owner@business.com"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant ml-1">Mobile Number</label>
                <input 
                  type="tel" 
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                  placeholder="(555) 123-4567"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant ml-1">Password</label>
                <input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant ml-1">Confirm Password</label>
                <input 
                  type="password" 
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center border-t border-outline-variant/30">
              <button 
                type="button"
                onClick={handlePrev}
                className="font-label-md text-label-md text-primary hover:bg-primary/5 px-6 py-3 rounded-xl transition-colors"
              >
                Back to Business Details
              </button>
              <button 
                type="submit"
                className="bg-primary hover:bg-primary/95 text-on-primary font-label-md text-label-md px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 flex items-center gap-2"
              >
                <span>Continue</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          /* Step 3 Form: KYC Verification (Shop License & Aadhaar Card) */
          <form onSubmit={handleSubmit} className="space-y-6 animate-fadeIn">
            <div className="space-y-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant ml-1">12-Digit Aadhaar Card Number</label>
              <input 
                type="text" 
                name="aadharNumber"
                maxLength="12"
                pattern="\d{12}"
                value={formData.aadharNumber}
                onChange={handleChange}
                required
                placeholder="e.g. 123456789012"
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>

            {/* Aadhaar File Upload */}
            <div className="space-y-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant ml-1">Upload Aadhaar Card (PDF / Image)</label>
              <div className="border-2 border-dashed border-outline-variant rounded-xl p-4 bg-surface-container-lowest flex flex-col items-center justify-center relative hover:bg-primary/5 transition-colors">
                <input 
                  type="file" 
                  name="aadharFile"
                  onChange={handleFileChange}
                  accept=".pdf,image/*"
                  required
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <span className="material-symbols-outlined text-outline text-3xl mb-1">upload_file</span>
                <p className="font-label-sm text-label-sm text-on-surface-variant text-center">
                  {formData.aadharFile ? (
                    <span className="text-primary font-bold">{formData.aadharFile}</span>
                  ) : (
                    <span>Click or Drag to Upload Aadhaar Card</span>
                  )}
                </p>
              </div>
            </div>

            {/* Shop License File Upload */}
            <div className="space-y-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant ml-1">Upload Shop License / Registration Document (PDF / Image)</label>
              <div className="border-2 border-dashed border-outline-variant rounded-xl p-4 bg-surface-container-lowest flex flex-col items-center justify-center relative hover:bg-primary/5 transition-colors">
                <input 
                  type="file" 
                  name="shopLicenseFile"
                  onChange={handleFileChange}
                  accept=".pdf,image/*"
                  required
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <span className="material-symbols-outlined text-outline text-3xl mb-1">storefront</span>
                <p className="font-label-sm text-label-sm text-on-surface-variant text-center">
                  {formData.shopLicenseFile ? (
                    <span className="text-primary font-bold">{formData.shopLicenseFile}</span>
                  ) : (
                    <span>Click or Drag to Upload Shop License</span>
                  )}
                </p>
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center border-t border-outline-variant/30">
              <button 
                type="button"
                onClick={handlePrev}
                className="font-label-md text-label-md text-primary hover:bg-primary/5 px-6 py-3 rounded-xl transition-colors"
              >
                Back to Owner Info
              </button>
              <button 
                type="submit"
                className="bg-primary hover:bg-primary/95 text-on-primary font-label-md text-label-md px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 flex items-center gap-2"
              >
                <span>Submit Application</span>
                <span className="material-symbols-outlined text-sm">check_circle</span>
              </button>
            </div>
          </form>
        )}

        {/* Bottom helper links */}
        <div className="text-center mt-6">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Already have a merchant account?{' '}
            <button 
              onClick={() => navigate('/merchant/login')}
              className="text-primary font-bold hover:underline"
            >
              Sign In here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
