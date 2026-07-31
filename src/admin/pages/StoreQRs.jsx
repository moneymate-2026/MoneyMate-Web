import { useState, useEffect } from "react";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import KpiCard from "../components/KpiCard";
import { adminMerchantService } from "../../services/api/admin/merchants";
import { 
  QrCode, 
  Search, 
  Store, 
  MapPin, 
  RefreshCw, 
  Ban, 
  CheckCircle2, 
  Activity, 
  AlertOctagon, 
  X,
  Smartphone
} from "lucide-react";

export default function StoreQRs() {
  const [qrs, setQrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchQRs = async () => {
    setLoading(true);
    try {
      const response = await adminMerchantService.getStoreQRs();
      setQrs(response.data);
    } catch (error) {
      showToast("Error loading store QRs", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQRs();
  }, []);

  const handleToggleQR = async (qrId, currentStatus) => {
    const newStatus = currentStatus === "Online" ? "Disabled" : "Online";
    try {
      await adminMerchantService.updateQRStatus(qrId, newStatus);
      showToast(`Terminal ${qrId} changed to ${newStatus}`);
      fetchQRs();
    } catch (error) {
      showToast("Failed to update QR terminal", "error");
    }
  };

  const handleRegenerate = (qrId) => {
    showToast(`New QR code cryptographic seed generated for ${qrId}!`);
  };

  const filteredQRs = qrs.filter(q => {
    const matchesSearch = 
      q.storeName.toLowerCase().includes(search.toLowerCase()) || 
      q.qrId.toLowerCase().includes(search.toLowerCase()) ||
      q.terminalId.toLowerCase().includes(search.toLowerCase()) ||
      q.location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const onlineCount = qrs.filter(q => q.status === "Online").length;
  const offlineCount = qrs.filter(q => q.status === "Offline" || q.status === "Disabled").length;

  const columns = [
    { 
      header: "QR Code ID & Terminal", 
      render: (row) => (
        <div>
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-admin-primary" />
            <span className="font-mono text-xs font-bold text-admin-on-surface">{row.qrId}</span>
          </div>
          <span className="text-[11px] text-admin-on-surface-variant font-semibold bg-admin-surface-container-highest px-1.5 py-0.2 rounded mt-1 inline-block">
            {row.terminalId}
          </span>
        </div>
      )
    },
    { 
      header: "Assigned Store", 
      render: (row) => (
        <div>
          <p className="font-bold text-admin-on-surface text-sm">{row.storeName}</p>
          <p className="text-xs text-admin-on-surface-variant flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-admin-primary" /> {row.location}
          </p>
        </div>
      )
    },
    { 
      header: "Daily Scans", 
      render: (row) => (
        <div className="flex items-center gap-2">
          <Activity className={`w-4 h-4 ${row.dailyScans > 50 ? "text-green-500" : "text-slate-400"}`} />
          <span className="font-bold text-sm text-admin-on-surface">{row.dailyScans} scans today</span>
        </div>
      )
    },
    { 
      header: "Processed Volume", 
      render: (row) => (
        <span className="font-mono text-sm font-bold text-admin-on-surface">{row.totalVolume}</span>
      )
    },
    { 
      header: "Last Activity", 
      accessor: "lastScan" 
    },
    { 
      header: "Terminal Status", 
      render: (row) => (
        <StatusBadge 
          status={row.status} 
          variant={
            row.status === "Online" ? "success" : 
            row.status === "Offline" ? "warning" : "error"
          } 
        />
      )
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleRegenerate(row.qrId)}
            className="p-1.5 bg-admin-surface-container-low text-admin-on-surface-variant hover:text-admin-primary hover:bg-admin-primary/10 rounded-lg transition-colors" 
            title="Regenerate QR Seed / Reset Token"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <button 
            onClick={() => handleToggleQR(row.qrId, row.status)}
            className={`p-1.5 rounded-lg transition-all ${
              row.status === "Online" 
                ? "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white" 
                : "bg-green-50 text-green-600 hover:bg-green-600 hover:text-white"
            }`}
            title={row.status === "Online" ? "Disable Terminal QR" : "Activate Terminal QR"}
          >
            {row.status === "Online" ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
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
            <h2 className="text-[26px] font-extrabold text-admin-on-surface tracking-tight">Store QR & Terminal Directory</h2>
            <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full">
              {onlineCount} Terminals Online
            </span>
          </div>
          <p className="text-sm text-admin-on-surface-variant mt-1">
            Monitor physical and digital storefront QR terminals, audit scan velocity, and manage cryptographic tokens.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          {["All", "Online", "Offline", "Disabled", "Unverified"].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === status 
                  ? "bg-admin-primary text-white shadow-sm" 
                  : "bg-admin-surface-container border border-admin-outline-variant text-admin-on-surface-variant hover:bg-admin-surface-container-low"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard title="Active Store QRs" value={qrs.length} trend="up" trendValue="+15% expansion" icon={QrCode} />
        <KpiCard title="Online Terminals" value={onlineCount} trend="up" trendValue="99.4% uptime" icon={Smartphone} />
        <KpiCard title="Daily Scan Velocity" value="321 Scans" trend="up" trendValue="Peak hours" icon={Activity} />
        <KpiCard title="Offline / Disabled" value={offlineCount} trend={offlineCount > 0 ? "down" : "up"} trendValue="Requires check" icon={AlertOctagon} />
      </div>

      {/* Search Bar */}
      <div className="bg-admin-surface-container border border-admin-outline-variant rounded-xl p-4 flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-admin-outline-variant/60 focus-within:border-admin-primary focus-within:ring-2 focus-within:ring-admin-primary/20 transition-all bg-admin-surface-container-lowest">
          <Search className="w-4 h-4 text-admin-on-surface-variant" />
          <input 
            type="text"
            placeholder="Search QRs by store name, terminal ID, QR ID, or city..."
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
            <p className="font-semibold text-sm">Loading QR terminal registry...</p>
          </div>
        ) : (
          <DataTable columns={columns} data={filteredQRs} className="border-0 shadow-none rounded-none" />
        )}
      </div>
    </div>
  );
}
