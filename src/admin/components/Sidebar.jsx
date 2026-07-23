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
  Settings2
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { path: "/admin", icon: LayoutDashboard, label: "Overview" },
  { path: "/admin/wallets", icon: Wallet, label: "Wallets" },
  { path: "/admin/users", icon: Users, label: "User Management" },
  { path: "/admin/merchants", icon: Store, label: "Merchant Management" },
  { path: "/admin/kyc", icon: UserCheck, label: "KYC Verification" },
  { path: "/admin/transactions", icon: Activity, label: "Transactions" },
  { path: "/admin/reports", icon: FileText, label: "Reports & Compliance" },
  { path: "/admin/audit", icon: ShieldAlert, label: "Audit Logs" },
  { path: "/admin/support", icon: MessageSquare, label: "Chat Support" },
  { path: "/admin/rbac", icon: Key, label: "RBAC" },
  { path: "/admin/config", icon: Settings2, label: "Web Config" },
  { path: "/admin/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  return (
    <div className="w-[260px] flex-shrink-0 bg-white border-r border-admin-outline-variant h-screen flex flex-col font-[Inter]">
      <div className="h-[64px] flex items-center px-6 border-b border-admin-outline-variant shrink-0">
        <h1 className="text-xl font-bold text-admin-on-surface tracking-tight">QR Rewards Admin</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/admin"}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative",
              isActive 
                ? "bg-admin-surface-container text-admin-primary" 
                : "text-admin-on-surface-variant hover:bg-admin-surface-container-low hover:text-admin-on-surface"
            )}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-admin-primary rounded-r-full" />
                )}
                <item.icon className="w-5 h-5 flex-shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </div>
      
      <div className="p-4 border-t border-admin-outline-variant">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-admin-primary-container text-admin-primary flex items-center justify-center font-bold">
            AD
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-admin-on-surface">Admin User</span>
            <span className="text-xs text-admin-on-surface-variant">admin@qrrewards.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}
