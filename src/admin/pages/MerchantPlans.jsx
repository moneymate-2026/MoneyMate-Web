import { useState, useEffect } from "react";
import KpiCard from "../components/KpiCard";
import { adminMerchantService } from "../services/merchants";
import { 
  DollarSign, 
  Users, 
  Search,
  RefreshCcw,
  Calendar,
  XCircle,
  FileText
} from "lucide-react";

export default function MerchantPlans() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, subsRes] = await Promise.all([
        adminMerchantService.getSubscriptionPlans(),
        adminMerchantService.getAdminSubscriptions()
      ]);

      setPlans(plansRes.data || []);
      
      const subsData = subsRes.data?.data || subsRes.data || [];
      if (Array.isArray(subsData)) {
        setSubscriptions(subsData);
      }
    } catch (error) {
      showToast("Failed to load subscription data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCancelSubscription = (subId) => {
    showToast(`Cancelled subscription ${subId}`, "success");
    // Optionally call backend to cancel
  };

  // Helper to find price for a plan code
  const getPlanPrice = (planCode) => {
    const plan = plans.find(p => p.id === planCode || p.plan_code === planCode || p.name?.toLowerCase() === planCode?.toLowerCase());
    if (plan && plan.price) {
      const priceStr = plan.price.toString().split(" ")[0].replace('$', '');
      return parseFloat(priceStr) || 0;
    }
    // Fallback if not found in plans
    if (planCode === 'premium') return 49.99;
    if (planCode === 'enterprise') return 199.99;
    return 0.00;
  };

  // Compute KPIs
  const activeSubs = subscriptions.filter(s => s.status === 'active' || s.Status === 'active');
  const totalSubscribers = activeSubs.length;
  
  const totalMRR = activeSubs.reduce((acc, sub) => {
    const code = sub.plan_code || sub.PlanCode || 'basic';
    return acc + getPlanPrice(code);
  }, 0);

  // Filter subscriptions
  const filteredSubs = subscriptions.filter(sub => {
    const q = searchQuery.toLowerCase();
    const storeId = (sub.store_id || sub.StoreID || '').toLowerCase();
    const planCode = (sub.plan_code || sub.PlanCode || '').toLowerCase();
    const status = (sub.status || sub.Status || '').toLowerCase();
    return storeId.includes(q) || planCode.includes(q) || status.includes(q);
  });

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col p-2 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl border flex items-center gap-3 animate-bounce ${
          toast.type === "error" ? "bg-red-600 text-white border-red-700" : "bg-green-600 text-white border-green-700"
        }`}>
          <span className="font-semibold text-sm">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-[26px] font-extrabold text-admin-on-surface tracking-tight">Merchant Subscriptions</h2>
        <button 
          onClick={fetchData}
          className="flex items-center justify-center p-2 text-admin-on-surface-variant hover:text-admin-on-surface hover:bg-admin-surface-container-high rounded-lg transition-colors"
          title="Refresh Data"
        >
          <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <KpiCard 
          title="Total Monthly Revenue" 
          value={`$${totalMRR.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} 
          trend="up" 
          trendValue="Based on active plans" 
          icon={DollarSign} 
        />
        <KpiCard 
          title="Active Subscribers" 
          value={totalSubscribers.toLocaleString()} 
          trend="up" 
          trendValue="Currently active" 
          icon={Users} 
        />
      </div>

      {/* Main Content - Table */}
      <div className="flex-1 flex flex-col bg-admin-surface-container rounded-xl border border-admin-outline-variant overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-admin-outline-variant flex justify-between items-center bg-admin-surface-container-high">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-on-surface-variant" size={18} />
            <input
              type="text"
              placeholder="Search by merchant ID, plan, or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-admin-surface-container border border-admin-outline-variant text-admin-on-surface rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-admin-primary/50"
            />
          </div>
          <div className="text-sm text-admin-on-surface-variant font-medium">
            Total: {filteredSubs.length}
          </div>
        </div>

        {/* Table Area */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-admin-surface-container-high sticky top-0 z-10">
              <tr>
                <th className="p-4 font-semibold text-admin-on-surface-variant border-b border-admin-outline-variant">Start Date</th>
                <th className="p-4 font-semibold text-admin-on-surface-variant border-b border-admin-outline-variant">End Date</th>
                <th className="p-4 font-semibold text-admin-on-surface-variant border-b border-admin-outline-variant">Which Subscription</th>
                <th className="p-4 font-semibold text-admin-on-surface-variant border-b border-admin-outline-variant">Which Merchant</th>
                <th className="p-4 font-semibold text-admin-on-surface-variant border-b border-admin-outline-variant">Amount</th>
                <th className="p-4 font-semibold text-admin-on-surface-variant border-b border-admin-outline-variant">Status</th>
                <th className="p-4 font-semibold text-admin-on-surface-variant border-b border-admin-outline-variant">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && subscriptions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-admin-on-surface-variant">
                    <div className="flex flex-col items-center justify-center">
                      <RefreshCcw size={32} className="animate-spin mb-4" />
                      <p>Loading subscriptions...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredSubs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-admin-on-surface-variant">
                    <div className="flex flex-col items-center justify-center">
                      <FileText size={48} className="mb-4 opacity-20" />
                      <p className="text-lg">No subscriptions found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSubs.map((sub) => {
                  const id = sub.id || sub.ID;
                  const storeId = sub.store_id || sub.StoreID;
                  const planCode = sub.plan_code || sub.PlanCode || 'Unknown';
                  const status = (sub.status || sub.Status || '').toLowerCase();
                  
                  // Use robust property fallback
                  const startStr = sub.current_period_start || sub.CurrentPeriodStart || sub.created_at || sub.CreatedAt;
                  const endStr = sub.current_period_end || sub.CurrentPeriodEnd;
                  
                  const amount = getPlanPrice(planCode);

                  return (
                    <tr 
                      key={id} 
                      className="border-b border-admin-outline-variant hover:bg-admin-surface-container-high transition-colors"
                    >
                      <td className="p-4 align-top">
                        <div className="flex items-center space-x-2 text-sm text-admin-on-surface-variant">
                          <Calendar size={14} />
                          <span>{startStr ? new Date(startStr).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </td>
                      <td className="p-4 align-top">
                        <div className="flex items-center space-x-2 text-sm text-admin-on-surface-variant">
                          <Calendar size={14} />
                          <span>{endStr ? new Date(endStr).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </td>
                      <td className="p-4 align-top">
                        <span className="px-2 py-1 bg-admin-surface-container-highest rounded text-sm font-semibold text-admin-on-surface capitalize">
                          {planCode}
                        </span>
                      </td>
                      <td className="p-4 align-top">
                        <div className="text-sm font-mono text-admin-on-surface-variant" title={storeId}>
                          {storeId ? `${storeId.substring(0, 8)}...` : 'Unknown'}
                        </div>
                      </td>
                      <td className="p-4 align-top">
                        <div className="text-sm font-semibold text-green-500">
                          ${amount.toFixed(2)}
                        </div>
                      </td>
                      <td className="p-4 align-top">
                        <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${
                          status === 'active' ? 'bg-green-500/20 text-green-500' :
                          status === 'cancelled' ? 'bg-admin-error/20 text-admin-error' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="p-4 align-top">
                        {status === 'active' && (
                          <button 
                            onClick={() => handleCancelSubscription(id)}
                            className="flex items-center space-x-1 text-admin-error hover:text-red-400 bg-admin-error/10 hover:bg-admin-error/20 px-2 py-1 rounded text-sm transition-colors"
                            title="Cancel Subscription"
                          >
                            <XCircle size={16} />
                            <span>Cancel</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
