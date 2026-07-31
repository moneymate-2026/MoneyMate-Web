import React, { useState, useEffect } from 'react';
import { gatewayClient } from '../../api/gatewayClient';

export default function MerchantNavbar({ currentPath, navigate }) {
  const defaultAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuDq4xO_uw4wbTgmKt6J4LUnwjLjFTBJAjuoAVVAYun-29iUpkYk-p41vg4a8VnMyoMkkWrUEbY7GXzE-7chiP8LCFoZMtprtB0ISz03hoTtC4eOurjfn3wwRLpV2Ddrdl6QO9MPA4YKsjRlTgI8n2yh4s7dHoRQRR5qB-QXUz0FLGKcO2kMwc13vppnqC-Td_Km0ghmpA_6MV3T68cMXMvDcPAF0tCErk8TzNmsNh2ioNEDIe_ePaUT";
  const [profileImage, setProfileImage] = useState(defaultAvatar);

  useEffect(() => {
    const loadProfileImage = async () => {
      try {
        const response = await gatewayClient.getProfile();
        if (response && response.success && response.data && response.data.profileImage) {
          setProfileImage(response.data.profileImage);
        } else {
          setProfileImage(defaultAvatar);
        }
      } catch (error) {
        console.error('Failed to load profile image in navbar:', error);
      }
    };

    loadProfileImage();

    const handleProfileUpdated = (e) => {
      if (e.detail && e.detail.profileImage !== undefined) {
        setProfileImage(e.detail.profileImage || defaultAvatar);
      } else {
        loadProfileImage();
      }
    };

    const handleProfilePreview = (e) => {
      if (e.detail) {
        setProfileImage(e.detail);
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdated);
    window.addEventListener('profileImagePreview', handleProfilePreview);
    window.addEventListener('storage', loadProfileImage);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdated);
      window.removeEventListener('profileImagePreview', handleProfilePreview);
      window.removeEventListener('storage', loadProfileImage);
    };
  }, []);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "New payment of $45.00 received from John D. via Storefront QR.", time: "5m ago", read: false, icon: "payments" },
    { id: 2, text: "Your Weekend Special campaign has double active scans today.", time: "1h ago", read: false, icon: "campaign" },
    { id: 3, text: "Compliance review completed. Profile verification successful.", time: "1d ago", read: true, icon: "verified_user" },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleClearNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <header className="bg-surface/80 backdrop-blur-xl shadow-sm border-b border-outline-variant sticky top-0 z-40 w-full h-[72px]">
      {/* Desktop view */}
      <div className="hidden md:flex justify-between items-center px-8 h-full relative">
        <div className="flex items-center flex-1 max-w-md relative group">
          <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant/50 text-[20px] group-focus-within:text-primary transition-colors">search</span>
          <input 
            type="text" 
            placeholder="Search transactions, offers, or settings..." 
            className="w-full bg-surface-container-low hover:bg-surface-container border border-outline-variant/40 text-on-surface font-body-sm pl-11 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-on-surface-variant/50 shadow-sm"
          />
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/merchant/choose-plan')}
            className="bg-gradient-to-r from-secondary-container to-secondary-fixed text-on-secondary-container font-label-md text-label-md px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all hover:scale-[1.02] active:scale-95"
          >
            Upgrade to Premium
          </button>
          <div className="flex gap-2 relative">
            {/* Notification button */}
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container transition-all duration-300 relative ${showNotifications ? 'bg-surface-container text-primary' : ''}`}
            >
              <span className="material-symbols-outlined">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-error rounded-full ring-2 ring-white"></span>
              )}
            </button>

            {/* KYC quick status shortcut */}
            <button 
              onClick={() => navigate('/merchant/kyc-status')}
              className="p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container transition-all duration-300"
              title="KYC Status"
            >
              <span className="material-symbols-outlined">verified_user</span>
            </button>

            {/* Notification Dropdown Panel */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-surface-container rounded-2xl border border-outline-variant/30 shadow-2xl z-50 p-4 animate-scale-up">
                <div className="flex justify-between items-center pb-2.5 border-b border-outline-variant/20 mb-2.5">
                  <h4 className="font-label-md text-label-md text-on-background font-bold">Notifications</h4>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllRead} 
                      className="text-primary text-xs font-semibold hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className={`flex gap-3 p-2 rounded-xl transition-colors relative group hover:bg-surface-container-low ${!notif.read ? 'bg-primary/5' : ''}`}
                      >
                        <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${!notif.read ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface-variant'}`}>
                          <span className="material-symbols-outlined text-sm">{notif.icon}</span>
                        </div>
                        <div className="flex-1 space-y-0.5">
                          <p className={`font-body-sm text-body-sm leading-snug text-on-surface ${!notif.read ? 'font-semibold' : ''}`}>{notif.text}</p>
                          <span className="text-[10px] text-on-surface-variant block">{notif.time}</span>
                        </div>
                        <button 
                          onClick={() => handleClearNotification(notif.id)}
                          className="opacity-0 group-hover:opacity-100 text-on-surface-variant hover:text-on-surface p-1 rounded transition-opacity"
                        >
                          <span className="material-symbols-outlined text-xs">close</span>
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-center font-body-sm text-body-sm text-on-surface-variant py-4">No notifications yet</p>
                  )}
                </div>
              </div>
            )}
          </div>
          <img 
            alt="Merchant Profile Avatar" 
            className="w-10 h-10 rounded-full border-2 border-outline-variant/30 object-cover cursor-pointer hover:border-primary transition-all duration-300" 
            onClick={() => navigate('/merchant/profile')}
            src={profileImage}
          />
        </div>
      </div>

      {/* Mobile view */}
      <div className="flex md:hidden justify-between items-center px-6 h-full relative">
        <div 
          onClick={() => navigate('/merchant/dashboard')}
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg bg-gradient-to-r from-[#a87ffb] to-[#00d0ff] text-white shadow-lg shadow-primary/20">
            M
          </div>
          <span className="font-display-lg text-headline-md font-bold text-on-surface hidden sm:block">
            MoneyMate
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowNotifications(!showNotifications)} className="text-primary relative">
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-error rounded-full ring-2 ring-white"></span>
            )}
          </button>
          <button onClick={() => navigate('/merchant/kyc-status')} className="text-primary">
            <span className="material-symbols-outlined">verified_user</span>
          </button>
          <div className="w-8 h-8 rounded-full overflow-hidden cursor-pointer" onClick={() => navigate('/merchant/profile')}>
            <img 
              className="w-full h-full object-cover" 
              alt="Avatar" 
              src={profileImage}
            />
          </div>

          {/* Mobile notification dropdown */}
          {showNotifications && (
            <div className="absolute right-6 top-14 w-72 bg-surface-container rounded-2xl border border-outline-variant/30 shadow-2xl z-50 p-4 animate-scale-up">
              <div className="flex justify-between items-center pb-2.5 border-b border-outline-variant/20 mb-2.5">
                <h4 className="font-label-md text-label-md text-on-background font-bold">Notifications</h4>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-primary text-xs font-semibold hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="space-y-3 max-h-56 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div key={notif.id} className={`flex gap-3 p-2 rounded-xl transition-colors relative ${!notif.read ? 'bg-primary/5' : ''}`}>
                      <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${!notif.read ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface-variant'}`}>
                        <span className="material-symbols-outlined text-sm">{notif.icon}</span>
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <p className="font-body-sm text-body-sm leading-snug text-on-surface">{notif.text}</p>
                        <span className="text-[10px] text-on-surface-variant block">{notif.time}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center font-body-sm text-body-sm text-on-surface-variant py-4">No notifications yet</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
