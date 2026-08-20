import { Routes, Route } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { AdminProvider } from "./components/AdminContext";
import Overview from "./pages/Overview";
import Wallets from "./pages/Wallets";
import UserManagement from "./pages/UserManagement";
import MerchantManagement from "./pages/MerchantManagement";
import KYCVerification from "./pages/KYCVerification";
import MerchantCampaigns from "./pages/MerchantCampaigns";
import StoreQRs from "./pages/StoreQRs";
import MerchantPlans from "./pages/MerchantPlans";
import Transactions from "./pages/Transactions";
import Reports from "./pages/Reports";
import Complaints from "./pages/Complaints";
import Feedbacks from "./pages/Feedbacks";
import AuditLogs from "./pages/AuditLogs";
import ChatSupport from "./pages/ChatSupport";
import RBAC from "./pages/RBAC";
import WebConfig from "./pages/WebConfig";
import Settings from "./pages/Settings";
import AdminLogin from "./pages/AdminLogin";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminModuleRoute from "./components/AdminModuleRoute";

export default function AdminRouter() {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route element={<AdminProtectedRoute />}>
        <Route path="/admin" element={<AdminProvider><AdminLayout /></AdminProvider>}>
          <Route index element={<AdminModuleRoute module="dashboard"><Overview /></AdminModuleRoute>} />
          <Route path="wallets" element={<AdminModuleRoute module="dashboard"><Wallets /></AdminModuleRoute>} />
          
          <Route path="users" element={<AdminModuleRoute module="users"><UserManagement /></AdminModuleRoute>} />
          <Route path="merchants" element={<AdminModuleRoute module="store"><MerchantManagement /></AdminModuleRoute>} />
          <Route path="kyc" element={<AdminModuleRoute module="users"><KYCVerification /></AdminModuleRoute>} />
          
          <Route path="merchant-campaigns" element={<AdminModuleRoute module="store"><MerchantCampaigns /></AdminModuleRoute>} />
          <Route path="store-qrs" element={<AdminModuleRoute module="store"><StoreQRs /></AdminModuleRoute>} />
          <Route path="merchant-plans" element={<AdminModuleRoute module="store"><MerchantPlans /></AdminModuleRoute>} />
          
          <Route path="transactions" element={<AdminModuleRoute module="dashboard"><Transactions /></AdminModuleRoute>} />
          
          <Route path="reports" element={<AdminModuleRoute module="support"><Reports /></AdminModuleRoute>} />
          <Route path="complaints" element={<AdminModuleRoute module="support"><Complaints /></AdminModuleRoute>} />
          <Route path="feedbacks" element={<AdminModuleRoute module="support"><Feedbacks /></AdminModuleRoute>} />
          <Route path="support" element={<AdminModuleRoute module="support"><ChatSupport /></AdminModuleRoute>} />
          
          <Route path="audit" element={<AdminModuleRoute module="settings"><AuditLogs /></AdminModuleRoute>} />
          <Route path="rbac" element={<AdminModuleRoute module="settings"><RBAC /></AdminModuleRoute>} />
          <Route path="config" element={<AdminModuleRoute module="settings"><WebConfig /></AdminModuleRoute>} />
          <Route path="settings" element={<AdminModuleRoute module="settings"><Settings /></AdminModuleRoute>} />
        </Route>
      </Route>
    </Routes>
  );
}
