import { useState, useEffect } from "react";
import { adminMerchantService } from "../services/merchants";
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Search, 
  Store, 
  ExternalLink,
  RefreshCcw,
  X
} from "lucide-react";
import clsx from "clsx";

export default function KYCVerification() {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [kycRes, merchRes] = await Promise.all([
        adminMerchantService.getAllKYCDocuments(),
        adminMerchantService.getMerchants()
      ]);

      const merchData = merchRes.data || [];
      let actualKyc = [];
      if (kycRes.data && Array.isArray(kycRes.data.data)) {
        actualKyc = kycRes.data.data;
      } else if (Array.isArray(kycRes.data)) {
        actualKyc = kycRes.data;
      }

      // Merge them
      const merged = merchData.map(m => {
        const doc = actualKyc.find(k => k.store_id === m.id) || null;
        return {
          ...m,
          kycDoc: doc
        };
      });

      setMerchants(merged);
    } catch (error) {
      showToast("Error loading KYC list", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (storeId) => {
    try {
      await adminMerchantService.approveKYC(storeId);
      showToast(`Successfully verified KYC for store!`);
      fetchData();
    } catch (err) {
      showToast("Approval failed", "error");
    }
  };

  const handleReject = async (storeId) => {
    try {
      await adminMerchantService.rejectKYC(storeId);
      showToast(`Rejected KYC documents for store.`, "error");
      fetchData();
    } catch (err) {
      showToast("Rejection failed", "error");
    }
  };

  const getStatus = (m) => {
    if (!m.kycDoc) {
      // No documents uploaded, so rely on store status if available, otherwise Pending
      if (m.status === "active" || m.status === "verified") return "Approved";
      if (m.status === "blocked" || m.status === "rejected") return "Rejected";
      return "Pending";
    }
    const doc = m.kycDoc;
    if (doc.store_status === "rejected" || doc.store_status === "blocked") return "Rejected";
    if (doc.is_verified || doc.store_status === "active" || doc.store_status === "verified") return "Approved";
    return "Pending";
  };

  const filteredData = merchants.filter(m => {
    const storeName = m.businessName || m.ownerName || m.legalName || "Unknown Store";
    const aadhaar = m.kycDoc?.aadhaar_number || "";
    const id = m.id || "";
    
    const matchesSearch = 
      storeName.toLowerCase().includes(search.toLowerCase()) || 
      aadhaar.toLowerCase().includes(search.toLowerCase()) ||
      id.toLowerCase().includes(search.toLowerCase());
      
    const status = getStatus(m);
    const matchesFilter = filter === "All" || status === filter;
    
    return matchesSearch && matchesFilter;
  });

  const pendingCount = merchants.filter(d => getStatus(d) === "Pending").length;
  const rejectedCount = merchants.filter(d => getStatus(d) === "Rejected").length;

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col p-2 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Toast Notification */}
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
            <h2 className="text-[26px] font-extrabold text-admin-on-surface tracking-tight">KYC Verification Dashboard</h2>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center gap-2 text-xs font-semibold mr-4">
            {["All", "Pending", "Approved", "Rejected"].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={clsx(
                  "px-4 py-2 rounded-xl transition-all flex items-center gap-1.5",
                  filter === status 
                    ? "bg-admin-primary text-white shadow-sm" 
                    : "bg-admin-surface-container border border-admin-outline-variant text-admin-on-surface-variant hover:bg-admin-surface-container-high"
                )}
              >
                {status === "Pending" && <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />}
                {status === "Approved" && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                {status === "Rejected" && <XCircle className="w-3.5 h-3.5 text-red-500" />}
                <span>{status}</span>
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
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-admin-surface-container border border-admin-outline-variant p-5 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h3 className="text-admin-on-surface-variant font-bold text-sm tracking-wide uppercase">Pending KYC Reviews</h3>
            <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-600 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-inner">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="relative z-10">
            <h4 className="text-3xl font-extrabold text-admin-on-surface mb-2 tracking-tight">{pendingCount}</h4>
          </div>
        </div>

        <div className="bg-admin-surface-container border border-admin-outline-variant p-5 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h3 className="text-admin-on-surface-variant font-bold text-sm tracking-wide uppercase">Rejected Applications</h3>
            <div className="p-2.5 bg-red-500/10 rounded-xl text-red-600 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-inner">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="relative z-10">
            <h4 className="text-3xl font-extrabold text-admin-on-surface mb-2 tracking-tight">{rejectedCount}</h4>
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
              placeholder="Search by store name or Aadhaar number..."
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
            Total: {filteredData.length}
          </div>
        </div>

        {/* Table Area */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-admin-surface-container-high sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="p-4 font-semibold text-admin-on-surface-variant border-b border-admin-outline-variant text-sm">Store Name</th>

                <th className="p-4 font-semibold text-admin-on-surface-variant border-b border-admin-outline-variant text-sm">Aadhaar Doc</th>
                <th className="p-4 font-semibold text-admin-on-surface-variant border-b border-admin-outline-variant text-sm">Shop License</th>
                <th className="p-4 font-semibold text-admin-on-surface-variant border-b border-admin-outline-variant text-sm">Status</th>
                <th className="p-4 font-semibold text-admin-on-surface-variant border-b border-admin-outline-variant text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && merchants.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-admin-on-surface-variant">
                    <div className="flex flex-col items-center justify-center">
                      <RefreshCcw size={32} className="animate-spin mb-4" />
                      <p>Loading KYC verifications...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-admin-on-surface-variant">
                    <div className="flex flex-col items-center justify-center">
                      <FileText size={48} className="mb-4 opacity-20" />
                      <p className="text-lg">No KYC applications found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((m) => {
                  const storeName = m.businessName || m.ownerName || m.legalName || "Unknown Store";
                  const status = getStatus(m);
                  const doc = m.kycDoc;

                  return (
                    <tr 
                      key={m.id} 
                      className="border-b border-admin-outline-variant hover:bg-admin-surface-container-high transition-colors"
                    >
                      <td className="p-4 align-middle">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded bg-admin-surface-container-highest flex items-center justify-center text-admin-primary">
                            <Store size={16} />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-admin-on-surface text-sm">{storeName}</span>
                            <span className="font-mono text-[10px] text-admin-on-surface-variant mt-0.5">
                              ID: {m.id.substring(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        {doc?.aadhaar_doc_url ? (
                          <a 
                            href={doc.aadhaar_doc_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-admin-surface-container-highest hover:bg-admin-primary/10 text-admin-primary rounded-lg text-xs font-semibold transition-colors border border-admin-outline-variant"
                          >
                            <ExternalLink size={14} /> View Aadhaar
                          </a>
                        ) : (
                          <span className="text-xs text-admin-on-surface-variant italic">Not uploaded</span>
                        )}
                      </td>
                      <td className="p-4 align-middle">
                        {doc?.shop_license_url ? (
                          <a 
                            href={doc.shop_license_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-admin-surface-container-highest hover:bg-admin-primary/10 text-admin-primary rounded-lg text-xs font-semibold transition-colors border border-admin-outline-variant"
                          >
                            <ExternalLink size={14} /> View License
                          </a>
                        ) : (
                          <span className="text-xs text-admin-on-surface-variant italic">Not uploaded</span>
                        )}
                      </td>
                      <td className="p-4 align-middle">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                          status === 'Approved' ? 'bg-green-500/20 text-green-500' :
                          status === 'Rejected' ? 'bg-red-500/20 text-red-500' :
                          'bg-amber-500/20 text-amber-500'
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="p-4 align-middle text-right">
                        <div className="flex items-center justify-end gap-2">
                          {status === "Pending" ? (
                            <>
                              <button 
                                onClick={() => handleApprove(m.id)}
                                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all bg-admin-surface-container-high border border-admin-outline-variant text-admin-on-surface hover:bg-green-500/10 hover:text-green-500 hover:border-green-500/30"
                              >
                                <CheckCircle2 size={14} />
                                <span>Approve</span>
                              </button>
                              <button 
                                onClick={() => handleReject(m.id)}
                                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all bg-admin-surface-container-high border border-admin-outline-variant text-admin-on-surface hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30"
                              >
                                <XCircle size={14} />
                                <span>Reject</span>
                              </button>
                            </>
                          ) : (
                            <span className="text-xs font-semibold text-admin-on-surface-variant italic">
                              Status resolved
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
    </div>
  );
}