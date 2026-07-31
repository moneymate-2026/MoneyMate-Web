import React from 'react';

export default function PlanCard({ 
  title, 
  subtitle, 
  price, 
  billingCycle = '/mo', 
  buttonText, 
  buttonType = 'primary', 
  features = [], 
  isPopular = false, 
  isCurrent = false,
  onAction
}) {
  return (
    <div className={`rounded-[24px] p-8 flex flex-col h-full relative overflow-hidden transition-all duration-300 ${
      isPopular 
        ? 'bg-surface-container premium-glow shadow-[0_20px_40px_rgba(108,56,248,0.1)] border-2 border-primary transform md:-translate-y-4 z-10' 
        : 'bg-surface-container backdrop-blur-md border border-outline-variant/50 shadow-[0_4px_20px_rgba(108,56,248,0.05)]'
    }`}>
      {isCurrent && (
        <div className="absolute top-0 right-0 bg-surface-variant text-on-surface-variant font-label-sm text-label-sm px-4 py-1 rounded-bl-lg">
          Current Plan
        </div>
      )}
      
      {isPopular && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary to-primary-container text-on-primary font-label-md text-label-md px-6 py-1.5 rounded-b-lg shadow-sm whitespace-nowrap">
          Most Popular
        </div>
      )}

      <div className={`flex justify-between items-center mb-2 ${isPopular ? 'mt-4' : ''}`}>
        <h3 className={`font-headline-md text-headline-md font-bold ${isPopular ? 'text-primary' : 'text-on-surface'}`}>{title}</h3>
        {isPopular && (
          <span className="material-symbols-outlined text-secondary-container text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            workspace_premium
          </span>
        )}
      </div>
      
      <p className="font-body-sm text-body-sm text-on-surface-variant mb-6 min-h-[40px]">{subtitle}</p>
      
      <div className="mb-8 flex items-baseline">
        <span className="font-display-lg text-display-lg text-on-surface font-bold text-4xl">{price}</span>
        <span className="font-body-md text-body-md text-on-surface-variant ml-1">{billingCycle}</span>
      </div>

      <button
        onClick={onAction}
        disabled={isCurrent}
        className={`w-full py-3.5 rounded-lg font-label-md text-label-md transition-all duration-300 ${
          isCurrent 
            ? 'bg-surface-container text-on-surface border border-outline-variant/50 cursor-default'
            : buttonType === 'primary'
              ? 'bg-primary hover:bg-primary/90 text-on-primary shadow-md hover:scale-[1.02] active:scale-[0.98]'
              : 'bg-surface-container hover:bg-surface-variant text-primary border-2 border-primary'
        } mb-8`}
      >
        {buttonText}
      </button>

      <div className="flex-grow flex flex-col gap-4">
        <p className="font-label-md text-label-md text-on-surface mb-2">
          {isPopular ? 'Everything in Essential, plus:' : 'Included features:'}
        </p>
        <ul className="flex flex-col gap-3 font-body-sm text-body-sm">
          {features.map((feature, idx) => {
            const isIncluded = feature.included !== false;
            return (
              <li 
                key={idx} 
                className={`flex items-start gap-3 ${
                  !isIncluded ? 'opacity-50 text-on-surface-variant' : feature.highlight ? 'bg-primary-fixed/30 p-2 rounded-lg border border-primary/20 text-on-surface' : 'text-on-surface'
                }`}
              >
                <span 
                  className={`material-symbols-outlined text-[20px] ${feature.highlight ? 'text-primary fill' : isIncluded ? 'text-primary' : 'text-outline'}`}
                  style={{ fontVariationSettings: feature.highlight ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {feature.highlight ? 'campaign' : isIncluded ? 'check_circle' : 'close'}
                </span>
                <span className={feature.highlight ? 'font-bold text-primary' : ''}>
                  {feature.text}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
