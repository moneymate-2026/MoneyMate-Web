import React from 'react';

export default function Welcome({ navigate }) {
  return (
    <div className="bg-transparent text-on-background min-h-screen flex flex-col justify-between relative overflow-hidden font-body-md">
      {/* Decorative top background gradient */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] -ml-60 -mb-60 pointer-events-none"></div>

      {/* Header */}
      <header className="w-full max-w-[1600px] mx-auto px-8 lg:px-16 xl:px-24 py-8 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">
            M
          </div>
          <span className="font-display-lg text-headline-md font-bold text-primary">MoneyMate</span>
        </div>
        <button 
          onClick={() => navigate('/merchant/login')}
          className="text-primary hover:bg-primary/5 border border-primary font-label-md text-label-md px-6 py-2.5 rounded-xl transition-all duration-300 active:scale-95"
        >
          Sign In
        </button>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-[1600px] mx-auto px-8 lg:px-16 xl:px-24 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20 items-center z-10 flex-grow">
        {/* Left Column: Wording & Actions */}
        <div className="lg:col-span-6 space-y-8 animate-slide-in-left">
          <div className="space-y-4">
            <span className="bg-primary/10 text-primary font-label-sm text-label-sm px-4 py-1.5 rounded-full uppercase tracking-wider font-semibold">
              Merchant Portal v2.0
            </span>
            <h1 className="font-display-lg text-display-lg text-on-background leading-tight font-bold text-4xl md:text-5xl lg:text-6xl">
              Grow Your Business with <span className="text-primary">MoneyMate</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
              Accept instant payments, build customer loyalty with smart rewards, and track your revenue in real-time. Join the future of fintech payments today.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => navigate('/merchant/register')}
              className="bg-primary hover:bg-primary/95 text-on-primary font-label-md text-label-md px-8 py-4 rounded-xl shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 active:scale-95 text-center flex items-center justify-center gap-2"
            >
              <span>Get Started Now</span>
              <span className="material-symbols-outlined text-md">arrow_forward</span>
            </button>
            <button 
              onClick={() => navigate('/merchant/login')}
              className="bg-surface hover:bg-surface-container text-on-surface border border-outline-variant font-label-md text-label-md px-8 py-4 rounded-xl transition-all duration-300 active:scale-95 text-center"
            >
              Access Portal
            </button>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-outline-variant/30">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <h4 className="font-label-md text-label-md text-on-background font-bold">Zero Setup Fee</h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Register and start accepting payments instantly.</p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                <span className="material-symbols-outlined">bolt</span>
              </div>
              <h4 className="font-label-md text-label-md text-on-background font-bold">Instant Settlements</h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Funds are credited directly to your bank account.</p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined">workspace_premium</span>
              </div>
              <h4 className="font-label-md text-label-md text-on-background font-bold">Smart Rewards</h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Offer automated cashback to keep customers coming back.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Premium Mockup/Visuals */}
        <div className="lg:col-span-6 flex justify-center relative animate-scale-up delay-200">
          <div className="w-full max-w-lg bg-surface-container rounded-3xl p-6 shadow-2xl border border-outline-variant/30 relative overflow-hidden group">
            {/* Soft decorative ring inside mockup */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none"></div>

            {/* Dashboard Mockup Representation */}
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-outline-variant/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">A</div>
                  <div>
                    <h5 className="font-label-md text-label-md text-on-background font-bold">Apex Innovations</h5>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">Verified Merchant</p>
                  </div>
                </div>
                <span className="bg-emerald-50 text-emerald-600 font-label-sm text-label-sm px-2.5 py-1 rounded-full border border-emerald-200">Active</span>
              </div>

              {/* Chart Mockup */}
              <div className="h-44 bg-surface-container rounded-2xl flex flex-col justify-end p-4 relative overflow-hidden border border-outline-variant/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary/10 text-7xl select-none">insights</span>
                </div>
                <div className="flex justify-between items-end h-32 gap-3 relative z-10">
                  <div className="w-full bg-primary/20 rounded-t-lg h-[40%]"></div>
                  <div className="w-full bg-primary/40 rounded-t-lg h-[65%]"></div>
                  <div className="w-full bg-primary/60 rounded-t-lg h-[50%]"></div>
                  <div className="w-full bg-primary rounded-t-lg h-[90%]"></div>
                  <div className="w-full bg-primary/80 rounded-t-lg h-[75%]"></div>
                </div>
              </div>

              {/* Stats Mockup */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface rounded-xl p-4 border border-outline-variant/20">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Daily Revenue</span>
                  <div className="font-headline-md text-headline-md text-on-background font-bold mt-1">$1,240.50</div>
                </div>
                <div className="bg-surface rounded-xl p-4 border border-outline-variant/20">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Customer Loyalty</span>
                  <div className="font-headline-md text-headline-md text-on-background font-bold mt-1">+24%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating badge */}
          <div className="absolute -bottom-6 -left-6 bg-secondary-container text-on-secondary-container p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-outline-variant/30 animate-float">
            <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            </div>
            <div>
              <p className="font-label-md text-label-md font-bold">Try Premium</p>
              <p className="font-body-sm text-body-sm opacity-80">Free 30-day Trial</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-outline-variant/30 py-6 text-center text-on-surface-variant font-body-sm text-body-sm z-10 bg-surface-container-low">
        © 2026 MoneyMate Inc. All rights reserved.
      </footer>
    </div>
  );
}
