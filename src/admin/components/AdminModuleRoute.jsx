import { Navigate } from "react-router-dom";
import { useAdmin } from "./AdminContext";

export default function AdminModuleRoute({ module, children }) {
  const { hasAnyPermission, loading } = useAdmin();

  if (loading) return null;

  if (!hasAnyPermission(module)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-10 bg-admin-surface-container-low rounded-2xl border border-admin-outline-variant m-6 shadow-xl">
        <div className="w-20 h-20 mb-6 bg-admin-error/10 text-admin-error rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-admin-on-surface mb-2">Access Restricted</h2>
        <p className="text-admin-on-surface-variant text-center max-w-md">
          You don't have the necessary permissions to view the <strong>{module}</strong> area. 
          If you believe this is a mistake, please contact a System Administrator.
        </p>
      </div>
    );
  }

  return children;
}
