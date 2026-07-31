import React, { useState } from 'react';
import { gatewayClient } from '../../api/gatewayClient';

export default function Login({ navigate, showToast }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await gatewayClient.login(formData.email, formData.password);
      setLoading(false);
      if (showToast) showToast('Logged in successfully!', 'success');
      navigate('/merchant/dashboard');
    } catch (error) {
      setLoading(false);
      if (showToast) showToast(error.message || 'Login failed', 'error');
    }
  };

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
      <div className="w-full max-w-[1200px] h-[700px] bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden flex relative z-20">
        
        {/* Left Side: Form */}
        <div className="w-full md:w-[50%] p-10 md:p-14 lg:p-16 flex flex-col justify-center relative z-20 bg-transparent">
          <div className="w-full max-w-[380px] mx-auto">
            <div className="mb-8">
              <div 
                onClick={() => navigate('/merchant/welcome')}
                className="w-10 h-10 bg-[#6366f1] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/30 cursor-pointer mb-6 hover:scale-105 transition-transform"
              >
                M
              </div>
              <h2 className="text-[28px] font-extrabold text-[#6366f1] tracking-tight leading-tight">Welcome back!</h2>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-bold text-slate-800 mb-1">Login</h3>
              <p className="text-[11px] font-semibold text-slate-400">Please enter your details to login.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                  className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-300 focus:border-[#6366f1] focus:ring-4 focus:ring-[#6366f1]/10 outline-none transition-all shadow-sm"
                />
              </div>

              <div className="space-y-1.5 relative">
                <div className="flex justify-between items-center pl-1 pr-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
                </div>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter your password"
                    className="w-full bg-white border-2 border-slate-100 rounded-xl pl-4 pr-12 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-300 focus:border-[#6366f1] focus:ring-4 focus:ring-[#6366f1]/10 outline-none transition-all shadow-sm"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#6366f1] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#5658e6] hover:bg-[#4338ca] text-white font-bold text-sm py-3.5 rounded-xl shadow-[0_8px_20px_rgba(99,102,241,0.3)] hover:shadow-[0_12px_25px_rgba(99,102,241,0.4)] transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                      <span>Logging in...</span>
                    </>
                  ) : (
                    <span>Login</span>
                  )}
                </button>
              </div>
              
              <div className="text-center pt-2">
                 <p className="text-[11px] font-semibold text-slate-400">
                   Don't have an account?{' '}
                   <button type="button" onClick={() => navigate('/merchant/register')} className="text-[#6366f1] hover:underline font-bold">Register</button>
                 </p>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side: Abstract Diagonal Visuals */}
        <div 
          className="hidden md:flex absolute top-0 bottom-0 right-0 w-[58%] bg-gradient-to-br from-[#8b3dff] via-[#6366f1] to-[#3b82f6] items-center justify-center z-10"
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
