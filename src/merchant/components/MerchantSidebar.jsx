import React from 'react';
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Wallet, 
  Tag, 
  QrCode, 
  Crown, 
  UserCheck, 
  Settings, 
  LogOut 
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function MerchantSidebar({ currentPath, navigate }) {
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/merchant/dashboard' },
    { name: 'Offers', icon: Tag, path: '/merchant/create-offer' },
    { name: 'QR Manager', icon: QrCode, path: '/merchant/payment-qr' },
    { name: 'Subscriptions', icon: Crown, path: '/merchant/choose-plan' },
    { name: 'KYC Status', icon: UserCheck, path: '/merchant/kyc-status' },
  ];

  return (
    <div className="w-[280px] flex-shrink-0 bg-surface-container border-r border-outline-variant h-screen hidden md:flex flex-col overflow-hidden shadow-[4px_0_24px_rgba(0,0,0,0.2)] fixed left-0 top-0 z-40 transition-colors duration-200">
      <div className="h-[72px] flex items-center px-6 border-b border-outline-variant shrink-0 gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg bg-gradient-to-r from-[#a87ffb] to-[#00d0ff] text-white shadow-lg shadow-primary/20">
          M
        </div>
        <div>
          <h1 className="text-xl font-bold text-on-surface tracking-tight leading-tight">MoneyMate</h1>
          <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Merchant</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-6 custom-scrollbar">
        <div className="flex flex-col gap-2">
          <h3 className="text-[12px] font-bold text-on-surface-variant uppercase tracking-[0.15em] px-2 mb-1">
            Menu
          </h3>
          <div className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 relative group w-full text-left",
                    isActive 
                      ? "bg-primary/10 text-primary font-bold" 
                      : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full shadow-[0_0_8px_rgba(139,61,255,0.6)]" />
                  )}
                  <item.icon 
                    className={cn("w-[22px] h-[22px] flex-shrink-0 transition-colors", isActive ? "text-primary" : "text-on-surface-variant group-hover:text-on-surface")} 
                    strokeWidth={isActive ? 2.5 : 2.25} 
                  />
                  {item.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-outline-variant mt-auto">
        <div className="flex flex-col gap-1">
          <button 
            onClick={() => navigate('/merchant/profile')}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all duration-200 w-full text-left"
          >
            <Settings className="w-[22px] h-[22px] flex-shrink-0 text-on-surface-variant" strokeWidth={2.25} />
            Settings
          </button>
          <button 
            onClick={() => navigate('/merchant/welcome')}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-error hover:bg-error/10 transition-all duration-200 w-full text-left"
          >
            <LogOut className="w-[22px] h-[22px] flex-shrink-0" strokeWidth={2.25} />
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
