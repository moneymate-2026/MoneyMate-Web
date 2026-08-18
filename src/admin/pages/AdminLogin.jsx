import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gatewayClient } from '../../api/gatewayClient';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('admin_token')) {
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (email && password) {
      try {
        const response = await gatewayClient.post('/auth/admin/login', {
          email: email,
          password: password
        });
        
        if (response.success && response.data) {
          const responseData = response.data.data || response.data || {};
          const token = responseData.access_token || responseData.AccessToken || responseData.token || responseData.Token;
          localStorage.setItem('admin_token', token);
          navigate('/admin');
        } else {
          setError(response.data?.error || 'Login failed');
        }
      } catch (err) {
        console.error(err);
        setError('Connection failed. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-admin-background relative overflow-hidden font-['Plus_Jakarta_Sans']">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-admin-primary/20 blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-blue-500/20 blur-[100px] animate-pulse-glow" style={{ animationDelay: '1s' }} />

      {/* Left Side - Brand & Imagery */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center items-center p-12 relative z-10 animate-slide-in-left">
        <div className="max-w-md text-center">
          <img src="/logo.png" alt="MoneyMate" className="h-32 w-auto object-contain mx-auto mb-6 animate-float" />
          <h1 className="text-4xl font-bold text-admin-on-surface mb-4 tracking-tight">QR Rewards Admin Portal</h1>
          <p className="text-admin-on-surface-variant text-lg leading-relaxed">Secure access to manage merchants, users, and global platform configurations.</p>
        </div>
        
        {/* Dashboard Preview Abstract */}
        <div className="mt-16 w-full max-w-lg h-64 rounded-xl border border-admin-outline-variant/60 bg-admin-surface-container/40 backdrop-blur-md shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-admin-surface-container-high/30 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="flex h-full flex-col p-6 space-y-4">
             <div className="h-6 w-32 bg-admin-surface-container-high rounded-md animate-pulse"></div>
             <div className="flex space-x-4">
               <div className="h-24 flex-1 bg-admin-primary/20 rounded-lg border border-admin-primary/30"></div>
               <div className="h-24 flex-1 bg-blue-500/20 rounded-lg border border-blue-500/30"></div>
               <div className="h-24 flex-1 bg-green-500/20 rounded-lg border border-green-500/30"></div>
             </div>
             <div className="h-full w-full bg-admin-surface-container rounded-lg flex items-end overflow-hidden pb-0 px-2 space-x-2">
                 {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-admin-primary/40 to-admin-primary/10 rounded-t-sm" style={{ height: `${h}%` }}></div>
                 ))}
             </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10 animate-fade-in delay-150">
        <div className="w-full max-w-md bg-admin-surface-container/80 backdrop-blur-md rounded-3xl p-10 relative border border-admin-outline-variant/50 shadow-2xl">
          
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-admin-primary to-blue-400 rounded-full blur-[60px] opacity-20 -z-10 translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="text-center mb-10 animate-scale-up delay-300">
            <h2 className="text-3xl font-bold text-admin-on-surface mb-2">Welcome Back</h2>
            <p className="text-admin-on-surface-variant text-sm">Please enter your admin credentials to continue.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-admin-error/10 border border-admin-error/50 text-admin-error px-4 py-2 rounded-xl text-sm animate-fade-in text-center">
                {error}
              </div>
            )}
            <div className="space-y-1 animate-slide-in-right delay-400">
              <label className="text-sm font-semibold text-admin-on-surface ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-admin-on-surface-variant" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 border border-admin-outline-variant/60 rounded-xl text-sm focus:ring-2 focus:ring-admin-primary/40 focus:border-admin-primary transition-all duration-200 bg-admin-background/50 focus:bg-admin-background text-admin-on-surface placeholder-admin-on-surface-variant/50 outline-none shadow-sm hover:border-admin-primary/50"
                  placeholder="admin@qrrewards.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1 animate-slide-in-right delay-500">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-semibold text-admin-on-surface">Password</label>
                <a href="#" className="text-xs font-medium text-admin-primary hover:text-blue-400 transition-colors">Forgot password?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-admin-on-surface-variant" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-12 py-3 border border-admin-outline-variant/60 rounded-xl text-sm focus:ring-2 focus:ring-admin-primary/40 focus:border-admin-primary transition-all duration-200 bg-admin-background/50 focus:bg-admin-background text-admin-on-surface placeholder-admin-on-surface-variant/50 outline-none shadow-sm hover:border-admin-primary/50"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-admin-on-surface-variant hover:text-admin-on-surface focus:outline-none"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center animate-slide-in-right delay-500">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-admin-primary focus:ring-admin-primary border-admin-outline-variant rounded cursor-pointer accent-admin-primary bg-admin-background"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-admin-on-surface-variant cursor-pointer hover:text-admin-on-surface transition-colors">
                Remember me for 30 days
              </label>
            </div>

            <div className="pt-2 animate-fade-in delay-500">
              <button
                type="submit"
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-admin-primary/20 text-sm font-bold text-white bg-admin-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-admin-background focus:ring-admin-primary transform transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                Sign In to Dashboard
              </button>
            </div>
          </form>

          <div className="mt-8 text-center text-xs text-gray-400 animate-fade-in delay-500">
            <p>&copy; {new Date().getFullYear()} QR Rewards System. All rights reserved.</p>
            <p className="mt-1">Secure Admin Authentication Portal</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
