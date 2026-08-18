import { useState, useEffect } from "react";
import { adminMerchantService } from "../services/merchants";
import { 
  Search, 
  RefreshCcw, 
  Tag,
  XCircle,
  FileText,
  Store,
  Calendar,
  X,
  Plus
} from "lucide-react";
import clsx from "clsx";

export default function MerchantCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [merchantsMap, setMerchantsMap] = useState({});
  const [merchantsList, setMerchantsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [toast, setToast] = useState(null);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    storeId: "",
    campaignName: "",
    redeemCode: "",
    offerCategory: "Retail",
    offerType: "Discount",
    rewardValue: "",
    minPurchase: "",
    redemptionLimit: "",
    targetAudience: "All Customers",
    startDate: new Date().toISOString().slice(0, 16),
    endDate: "",
    bannerUrl: ""
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch both campaigns and merchants to map store names
      const [campRes, merchRes] = await Promise.all([
        adminMerchantService.getAdminCampaigns(),
        adminMerchantService.getMerchants()
      ]);

      const merchData = merchRes.data || [];
      const mMap = {};
      merchData.forEach(m => {
        mMap[m.id] = m.businessName || m.ownerName;
      });
      setMerchantsMap(mMap);
      setMerchantsList(merchData);

      let actualCampaigns = [];
      if (campRes.data && Array.isArray(campRes.data.data)) {
        actualCampaigns = campRes.data.data;
      } else if (Array.isArray(campRes.data)) {
        actualCampaigns = campRes.data;
      }

      setCampaigns(actualCampaigns);
    } catch (error) {
      showToast("Error loading campaigns", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCloseCampaign = async (id) => {
    try {
      await adminMerchantService.updateCampaignStatus(id, false); // false = paused/closed
      showToast(`Campaign ${id} has been closed.`);
      fetchData();
    } catch (error) {
      showToast("Error updating campaign status", "error");
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.storeId) {
        showToast("Please select a store", "error");
        return;
      }
      
      const payload = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };
      
      await adminMerchantService.createAdminCampaign(formData.storeId, payload);
      showToast("Campaign created successfully!");
      setIsCreateModalOpen(false);
      fetchData();
    } catch (error) {
      showToast("Error creating campaign", "error");
    }
  };

  const activeCount = campaigns.filter(c => {
    const isExpired = new Date(c.EndDate) < new Date();
    return !isExpired && (c.Status || "").toLowerCase() === "active";
  }).length;

  const filteredCampaigns = campaigns.filter(c => {
    const id = c.ID || c.id || "";
    const storeName = merchantsMap[c.StoreID] || "Unknown Store";
    const name = c.Name || c.title || "";
    
    const matchesSearch = 
      name.toLowerCase().includes(search.toLowerCase()) || 
      storeName.toLowerCase().includes(search.toLowerCase()) ||
      id.toLowerCase().includes(search.toLowerCase());
      
    const isExpired = new Date(c.EndDate) < new Date();
    const rawStatus = (c.Status || "").toLowerCase();
    
    let displayStatus = "Active";
    if (rawStatus !== "active") displayStatus = "Closed";
    if (isExpired) displayStatus = "Expired";

    const matchesStatus = statusFilter === "All" || displayStatus === statusFilter;
    return matchesSearch && matchesStatus;
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
        <div>
          <h2 className="text-[26px] font-extrabold text-admin-on-surface tracking-tight">Merchant Campaigns & Offers</h2>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center gap-2 text-xs font-semibold mr-4 hidden md:flex">
            {["All", "Active", "Closed", "Expired"].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={clsx(
                  "px-4 py-2 rounded-xl transition-all",
                  statusFilter === status 
                    ? "bg-admin-primary text-white shadow-sm" 
                    : "bg-admin-surface-container border border-admin-outline-variant text-admin-on-surface-variant hover:bg-admin-surface-container-high"
                )}
              >
                {status}
              </button>
            ))}
          </div>
          <button 
            onClick={fetchData}
            className="flex items-center justify-center p-2 text-admin-on-surface-variant hover:text-admin-on-surface hover:bg-admin-surface-container-high rounded-lg transition-colors"
            title="Refresh Data"
          >
            <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-admin-primary text-admin-on-primary rounded-xl font-semibold shadow-md shadow-admin-primary/20 hover:bg-admin-primary-container transition-all flex items-center gap-2 text-sm"
          >
            <Plus size={16} /> Create Campaign
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-admin-surface-container border border-admin-outline-variant p-5 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h3 className="text-admin-on-surface-variant font-bold text-sm tracking-wide uppercase">Active Campaigns</h3>
            <div className="p-2.5 bg-admin-surface-container-highest rounded-xl text-admin-primary group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-inner">
              <Tag className="w-5 h-5" />
            </div>
          </div>
          <div className="relative z-10">
            <h4 className="text-3xl font-extrabold text-admin-on-surface mb-2 tracking-tight">{activeCount}</h4>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-admin-surface-container rounded-xl border border-admin-outline-variant overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-admin-outline-variant flex justify-between items-center bg-admin-surface-container-high">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-on-surface-variant" size={18} />
            <input
              type="text"
              placeholder="Search campaigns by name, store, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-admin-surface-container border border-admin-outline-variant text-admin-on-surface rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-admin-primary/50"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-admin-on-surface-variant hover:text-admin-on-surface">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="text-sm text-admin-on-surface-variant font-medium">
            Total: {filteredCampaigns.length}
          </div>
        </div>

        {/* Table Area */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-admin-surface-container-high sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="p-4 font-semibold text-admin-on-surface-variant border-b border-admin-outline-variant text-sm">Store Name</th>
                <th className="p-4 font-semibold text-admin-on-surface-variant border-b border-admin-outline-variant text-sm">Campaign ID / Name</th>
                <th className="p-4 font-semibold text-admin-on-surface-variant border-b border-admin-outline-variant text-sm">Duration</th>
                <th className="p-4 font-semibold text-admin-on-surface-variant border-b border-admin-outline-variant text-sm">Category</th>
                <th className="p-4 font-semibold text-admin-on-surface-variant border-b border-admin-outline-variant text-sm">Type</th>
                <th className="p-4 font-semibold text-admin-on-surface-variant border-b border-admin-outline-variant text-sm">Status</th>
                <th className="p-4 font-semibold text-admin-on-surface-variant border-b border-admin-outline-variant text-sm text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && campaigns.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-admin-on-surface-variant">
                    <div className="flex flex-col items-center justify-center">
                      <RefreshCcw size={32} className="animate-spin mb-4" />
                      <p>Loading campaigns...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-admin-on-surface-variant">
                    <div className="flex flex-col items-center justify-center">
                      <FileText size={48} className="mb-4 opacity-20" />
                      <p className="text-lg">No campaigns found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((c) => {
                  const id = c.ID || c.id || "Unknown";
                  const storeName = merchantsMap[c.StoreID] || "Unknown Store";
                  const name = c.Name || "Unnamed Campaign";
                  const category = c.OfferCategory || "Uncategorized";
                  const type = c.OfferType || "Standard";
                  
                  const isExpired = new Date(c.EndDate) < new Date();
                  const rawStatus = (c.Status || "").toLowerCase();
                  
                  let displayStatus = "Active";
                  if (rawStatus !== "active") displayStatus = "Closed";
                  if (isExpired) displayStatus = "Expired";

                  return (
                    <tr 
                      key={id} 
                      className="border-b border-admin-outline-variant hover:bg-admin-surface-container-high transition-colors"
                    >
                      <td className="p-4 align-middle">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded bg-admin-surface-container-highest flex items-center justify-center text-admin-primary">
                            <Store size={16} />
                          </div>
                          <span className="font-bold text-admin-on-surface text-sm">{storeName}</span>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex flex-col">
                          <span className="font-bold text-admin-on-surface text-sm">{name}</span>
                          <span className="font-mono text-xs text-admin-on-surface-variant mt-0.5" title={id}>
                            {id.substring(0, 8)}...
                          </span>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center space-x-2 text-sm text-admin-on-surface-variant">
                          <Calendar size={14} className="text-admin-primary" />
                          <div className="flex flex-col text-xs">
                            <span>{new Date(c.StartDate).toLocaleDateString()}</span>
                            <span>{new Date(c.EndDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <span className="px-2.5 py-1 bg-admin-surface-container-highest text-admin-on-surface font-semibold text-xs rounded border border-admin-outline-variant">
                          {category}
                        </span>
                      </td>
                      <td className="p-4 align-middle">
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-semibold text-xs rounded border border-indigo-200">
                          {type}
                        </span>
                      </td>
                      <td className="p-4 align-middle">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                          displayStatus === 'Active' ? 'bg-green-500/20 text-green-500' :
                          displayStatus === 'Expired' ? 'bg-amber-500/20 text-amber-500' :
                          'bg-red-500/20 text-red-500'
                        }`}>
                          {displayStatus}
                        </span>
                      </td>
                      <td className="p-4 align-middle text-right">
                        <div className="flex items-center justify-end">
                          {displayStatus === "Active" ? (
                            <button 
                              onClick={() => handleCloseCampaign(id)}
                              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-100 hover:border-red-600"
                            >
                              <XCircle size={14} />
                              <span>Close</span>
                            </button>
                          ) : (
                            <span className="text-xs font-semibold text-admin-on-surface-variant italic">
                              {displayStatus === "Expired" ? "Expired" : "Closed"}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE CAMPAIGN MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-admin-surface-container rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden border border-admin-outline-variant animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-admin-outline-variant flex justify-between items-center bg-admin-surface-container-high shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-admin-primary/10 text-admin-primary flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-admin-on-surface">Create New Campaign/Offer</h3>
                  <span className="text-xs text-admin-on-surface-variant">Publish a new campaign or offer for a specific store</span>
                </div>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 hover:bg-admin-surface-container-highest rounded-full text-admin-on-surface-variant hover:text-admin-on-surface transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="font-semibold text-admin-on-surface">Store <span className="text-red-500">*</span></label>
                  <select 
                    required 
                    value={formData.storeId}
                    onChange={(e) => setFormData({...formData, storeId: e.target.value})}
                    className="w-full px-4 py-2 bg-admin-surface border border-admin-outline-variant rounded-xl text-admin-on-surface focus:ring-2 focus:ring-admin-primary/50 outline-none"
                  >
                    <option value="" disabled>Select a Store</option>
                    {merchantsList.map(m => (
                      <option key={m.id} value={m.id}>{m.businessName || m.ownerName}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-admin-on-surface">Campaign Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required 
                    value={formData.campaignName}
                    onChange={(e) => setFormData({...formData, campaignName: e.target.value})}
                    placeholder="e.g. Summer Sale 2026"
                    className="w-full px-4 py-2 bg-admin-surface border border-admin-outline-variant rounded-xl text-admin-on-surface focus:ring-2 focus:ring-admin-primary/50 outline-none placeholder:text-admin-on-surface-variant/50"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-admin-on-surface">Redeem Code</label>
                  <input 
                    type="text" 
                    value={formData.redeemCode}
                    onChange={(e) => setFormData({...formData, redeemCode: e.target.value})}
                    placeholder="e.g. SUMMER50"
                    className="w-full px-4 py-2 bg-admin-surface border border-admin-outline-variant rounded-xl text-admin-on-surface focus:ring-2 focus:ring-admin-primary/50 outline-none placeholder:text-admin-on-surface-variant/50"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-admin-on-surface">Offer Category</label>
                  <select 
                    value={formData.offerCategory}
                    onChange={(e) => setFormData({...formData, offerCategory: e.target.value})}
                    className="w-full px-4 py-2 bg-admin-surface border border-admin-outline-variant rounded-xl text-admin-on-surface focus:ring-2 focus:ring-admin-primary/50 outline-none"
                  >
                    <option value="Retail">Retail</option>
                    <option value="Dining">Dining</option>
                    <option value="Services">Services</option>
                    <option value="Apparel">Apparel</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-admin-on-surface">Offer Type</label>
                  <select 
                    value={formData.offerType}
                    onChange={(e) => setFormData({...formData, offerType: e.target.value})}
                    className="w-full px-4 py-2 bg-admin-surface border border-admin-outline-variant rounded-xl text-admin-on-surface focus:ring-2 focus:ring-admin-primary/50 outline-none"
                  >
                    <option value="Discount">Discount</option>
                    <option value="Cashback">Cashback</option>
                    <option value="BOGO">Buy One Get One</option>
                    <option value="Flat Rate">Flat Rate</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-admin-on-surface">Reward Value (₹ or %) <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    required 
                    min="0"
                    step="0.01"
                    value={formData.rewardValue}
                    onChange={(e) => setFormData({...formData, rewardValue: e.target.value})}
                    placeholder="e.g. 50"
                    className="w-full px-4 py-2 bg-admin-surface border border-admin-outline-variant rounded-xl text-admin-on-surface focus:ring-2 focus:ring-admin-primary/50 outline-none placeholder:text-admin-on-surface-variant/50"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-admin-on-surface">Min Bill Amount (₹) <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    required 
                    min="0"
                    step="0.01"
                    value={formData.minPurchase}
                    onChange={(e) => setFormData({...formData, minPurchase: e.target.value})}
                    placeholder="e.g. 500"
                    className="w-full px-4 py-2 bg-admin-surface border border-admin-outline-variant rounded-xl text-admin-on-surface focus:ring-2 focus:ring-admin-primary/50 outline-none placeholder:text-admin-on-surface-variant/50"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-admin-on-surface">Redemption Limit</label>
                  <input 
                    type="number" 
                    min="0"
                    value={formData.redemptionLimit}
                    onChange={(e) => setFormData({...formData, redemptionLimit: e.target.value})}
                    placeholder="e.g. 100 (0 for unlimited)"
                    className="w-full px-4 py-2 bg-admin-surface border border-admin-outline-variant rounded-xl text-admin-on-surface focus:ring-2 focus:ring-admin-primary/50 outline-none placeholder:text-admin-on-surface-variant/50"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-admin-on-surface">Target Audience</label>
                  <select 
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                    className="w-full px-4 py-2 bg-admin-surface border border-admin-outline-variant rounded-xl text-admin-on-surface focus:ring-2 focus:ring-admin-primary/50 outline-none"
                  >
                    <option value="All Customers">All Customers</option>
                    <option value="New Customers">New Customers</option>
                    <option value="Loyal Customers">Loyal Customers</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-admin-on-surface">Start Date <span className="text-red-500">*</span></label>
                  <input 
                    type="datetime-local" 
                    required 
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-4 py-2 bg-admin-surface border border-admin-outline-variant rounded-xl text-admin-on-surface focus:ring-2 focus:ring-admin-primary/50 outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-admin-on-surface">End Date <span className="text-red-500">*</span></label>
                  <input 
                    type="datetime-local" 
                    required 
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full px-4 py-2 bg-admin-surface border border-admin-outline-variant rounded-xl text-admin-on-surface focus:ring-2 focus:ring-admin-primary/50 outline-none"
                  />
                </div>
                
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="font-semibold text-admin-on-surface">Banner URL</label>
                  <input 
                    type="url" 
                    value={formData.bannerUrl}
                    onChange={(e) => setFormData({...formData, bannerUrl: e.target.value})}
                    placeholder="https://example.com/banner.jpg"
                    className="w-full px-4 py-2 bg-admin-surface border border-admin-outline-variant rounded-xl text-admin-on-surface focus:ring-2 focus:ring-admin-primary/50 outline-none placeholder:text-admin-on-surface-variant/50"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-admin-outline-variant mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl font-bold text-admin-on-surface hover:bg-admin-surface-container-highest transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 bg-admin-primary text-admin-on-primary rounded-xl font-bold shadow-lg shadow-admin-primary/20 hover:bg-admin-primary-container transition-all"
                >
                  Publish Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
