import React, { useState } from 'react';
import { gatewayClient } from '../../api/gatewayClient';

export default function Register({ navigate, showToast }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    dbaName: '',
    businessType: '',
    taxId: '',
    address: '',
    ownerName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    aadharNumber: '',
    aadharFileBase64: '',
    aadharFileName: '',
    shopLicenseFileBase64: '',
    shopLicenseFileName: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const fieldName = e.target.name;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          [`${fieldName}Base64`]: reader.result,
          [`${fieldName}Name`]: file.name,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({
        ...prev,
        [`${fieldName}Base64`]: '',
        [`${fieldName}Name`]: '',
      }));
    }
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
    if (!formData.aadharFileBase64) {
      if (showToast) showToast("Please upload your Aadhaar Card document!", "error");
      return;
    }
    if (!formData.shopLicenseFileBase64) {
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

  const inputClasses = "w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-300 focus:border-[#6366f1] focus:ring-4 focus:ring-[#6366f1]/10 outline-none transition-all shadow-sm";
  const labelClasses = "text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1 mb-1 block";

  return (
    <div className="bg-[#eef2f6] text-slate-900 min-h-screen flex items-center justify-center p-4 md:p-8 relative overflow-hidden font-body-md z-10">
      
      {/* Abstract Polygonal Background Outside the Box */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-5%] left-[-5%] w-[45%] h-[65%] bg-[#6366f1] opacity-90" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[75%] bg-[#8b3dff] opacity-10" style={{ clipPath: 'polygon(100% 100%, 0 100%, 100% 0)' }}></div>
        <div className="absolute top-[15%] right-[10%] w-[35%] h-[55%] bg-[#3b82f6] opacity-20" style={{ clipPath: 'polygon(50% 0, 100% 100%, 0 100%)' }}></div>
        <div className="absolute bottom-[5%] left-[20%] w-[30%] h-[40%] bg-white opacity-40" style={{ clipPath: 'polygon(0 50%, 50% 100%, 100% 0)' }}></div>
      </div>

      {/* Main Container Card */}
      <div className="w-full max-w-[1300px] min-h-[750px] bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden flex relative z-20">
        
        {/* Left Side: Form */}
        <div className="w-full lg:w-[50%] p-8 md:p-12 lg:p-16 flex flex-col justify-center relative z-20 bg-transparent">
          <div className="w-full max-w-[420px] mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div 
                  onClick={() => navigate('/merchant/welcome')}
                  className="w-10 h-10 bg-[#6366f1] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/30 cursor-pointer hover:scale-105 transition-transform shrink-0"
                >
                  M
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-[#6366f1] tracking-tight">Merchant Setup</h2>
                  <p className="text-xs font-semibold text-slate-400">Step {step} of 3</p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-2 mb-8">
              {[1, 2, 3].map((num) => (
                <React.Fragment key={num}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors shrink-0 ${
                    step >= num ? 'bg-[#6366f1] text-white shadow-md shadow-indigo-500/30' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {num}
                  </div>
                  {num < 3 && (
                    <div className={`flex-1 h-1 rounded-full transition-colors ${
                      step > num ? 'bg-[#6366f1]' : 'bg-slate-100'
                    }`}></div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Forms container */}
            <div className="flex-1">
              {step === 1 && (
                <form onSubmit={handleNext1} className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClasses}>Legal Business Name</label>
                      <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} required placeholder="Apex Innovations" className={inputClasses} />
                    </div>
                    <div>
                      <label className={labelClasses}>Doing Business As (DBA)</label>
                      <input type="text" name="dbaName" value={formData.dbaName} onChange={handleChange} placeholder="Apex Tech" className={inputClasses} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClasses}>Business Type</label>
                      <input type="text" name="businessType" value={formData.businessType} onChange={handleChange} required placeholder="Retail, Software..." className={inputClasses} />
                    </div>
                    <div>
                      <label className={labelClasses}>Tax ID / EIN</label>
                      <input type="text" name="taxId" value={formData.taxId} onChange={handleChange} required placeholder="XX-XXXXXXX" className={inputClasses} />
                    </div>
                  </div>

                  <div>
                    <label className={labelClasses}>Registered Address</label>
                    <textarea name="address" value={formData.address} onChange={handleChange} required rows="2" placeholder="Full address details..." className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-300 focus:border-[#6366f1] focus:ring-4 focus:ring-[#6366f1]/10 outline-none transition-all shadow-sm resize-none"></textarea>
                  </div>

                  <div className="pt-2 flex justify-between items-center">
                    <button type="button" onClick={() => navigate('/merchant/welcome')} className="text-slate-500 hover:text-[#6366f1] text-sm font-bold transition-colors">
                      Cancel
                    </button>
                    <button type="submit" className="bg-[#5658e6] hover:bg-[#4338ca] text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-indigo-500/30 transition-all active:scale-[0.98] flex items-center gap-2">
                      Next Step <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                  </div>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleNext2} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div>
                    <label className={labelClasses}>Primary Owner Name</label>
                    <input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} required placeholder="Full Legal Name" className={inputClasses} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClasses}>Contact Email</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="owner@business.com" className={inputClasses} />
                    </div>
                    <div>
                      <label className={labelClasses}>Mobile Number</label>
                      <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} required placeholder="(555) 123-4567" className={inputClasses} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <label className={labelClasses}>Password</label>
                      <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" className={inputClasses} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-8 text-slate-400 hover:text-[#6366f1]">
                        <span className="material-symbols-outlined text-[18px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                      </button>
                    </div>
                    <div className="relative">
                      <label className={labelClasses}>Confirm Password</label>
                      <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required placeholder="••••••••" className={inputClasses} />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-8 text-slate-400 hover:text-[#6366f1]">
                        <span className="material-symbols-outlined text-[18px]">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between items-center">
                    <button type="button" onClick={handlePrev} className="text-slate-500 hover:text-[#6366f1] text-sm font-bold transition-colors">
                      Back
                    </button>
                    <button type="submit" className="bg-[#5658e6] hover:bg-[#4338ca] text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-indigo-500/30 transition-all active:scale-[0.98] flex items-center gap-2">
                      Next Step <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                  </div>
                </form>
              )}

              {step === 3 && (
                <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div>
                    <label className={labelClasses}>12-Digit Aadhaar Card Number</label>
                    <input type="text" name="aadharNumber" maxLength="12" pattern="\d{12}" value={formData.aadharNumber} onChange={handleChange} required placeholder="e.g. 123456789012" className={inputClasses} />
                  </div>

                  <div>
                    <label className={labelClasses}>Upload Aadhaar Card</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col items-center justify-center relative hover:bg-[#6366f1]/5 transition-colors cursor-pointer group">
                      <input type="file" name="aadharFile" onChange={handleFileChange} accept=".pdf,image/*" required className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <span className="material-symbols-outlined text-slate-300 group-hover:text-[#6366f1] text-2xl mb-1 transition-colors">upload_file</span>
                      <p className="text-[10px] font-bold text-slate-500 text-center uppercase tracking-wider">
                        {formData.aadharFileName ? <span className="text-[#6366f1]">{formData.aadharFileName}</span> : "Click to Upload"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className={labelClasses}>Upload Shop License</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col items-center justify-center relative hover:bg-[#6366f1]/5 transition-colors cursor-pointer group">
                      <input type="file" name="shopLicenseFile" onChange={handleFileChange} accept=".pdf,image/*" required className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <span className="material-symbols-outlined text-slate-300 group-hover:text-[#6366f1] text-2xl mb-1 transition-colors">storefront</span>
                      <p className="text-[10px] font-bold text-slate-500 text-center uppercase tracking-wider">
                        {formData.shopLicenseFileName ? <span className="text-[#6366f1]">{formData.shopLicenseFileName}</span> : "Click to Upload"}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between items-center">
                    <button type="button" onClick={handlePrev} className="text-slate-500 hover:text-[#6366f1] text-sm font-bold transition-colors">
                      Back
                    </button>
                    <button type="submit" className="bg-[#10b981] hover:bg-[#059669] text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/30 transition-all active:scale-[0.98] flex items-center gap-2">
                      Submit <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="text-center pt-6 mt-4 border-t border-slate-100">
               <p className="text-xs font-semibold text-slate-400">
                 Already have an account?{' '}
                 <button type="button" onClick={() => navigate('/merchant/login')} className="text-[#6366f1] hover:underline font-bold">Login</button>
               </p>
            </div>
          </div>
        </div>

        {/* Right Side: Abstract Diagonal Visuals */}
        <div 
          className="hidden lg:flex absolute top-0 bottom-0 right-0 w-[58%] bg-gradient-to-br from-[#8b3dff] via-[#6366f1] to-[#3b82f6] items-center justify-center z-10"
          style={{ clipPath: 'polygon(22% 0, 100% 0, 100% 100%, 0 100%)' }}
        >
          {/* Glassmorphism Abstract Triangles (using skewed shapes) */}
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            
            {/* Shape 1 - Background */}
            <div className="absolute top-[30%] left-[20%] w-[120%] h-[120%] bg-white/5 backdrop-blur-sm border border-white/10 rounded-[6rem] rotate-12 z-0" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
            
            {/* Shape 2 - Middle (Triangle) */}
            <div className="absolute top-[20%] left-[10%] w-[100%] h-[100%] bg-white/10 backdrop-blur-md border border-white/20 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] z-10" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', transform: 'rotate(-15deg)' }}></div>

            {/* Shape 3 - Foreground (Triangle) */}
            <div className="absolute top-[35%] left-[25%] w-[80%] h-[80%] bg-white/20 backdrop-blur-xl border border-white/30 rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.3)] z-20 flex items-center justify-center gap-3" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', transform: 'rotate(5deg)' }}>
              <div className="absolute bottom-[30%] flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-inner">
                  <span className="text-[#6366f1] font-black text-2xl">M</span>
                </div>
                <span className="text-4xl font-black text-white tracking-widest drop-shadow-md">MONEYMATE</span>
              </div>
            </div>

            {/* Soft glowing orbs */}
            <div className="absolute top-20 right-20 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-40 w-60 h-60 bg-[#8b3dff]/40 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
