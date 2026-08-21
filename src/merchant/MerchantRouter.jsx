import React, { useState, useEffect } from 'react';
import FloatingCoinsBackground from './components/FloatingCoinsBackground';
import Welcome from './pages/Welcome';
import Register from './pages/Register';
import VerificationPending from './pages/VerificationPending';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ChoosePlan from './pages/ChoosePlan';
import CreateOffer from './pages/CreateOffer';
import PaymentQR from './pages/PaymentQR';
import EarningsReports from './pages/EarningsReports';
import Profile from './pages/Profile';
import KYCStatus from './pages/KYCStatus';
import Wallet from './pages/Wallet';

export default function MerchantRouter() {
  const [path, setPath] = useState(() => {
    const initialPath = window.location.pathname;
    const isAuthenticated = !!localStorage.getItem('merchant_token');
    const publicRoutes = ['/merchant/welcome', '/merchant/register', '/merchant/login', '/merchant/verification-pending'];
    const isPublicPath = publicRoutes.includes(initialPath) || initialPath === '/merchant' || initialPath === '/';
    
    if (!isAuthenticated && !isPublicPath) {
      window.history.replaceState(null, '', '/merchant/login');
      return '/merchant/login';
    }
    if (isAuthenticated && isPublicPath) {
      window.history.replaceState(null, '', '/merchant/dashboard');
      return '/merchant/dashboard';
    }
    return initialPath;
  });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const handlePopState = () => {
      const newPath = window.location.pathname;
      const isAuthenticated = !!localStorage.getItem('merchant_token');
      const publicRoutes = ['/merchant/welcome', '/merchant/register', '/merchant/login', '/merchant/verification-pending'];
      const isPublicPath = publicRoutes.includes(newPath) || newPath === '/merchant' || newPath === '/';

      let finalPath = newPath;
      if (!isAuthenticated && !isPublicPath) {
        finalPath = '/merchant/login';
        window.history.replaceState(null, '', finalPath);
      } else if (isAuthenticated && isPublicPath) {
        finalPath = '/merchant/dashboard';
        window.history.replaceState(null, '', finalPath);
      }
      setPath(finalPath);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const handleAuthExpired = () => {
      setToast({ message: 'Your session has expired. Please log in again.', type: 'error' });
      window.history.replaceState(null, '', '/merchant/login');
      setPath('/merchant/login');
    };

    window.addEventListener('auth_expired', handleAuthExpired);
    return () => window.removeEventListener('auth_expired', handleAuthExpired);
  }, []);

  const navigate = (newPath, replace = false) => {
    const isAuthenticated = !!localStorage.getItem('merchant_token');
    const publicRoutes = ['/merchant/welcome', '/merchant/register', '/merchant/login', '/merchant/verification-pending'];
    const isPublicPath = publicRoutes.includes(newPath) || newPath === '/merchant' || newPath === '/';

    let finalPath = newPath;
    if (!isAuthenticated && !isPublicPath) {
      finalPath = '/merchant/login';
      replace = true;
    } else if (isAuthenticated && isPublicPath) {
      finalPath = '/merchant/dashboard';
      replace = true;
    }

    if (replace) {
      window.history.replaceState(null, '', finalPath);
    } else {
      window.history.pushState(null, '', finalPath);
    }
    setPath(finalPath);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const renderPage = () => {
    switch (path) {
      case '/merchant/welcome':
        return <Welcome navigate={navigate} showToast={showToast} />;
      case '/merchant/register':
        return <Register navigate={navigate} showToast={showToast} />;
      case '/merchant/verification-pending':
        return <VerificationPending navigate={navigate} showToast={showToast} />;
      case '/merchant/login':
        return <Login navigate={navigate} showToast={showToast} />;
      case '/merchant/dashboard':
        return <Dashboard navigate={navigate} showToast={showToast} />;
      case '/merchant/choose-plan':
        return <ChoosePlan navigate={navigate} showToast={showToast} />;
      case '/merchant/create-offer':
        return <CreateOffer navigate={navigate} showToast={showToast} />;
      case '/merchant/payment-qr':
        return <PaymentQR navigate={navigate} showToast={showToast} />;
      case '/merchant/earnings-reports':
        return <EarningsReports navigate={navigate} showToast={showToast} />;
      case '/merchant/wallet':
        return <Wallet navigate={navigate} showToast={showToast} />;
      case '/merchant/profile':
        return <Profile navigate={navigate} showToast={showToast} />;
      case '/merchant/kyc-status':
        return <KYCStatus navigate={navigate} showToast={showToast} />;
      default:
        // Redirect to /merchant/welcome by pushing state
        setTimeout(() => {
          navigate('/merchant/welcome');
        }, 0);
        return <Welcome navigate={navigate} showToast={showToast} />;
    }
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-200 relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <FloatingCoinsBackground />
      </div>
      
      <div className="relative z-10">
        {renderPage()}
      </div>

      {/* Global Animated Premium Toast Notification */}
      {toast && (
        <div 
          className={`fixed bottom-6 right-6 z-50 animate-slide-in-right bg-surface-container rounded-2xl shadow-2xl border p-4 max-w-sm flex items-start gap-3.5 transition-all duration-300 border-outline-variant/40`}
          style={{ boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
        >
          {/* Accent Line */}
          <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${
            toast.type === 'success' ? 'bg-tertiary' : 
            toast.type === 'error' ? 'bg-error' : 'bg-primary'
          }`}></div>

          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
            toast.type === 'success' ? 'bg-tertiary/10 text-tertiary' : 
            toast.type === 'error' ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'
          }`}>
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              {toast.type === 'success' ? 'check_circle' : 
               toast.type === 'error' ? 'cancel' : 'info'}
            </span>
          </div>

          <div className="flex-1 min-w-0 pr-2">
            <p className="font-label-md text-label-md font-bold text-on-surface">
              {toast.type === 'success' ? 'Success' : 
               toast.type === 'error' ? 'Failed' : 'Notice'}
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 leading-normal pr-1">{toast.message}</p>
          </div>

          <button 
            onClick={() => setToast(null)}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}
    </div>
  );
}
