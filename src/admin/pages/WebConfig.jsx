import { useState, useEffect } from "react";
import { Server, Shield, Key, Users, Store, CreditCard, Lock, Headset, Activity, Power, Save, RefreshCw } from "lucide-react";
import { useAdmin } from "../components/AdminContext";
import { gatewayClient } from "../../api/gatewayClient";

const apiModules = [
  {
    id: "auth_routes",
    name: "Authentication API",
    desc: "User and merchant authentication flows, JWT issuance.",
    icon: Key,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    subRoutes: [
      { id: "auth_user_login", name: "User Login" },
      { id: "auth_user_register", name: "User Registration" },
      { id: "auth_admin_login", name: "Admin Login" },
      { id: "auth_merchant_login", name: "Merchant Login" },
      { id: "auth_merchant_register", name: "Merchant Registration" }
    ]
  },
  {
    id: "pin_routes",
    name: "PIN Validation API",
    desc: "Secure transaction PIN verification and vault routing.",
    icon: Shield,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    subRoutes: [
      { id: "pin_management", name: "Setup & Manage PIN" },
      { id: "pin_verification", name: "Verify PIN Transaction" }
    ]
  },
  {
    id: "admin_routes",
    name: "Administrative Routes",
    desc: "Core controls, RBAC, and master administrative APIs.",
    icon: Users,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    subRoutes: [
      { id: "admin_merchants_kyc", name: "Merchant Management & KYC" },
      { id: "admin_master_campaigns", name: "Master Campaigns Control" },
      { id: "admin_platform_config", name: "Platform Configurations" },
      { id: "admin_system_audit", name: "System Audit Logs" }
    ]
  },
  {
    id: "merchant_routes",
    name: "Merchant Interface API",
    desc: "Dashboard operations, campaigns, and store profiles.",
    icon: Store,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    subRoutes: [
      { id: "merch_dashboard_analytics", name: "Dashboard & Analytics" },
      { id: "merch_campaigns_management", name: "Campaigns Management" },
      { id: "merch_subscriptions", name: "Subscription Plans" },
      { id: "merch_wallet_payouts", name: "Wallet & Payouts" }
    ]
  },
  {
    id: "payment_routes",
    name: "Payment Processing",
    desc: "Wallet management and fiat-to-token operations.",
    icon: CreditCard,
    color: "text-green-500",
    bg: "bg-green-500/10",
    subRoutes: [
      { id: "pay_p2p_transfers", name: "P2P Transfers" },
      { id: "pay_fiat_deposits", name: "Fiat Deposits" },
      { id: "pay_fiat_withdrawals", name: "Fiat Withdrawals" },
      { id: "pay_wallet_balances", name: "Wallet Balances & History" }
    ]
  },
  {
    id: "secure_routes",
    name: "Secure Internal APIs",
    desc: "Protected inter-service communications.",
    icon: Lock,
    color: "text-slate-400",
    bg: "bg-slate-400/10",
    subRoutes: [
      { id: "secure_service_comm", name: "Inter-service Communications" },
      { id: "secure_identity_sync", name: "Protected Identity Sync" }
    ]
  },
  {
    id: "support_routes",
    name: "Support Core",
    desc: "Feedbacks, user complaints, ticketing, and chat.",
    icon: Headset,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    subRoutes: [
      { id: "support_user_complaints", name: "User Complaints" },
      { id: "support_fraud_reports", name: "Fraud Reports" },
      { id: "support_live_chat", name: "Live Chat System" }
    ]
  },
  {
    id: "downstream_routes",
    name: "Downstream Gateway",
    desc: "Proxy routing for downstream microservices.",
    icon: Activity,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    subRoutes: [
      { id: "ds_payment_aggregator", name: "Payment Aggregator" },
      { id: "ds_campaign_service", name: "Campaign Service" },
      { id: "ds_notification_engine", name: "Notification Engine" }
    ]
  }
];

