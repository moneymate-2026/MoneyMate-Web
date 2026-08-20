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
  FileText,
  Plus
} from "lucide-react";
import StatusBadge from "../components/StatusBadge";

export default function MerchantPlans() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    storeId: '',
    planCode: ''
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, subsRes, merchantsRes] = await Promise.all([
        adminMerchantService.getSubscriptionPlans(),
        adminMerchantService.getAdminSubscriptions(),
        adminMerchantService.getMerchants()
      ]);

      setPlans(plansRes.data || []);
      setMerchants(merchantsRes.data || []);
      
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

  const handleCancelSubscription = async (storeId) => {
    try {
      await adminMerchantService.updateSubscriptionTier(storeId, 'basic');
      showToast(`Subscription cancelled successfully!`);
      fetchData();
    } catch (error) {
      showToast("Failed to cancel subscription", "error");
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.storeId || !formData.planCode) {
      showToast("Please fill in required fields", "error");
      return;
    }
    try {
      await adminMerchantService.updateSubscriptionTier(formData.storeId, formData.planCode);
      showToast("Subscription created successfully!");
      setIsModalOpen(false);
      setFormData({ storeId: '', planCode: '' });
      fetchData();
    } catch (error) {
      showToast("Failed to create subscription", "error");
    }
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
    
    const merchant = merchants.find(m => m.id === (sub.store_id || sub.StoreID));
    const businessName = merchant ? merchant.businessName.toLowerCase() : '';
    
    return storeId.includes(q) || planCode.includes(q) || status.includes(q) || businessName.includes(q);
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
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-admin-primary text-admin-on-primary rounded-xl font-semibold shadow-md shadow-admin-primary/20 hover:bg-admin-primary-container transition-all flex items-center gap-2 text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4 shrink-0" /> Create Subscription
          </button>
          <button 
            onClick={fetchData}
            className="flex items-center justify-center p-2 text-admin-on-surface-variant hover:text-admin-on-surface hover:bg-admin-surface-container-high rounded-lg transition-colors"
            title="Refresh Data"
          >
            <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <KpiCard 
          title="Total Monthly Revenue" 
          value={`$${totalMRR.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} 
          icon={DollarSign} 
        />
        <KpiCard 
          title="Active Subscribers" 
          value={totalSubscribers.toLocaleString()} 
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
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-admin-on-surface">
                            {merchants.find(m => m.id === storeId)?.businessName || "Unknown Merchant"}
                          </span>
                          <span className="text-xs font-mono text-admin-on-surface-variant" title={storeId}>
                            {storeId ? `${storeId.substring(0, 8)}...` : 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 align-top">
                        <div className="text-sm font-semibold text-green-500">
                          ${amount.toFixed(2)}
                        </div>
                      </td>
                      <td className="p-4 align-top">
                        <StatusBadge 
                          status={status.charAt(0).toUpperCase() + status.slice(1)} 
                          variant={
                            status === 'active' ? 'success' :
                            status === 'cancelled' ? 'error' :
                            'default'
                          } 
                        />
                      </td>
                      <td className="p-4 align-top">
                        {status === 'active' && planCode !== 'basic' && (
                          <button 
                            onClick={() => handleCancelSubscription(storeId)}
                            className="flex items-center space-x-1.5 px-2 py-1.5 rounded-lg font-bold text-xs transition-all text-admin-on-surface-variant hover:text-red-500 hover:bg-red-500/10"
                            title="Cancel Subscription"
                          >
                            <XCircle size={14} />
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

      {/* CREATE SUBSCRIPTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-admin-surface-container rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-admin-outline-variant animate-in zoom-in-95 duration-200 flex flex-col">
            <div className="p-6 border-b border-admin-outline-variant flex justify-between items-center bg-admin-surface-container-high shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-admin-primary/10 text-admin-primary flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-admin-on-surface">Create New Subscription</h3>
                  <span className="text-xs text-admin-on-surface-variant">Select an existing merchant and assign a plan</span>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-admin-surface-container-highest rounded-full text-admin-on-surface-variant hover:text-admin-on-surface transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-admin-on-surface-variant block mb-1">Select Merchant *</label>
                <select 
                  required
                  value={formData.storeId}
                  onChange={(e) => setFormData({ ...formData, storeId: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-admin-outline-variant text-sm font-semibold text-admin-on-surface bg-admin-surface-container-lowest focus:ring-2 focus:ring-admin-primary/20 outline-none"
                >
                  <option value="">-- Select Merchant --</option>
                  {merchants.map(m => (
                    <option key={m.id} value={m.id}>{m.businessName} ({m.displayId})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-admin-on-surface-variant block mb-1">Select Plan *</label>
                <select 
                  required
                  value={formData.planCode}
                  onChange={(e) => setFormData({ ...formData, planCode: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-admin-outline-variant text-sm font-semibold text-admin-on-surface bg-admin-surface-container-lowest focus:ring-2 focus:ring-admin-primary/20 outline-none"
                >
                  <option value="">-- Select Plan --</option>
                  {plans.map(p => (
                    <option key={p.plan_code} value={p.plan_code}>{p.name} - {p.formatted_price || `$${p.price}`}</option>
                  ))}
                </select>
              </div>
              <div className="pt-4 border-t flex justify-end gap-3 shrink-0">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-admin-outline-variant text-admin-on-surface font-semibold text-xs rounded-xl hover:bg-admin-surface-container-highest transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-admin-primary hover:bg-admin-primary-container text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Create Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
