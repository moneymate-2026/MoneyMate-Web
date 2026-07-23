import { useState, useEffect } from "react";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { adminUserService } from "../../services/api/admin/users";
import { Search, Plus, Filter, MoreVertical, ShieldAlert, CheckCircle2, Ban } from "lucide-react";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await adminUserService.getUsers();
        setUsers(response.data);
      } catch (error) {
        console.error("Failed to fetch users", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) || 
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { header: "User ID", accessor: "id" },
    { 
      header: "User", 
      render: (row) => (
        <div>
          <p className="font-medium text-admin-on-surface">{row.name}</p>
          <p className="text-xs text-admin-on-surface-variant">{row.email}</p>
        </div>
      )
    },
    { 
      header: "Role", 
      render: (row) => (
        <span className="px-2 py-1 bg-admin-surface-container-high rounded-md text-xs font-semibold text-admin-on-surface-variant">
          {row.role}
        </span>
      )
    },
    { header: "Joined Date", accessor: "joined" },
    { 
      header: "Status", 
      render: (row) => (
        <StatusBadge 
          status={row.status} 
          variant={
            row.status === "Active" ? "success" : 
            row.status === "Suspended" ? "error" : "warning"
          } 
        />
      )
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-3">
          <button className="text-admin-on-surface-variant hover:text-admin-primary transition-colors" title="View Details">
            <Search className="w-4 h-4" />
          </button>
          <button className="text-admin-on-surface-variant hover:text-green-600 transition-colors" title="Activate">
            <CheckCircle2 className="w-4 h-4" />
          </button>
          <button className="text-admin-on-surface-variant hover:text-admin-error transition-colors" title="Suspend">
            <Ban className="w-4 h-4" />
          </button>
          <button className="text-admin-on-surface-variant hover:text-admin-on-surface transition-colors" title="More">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-bold text-admin-on-surface tracking-tight">User Management</h2>
          <p className="text-sm text-admin-on-surface-variant mt-1">View, manage, and configure users across the platform.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-admin-outline-variant text-admin-on-surface rounded-lg font-semibold shadow-sm hover:bg-admin-surface-container-low transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filters
          </button>
          <button className="px-4 py-2 bg-admin-primary text-admin-on-primary rounded-lg font-semibold shadow-md shadow-admin-primary/20 hover:bg-admin-primary-container transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>
      </div>

      <div className="bg-white border border-admin-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-admin-outline-variant flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md flex items-center gap-2 px-3 py-2 rounded-lg border border-admin-outline-variant/60 focus-within:border-admin-primary focus-within:ring-2 focus-within:ring-admin-primary/20 transition-all bg-admin-surface-container-lowest">
            <Search className="w-4 h-4 text-admin-on-surface-variant" />
            <input 
              type="text"
              placeholder="Search by name or email..."
              className="bg-transparent border-none outline-none text-sm w-full text-admin-on-surface"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-admin-on-surface-variant font-medium">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            3 users pending KYC approval
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-admin-on-surface-variant">
            <div className="w-8 h-8 border-4 border-admin-outline-variant border-t-admin-primary rounded-full animate-spin mb-4"></div>
            <p className="font-medium">Loading users...</p>
          </div>
        ) : (
          <DataTable columns={columns} data={filteredUsers} className="border-0 shadow-none rounded-none" />
        )}

        <div className="p-4 border-t border-admin-outline-variant flex items-center justify-between text-sm text-admin-on-surface-variant">
          <div>
            Showing <span className="font-semibold text-admin-on-surface">{filteredUsers.length}</span> of <span className="font-semibold text-admin-on-surface">{users.length}</span> results
          </div>
          <div className="flex gap-1">
            <button className="px-3 py-1 rounded-md border border-admin-outline-variant hover:bg-admin-surface-container disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 rounded-md border border-admin-outline-variant hover:bg-admin-surface-container text-admin-primary bg-admin-surface-container">1</button>
            <button className="px-3 py-1 rounded-md border border-admin-outline-variant hover:bg-admin-surface-container">2</button>
            <button className="px-3 py-1 rounded-md border border-admin-outline-variant hover:bg-admin-surface-container">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}