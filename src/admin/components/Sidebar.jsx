import { NavLink, useNavigate } from "react-router-dom";
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
  Headphones,
  LogOut
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { gatewayClient } from "../../api/gatewayClient";
import { useAdmin } from "./AdminContext";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const navGroups = [
  {
    category: "DASHBOARD & FINANCE",
    items: [
      { path: "/admin", icon: LayoutDashboard, label: "Overview", module: "dashboard" },
      { path: "/admin/wallets", icon: Wallet, label: "Wallets", module: "dashboard" },
    ]
  },
  {
    category: "USERS & MERCHANTS",
    items: [
      { path: "/admin/users", icon: Users, label: "User Management", module: "users" },
      { path: "/admin/merchants", icon: Store, label: "Merchant Management", module: "store" },
      { path: "/admin/kyc", icon: UserCheck, label: "KYC Verification", module: "users" },
    ]
  },
  {
    category: "STORE & CAMPAIGNS",
    items: [
      { path: "/admin/merchant-campaigns", icon: Tag, label: "Merchant Campaigns", module: "store" },
      { path: "/admin/store-qrs", icon: QrCode, label: "Store QR Directory", module: "store" },
      { path: "/admin/merchant-plans", icon: Crown, label: "Subscription Plans", module: "store" },
    ]
  },
  {
    category: "SUPPORT & COMPLIANCE",
    items: [
      { path: "/admin/reports", icon: FileText, label: "Reports", module: "support" },
      { path: "/admin/complaints", icon: AlertTriangle, label: "Complaints", module: "support" },
      { path: "/admin/feedbacks", icon: MessageSquare, label: "Feedbacks", module: "support" },
      { path: "/admin/support", icon: Headphones, label: "Chat Support", module: "support" },
    ]
  },
  {
    category: "SYSTEM & SETTINGS",
    items: [
      { path: "/admin/audit", icon: ShieldAlert, label: "Audit Logs", module: "settings" },
      { path: "/admin/rbac", icon: Key, label: "RBAC", module: "settings" },
      { path: "/admin/config", icon: Settings2, label: "Web Config", module: "settings" },
    ]
  }
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { hasAnyPermission, roleName } = useAdmin();

  const handleLogout = async () => {
    try {
      await gatewayClient.post('/auth/logout');
    } catch (e) {
      console.warn("Logout API failed, continuing local logout", e);
    }
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  return (
    <div className="w-[280px] flex-shrink-0 bg-admin-surface-container border-r border-admin-outline-variant h-screen flex flex-col overflow-hidden shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
      <div className="h-[72px] flex items-center px-6 border-b border-admin-outline-variant shrink-0 gap-3">
        <div className="w-9 h-9 overflow-hidden flex-shrink-0 flex items-start justify-center">
          <img src="/logo.png" alt="M" className="w-full h-full object-cover object-top scale-[1.4] origin-top mix-blend-screen" />
        </div>
        <h1 className="text-[22px] font-extrabold text-white tracking-tight">MoneyMate</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-6 custom-scrollbar">
        {navGroups.map((group, groupIdx) => {
          const visibleItems = group.items.filter(item => hasAnyPermission(item.module));
          if (visibleItems.length === 0) return null;

          return (
            <div key={groupIdx} className="flex flex-col gap-2">
              <h3 className="text-[12px] font-bold text-admin-on-surface-variant uppercase tracking-[0.15em] px-2 mb-1">
                {group.category}
              </h3>
              <div className="flex flex-col gap-1">
                {visibleItems.map((item) => (
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
          );
        })}
      </div>
      
      <div className="p-4 border-t border-admin-outline-variant bg-admin-surface-container-low mt-auto">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 flex-1 overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-admin-primary/20 text-admin-primary flex items-center justify-center font-bold border border-admin-primary/30 shrink-0">
              AD
            </div>
            <div className="flex flex-col overflow-hidden justify-center">
              <span className="text-sm font-semibold text-admin-on-surface truncate">
                {roleName === 'admin' ? 'Administrator' : roleName || 'Staff Member'}
              </span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-admin-on-surface-variant hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