export default function WebConfig() {
  const { hasPermission } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState(null);
  
  // Default all systems to ON
  const [configState, setConfigState] = useState({});

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await gatewayClient.get("/admin/config");
        
        // Initialize default state
        let defaultState = {};
        apiModules.forEach(mod => {
          defaultState[mod.id] = true;
          mod.subRoutes.forEach(sub => {
            defaultState[sub.id] = true;
          });
        });

        if (response.data?.data) {
          setConfigState({ ...defaultState, ...response.data.data });
        } else {
          setConfigState(defaultState);
        }
      } catch (error) {
        console.error("Failed to fetch gateway config:", error);
        showToast("Failed to fetch current configuration.", "error");
      } finally {
        setFetching(false);
      }
    };
    fetchConfig();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleToggle = (id, parentId = null) => {
    setConfigState(prev => {
      const newState = { ...prev, [id]: !prev[id] };
      
      if (parentId) {
        // Toggling a sub-route
        const parentMod = apiModules.find(m => m.id === parentId);
        if (parentMod) {
          const anySubActive = parentMod.subRoutes.some(sub => newState[sub.id]);
          if (!anySubActive) {
            newState[parentId] = false; // Turn off parent if all subs are off
          } else {
            newState[parentId] = true; // Ensure parent is on if at least one sub is on
          }
        }
      } else {
        // Toggling a master route
        const mod = apiModules.find(m => m.id === id);
        if (mod) {
          const isMasterNowActive = newState[id];
          // Match all sub-routes to the master state
          mod.subRoutes.forEach(sub => {
            newState[sub.id] = isMasterNowActive;
          });
        }
      }
      
      return newState;
    });
  };

  const handleToggleAll = (state) => {
    let newState = {};
    apiModules.forEach(mod => {
      newState[mod.id] = state;
      mod.subRoutes.forEach(sub => {
        newState[sub.id] = state;
      });
    });
    setConfigState(newState);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await gatewayClient.put("/admin/config", configState);
      showToast("Platform API configuration updated successfully.", "success");
    } catch (error) {
      console.error("Failed to update gateway config:", error);
      showToast("Failed to update configuration.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="w-8 h-8 border-4 border-admin-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-admin-surface-container border border-admin-outline-variant p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-[24px] font-bold text-admin-on-surface tracking-tight flex items-center gap-3">
            <div className="p-2 bg-admin-primary/10 rounded-lg">
              <Server className="w-6 h-6 text-admin-primary" />
            </div>
            Gateway Router Configuration
          </h2>
        </div>
        

      </div>



      {/* Grid of Route Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {apiModules.map((mod) => {
          const isMasterActive = configState[mod.id];
          const Icon = mod.icon;
          
          return (
            <div 
              key={mod.id} 
              className={`bg-admin-surface-container border border-admin-outline-variant rounded-2xl shadow-sm overflow-hidden flex flex-col transition-all duration-300 ${!isMasterActive ? 'border-admin-error/30 shadow-[0_0_15px_rgba(239,68,68,0.05)]' : ''}`}
            >
              {/* Card Header (Master Toggle) */}
              <div className="p-5 border-b border-admin-outline-variant flex items-start justify-between bg-admin-surface-container-lowest">
                <div className="flex gap-4 items-start">
                   <div className={`p-3 rounded-xl ${mod.bg} ${mod.color} mt-0.5`}>
                     <Icon className="w-6 h-6" />
                   </div>
                   <div>
                     <h3 className="text-[16px] font-bold text-admin-on-surface mb-1 flex items-center gap-2">
                       {mod.name}
                       {!isMasterActive && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-admin-error/10 text-admin-error rounded-md">
                            Offline
                          </span>
                       )}
                     </h3>
                     <p className="text-[13px] text-admin-on-surface-variant leading-relaxed max-w-[280px]">
                       {mod.desc}
                     </p>
                   </div>
                </div>
                
                <div className="flex items-center pt-2">
                   <button
                     type="button"
                     onClick={() => hasPermission('settings', 'update') && handleToggle(mod.id)}
                     disabled={!hasPermission('settings', 'update')}
                     className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                       isMasterActive ? 'bg-admin-primary' : 'bg-admin-surface-container-highest border-admin-outline-variant'
                     } ${!hasPermission('settings', 'update') ? 'opacity-50 cursor-not-allowed' : ''}`}
                   >
                     <span className="sr-only">Toggle {mod.name}</span>
                     <span
                       className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                         isMasterActive ? 'translate-x-5' : 'translate-x-0'
                       }`}
                     />
                   </button>
                </div>
              </div>
              
              {/* Card Body (Sub Routes) */}
              <div className={`flex flex-col p-2 pb-3 transition-opacity duration-300 ${!isMasterActive ? 'opacity-40 pointer-events-none grayscale-[50%]' : ''}`}>
                {mod.subRoutes.map((sub) => {
                  const isSubActive = configState[sub.id];
                  
                  return (
                    <div key={sub.id} className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-admin-surface-container-highest/40 transition-colors group">
                      <span className="text-[14px] font-medium text-admin-on-surface group-hover:text-admin-primary transition-colors">
                        {sub.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => hasPermission('settings', 'update') && handleToggle(sub.id, mod.id)}
                        disabled={!hasPermission('settings', 'update')}
                        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isSubActive ? 'bg-emerald-500' : 'bg-admin-surface-container-highest border-admin-outline-variant'
                        } ${!hasPermission('settings', 'update') ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span className="sr-only">Toggle {sub.name}</span>
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            isSubActive ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border flex items-center gap-3 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300 ${
          toast.type === "error" ? "bg-red-600 text-white border-red-700" : "bg-emerald-600 text-white border-emerald-700"
        }`}>
          <span className="font-bold text-sm tracking-wide">{toast.message}</span>
        </div>
      )}
    </div>
  );
}