import React from 'react';

const FloatingCoinsBackground = () => {
  // Generate random properties for multiple floating elements
  const elements = Array.from({ length: 8 }).map((_, i) => {
    const size = Math.random() * 40 + 30; // 30px to 70px
    const left = Math.random() * 100; // 0% to 100%
    const delay = Math.random() * 15; // 0s to 15s delay
    const duration = Math.random() * 10 + 15; // 15s to 25s duration
    const isCoin = Math.random() > 0.5;
    
    return { id: i, size, left, delay, duration, isCoin };
  });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {elements.map((el) => (
        <div
          key={el.id}
          className="absolute flex items-center justify-center animate-drift"
          style={{
            left: `${el.left}%`,
            width: `${el.size}px`,
            height: `${el.size}px`,
            animationDelay: `${el.delay}s`,
            animationDuration: `${el.duration}s`,
          }}
        >
          {el.isCoin ? (
            <div className="w-full h-full bg-gradient-to-br from-yellow-300 to-amber-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.4)] border-2 border-yellow-200 backdrop-blur-sm">
              <span className="material-symbols-outlined text-amber-700/80" style={{ fontSize: el.size * 0.5 }}>attach_money</span>
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 to-surface-tint/20 rounded-2xl rotate-12 flex items-center justify-center shadow-[0_0_20px_rgba(168,127,251,0.2)] border border-primary/20 backdrop-blur-md">
              <span className="material-symbols-outlined text-primary/60" style={{ fontSize: el.size * 0.5 }}>account_balance_wallet</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FloatingCoinsBackground;
