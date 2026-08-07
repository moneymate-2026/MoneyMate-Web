import { useState, useEffect } from "react";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import KpiCard from "../components/KpiCard";
import { adminMerchantService } from "../services/merchants";
import { 
  Megaphone, 
  Tag, 
  Search, 
  Filter, 
  Play, 
  Pause, 
  Flag, 
  DollarSign, 
  Users, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle,
  X
} from "lucide-react";

export default function MerchantCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const response = await adminMerchantService.getMerchantCampaigns();
      setCampaigns(response.data);
    } catch (error) {
      showToast("Error loading campaigns", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await adminMerchantService.updateCampaignStatus(id, newStatus);
      showToast(`Campaign ${id} updated to ${newStatus}`);
      fetchCampaigns();
    } catch (error) {
      showToast("Error updating campaign status", "error");
    }
  };

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = 
      c.title.toLowerCase().includes(search.toLowerCase()) || 
      c.merchantName.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = campaigns.filter(c => c.status === "Active").length;
  const flaggedCount = campaigns.filter(c => c.status === "Flagged").length;

  const columns = [
    { 
      header: "Campaign ID", 
      render: (row) => (
        <span className="font-mono text-xs font-bold bg-admin-surface-container-highest px-2.5 py-1 rounded text-admin-on-surface">
          {row.id}
        </span>
      )
    },
    { 
      header: "Merchant & Title", 
      render: (row) => (
        <div>
          <p className="font-bold text-admin-on-surface text-sm">{row.title}</p>
          <span className="text-xs text-admin-primary font-semibold">{row.merchantName}</span>
        </div>
      )
    },
    { 
      header: "Reward Type", 
      render: (row) => (
        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-semibold text-xs rounded-lg border border-indigo-200">
          {row.type}
        </span>
      )
    },
    { 
      header: "Customer Scans", 
      render: (row) => (
        <div>
          <span className="font-bold text-admin-on-surface text-sm">{row.scans.toLocaleString()} scans</span>
          <p className="text-[11px] text-admin-on-surface-variant">Spent: {row.cashbackSpent} / {row.budget}</p>
        </div>
      )
    },
    { 
      header: "Duration", 
      render: (row) => (
        <div className="text-xs text-admin-on-surface-variant">
          <p>{row.startDate}</p>
          <p>to {row.endDate}</p>
        </div>
      )
    },
    { 
      header: "Status", 
      render: (row) => (
        <StatusBadge 
          status={row.status} 
          variant={
            row.status === "Active" ? "success" : 
            row.status === "Flagged" ? "error" : "warning"
          } 
        />
      )
    },
    {
      header: "Admin Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.status === "Active" ? (
            <button 
              onClick={() => handleUpdateStatus(row.id, "Paused")}
              className="p-1.5 bg-amber-50 hover:bg-amber-500 hover:text-white text-amber-600 rounded-lg transition-all" 
              title="Pause Campaign"
            >
              <Pause className="w-4 h-4" />
            </button>
          ) : (
            <button 
              onClick={() => handleUpdateStatus(row.id, "Active")}
              className="p-1.5 bg-green-50 hover:bg-green-600 hover:text-white text-green-600 rounded-lg transition-all" 
              title="Activate Campaign"
            >
              <Play className="w-4 h-4" />
            </button>
          )}
          
          <button 
            onClick={() => handleUpdateStatus(row.id, row.status === "Flagged" ? "Active" : "Flagged")}
            className={`p-1.5 rounded-lg transition-all ${
              row.status === "Flagged" 
                ? "bg-red-600 text-white hover:bg-red-700" 
                : "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"
            }`}
            title="Flag as Suspicious / Policy Violation"
          >
            <Flag className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

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
            <h2 className="text-[26px] font-extrabold text-admin-on-surface tracking-tight">Merchant Campaigns & Offers</h2>
            <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-1 rounded-full">
              {campaigns.length} Total Offers
            </span>
          </div>

        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          {["All", "Active", "Paused", "Flagged"].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === status 
                  ? "bg-admin-primary text-white shadow-sm" 
                  : "bg-admin-surface-container border border-admin-outline-variant text-admin-on-surface-variant hover:bg-admin-surface-container-low"
              }`}
            >
              {status} ({status === "All" ? campaigns.length : campaigns.filter(c => c.status === status).length})
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard title="Active Campaigns" value={activeCount} trend="up" trendValue="+4 this wk" icon={Tag} />
        <KpiCard title="Total Customer Scans" value="2,187" trend="up" trendValue="+24% engagement" icon={Users} />
        <KpiCard title="Total Rewards Issued" value="$3,903.00" trend="up" trendValue="High ROI" icon={DollarSign} />
        <KpiCard title="Flagged / Policy Alerts" value={flaggedCount} trend={flaggedCount > 0 ? "down" : "up"} trendValue="Action req." icon={AlertTriangle} />
      </div>

      {/* Search Bar */}
      <div className="bg-admin-surface-container border border-admin-outline-variant rounded-xl p-4 flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-admin-outline-variant/60 focus-within:border-admin-primary focus-within:ring-2 focus-within:ring-admin-primary/20 transition-all bg-admin-surface-container-lowest">
          <Search className="w-4 h-4 text-admin-on-surface-variant" />
          <input 
            type="text"
            placeholder="Search campaigns by title, merchant name, or ID..."
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

      {/* Table */}
      <div className="bg-admin-surface-container border border-admin-outline-variant rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-admin-on-surface-variant">
            <div className="w-9 h-9 border-4 border-admin-outline-variant border-t-admin-primary rounded-full animate-spin mb-4"></div>
            <p className="font-semibold text-sm">Loading promotional campaigns...</p>
          </div>
        ) : (
          <DataTable columns={columns} data={filteredCampaigns} className="border-0 shadow-none rounded-none" />
        )}
      </div>
    </div>
  );
}
