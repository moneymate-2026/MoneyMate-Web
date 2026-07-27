import React from 'react';

export default function MerchantSidebar({ currentPath, navigate }) {
  const menuItems = [
    { name: 'Dashboard', icon: 'dashboard', path: '/merchant/dashboard' },
    { name: 'Rewards', icon: 'workspace_premium', path: '/merchant/earnings-reports' },
    { name: 'Offers', icon: 'local_offer', path: '/merchant/create-offer' },
    { name: 'QR Manager', icon: 'qr_code_2', path: '/merchant/payment-qr' },
    { name: 'Subscriptions', icon: 'card_membership', path: '/merchant/choose-plan' },
    { name: 'KYC Status', icon: 'how_to_reg', path: '/merchant/kyc-status' },
  ];

  return (
    <nav className="h-screen w-64 fixed left-0 top-0 hidden md:flex flex-col bg-surface-container-low shadow-md z-40 transition-colors duration-200 ease-in-out py-6 border-r border-outline-variant/30">
      <div className="px-6 mb-8 flex flex-col items-start gap-2">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-variant flex items-center justify-center">
          <img 
            className="w-full h-full object-cover" 
            alt="Merchant Logo" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVqP3a9j873OMX6RSHiZcCoFbWqwx7CFdQH_frKYiUILK7cR22Nofevt0jIn7EntPoBUUFujwtZ95tDepYWjA5SnYub2vyhl0sqtSXElOmkCPgzbtCzoQdMD5jQBuEtNL6cJncxdbYdE9l_7hFekaRvnt_WDG2WC4ZQQcCfi3LALJ91LkVZUKX3JehEF9hHXA70uKhw1FGaon1f5P8Q3iDOIWDGnY-_bNbv_QTroAtC1EFRB3X0JWd"
          />
        </div>
        <div>
          <h1 className="font-headline-md text-headline-md text-primary font-bold">MoneyMate Merchant</h1>
          <p className="font-label-sm text-label-sm text-on-surface-variant">Verified Partner</p>
        </div>
      </div>
      <div className="flex flex-col h-full gap-2 px-2 flex-1">
        {menuItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-colors duration-200 ease-in-out w-full text-left ${
                isActive
                  ? 'bg-primary-container text-on-primary-container font-bold'
                  : 'text-on-surface-variant hover:bg-surface-variant'
              }`}
            >
              <span 
                className="material-symbols-outlined" 
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span className="font-label-md text-label-md">{item.name}</span>
            </button>
          );
        })}
      </div>
      <div className="flex flex-col gap-2 px-2 mt-auto pt-4 border-t border-outline-variant/30">
        <button 
          onClick={() => navigate('/merchant/profile')}
          className="text-on-surface-variant flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-surface-variant transition-colors duration-200 ease-in-out w-full text-left"
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="font-label-md text-label-md">Settings</span>
        </button>
        <button 
          onClick={() => navigate('/merchant/welcome')}
          className="text-on-surface-variant flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-surface-variant transition-colors duration-200 ease-in-out w-full text-left"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="font-label-md text-label-md">Log Out</span>
        </button>
      </div>
    </nav>
  );
}
