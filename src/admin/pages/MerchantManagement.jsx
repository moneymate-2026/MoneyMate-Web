import { useState, useEffect } from "react";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import KpiCard from "../components/KpiCard";
import { adminMerchantService } from "../services/merchants";
import { 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  ShieldAlert, 
  CheckCircle2, 
  Ban, 
  Store, 
  TrendingUp, 
  DollarSign, 
  UserCheck, 
  QrCode, 
  FileText, 
  Mail, 
  Phone, 
  MapPin, 
  X,
  Award,
  ChevronRight,
  Edit3,
  Trash2,
  Printer,
  Download,
  Building2,
  Save,
  AlertTriangle
} from "lucide-react";

export default function MerchantManagement() {
  const [merchants, setMerchants] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [tierFilter, setTierFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [toast, setToast] = useState(null);

  // CRUD State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingMerchant, setEditingMerchant] = useState(null);
  const [deletingMerchant, setDeletingMerchant] = useState(null);
  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    category: "Retail",
    tier: "Basic",
    status: "Active",
    address: "",
    password: ""
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchMerchants = async () => {
    setLoading(true);
    try {
      const response = await adminMerchantService.getMerchants();
      setMerchants(response.data);
      setStats(response.stats || {});
    } catch (error) {
      console.error("Failed to fetch merchants", error);
      showToast("Failed to load merchants", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchants();
  }, []);

  // CRUD Handlers
  const handleOpenCreate = () => {
    setFormData({
      businessName: "",
      ownerName: "",
      email: "",
      phone: "",
      category: "Retail",
      tier: "Basic",
      status: "Active",
      address: "",
      password: ""
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (merchant, e) => {
    if (e) e.stopPropagation();
    setFormData({
      businessName: merchant.businessName,
      ownerName: merchant.ownerName,
      email: merchant.email,
      phone: merchant.phone,
      category: merchant.category,
      tier: merchant.tier,
      status: merchant.status,
      address: merchant.address
    });
    setEditingMerchant(merchant);
  };

  const handleOpenDelete = (merchant, e) => {
    if (e) e.stopPropagation();
    setDeletingMerchant(merchant);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.businessName || !formData.ownerName || !formData.email) {
      showToast("Please fill in required fields", "error");
      return;
    }
    try {
      await adminMerchantService.createMerchant(formData);
      showToast(`Merchant store "${formData.businessName}" created successfully!`);
      setIsCreateModalOpen(false);
      fetchMerchants();
    } catch (error) {
      showToast("Failed to create merchant", "error");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminMerchantService.updateMerchant(editingMerchant.id, formData);
      showToast(`Merchant store "${formData.businessName}" updated successfully!`);
      const updatedId = editingMerchant.id;
      setEditingMerchant(null);
      await fetchMerchants();
      if (selectedMerchant && selectedMerchant.id === updatedId) {
        setSelectedMerchant(prev => ({ ...prev, ...formData }));
      }
    } catch (error) {
      showToast("Failed to update merchant", "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingMerchant) return;
    try {
      await adminMerchantService.deleteMerchant(deletingMerchant.id);
      showToast(`Merchant "${deletingMerchant.businessName}" deleted successfully!`, "error");
      if (selectedMerchant && selectedMerchant.id === deletingMerchant.id) {
        setSelectedMerchant(null);
      }
      setDeletingMerchant(null);
      fetchMerchants();
    } catch (error) {
      showToast("Failed to delete merchant", "error");
    }
  };

  // PDF Export
  const handleExportPDF = () => {
    showToast("Generating PDF report...");
    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (!printWindow) {
      showToast("Popup blocked! Please allow popups to download PDF.", "error");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>MoneyMate QR Rewards - Merchant Directory Report</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #1e293b; }
          .header { display: flex; justify-content: space-between; items-center: center; border-bottom: 2px solid #6366f1; padding-bottom: 15px; margin-bottom: 20px; }
          .title { font-size: 24px; font-weight: bold; color: #0f172a; margin: 0; }
          .subtitle { font-size: 13px; color: #64748b; margin-top: 5px; }
          .meta { text-align: right; font-size: 12px; color: #64748b; }
          .kpi-row { display: flex; gap: 15px; margin-bottom: 25px; }
          .kpi-card { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px 15px; rounded: 8px; }
          .kpi-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; }
          .kpi-val { font-size: 20px; font-weight: bold; color: #0f172a; margin-top: 4px; }
          table { w-full; width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
          th { background-color: #f1f5f9; color: #334155; text-align: left; padding: 10px; font-weight: 600; border-bottom: 2px solid #cbd5e1; }
          td { padding: 10px; border-bottom: 1px solid #e2e8f0; color: #334155; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .badge { padding: 3px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; }
          .badge-active { background: #dcfce7; color: #166534; }
          .badge-suspended { background: #fee2e2; color: #991b1b; }
          .badge-pending { background: #fef3c7; color: #92400e; }
          .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0; font-size: 11px; text-align: center; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">MoneyMate QR Rewards</h1>
            <p class="subtitle">Official Merchant Directory & Compliance Report</p>
          </div>
          <div class="meta">
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Total Stores:</strong> ${filteredMerchants.length}</p>
          </div>
        </div>

        <div class="kpi-row">
          <div class="kpi-card">
            <div class="kpi-label">Total Stores</div>
            <div class="kpi-val">${merchants.length}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Active Storefronts</div>
            <div class="kpi-val">${merchants.filter(m => m.status === 'Active').length}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Pending KYC</div>
            <div class="kpi-val">${merchants.filter(m => m.kycStatus === 'Pending').length}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Total Volume</div>
            <div class="kpi-val">${stats.totalVolumeProcessed || "$175,916.75"}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Store ID</th>
              <th>Business Name & Category</th>
              <th>Owner Contact</th>
              <th>Tier</th>
              <th>QR Volume</th>
              <th>Status</th>
              <th>KYC Status</th>
            </tr>
          </thead>
          <tbody>
            ${filteredMerchants.map(m => `
              <tr>
                <td><strong>${m.id}</strong><br><span style="font-size:10px;color:#64748b">${m.registeredDate}</span></td>
                <td><strong>${m.businessName}</strong><br><span style="font-size:10px;color:#6366f1">${m.category}</span></td>
                <td>${m.ownerName}<br><span style="font-size:10px;color:#64748b">${m.email}</span></td>
                <td>${m.tier}</td>
                <td><strong>${m.volume}</strong><br><span style="font-size:10px;color:#16a34a">Rewards: ${m.cashbackIssued}</span></td>
                <td><span class="badge ${m.status === 'Active' ? 'badge-active' : m.status === 'Suspended' ? 'badge-suspended' : 'badge-pending'}">${m.status}</span></td>
                <td>${m.kycStatus}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          Confidential Administrative Document • MoneyMate Platform Inc. • Page 1 of 1
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleApproveKYC = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await adminMerchantService.approveKYC(id);
      showToast(`Merchant ${id} KYC verified and activated!`);
      fetchMerchants();
      if (selectedMerchant && selectedMerchant.id === id) {
        setSelectedMerchant(prev => ({ ...prev, kycStatus: "Approved", status: "Active", qrStatus: "Active" }));
      }
    } catch (error) {
      showToast("Error approving KYC", "error");
    }
  };

  const handleRejectKYC = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await adminMerchantService.rejectKYC(id);
      showToast(`Merchant ${id} KYC rejected and suspended.`, "error");
      fetchMerchants();
      if (selectedMerchant && selectedMerchant.id === id) {
        setSelectedMerchant(prev => ({ ...prev, kycStatus: "Rejected", status: "Suspended", qrStatus: "Disabled" }));
      }
    } catch (error) {
      showToast("Error rejecting KYC", "error");
    }
  };

  const handleToggleStatus = async (id, currentStatus, e) => {
    if (e) e.stopPropagation();
    const newStatus = currentStatus === "Active" ? "Suspended" : "Active";
    try {
      await adminMerchantService.updateMerchantStatus(id, newStatus);
      showToast(`Merchant ${id} status updated to ${newStatus}`);
      fetchMerchants();
      if (selectedMerchant && selectedMerchant.id === id) {
        setSelectedMerchant(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      showToast("Error updating status", "error");
    }
  };

  const handleChangeTier = async (id, newTier, e) => {
    if (e) e.stopPropagation();
    try {
      await adminMerchantService.updateSubscriptionTier(id, newTier);
      showToast(`Merchant ${id} plan upgraded to ${newTier}!`);
      fetchMerchants();
      if (selectedMerchant && selectedMerchant.id === id) {
        setSelectedMerchant(prev => ({ ...prev, tier: newTier }));
      }
    } catch (error) {
      showToast("Error changing plan", "error");
    }
  };

  const filteredMerchants = merchants.filter(m => {
    const query = search.toLowerCase();
    const matchesSearch = 
      m.businessName.toLowerCase().includes(query) || 
      m.ownerName.toLowerCase().includes(query) ||
      m.email.toLowerCase().includes(query) ||
      (m.phone && m.phone.toLowerCase().includes(query)) ||
      (m.address && m.address.toLowerCase().includes(query)) ||
      m.category.toLowerCase().includes(query) ||
      m.id.toLowerCase().includes(query);
    const matchesStatus = statusFilter === "All" || m.status === statusFilter;
    const matchesTier = tierFilter === "All" || m.tier === tierFilter;
    const matchesCategory = categoryFilter === "All" || m.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesTier && matchesCategory;
  });

  const columns = [
    { 
      header: "Store ID & Date", 
      render: (row) => (
        <div>
          <span className="font-mono text-xs font-bold bg-admin-surface-container-high px-2 py-0.5 rounded text-admin-on-surface">
            {row.displayId || row.id}
          </span>
          <p className="text-[11px] text-admin-on-surface-variant mt-1">{row.registeredDate}</p>
        </div>
      )
    },
    { 
      header: "Business & Category", 
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-admin-primary/10 text-admin-primary flex items-center justify-center font-bold text-sm shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-admin-on-surface hover:text-admin-primary transition-colors cursor-pointer" onClick={() => setSelectedMerchant(row)}>
              {row.businessName}
            </p>
            <span className="inline-block mt-0.5 px-2 py-0.2 bg-admin-surface-container-highest text-slate-600 rounded text-[10px] font-semibold uppercase">
              {row.category}
            </span>
          </div>
        </div>
      )
    },
    { 
      header: "Owner Contact", 
      render: (row) => (
        <div>
          <p className="font-medium text-admin-on-surface text-xs">{row.ownerName}</p>
          <p className="text-[11px] text-admin-on-surface-variant">{row.email}</p>
          <p className="text-[10px] text-admin-on-surface-variant">{row.phone}</p>
        </div>
      )
    },
    { 
      header: "Subscription Tier", 
      render: (row) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
          row.tier === "Enterprise" ? "bg-indigo-50 text-indigo-800 border-indigo-200" :
          row.tier === "Premium" ? "bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-400/50" :
          "bg-admin-surface-container-high text-admin-on-surface border-admin-outline-variant"
        }`}>
          {row.tier === "Enterprise" ? "👑 Enterprise" : row.tier === "Premium" ? "⭐ Premium" : "Basic"}
        </span>
      )
    },
    { 
      header: "QR Volume", 
      render: (row) => (
        <div>
          <p className="font-bold text-admin-on-surface text-sm">{row.volume}</p>
          <p className="text-[11px] text-green-600 font-medium">Rewards: {row.cashbackIssued}</p>
        </div>
      )
    },
    { 
      header: "KYC & Status", 
      render: (row) => (
        <div className="space-y-1">
          <StatusBadge 
            status={row.status} 
            variant={
              row.status === "Active" ? "success" : 
              row.status === "Suspended" ? "error" : "warning"
            } 
          />
          <div className="text-[10px] font-medium text-admin-on-surface-variant flex items-center gap-1">
            <span>KYC:</span>
            <span className={
              row.kycStatus === "Approved" ? "text-green-600 font-bold" :
              row.kycStatus === "Pending" ? "text-amber-600 font-bold animate-pulse" : "text-red-600 font-bold"
            }>
              {row.kycStatus}
            </span>
          </div>
        </div>
      )
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={() => setSelectedMerchant(row)}
            className="p-1.5 bg-admin-surface-container-low text-admin-on-surface-variant hover:text-admin-primary hover:bg-admin-primary/10 rounded-lg transition-colors" 
            title="View Store Profile & KYC"
          >
            <Search className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => handleOpenEdit(row, e)}
            className="p-1.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-lg transition-all" 
            title="Edit Merchant Details"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          {row.kycStatus === "Pending" && (
            <button 
              onClick={(e) => handleApproveKYC(row.id, e)}
              className="p-1.5 bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white rounded-lg transition-all" 
              title="Approve KYC & Activate"
            >
              <UserCheck className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={(e) => handleToggleStatus(row.id, row.status, e)}
            className={`p-1.5 rounded-lg transition-all ${
              row.status === "Active" 
                ? "bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white" 
                : "bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white"
            }`}
            title={row.status === "Active" ? "Suspend Merchant" : "Activate Merchant"}
          >
            {row.status === "Active" ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          </button>
          <button 
            onClick={(e) => handleOpenDelete(row, e)}
            className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all" 
            title="Delete Merchant Store"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

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

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[26px] font-extrabold text-admin-on-surface tracking-tight">Merchant Management</h2>
            <span className="bg-admin-primary/10 text-admin-primary text-xs font-bold px-2.5 py-1 rounded-full">
              {merchants.length} Total Stores
            </span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setStatusFilter(statusFilter === "Pending KYC" ? "All" : "Pending KYC")}
            className={`px-3.5 py-2 border rounded-xl font-semibold shadow-sm transition-all flex items-center gap-2 text-xs sm:text-sm ${
              statusFilter === "Pending KYC" 
                ? "bg-amber-500 text-white border-amber-600 shadow-amber-500/20 shadow-md" 
                : "bg-admin-surface-container border-admin-outline-variant text-admin-on-surface hover:bg-admin-surface-container-low"
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Pending KYC ({merchants.filter(m => m.kycStatus === "Pending").length})</span>
          </button>
          
          <button 
            onClick={handleExportPDF}
            className="px-3.5 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl font-semibold shadow-sm hover:bg-indigo-500/20 transition-all flex items-center gap-2 text-xs sm:text-sm"
          >
            <Printer className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Export PDF</span>
          </button>

          <button 
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-admin-primary text-admin-on-primary rounded-xl font-semibold shadow-md shadow-admin-primary/20 hover:bg-admin-primary-container transition-all flex items-center gap-2 text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4 shrink-0" /> Create Merchant
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <KpiCard 
          title="Total Registered Stores" 
          value={stats.totalMerchants || merchants.length} 
          trend="up" 
          trendValue="+12% this mo" 
          icon={Store} 
        />
        <KpiCard 
          title="Active Storefronts" 
          value={stats.activeStores || merchants.filter(m => m.status === 'Active').length} 
          trend="up" 
          trendValue="94.2% online" 
          icon={CheckCircle2} 
        />
        <KpiCard 
          title="Pending KYC Reviews" 
          value={stats.pendingKyc || merchants.filter(m => m.kycStatus === 'Pending').length} 
          trend={merchants.filter(m => m.kycStatus === 'Pending').length > 0 ? "down" : "up"} 
          trendValue="Action req." 
          icon={UserCheck} 
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-admin-surface-container border border-admin-outline-variant rounded-2xl shadow-sm p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 max-w-lg flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-admin-outline-variant/60 focus-within:border-admin-primary focus-within:ring-2 focus-within:ring-admin-primary/20 transition-all bg-admin-surface-container-lowest">
            <Search className="w-4 h-4 text-admin-primary shrink-0" />
            <input 
              type="text"
              placeholder="Search merchants by business name, owner, email, phone, address, or store ID..."
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

          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="text-admin-on-surface-variant mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Status:
            </span>
            {["All", "Active", "Pending KYC", "Suspended"].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === status 
                    ? "bg-admin-primary text-white shadow-sm" 
                    : "bg-admin-surface-container-low text-admin-on-surface-variant hover:bg-admin-surface-container"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-admin-outline-variant/40 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="text-admin-on-surface-variant">Tier:</span>
            {["All", "Basic", "Premium", "Enterprise"].map(tier => (
              <button
                key={tier}
                onClick={() => setTierFilter(tier)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  tierFilter === tier 
                    ? "bg-admin-primary text-white" 
                    : "bg-admin-surface-container-highest text-admin-on-surface-variant hover:bg-admin-surface-container-highest"
                }`}
              >
                {tier}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Main Table Container with Box Scrolling (Max Height 520px) */}
      <div className="bg-admin-surface-container border border-admin-outline-variant rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-admin-on-surface-variant">
            <div className="w-9 h-9 border-4 border-admin-outline-variant border-t-admin-primary rounded-full animate-spin mb-4"></div>
            <p className="font-semibold text-sm">Loading merchant directories...</p>
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={filteredMerchants} 
            maxHeight="520px"
            stickyHeader={true}
            className="border-0 shadow-none rounded-none" 
          />
        )}

        <div className="p-4 bg-admin-surface-container-lowest border-t border-admin-outline-variant flex flex-col sm:flex-row items-center justify-between text-sm text-admin-on-surface-variant gap-4">
          <div>
            Showing <span className="font-bold text-admin-on-surface">{filteredMerchants.length}</span> of <span className="font-bold text-admin-on-surface">{merchants.length}</span> merchant stores
          </div>
          <div className="flex gap-1.5">
            <button className="px-3 py-1.5 rounded-lg border border-admin-outline-variant hover:bg-admin-surface-container disabled:opacity-50 font-medium text-xs" disabled>Previous</button>
            <button className="px-3 py-1.5 rounded-lg border border-admin-outline-variant hover:bg-admin-surface-container text-admin-primary bg-admin-surface-container font-bold text-xs">1</button>
            <button className="px-3 py-1.5 rounded-lg border border-admin-outline-variant hover:bg-admin-surface-container font-medium text-xs">2</button>
            <button className="px-3 py-1.5 rounded-lg border border-admin-outline-variant hover:bg-admin-surface-container font-medium text-xs">Next</button>
          </div>
        </div>
      </div>

      {/* CREATE MERCHANT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-admin-surface-container rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden border border-admin-outline-variant animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-admin-outline-variant flex justify-between items-center bg-admin-surface-container-high shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-admin-primary/10 text-admin-primary flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-admin-on-surface">Create New Merchant Store</h3>
                  <span className="text-xs text-admin-on-surface-variant">Register a new shop owner and storefront on the platform</span>
                </div>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 hover:bg-admin-surface-container-highest rounded-full text-admin-on-surface-variant hover:text-admin-on-surface transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-admin-on-surface-variant block mb-1">Business / Store Name *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Acme Supermarket"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-admin-outline-variant text-sm font-semibold bg-admin-surface-container-lowest focus:ring-2 focus:ring-admin-primary/20 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-admin-on-surface-variant block mb-1">Owner Name *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. John Doe"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-admin-outline-variant text-sm font-semibold bg-admin-surface-container-lowest focus:ring-2 focus:ring-admin-primary/20 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-admin-on-surface-variant block mb-1">Owner Email *</label>
                  <input 
                    type="email" 
                    required
                    placeholder="store@acme.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-admin-outline-variant text-sm font-semibold bg-admin-surface-container-lowest focus:ring-2 focus:ring-admin-primary/20 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-admin-on-surface-variant block mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-admin-outline-variant text-sm font-semibold bg-admin-surface-container-lowest focus:ring-2 focus:ring-admin-primary/20 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-admin-on-surface-variant block mb-1">Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-admin-outline-variant text-xs font-bold bg-admin-surface-container-lowest focus:ring-2 focus:ring-admin-primary/20 outline-none"
                  >
                    <option value="Retail">Retail</option>
                    <option value="F&B">F&B</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Services">Services</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-admin-on-surface-variant block mb-1">SaaS Tier</label>
                  <select 
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-admin-outline-variant text-xs font-bold bg-admin-surface-container-lowest focus:ring-2 focus:ring-admin-primary/20 outline-none"
                  >
                    <option value="Basic">Basic ($0)</option>
                    <option value="Premium">Premium ($29)</option>
                    <option value="Enterprise">Enterprise ($99)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-admin-on-surface-variant block mb-1">Initial Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-admin-outline-variant text-xs font-bold bg-admin-surface-container-lowest focus:ring-2 focus:ring-admin-primary/20 outline-none"
                  >
                    <option value="Active">Active (Verified)</option>
                    <option value="Pending KYC">Pending KYC</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-admin-on-surface-variant block mb-1">Initial Password *</label>
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••"
                    value={formData.password || ""}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-admin-outline-variant text-sm font-semibold bg-admin-surface-container-lowest focus:ring-2 focus:ring-admin-primary/20 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-admin-on-surface-variant block mb-1">Physical Store Address</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 742 Evergreen Terrace, Suite 100, NY"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-admin-outline-variant text-sm font-semibold bg-admin-surface-container-lowest focus:ring-2 focus:ring-admin-primary/20 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-3 shrink-0">
                <button 
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-admin-outline-variant text-admin-on-surface font-semibold text-xs rounded-xl hover:bg-admin-surface-container-highest transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-admin-primary hover:bg-admin-primary-container text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> Create Merchant Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MERCHANT MODAL */}
      {editingMerchant && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-admin-surface-container rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden border border-admin-outline-variant animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-admin-outline-variant flex justify-between items-center bg-admin-surface-container-high shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-admin-on-surface">Edit Store: {editingMerchant.businessName}</h3>
                  <span className="font-mono text-xs bg-admin-surface-container-highest px-2 py-0.5 rounded text-admin-on-surface">{editingMerchant.id}</span>
                </div>
              </div>
              <button 
                onClick={() => setEditingMerchant(null)}
                className="p-1.5 hover:bg-admin-surface-container-highest rounded-full text-admin-on-surface-variant hover:text-admin-on-surface transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-admin-on-surface-variant block mb-1">Business / Store Name *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-admin-outline-variant text-sm font-semibold bg-admin-surface-container-lowest focus:ring-2 focus:ring-admin-primary/20 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-admin-on-surface-variant block mb-1">Owner Name *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-admin-outline-variant text-sm font-semibold bg-admin-surface-container-lowest focus:ring-2 focus:ring-admin-primary/20 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-admin-on-surface-variant block mb-1">Owner Email *</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-admin-outline-variant text-sm font-semibold bg-admin-surface-container-lowest focus:ring-2 focus:ring-admin-primary/20 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-admin-on-surface-variant block mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-admin-outline-variant text-sm font-semibold bg-admin-surface-container-lowest focus:ring-2 focus:ring-admin-primary/20 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-admin-on-surface-variant block mb-1">Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-admin-outline-variant text-xs font-bold bg-admin-surface-container-lowest focus:ring-2 focus:ring-admin-primary/20 outline-none"
                  >
                    <option value="Retail">Retail</option>
                    <option value="F&B">F&B</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Services">Services</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-admin-on-surface-variant block mb-1">SaaS Tier</label>
                  <select 
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-admin-outline-variant text-xs font-bold bg-admin-surface-container-lowest focus:ring-2 focus:ring-admin-primary/20 outline-none"
                  >
                    <option value="Basic">Basic ($0)</option>
                    <option value="Premium">Premium ($29)</option>
                    <option value="Enterprise">Enterprise ($99)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-admin-on-surface-variant block mb-1">Account Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-admin-outline-variant text-xs font-bold bg-admin-surface-container-lowest focus:ring-2 focus:ring-admin-primary/20 outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending KYC">Pending KYC</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-admin-on-surface-variant block mb-1">Physical Store Address</label>
                <input 
                  type="text" 
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-admin-outline-variant text-sm font-semibold bg-admin-surface-container-lowest focus:ring-2 focus:ring-admin-primary/20 outline-none"
                />
              </div>

              <div className="pt-4 border-t flex justify-end gap-3 shrink-0">
                <button 
                  type="button"
                  onClick={() => setEditingMerchant(null)}
                  className="px-4 py-2 border border-admin-outline-variant text-admin-on-surface font-semibold text-xs rounded-xl hover:bg-admin-surface-container-highest transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingMerchant && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-admin-surface-container rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-red-200 animate-in zoom-in-95 duration-200 p-6 space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-extrabold text-lg text-admin-on-surface">Delete Store Account?</h3>
              <p className="text-xs text-admin-on-surface-variant leading-relaxed">
                You are about to permanently delete <span className="font-bold text-admin-on-surface">&quot;{deletingMerchant.businessName}&quot; ({deletingMerchant.id})</span>. All assigned QR terminals, cashback logs, and owner credentials will be removed. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-admin-outline-variant">
              <button 
                type="button"
                onClick={() => setDeletingMerchant(null)}
                className="flex-1 py-2.5 border border-admin-outline-variant text-admin-on-surface font-semibold text-xs rounded-xl hover:bg-admin-surface-container-highest transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-500/20 transition-all flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Yes, Delete Store
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Merchant Details Slide-Over Modal */}
      {selectedMerchant && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end animate-in fade-in duration-300">
          <div className="bg-admin-surface-container w-full max-w-2xl h-full shadow-2xl overflow-y-auto flex flex-col animate-in slide-in-from-right duration-300 border-l border-admin-outline-variant">
            {/* Modal Header */}
            <div className="p-6 border-b border-admin-outline-variant sticky top-0 bg-admin-surface-container/90 backdrop-blur-md z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-admin-primary/10 text-admin-primary flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-extrabold text-admin-on-surface">{selectedMerchant.businessName}</h3>
                    <span className="font-mono text-xs bg-admin-surface-container-highest px-2 py-0.5 rounded font-bold">{selectedMerchant.id}</span>
                  </div>
                  <p className="text-xs text-admin-on-surface-variant flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-admin-primary" /> {selectedMerchant.address}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => handleOpenEdit(selectedMerchant, e)}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl font-semibold text-xs flex items-center gap-1 transition-colors"
                  title="Edit Merchant"
                >
                  <Edit3 className="w-4 h-4" /> Edit
                </button>
                <button 
                  onClick={() => setSelectedMerchant(null)}
                  className="p-2 text-admin-on-surface-variant hover:text-admin-on-surface rounded-full hover:bg-admin-surface-container-highest transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 flex-1">
              {/* Status Banner */}
              <div className="bg-admin-surface-container-low p-4 rounded-2xl border border-admin-outline-variant/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-admin-on-surface-variant font-semibold uppercase tracking-wider">Account Status</span>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={selectedMerchant.status} variant={selectedMerchant.status === "Active" ? "success" : "error"} />
                    <span className="text-sm font-bold">KYC: {selectedMerchant.kycStatus}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {selectedMerchant.kycStatus === "Pending" && (
                    <button 
                      onClick={() => handleApproveKYC(selectedMerchant.id)}
                      className="px-3.5 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <UserCheck className="w-4 h-4" /> Approve KYC
                    </button>
                  )}
                  {selectedMerchant.status === "Active" ? (
                    <button 
                      onClick={() => handleToggleStatus(selectedMerchant.id, "Active")}
                      className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <Ban className="w-4 h-4" /> Suspend Store
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleToggleStatus(selectedMerchant.id, "Suspended")}
                      className="px-3.5 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Activate Store
                    </button>
                  )}
                </div>
              </div>

              {/* Owner and Subscription Plan Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-admin-outline-variant rounded-xl p-4 space-y-3 bg-admin-surface-container">
                  <h4 className="font-bold text-sm text-admin-on-surface flex items-center gap-2 border-b pb-2">
                    <UserCheck className="w-4 h-4 text-admin-primary" /> Owner Information
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-admin-on-surface-variant block">Owner Name:</span>
                      <span className="font-semibold text-admin-on-surface text-sm">{selectedMerchant.ownerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-admin-on-surface">
                      <Mail className="w-3.5 h-3.5 text-admin-on-surface-variant" /> {selectedMerchant.email}
                    </div>
                    <div className="flex items-center gap-2 text-admin-on-surface">
                      <Phone className="w-3.5 h-3.5 text-admin-on-surface-variant" /> {selectedMerchant.phone}
                    </div>
                  </div>
                </div>

                <div className="border border-admin-outline-variant rounded-xl p-4 space-y-3 bg-admin-surface-container">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h4 className="font-bold text-sm text-admin-on-surface flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-500" /> Subscription Plan
                    </h4>
                    <span className="font-mono text-xs font-bold text-admin-primary">{selectedMerchant.tier}</span>
                  </div>
                  <p className="text-xs text-admin-on-surface-variant">
                    Manage the merchant&apos;s current billing tier and feature entitlements.
                  </p>
                  <div className="pt-1 flex items-center gap-2">
                    <span className="text-xs font-semibold text-admin-on-surface-variant">Upgrade:</span>
                    {["Basic", "Premium", "Enterprise"].map(t => (
                      <button
                        key={t}
                        onClick={() => handleChangeTier(selectedMerchant.id, t)}
                        disabled={selectedMerchant.tier === t}
                        className={`px-2 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                          selectedMerchant.tier === t 
                            ? "bg-admin-primary text-white border-admin-primary opacity-60 cursor-default" 
                            : "bg-admin-surface-container-high hover:bg-admin-surface-container-highest text-admin-on-surface border-admin-outline-variant"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* KYC Documents Section */}
              <div className="border border-admin-outline-variant rounded-xl p-5 space-y-4 bg-admin-surface-container shadow-sm">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm text-admin-on-surface flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" /> Submitted KYC Verification Documents
                  </h4>
                  <span className="text-xs text-admin-on-surface-variant">
                    Sub. Date: {selectedMerchant.kycDocs?.submittedDate || selectedMerchant.registeredDate}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-admin-surface-container-high border border-admin-outline-variant flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-admin-on-surface-variant">Business License</span>
                      <p className="font-mono text-xs font-semibold text-admin-on-surface mt-1 truncate">
                        {selectedMerchant.kycDocs?.businessLicense || "LIC-DOC.pdf"}
                      </p>
                    </div>
                    <button 
                      onClick={() => showToast(`Previewing ${selectedMerchant.kycDocs?.businessLicense}...`)}
                      className="mt-3 text-[11px] font-bold text-admin-primary hover:underline flex items-center gap-1"
                    >
                      <span>View File</span> <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-admin-surface-container-high border border-admin-outline-variant flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-admin-on-surface-variant">Tax EIN / GST</span>
                      <p className="font-mono text-xs font-semibold text-admin-on-surface mt-1 truncate">
                        {selectedMerchant.kycDocs?.taxId || "EIN-VERIFIED"}
                      </p>
                    </div>
                    <span className="mt-3 text-[11px] font-bold text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified Valid
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-admin-surface-container-high border border-admin-outline-variant flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-admin-on-surface-variant">Settlement Bank</span>
                      <p className="font-mono text-xs font-semibold text-admin-on-surface mt-1 truncate">
                        {selectedMerchant.kycDocs?.bankAccount || "Bank Acc ***"}
                      </p>
                    </div>
                    <span className="mt-3 text-[11px] font-bold text-slate-600">
                      Direct Deposit Ready
                    </span>
                  </div>
                </div>

                {selectedMerchant.kycStatus === "Pending" && (
                  <div className="pt-3 border-t flex justify-end gap-3">
                    <button 
                      onClick={() => handleRejectKYC(selectedMerchant.id)}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs rounded-xl border border-red-200 transition-all"
                    >
                      Reject Documents
                    </button>
                    <button 
                      onClick={() => handleApproveKYC(selectedMerchant.id)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                    >
                      <UserCheck className="w-4 h-4" /> Approve & Verify Store
                    </button>
                  </div>
                )}
              </div>

              {/* Financials & QR Activity */}
              <div className="border border-admin-outline-variant rounded-xl p-5 space-y-3 bg-admin-surface-container">
                <h4 className="font-bold text-sm text-admin-on-surface flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-admin-primary" /> Store QR & Volume Analytics
                </h4>
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="p-3 bg-admin-surface-container-lowest rounded-xl border">
                    <span className="text-[11px] text-admin-on-surface-variant block">Assigned QR ID</span>
                    <span className="font-mono text-xs font-bold text-admin-on-surface">{selectedMerchant.qrCodeId}</span>
                  </div>
                  <div className="p-3 bg-admin-surface-container-lowest rounded-xl border">
                    <span className="text-[11px] text-admin-on-surface-variant block">Total Scan Volume</span>
                    <span className="font-bold text-sm text-admin-on-surface">{selectedMerchant.volume}</span>
                  </div>
                  <div className="p-3 bg-admin-surface-container-lowest rounded-xl border">
                    <span className="text-[11px] text-admin-on-surface-variant block">Rewards Distributed</span>
                    <span className="font-bold text-sm text-green-600">{selectedMerchant.cashbackIssued}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-admin-outline-variant bg-admin-surface-container-high flex justify-between items-center">
              <button 
                onClick={(e) => handleOpenDelete(selectedMerchant, e)}
                className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl font-bold text-xs transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Delete Store
              </button>
              <button 
                onClick={() => setSelectedMerchant(null)}
                className="px-5 py-2 bg-admin-surface-container border border-admin-outline-variant text-admin-on-surface rounded-xl font-semibold text-xs hover:bg-admin-surface-container-highest transition-colors"
              >
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}