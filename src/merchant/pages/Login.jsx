import React, { useState } from 'react';
import { gatewayClient } from '../../api/gatewayClient';

export default function Login({ navigate, showToast }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);

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
    <div className="bg-background text-on-background min-h-screen flex items-center justify-center py-12 px-6 relative overflow-hidden font-body-md">
      {/* Decorative gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] -ml-60 -mb-60 pointer-events-none"></div>

      <div className="max-w-md w-full bg-white rounded-3xl p-8 md:p-10 border border-outline-variant/30 shadow-2xl relative z-10 space-y-8 animate-scale-up">
        {/* Header */}
        <div className="text-center">
          <div 
            onClick={() => navigate('/merchant/welcome')}
            className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto shadow-md cursor-pointer mb-4"
          >
            M
          </div>
          <h2 className="font-headline-lg text-headline-lg text-on-background font-bold text-3xl">Merchant Portal</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
            Sign in to manage payments and rewards.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="font-label-sm text-label-sm text-on-surface-variant ml-1">Email Address</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="name@business.com"
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center px-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Password</label>
              <button 
                type="button"
                onClick={() => showToast && showToast('Password reset simulation triggered. Check your email.', 'info')}
                className="font-label-sm text-label-sm text-primary hover:underline"
              >
                Forgot Password?
              </button>
            </div>
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

          <div className="flex items-center justify-between px-1">
            <label className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant cursor-pointer">
              <input 
                type="checkbox" 
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="rounded border-outline-variant text-primary focus:ring-primary focus:ring-0"
              />
              <span>Remember me</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/95 text-on-primary font-label-md text-label-md py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">login</span>
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="text-center pt-4 border-t border-outline-variant/20">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Don't have a merchant account?{' '}
            <button 
              onClick={() => navigate('/merchant/register')}
              className="text-primary font-bold hover:underline"
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
