import { useState, useEffect } from "react";
import KpiCard from "../components/KpiCard";
import { adminMerchantService } from "../../services/api/admin/merchants";
import { 
  Crown, 
  DollarSign, 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  Edit3, 
  Plus, 
  ShieldCheck, 
  Sparkles, 
  Layers,
  X
} from "lucide-react";

export default function MerchantPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await adminMerchantService.getSubscriptionPlans();
      setPlans(response.data);
    } catch (error) {
      showToast("Failed to load subscription plans", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSavePlan = (e) => {
    e.preventDefault();
    showToast(`Successfully updated ${editingPlan.name} pricing and feature entitlements!`);
    setEditingPlan(null);
  };

  const totalMRR = "$44,930";
  const totalSubscribers = plans.reduce((acc, p) => acc + p.activeMerchants, 0);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
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
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[26px] font-extrabold text-admin-on-surface tracking-tight">Merchant Subscription Plans</h2>
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full">
              3 Active Tiers
            </span>
          </div>
          <p className="text-sm text-admin-on-surface-variant mt-1">
            Configure SaaS billing tiers, manage Monthly Recurring Revenue (MRR), and define feature limits for shop owners.
          </p>
        </div>

        <button 
          onClick={() => showToast("Opening new custom tier builder...")}
          className="px-4 py-2.5 bg-admin-primary text-admin-on-primary rounded-xl font-semibold shadow-md shadow-admin-primary/20 hover:bg-admin-primary-container transition-all flex items-center gap-2 text-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Custom Tier
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard title="Total Monthly Revenue" value={totalMRR} trend="up" trendValue="+14.2% MRR" icon={DollarSign} />
        <KpiCard title="Active Subscribers" value={totalSubscribers.toLocaleString()} trend="up" trendValue="+82 stores" icon={Users} />
        <KpiCard title="Avg Revenue / Store" value="$31.64" trend="up" trendValue="+5.1% ARPU" icon={TrendingUp} />
        <KpiCard title="Enterprise Adoption" value="16.9%" trend="up" trendValue="High retention" icon={Crown} />
      </div>

      {/* Subscription Tier Cards Grid */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center text-admin-on-surface-variant bg-admin-surface-container border rounded-2xl">
          <div className="w-9 h-9 border-4 border-admin-outline-variant border-t-admin-primary rounded-full animate-spin mb-4"></div>
          <p className="font-semibold text-sm">Loading SaaS tier configurations...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`bg-admin-surface-container rounded-3xl p-6 border flex flex-col justify-between relative shadow-sm hover:shadow-xl transition-all ${
                plan.id === "PLAN-PREMIUM" 
                  ? "border-amber-400 ring-2 ring-amber-400/30 bg-gradient-to-b from-amber-50/30 to-white" 
                  : "border-admin-outline-variant"
              }`}
            >
              {plan.id === "PLAN-PREMIUM" && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Most Popular
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-admin-surface-container-low flex items-center justify-center font-bold text-admin-primary">
                    {plan.id === "PLAN-ENTERPRISE" ? <Crown className="w-6 h-6 text-indigo-600" /> :
                     plan.id === "PLAN-PREMIUM" ? <Sparkles className="w-6 h-6 text-amber-500" /> :
                     <Layers className="w-6 h-6 text-slate-600" />}
                  </div>
                  <span className="font-mono text-xs bg-admin-surface-container-highest text-slate-600 font-bold px-2 py-1 rounded-lg">
                    {plan.activeMerchants} Stores
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-admin-on-surface">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-black text-admin-on-surface">{plan.price.split(" / ")[0]}</span>
                    <span className="text-sm font-semibold text-admin-on-surface-variant">/ month</span>
                  </div>
                  <p className="text-xs text-green-600 font-bold mt-1">
                    Generates {plan.mrr} MRR
                  </p>
                </div>

                <div className="pt-4 border-t border-admin-outline-variant/60 space-y-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-admin-on-surface-variant block">
                    Included Entitlements:
                  </span>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-admin-on-surface font-medium">
                      <CheckCircle2 className={`w-4 h-4 shrink-0 ${plan.id === "PLAN-PREMIUM" ? "text-amber-500" : "text-green-600"}`} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-admin-outline-variant/60">
                <button 
                  onClick={() => setEditingPlan(plan)}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 ${
                    plan.id === "PLAN-PREMIUM" 
                      ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20" 
                      : "bg-admin-surface-container-low hover:bg-admin-surface-container text-admin-on-surface"
                  }`}
                >
                  <Edit3 className="w-4 h-4" /> Edit Tier Pricing & Perks
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Tier Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-admin-surface-container rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-admin-outline-variant animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-admin-outline-variant flex justify-between items-center bg-admin-surface-container-high">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-admin-primary/10 text-admin-primary flex items-center justify-center font-bold">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-admin-on-surface">Edit {editingPlan.name}</h3>
                  <span className="text-xs text-admin-on-surface-variant">Update monthly pricing & limits</span>
                </div>
              </div>
              <button 
                onClick={() => setEditingPlan(null)}
                className="p-1.5 hover:bg-admin-surface-container-highest rounded-full text-admin-on-surface-variant hover:text-admin-on-surface transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-admin-on-surface-variant block mb-1">Tier Display Name</label>
                <input 
                  type="text" 
                  defaultValue={editingPlan.name} 
                  className="w-full px-3.5 py-2 rounded-xl border border-admin-outline-variant text-sm font-semibold bg-admin-surface-container-lowest focus:ring-2 focus:ring-admin-primary/20 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-admin-on-surface-variant block mb-1">Monthly Billing Price ($)</label>
                <input 
                  type="text" 
                  defaultValue={editingPlan.price} 
                  className="w-full px-3.5 py-2 rounded-xl border border-admin-outline-variant text-sm font-semibold bg-admin-surface-container-lowest focus:ring-2 focus:ring-admin-primary/20 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-admin-on-surface-variant block mb-1">Feature Entitlements (One per line)</label>
                <textarea 
                  rows={4}
                  defaultValue={editingPlan.features.join("\n")} 
                  className="w-full px-3.5 py-2 rounded-xl border border-admin-outline-variant text-xs font-medium bg-admin-surface-container-lowest focus:ring-2 focus:ring-admin-primary/20 outline-none font-mono"
                />
              </div>

              <div className="pt-4 border-t flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="px-4 py-2 border border-admin-outline-variant text-admin-on-surface font-semibold text-xs rounded-xl hover:bg-admin-surface-container-highest transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-admin-primary hover:bg-admin-primary-container text-white font-semibold text-xs rounded-xl shadow-md transition-all"
                >
                  Save Tier Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
