import React from 'react';
import { Home, LineChart, Wallet, User } from 'lucide-react';

export default function MerchantBottomNav({ currentPath, navigate }) {
  const navItems = [
    { name: 'Home', icon: Home, path: '/merchant/dashboard' },
    { name: 'Analytics', icon: LineChart, path: '/merchant/earnings-reports' },
    { name: 'Wallet', icon: Wallet, path: '/merchant/payment-qr' },
    { name: 'Profile', icon: User, path: '/merchant/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 pb-safe bg-surface/95 backdrop-blur-xl md:hidden border-t border-outline-variant/20 shadow-[0_-4px_20px_rgba(108,56,248,0.1)] rounded-t-xl">
      {navItems.map((item) => {
        const isActive = currentPath === item.path;
        return (
          <button
            key={item.name}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-transform ${
              isActive 
                ? 'text-primary font-bold scale-110' 
                : 'text-on-surface-variant hover:bg-surface-variant/50'
            }`}
          >
            <item.icon 
              className={`w-6 h-6 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}
              strokeWidth={isActive ? 2.5 : 2}
            />
            <span className="font-label-sm text-label-sm mt-1">{item.name}</span>
          </button>
        );
      })}
    </nav>
  );
}
