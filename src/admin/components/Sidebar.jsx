import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Wallet, 
  Users, 
  Store, 
  UserCheck, 
  Activity, 
  FileText, 
  ShieldAlert, 
  MessageSquare, 
  Key, 
  Settings,
  Settings2,
  Tag,
  QrCode,
  Crown,
  AlertTriangle,
  Headphones
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const navGroups = [
  {
    category: "DASHBOARD & FINANCE",
    items: [
      { path: "/admin", icon: LayoutDashboard, label: "Overview" },
      { path: "/admin/wallets", icon: Wallet, label: "Wallets" },
      { path: "/admin/transactions", icon: Activity, label: "Transactions" },
    ]
  },
  {
    category: "USERS & MERCHANTS",
    items: [
      { path: "/admin/users", icon: Users, label: "User Management" },
      { path: "/admin/merchants", icon: Store, label: "Merchant Management" },
      { path: "/admin/kyc", icon: UserCheck, label: "KYC Verification" },
    ]
  },
  {
    category: "STORE & CAMPAIGNS",
    items: [
      { path: "/admin/merchant-campaigns", icon: Tag, label: "Merchant Campaigns" },
      { path: "/admin/store-qrs", icon: QrCode, label: "Store QR Directory" },
      { path: "/admin/merchant-plans", icon: Crown, label: "Subscription Plans" },
    ]
  },
  {
    category: "SUPPORT & COMPLIANCE",
    items: [
      { path: "/admin/reports", icon: FileText, label: "Reports" },
      { path: "/admin/complaints", icon: AlertTriangle, label: "Complaints" },
      { path: "/admin/feedbacks", icon: MessageSquare, label: "Feedbacks" },
      { path: "/admin/support", icon: Headphones, label: "Chat Support" },
    ]
  },
  {
    category: "SYSTEM & SETTINGS",
    items: [
      { path: "/admin/audit", icon: ShieldAlert, label: "Audit Logs" },
      { path: "/admin/rbac", icon: Key, label: "RBAC" },
      { path: "/admin/config", icon: Settings2, label: "Web Config" },
      { path: "/admin/settings", icon: Settings, label: "Settings" },
    ]
  }
];

export default function Sidebar() {
  return (
    <div className="w-[280px] flex-shrink-0 bg-admin-surface-container border-r border-admin-outline-variant h-screen flex flex-col overflow-hidden shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
      <div className="h-[72px] flex items-center px-6 border-b border-admin-outline-variant shrink-0 gap-3">
        <div className="w-9 h-9 overflow-hidden flex-shrink-0 flex items-start justify-center">
          <img src="/logo.png" alt="M" className="w-full h-full object-cover object-top scale-[1.4] origin-top mix-blend-screen" />
        </div>
        <h1 className="text-[22px] font-extrabold text-white tracking-tight">MoneyMate</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-6 custom-scrollbar">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="flex flex-col gap-2">
            <h3 className="text-[12px] font-bold text-admin-on-surface-variant uppercase tracking-[0.15em] px-2 mb-1">
              {group.category}
            </h3>
            <div className="flex flex-col gap-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/admin"}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 relative group",
                    isActive 
                      ? "bg-admin-primary/10 text-admin-primary font-bold" 
                      : "text-slate-200 hover:bg-admin-surface-container-high hover:text-white"
                  )}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-admin-primary rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                      )}
                      <item.icon 
                        className={cn("w-[22px] h-[22px] flex-shrink-0 transition-colors", isActive ? "text-admin-primary" : "text-slate-300 group-hover:text-white")} 
                        strokeWidth={isActive ? 2.5 : 2.25} 
                      />
                      {item.label}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-admin-outline-variant bg-admin-surface-container-low mt-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-admin-primary/20 text-admin-primary flex items-center justify-center font-bold border border-admin-primary/30">
            AD
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold text-admin-on-surface truncate">Admin User</span>
            <span className="text-xs text-admin-on-surface-variant truncate">admin@qrrewards.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}
