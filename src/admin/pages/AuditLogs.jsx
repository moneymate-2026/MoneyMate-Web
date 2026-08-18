import { useState, useEffect } from "react";
import DataTable from "../components/DataTable";
import { Search, RefreshCw, History, ShieldAlert, CheckCircle2 } from "lucide-react";

// Data will be fetched from API


export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    // Simulate API fetch or connect to real backend later
    try {
      // const response = await api.get('/audit-logs');
      // setLogs(response.data);
      setLogs([]); // currently empty
    } catch (error) {
      console.error("Failed to fetch logs", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchLogs();
  };

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(search.toLowerCase()) || 
    log.personName.toLowerCase().includes(search.toLowerCase()) ||
    log.details.toLowerCase().includes(search.toLowerCase()) ||
    log.module.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: '2-digit', minute: '2-digit', second: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const columns = [
    { 
      header: "Date & Time", 
      render: (row) => (
        <span className="text-sm font-medium text-admin-on-surface whitespace-nowrap">
          {formatDate(row.date)}
        </span>
      )
    },
    { 
      header: "User / Role", 
      render: (row) => (
        <div>
          <p className="font-semibold text-admin-on-surface">{row.personName}</p>
          <span className="px-2 py-0.5 mt-1 inline-block bg-admin-surface-container-high rounded-md text-[11px] font-bold text-admin-on-surface-variant uppercase tracking-wider">
            {row.personRole}
          </span>
        </div>
      )
    },
    { 
      header: "Module", 
      render: (row) => (
        <span className="px-2.5 py-1 bg-admin-surface-container rounded-lg text-xs font-medium text-admin-on-surface border border-admin-outline-variant/50">
          {row.module}
        </span>
      )
    },
    { 
      header: "Action / Changes", 
      render: (row) => (
        <div className="max-w-md">
          <p className="font-semibold text-admin-primary tracking-tight">{row.action}</p>
          <p className="text-sm text-admin-on-surface-variant mt-0.5 truncate" title={row.details}>
            {row.details}
          </p>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-bold text-admin-on-surface tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-admin-primary" />
            Audit Logs
          </h2>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 bg-admin-surface-container border border-admin-outline-variant text-admin-on-surface rounded-lg font-semibold shadow-sm hover:bg-admin-surface-container-low transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} /> 
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-admin-surface-container border border-admin-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-admin-outline-variant flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="w-full sm:flex-1 max-w-md flex items-center gap-2 px-3 py-2 rounded-lg border border-admin-outline-variant/60 focus-within:border-admin-primary focus-within:ring-2 focus-within:ring-admin-primary/20 transition-all bg-admin-surface-container-lowest">
            <Search className="w-4 h-4 text-admin-on-surface-variant" />
            <input 
              type="text"
              placeholder="Search by action, user, or details..."
              className="bg-transparent border-none outline-none text-sm w-full text-admin-on-surface"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-admin-on-surface-variant font-medium bg-admin-surface-container-lowest px-3 py-2 rounded-lg border border-admin-outline-variant/50">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            System tracking active
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-admin-on-surface-variant">
            <div className="w-8 h-8 border-4 border-admin-outline-variant border-t-admin-primary rounded-full animate-spin mb-4"></div>
            <p className="font-medium">Loading audit logs...</p>
          </div>
        ) : (
          <DataTable columns={columns} data={filteredLogs} className="border-0 shadow-none rounded-none" />
        )}

        <div className="p-4 border-t border-admin-outline-variant flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-admin-on-surface-variant">
          <div>
            Showing <span className="font-semibold text-admin-on-surface">{filteredLogs.length}</span> of <span className="font-semibold text-admin-on-surface">{logs.length}</span> events
          </div>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 rounded-md border border-admin-outline-variant hover:bg-admin-surface-container disabled:opacity-50 transition-colors font-medium" disabled>Previous</button>
            <button className="px-3 py-1.5 rounded-md border border-admin-primary bg-admin-primary/10 text-admin-primary font-bold">1</button>
            <button className="px-3 py-1.5 rounded-md border border-admin-outline-variant hover:bg-admin-surface-container transition-colors font-medium" disabled={filteredLogs.length <= 10}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}