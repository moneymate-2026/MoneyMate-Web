import React, { useState } from 'react';
import MerchantSidebar from '../components/MerchantSidebar';
import MerchantNavbar from '../components/MerchantNavbar';
import MerchantBottomNav from '../components/MerchantBottomNav';
import PlanCard from '../components/PlanCard';

export default function ChoosePlan({ navigate, showToast }) {
  const currentPath = '/merchant/choose-plan';
  const [currentPlan, setCurrentPlan] = useState('Essential');

  const handleSelectPlan = (planName) => {
    if (planName === 'Enterprise') {
      if (showToast) showToast('Redirecting to sales consultation scheduling...', 'info');
    } else {
      setCurrentPlan(planName);
      if (showToast) showToast(`Successfully switched to the ${planName} plan!`, 'success');
    }
  };

  const plans = [
    {
      title: "Essential",
      subtitle: "For new merchants starting their loyalty and scan payments journey.",
      price: "$0",
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
      price: "$29",
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
      price: "$99",
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

      {/* Main Container */}
      <div className="flex-grow md:ml-[280px] flex flex-col">
        {/* Top Navbar */}
        <MerchantNavbar currentPath={currentPath} navigate={navigate} />

        {/* Page Content */}
        <main className="p-6 md:p-8 space-y-8 max-w-7xl w-full mx-auto pb-24 md:pb-8 flex-grow">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3 animate-fade-in">
            <h2 className="font-headline-lg text-headline-lg font-bold text-on-background text-3xl">
              Choose Your Plan
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Select the plan that fits your business scale. Upgrade, downgrade, or cancel anytime.
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 items-stretch animate-scale-up delay-100">
            {plans.map((plan, idx) => (
              <PlanCard 
                key={idx} 
                {...plan} 
                onAction={() => handleSelectPlan(plan.title)} 
              />
            ))}
          </div>

          {/* Pricing FAQ or Note */}
          <div className="bg-surface-container-low rounded-2xl p-6 text-center border border-outline-variant/20 max-w-3xl mx-auto animate-fade-in delay-300">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Need a custom plan with special transaction volumes? <button onClick={() => handleSelectPlan('Enterprise')} className="text-primary font-bold hover:underline">Contact our corporate solutions team</button> for custom pricing.
            </p>
          </div>
        </main>

        {/* Mobile bottom nav */}
        <MerchantBottomNav currentPath={currentPath} navigate={navigate} />
      </div>
    </div>
  );
}
