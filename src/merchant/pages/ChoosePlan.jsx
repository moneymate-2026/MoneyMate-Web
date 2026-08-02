import React, { useState, useEffect } from 'react';
import MerchantSidebar from '../components/MerchantSidebar';
import MerchantNavbar from '../components/MerchantNavbar';
import MerchantBottomNav from '../components/MerchantBottomNav';
import PlanCard from '../components/PlanCard';
import { gatewayClient } from '../../api/gatewayClient';

export default function ChoosePlan({ navigate, showToast }) {
  const currentPath = '/merchant/choose-plan';
  const [currentPlan, setCurrentPlan] = useState('Essential');
  const [loading, setLoading] = useState(true);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await gatewayClient.getCurrentSubscription();
        if (res.success && res.data && res.data.planName) {
          setCurrentPlan(res.data.planName);
        } else if (res.success && res.data && res.data.PlanName) {
          setCurrentPlan(res.data.PlanName);
        }
      } catch (err) {
        console.error("Failed to load current plan", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, []);

  const handleSelectPlan = async (planName) => {
    if (planName === 'Enterprise') {
      if (showToast) showToast('Redirecting to sales consultation scheduling...', 'info');
      return;
    }

    if (planName === 'Essential') {
      try {
        await gatewayClient.changeSubscriptionPlan('essential', 'Downgrade');
        setCurrentPlan('Essential');
        if (showToast) showToast('Successfully downgraded to Essential.', 'success');
      } catch (err) {
        if (showToast) showToast(err.message || 'Failed to downgrade', 'error');
      }
      return;
    }

    // Handle Growth plan upgrade using Razorpay
    if (planName === 'Growth') {
      try {
        const initRes = await gatewayClient.initiateUpgrade('growth');
        const orderId = initRes.data?.order_id || initRes.data?.orderId;
        
        if (!orderId) {
          throw new Error('Failed to create payment order');
        }

        const options = {
          key: 'rzp_test_TKsO2y7CqtGfzS', // Test key
          amount: 249900, // 2499 INR in paise
          currency: 'INR',
          name: 'MoneyMate',
          description: 'Upgrade to Growth Plan',
          order_id: orderId,
          handler: async function (response) {
            try {
              await gatewayClient.verifyUpgrade(
                response.razorpay_payment_id,
                response.razorpay_order_id,
                response.razorpay_signature,
                'growth'
              );
              setCurrentPlan('Growth');
              if (showToast) showToast('Successfully switched to the Growth plan!', 'success');
            } catch (err) {
              if (showToast) showToast(err.message || 'Payment verification failed', 'error');
            }
          },
          prefill: {
            name: localStorage.getItem('merchant_business_name') || 'Merchant',
            email: localStorage.getItem('merchant_email') || '',
          },
          theme: {
            color: '#6366f1'
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response){
          if (showToast) showToast('Payment failed or cancelled', 'error');
        });
        rzp.open();
      } catch (err) {
        if (showToast) showToast(err.message || 'Failed to initiate upgrade', 'error');
      }
    }
  };

  const plans = [
    {
      title: "Essential",
      subtitle: "For new merchants starting their loyalty and scan payments journey.",
      price: "₹0",
      billingCycle: "/mo",
      buttonText: currentPlan === 'Essential' ? "Active Plan" : "Downgrade to Essential",
      buttonType: "secondary",
      isCurrent: currentPlan === 'Essential',
      features: [
        { text: "Standard QR Payments" },
        { text: "1 Active Offer Campaign" },
        { text: "Standard Dashboard Analytics" },
        { text: "Support via email" },
        { text: "Custom API Integrations", included: false },
        { text: "Dedicated Account Manager", included: false },
      ]
    },
    {
      title: "Growth",
      subtitle: "For growing businesses wanting to supercharge sales and customer retention.",
      price: "₹2,499",
      billingCycle: "/mo",
      buttonText: currentPlan === 'Growth' ? "Active Plan" : "Upgrade to Growth",
      buttonType: "primary",
      isPopular: true,
      isCurrent: currentPlan === 'Growth',
      features: [
        { text: "Unlimited QR Payments" },
        { text: "5 Active Offer Campaigns" },
        { text: "Advanced Analytics & Insights" },
        { text: "SMS Customer Notifications" },
        { text: "Priority Email & Chat Support" },
        { text: "Custom API Integrations", included: false },
      ]
    },
    {
      title: "Enterprise",
      subtitle: "For large retail chains needing bespoke integrations and dedicated support.",
      price: "₹8,499",
      billingCycle: "/mo",
      buttonText: "Contact Sales",
      buttonType: "secondary",
      isCurrent: currentPlan === 'Enterprise',
      features: [
        { text: "Everything in Growth" },
        { text: "Unlimited Active Campaigns" },
        { text: "Custom API & Webhook Integrations", highlight: true },
        { text: "Dedicated Account Manager" },
        { text: "24/7 Phone & Slack Support" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <MerchantSidebar currentPath={currentPath} navigate={navigate} />

      <div className="flex-grow md:ml-[280px] flex flex-col min-w-0">
        {/* Top Navbar */}
        <MerchantNavbar currentPath={currentPath} navigate={navigate} />

        {/* Page Content */}
        <main className="p-6 md:px-12 md:py-10 space-y-8 w-full pb-24 md:pb-8 flex-grow">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-8 animate-fade-in">
            <h2 className="font-headline-lg text-headline-lg font-bold text-on-background text-3xl">
              Choose Your Plan
            </h2>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 pt-4 items-stretch animate-scale-up delay-100 max-w-6xl mx-auto">
            {loading ? (
              <div className="col-span-1 lg:col-span-3 flex justify-center py-12">
                <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
              </div>
            ) : (
              plans.map((plan, idx) => (
                <PlanCard 
                  key={idx} 
                  {...plan} 
                  onAction={() => handleSelectPlan(plan.title)} 
                />
              ))
            )}
          </div>

          {!loading && currentPlan !== 'Essential' && (
            <div className="mt-8 text-center animate-fade-in delay-200">
              <button 
                onClick={() => handleSelectPlan('Essential')}
                className="text-error font-label-md hover:underline bg-error/10 px-6 py-3 rounded-xl transition-colors hover:bg-error/20 inline-flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">cancel</span>
                Cancel Premium Subscription (Downgrade to Essential)
              </button>
            </div>
          )}
        </main>

        {/* Mobile bottom nav */}
        <MerchantBottomNav currentPath={currentPath} navigate={navigate} />
      </div>
    </div>
  );
}
