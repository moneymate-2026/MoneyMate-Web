import { useState, useEffect } from "react";
import StatusBadge from "../components/StatusBadge";
import KpiCard from "../components/KpiCard";
import { adminMerchantService } from "../../services/api/admin/merchants";
import { 
  UserCheck, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Search, 
  Filter, 
  Store, 
  Calendar, 
  Award, 
  AlertTriangle,
  ChevronRight,
  X
} from "lucide-react";

export default function KYCVerification() {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Pending");
  const [selectedItem, setSelectedItem] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchKYCList = async () => {
    setLoading(true);
    try {
      const response = await adminMerchantService.getMerchants();
      setMerchants(response.data);
    } catch (error) {
      showToast("Error loading KYC list", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKYCList();
  }, []);

  const handleApprove = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await adminMerchantService.approveKYC(id);
      showToast(`Successfully verified KYC for store ${id}!`);
      fetchKYCList();
      if (selectedItem && selectedItem.id === id) {
        setSelectedItem(prev => ({ ...prev, kycStatus: "Approved", status: "Active" }));
      }
    } catch (err) {
      showToast("Approval failed", "error");
    }
  };

  const handleReject = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await adminMerchantService.rejectKYC(id);
      showToast(`Rejected KYC documents for store ${id}.`, "error");
      fetchKYCList();
      if (selectedItem && selectedItem.id === id) {
        setSelectedItem(prev => ({ ...prev, kycStatus: "Rejected", status: "Suspended" }));
      }
    } catch (err) {
      showToast("Rejection failed", "error");
    }
  };

  const filteredData = merchants.filter(m => {
    const matchesSearch = 
      m.businessName.toLowerCase().includes(search.toLowerCase()) || 
      m.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      m.id.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All" || m.kycStatus === filter;
    return matchesSearch && matchesFilter;
  });

  const pendingCount = merchants.filter(m => m.kycStatus === "Pending").length;
  const approvedCount = merchants.filter(m => m.kycStatus === "Approved").length;
  const rejectedCount = merchants.filter(m => m.kycStatus === "Rejected").length;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
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
            {pendingCount > 0 && (
              <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">
                {pendingCount} Action Req.
              </span>
            )}
          </div>
          <p className="text-sm text-admin-on-surface-variant mt-1">
            Review business licenses, tax identifications, and bank account setups for new store registrations.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          {["Pending", "Approved", "Rejected", "All"].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                filter === status 
                  ? "bg-admin-primary text-white shadow-md shadow-admin-primary/20" 
                  : "bg-white border border-admin-outline-variant text-admin-on-surface-variant hover:bg-admin-surface-container-low"
              }`}
            >
              {status === "Pending" && <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />}
              {status === "Approved" && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
              {status === "Rejected" && <XCircle className="w-3.5 h-3.5 text-red-500" />}
              <span>{status}</span>
              <span className="opacity-75">
                ({status === "All" ? merchants.length : merchants.filter(m => m.kycStatus === status).length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard title="Pending KYC Reviews" value={pendingCount} trend="down" trendValue="Requires Action" icon={ShieldAlert} />
        <KpiCard title="Approved This Month" value={approvedCount} trend="up" trendValue="+8.4% rate" icon={CheckCircle2} />
        <KpiCard title="Rejected Applications" value={rejectedCount} trend="down" trendValue="Low fraud" icon={XCircle} />
        <KpiCard title="Avg Verification Time" value="1.4 days" trend="up" trendValue="SLA Met" icon={UserCheck} />
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-admin-outline-variant rounded-xl p-4 flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-admin-outline-variant/60 focus-within:border-admin-primary focus-within:ring-2 focus-within:ring-admin-primary/20 transition-all bg-admin-surface-container-lowest">
          <Search className="w-4 h-4 text-admin-on-surface-variant" />
          <input 
            type="text"
            placeholder="Search by store name, owner, or Store ID..."
            className="bg-transparent border-none outline-none text-sm w-full text-admin-on-surface"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-admin-on-surface-variant hover:text-admin-on-surface">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Applications Grid / Cards */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center text-admin-on-surface-variant bg-white border rounded-2xl">
          <div className="w-9 h-9 border-4 border-admin-outline-variant border-t-admin-primary rounded-full animate-spin mb-4"></div>
          <p className="font-semibold text-sm">Loading KYC verification files...</p>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="bg-white border rounded-2xl p-12 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto opacity-80" />
          <h3 className="font-bold text-lg text-admin-on-surface">All caught up!</h3>
          <p className="text-sm text-admin-on-surface-variant max-w-sm mx-auto">
            No merchant applications matching the selected "{filter}" criteria were found.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map(item => (
            <div 
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={`bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group ${
                item.kycStatus === "Pending" ? "border-l-4 border-l-amber-500" :
                item.kycStatus === "Approved" ? "border-l-4 border-l-green-500" : "border-l-4 border-l-red-500"
              }`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="font-mono text-xs font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                    {item.id}
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    item.kycStatus === "Pending" ? "bg-amber-100 text-amber-800" :
                    item.kycStatus === "Approved" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {item.kycStatus}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-lg text-admin-on-surface group-hover:text-admin-primary transition-colors">
                    {item.businessName}
                  </h3>
                  <p className="text-xs text-admin-on-surface-variant flex items-center gap-1 mt-0.5">
                    <span>Owner:</span> <span className="font-semibold text-admin-on-surface">{item.ownerName}</span>
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Document Type:</span>
                    <span className="font-semibold text-slate-800">Business License & EIN</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Submitted Date:</span>
                    <span className="font-semibold text-slate-800">{item.kycDocs?.submittedDate || item.registeredDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bank Setup:</span>
                    <span className="font-semibold text-green-600">Verified</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-admin-outline-variant/60 flex items-center justify-between">
                <span className="text-xs font-semibold text-admin-primary flex items-center gap-1 group-hover:underline">
                  <span>Inspect Files</span> <ChevronRight className="w-3.5 h-3.5" />
                </span>
                
                {item.kycStatus === "Pending" && (
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <button 
                      onClick={(e) => handleReject(item.id, e)}
                      className="px-2.5 py-1.5 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 text-xs font-semibold rounded-lg transition-all"
                    >
                      Reject
                    </button>
                    <button 
                      onClick={(e) => handleApprove(item.id, e)}
                      className="px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                    >
                      Approve
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* KYC Inspection Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border border-admin-outline-variant animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-admin-outline-variant flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-admin-primary/10 text-admin-primary flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-admin-on-surface">{selectedItem.businessName}</h3>
                  <span className="font-mono text-xs text-slate-500">{selectedItem.id} • KYC Inspection</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedItem(null)}
                className="p-1.5 hover:bg-slate-200 rounded-full text-slate-500 hover:text-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 border">
                <div>
                  <span className="text-xs text-slate-500 block">Verification Status</span>
                  <span className={`font-bold text-sm ${
                    selectedItem.kycStatus === "Approved" ? "text-green-600" :
                    selectedItem.kycStatus === "Pending" ? "text-amber-600" : "text-red-600"
                  }`}>
                    {selectedItem.kycStatus}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Risk Assessment</span>
                  <span className="font-bold text-sm text-green-600">Low Risk (98/100)</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-sm text-admin-on-surface border-b pb-2">Uploaded Verification Files</h4>
                
                <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-admin-primary/40 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-indigo-600 shrink-0" />
                    <div>
                      <p className="font-bold text-xs text-admin-on-surface">{selectedItem.kycDocs?.businessLicense || "Business_License_Official.pdf"}</p>
                      <span className="text-[11px] text-admin-on-surface-variant">2.4 MB • PDF • Verified digitally</span>
                    </div>
                  </div>
                  <button onClick={() => showToast("Downloading Document...")} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold">
                    Preview
                  </button>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-admin-primary/40 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-amber-600 shrink-0" />
                    <div>
                      <p className="font-bold text-xs text-admin-on-surface">Tax ID / EIN Verification: {selectedItem.kycDocs?.taxId || "EIN-88-291039"}</p>
                      <span className="text-[11px] text-green-600 font-semibold">IRS Database Match Confirmed</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-green-600">Passed</span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-admin-primary/40 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-green-600 shrink-0" />
                    <div>
                      <p className="font-bold text-xs text-admin-on-surface">Settlement Account: {selectedItem.kycDocs?.bankAccount || "Chase ****4920"}</p>
                      <span className="text-[11px] text-admin-on-surface-variant">ACH Verification successful</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-green-600">Active</span>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-admin-outline-variant bg-slate-50 flex justify-between items-center">
              <button 
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-100 transition-colors"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {selectedItem.kycStatus !== "Rejected" && (
                  <button 
                    onClick={() => handleReject(selectedItem.id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" /> Reject KYC
                  </button>
                )}
                {selectedItem.kycStatus !== "Approved" && (
                  <button 
                    onClick={() => handleApprove(selectedItem.id)}
                    className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve & Verify
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}