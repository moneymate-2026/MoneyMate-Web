import { useState, useEffect } from "react";
import { adminMerchantService } from "../services/merchants";
import { 
  Search, 
  MapPin, 
  RefreshCcw, 
  Ban, 
  CheckCircle2, 
  X,
  Store,
  FileText
} from "lucide-react";
import clsx from "clsx";
import StatusBadge from "../components/StatusBadge";

export default function StoreQRs() {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchMerchants = async () => {
    setLoading(true);
    try {
      // In getMerchants, we fetch all stores and map them.
      // But adminMerchantService.getMerchants maps `VPA` if available.
      // Wait, let's fetch raw if we need VPA, or we can just call it and check.
      // Currently getMerchants returns mappedData, so we will use the raw response if possible, 
      // or modify how we use getMerchants. Let's fetch directly using the underlying getMerchants and see if VPA is there.
      const response = await adminMerchantService.getMerchants();
      // Since merchants.js `getMerchants` drops some fields, let's just make a raw API call here 
      // to ensure we have VPA and full details, or we can just rely on the API response directly here.
      
      // Let's assume adminMerchantService.getMerchants() maps it, we might need to modify merchants.js or fetch here.
      // It's safer to use gatewayClient directly in the page to get the raw stores with VPA.
      const { gatewayClient } = await import('../../api/gatewayClient');
      const res = await gatewayClient.get('/admin/merchants');
      const actualData = res.data?.data || res.data || [];
      const stores = Array.isArray(actualData) ? actualData : [];
      setMerchants(stores);
    } catch (error) {
      showToast("Error loading stores", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchants();
  }, []);

  const handleToggleBlock = async (storeId, currentStatus) => {
    // If it's active, block it (set to 'blocked' or 'suspended'). If blocked, activate it ('active').
    const newStatus = (currentStatus?.toLowerCase() === 'active' || currentStatus?.toLowerCase() === 'verified') 
      ? 'suspended' 
      : 'active';
    
    try {
      await adminMerchantService.updateMerchantStatus(storeId, newStatus);
      showToast(`Store ${newStatus === 'suspended' ? 'blocked' : 'activated'} successfully!`);
      fetchMerchants();
    } catch (error) {
      showToast("Failed to update status", "error");
    }
  };

  const filteredMerchants = merchants.filter(m => {
    const name = (m.LegalName || m.legal_name || m.OwnerName || "").toLowerCase();
    const vpa = (m.VPA || m.vpa || "").toLowerCase();
    const id = (m.ID || m.id || "").toLowerCase();
    
    const matchesSearch = name.includes(search.toLowerCase()) || vpa.includes(search.toLowerCase()) || id.includes(search.toLowerCase());
    
    let isBlocked = (m.Status || m.status || "").toLowerCase() === 'suspended';
    let isActive = (m.Status || m.status || "").toLowerCase() === 'active' || (m.Status || m.status || "").toLowerCase() === 'verified';
    
    let matchesStatus = true;
    if (statusFilter === "Active") matchesStatus = isActive;
    if (statusFilter === "Blocked") matchesStatus = isBlocked;
    
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
          <h2 className="text-[26px] font-extrabold text-admin-on-surface tracking-tight">Store QR & VPA Directory</h2>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center gap-2 text-xs font-semibold mr-4">
            {["All", "Active", "Blocked"].map(status => (
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
            onClick={fetchMerchants}
            className="flex items-center justify-center p-2 text-admin-on-surface-variant hover:text-admin-on-surface hover:bg-admin-surface-container-high rounded-lg transition-colors"
            title="Refresh Data"
          >
            <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
          </button>
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
              placeholder="Search by store name, VPA, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-admin-surface-container border border-admin-outline-variant text-admin-on-surface rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-admin-primary/50"
            />
          </div>
          <div className="text-sm text-admin-on-surface-variant font-medium">
            Total: {filteredMerchants.length}
          </div>
        </div>

        {/* Table Area */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-admin-surface-container-high sticky top-0 z-10">
              <tr>
                <th className="p-4 font-semibold text-admin-on-surface-variant border-b border-admin-outline-variant">Store Name</th>
                <th className="p-4 font-semibold text-admin-on-surface-variant border-b border-admin-outline-variant">VPA Address</th>
                <th className="p-4 font-semibold text-admin-on-surface-variant border-b border-admin-outline-variant">Status</th>
                <th className="p-4 font-semibold text-admin-on-surface-variant border-b border-admin-outline-variant text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && merchants.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-admin-on-surface-variant">
                    <div className="flex flex-col items-center justify-center">
                      <RefreshCcw size={32} className="animate-spin mb-4" />
                      <p>Loading stores...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredMerchants.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-admin-on-surface-variant">
                    <div className="flex flex-col items-center justify-center">
                      <FileText size={48} className="mb-4 opacity-20" />
                      <p className="text-lg">No stores found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMerchants.map((m) => {
                  const id = m.ID || m.id;
                  const name = m.LegalName || m.legal_name || m.OwnerName || "Unknown Store";
                  const vpa = m.VPA || m.vpa || "N/A";
                  const rawStatus = (m.Status || m.status || "").toLowerCase();
                  
                  const isBlocked = rawStatus === 'suspended' || rawStatus === 'rejected';
                  const isActive = rawStatus === 'active' || rawStatus === 'verified';
                  
                  let displayStatus = rawStatus;
                  if (isActive) displayStatus = "Active";
                  else if (isBlocked) displayStatus = "Blocked";
                  else displayStatus = "Pending";

                  return (
                    <tr 
                      key={id} 
                      className="border-b border-admin-outline-variant hover:bg-admin-surface-container-high transition-colors"
                    >
                      <td className="p-4 align-top">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-admin-surface-container-highest flex items-center justify-center text-admin-primary">
                            <Store size={20} />
                          </div>
                          <div>
                            <div className="font-bold text-admin-on-surface">{name}</div>
                            <div className="text-xs text-admin-on-surface-variant font-mono mt-0.5" title={id}>
                              {id.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <span className="font-mono text-sm font-semibold text-admin-on-surface bg-admin-surface-container-highest px-2 py-1 rounded">
                          {vpa}
                        </span>
                      </td>
                      <td className="p-4 align-middle">
                        <StatusBadge 
                          status={displayStatus} 
                          variant={
                            displayStatus === 'Active' ? 'success' :
                            displayStatus === 'Blocked' ? 'error' :
                            'warning'
                          } 
                        />
                      </td>
                      <td className="p-4 align-middle text-right">
                        <div className="flex items-center justify-end">
                          <button 
                            onClick={() => handleToggleBlock(id, rawStatus)}
                            className={`flex items-center space-x-1.5 px-2 py-1.5 rounded-lg font-bold text-xs transition-all text-admin-on-surface-variant ${
                              displayStatus === "Blocked" 
                                ? "hover:text-green-500 hover:bg-green-500/10" 
                                : "hover:text-red-500 hover:bg-red-500/10"
                            }`}
                          >
                            {displayStatus === "Blocked" ? (
                              <>
                                <CheckCircle2 size={14} />
                                <span>Unblock</span>
                              </>
                            ) : (
                              <>
                                <Ban size={14} />
                                <span>Block</span>
                              </>
                            )}
                          </button>
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
    </div>
  );
}
