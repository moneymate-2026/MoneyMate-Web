import { Routes, Route } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import Overview from "./pages/Overview";
import Wallets from "./pages/Wallets";
import UserManagement from "./pages/UserManagement";
import MerchantManagement from "./pages/MerchantManagement";
import KYCVerification from "./pages/KYCVerification";
import Transactions from "./pages/Transactions";
import Reports from "./pages/Reports";
import AuditLogs from "./pages/AuditLogs";
import ChatSupport from "./pages/ChatSupport";
import RBAC from "./pages/RBAC";
import WebConfig from "./pages/WebConfig";
import Settings from "./pages/Settings";

export default function AdminRouter() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Overview />} />
        <Route path="wallets" element={<Wallets />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="merchants" element={<MerchantManagement />} />
        <Route path="kyc" element={<KYCVerification />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="reports" element={<Reports />} />
        <Route path="audit" element={<AuditLogs />} />
        <Route path="support" element={<ChatSupport />} />
        <Route path="rbac" element={<RBAC />} />
        <Route path="config" element={<WebConfig />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
