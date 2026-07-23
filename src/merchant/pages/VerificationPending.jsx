import React, { useState } from 'react';
import { gatewayClient } from '../../api/gatewayClient';

export default function VerificationPending({ navigate }) {
  const [checking, setChecking] = useState(false);
  const [notification, setNotification] = useState('');

  const handleCheckStatus = async () => {
    setChecking(true);
    setNotification('');
    
    try {
      const response = await gatewayClient.getProfile();
      if (response.success && response.data) {
        if (response.data.status === 'Verified') {
          setNotification('Application verified! Logging you in...');
          setTimeout(() => {
            setChecking(false);
            navigate('/merchant/dashboard');
          }, 1500);
        } else {
          // For demo purposes, auto-verify the status on the first check request
          await gatewayClient.updateProfile({ status: 'Verified' });
          setTimeout(() => {
            setChecking(false);
            setNotification('Compliance approved! Verification status updated. Click "Check Status" again to enter dashboard.');
          }, 2000);
        }
      }
    } catch (error) {
      setChecking(false);
      setNotification('Error verifying status. Please try again.');
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex items-center justify-center py-12 px-6 relative overflow-hidden font-body-md">
      {/* Decorative gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] -ml-60 -mb-60 pointer-events-none"></div>

      <div className="max-w-md w-full bg-white rounded-3xl p-8 md:p-10 border border-outline-variant/30 shadow-2xl relative z-10 text-center space-y-6 animate-scale-up">
        {/* Status Icon */}
        <div className="relative mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary animate-float">
          <span className="material-symbols-outlined text-5xl animate-pulse">
            hourglass_empty
          </span>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-secondary-container rounded-full flex items-center justify-center border-4 border-white">
            <span className="material-symbols-outlined text-sm text-secondary font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
              info
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h2 className="font-headline-lg text-headline-lg text-on-background font-bold text-2xl">
            Verification Pending
          </h2>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-surface-variant text-on-surface-variant font-label-sm text-label-sm font-semibold">
            Under Review
          </span>
          <p className="font-body-md text-body-md text-on-surface-variant pt-2 leading-relaxed">
            Thank you for registering. Our compliance team is currently reviewing your merchant application to ensure secure payments.
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant opacity-70">
            Standard reviews take 24–48 business hours. We will email you immediately upon approval.
          </p>
        </div>

        {/* Status notification */}
        {notification && (
          <div className="bg-tertiary/10 text-tertiary border border-tertiary/20 p-3 rounded-xl font-label-md text-label-md animate-bounce">
            {notification}
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-3 pt-4 border-t border-outline-variant/20">
          <button
            onClick={handleCheckStatus}
            disabled={checking}
            className="w-full bg-primary hover:bg-primary/95 text-on-primary font-label-md text-label-md py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
          >
            {checking ? (
              <>
                <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                <span>Checking Status...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">refresh</span>
                <span>Check Status</span>
              </>
            )}
          </button>
          
          <button
            onClick={() => navigate('/merchant/welcome')}
            className="w-full bg-surface hover:bg-surface-container text-on-surface border border-outline-variant py-3.5 rounded-xl transition-all duration-300 active:scale-95"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
