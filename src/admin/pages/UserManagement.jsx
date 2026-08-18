import { useState, useEffect } from "react";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { adminUserService } from "../services/users";
import { Search, Plus, Filter, MoreVertical, ShieldAlert, CheckCircle2, Ban, Trash2, Edit, X } from "lucide-react";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [modalData, setModalData] = useState({ id: '', email: '', phone: '', full_name: '', password: '', role: 'user', pin: '' });
  const [modalLoading, setModalLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

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

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    if (!window.confirm(`Are you sure you want to ${newStatus.toLowerCase()} this user?`)) return;
    
    setActionLoading(id);
    try {
      await adminUserService.updateUserStatus(id, newStatus.toLowerCase());
      // Refresh local state without full reload
      setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
      showToast(`User status updated to ${newStatus}`, "success");
    } catch (error) {
      console.error(`Failed to update status for user ${id}`, error);
      showToast('Failed to update user status.', "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    
    setActionLoading(id);
    try {
      await adminUserService.deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
      showToast('User deleted successfully', "success");
    } catch (error) {
      console.error(`Failed to delete user ${id}`, error);
      showToast('Failed to delete user.', "error");
    } finally {
      setActionLoading(null);
    }
  };

  const openModal = (mode, user = null) => {
    setModalMode(mode);
    if (mode === 'edit' && user) {
      setModalData({
        id: user.id,
        email: user.email || '',
        phone: user.phone || '',
        full_name: user.name || '',
        password: '', // Empty password for edit
        role: user.role?.toLowerCase() || 'user',
        pin: ''
      });
    } else {
      setModalData({ id: '', email: '', phone: '', full_name: '', password: '', role: 'user', pin: '' });
    }
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      if (modalMode === 'create') {
        await adminUserService.createUser(modalData);
      } else {
        await adminUserService.updateUser(modalData.id, modalData);
      }
      setIsModalOpen(false);
      showToast(modalMode === 'create' ? 'User created successfully' : 'User updated successfully', "success");
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error(`Failed to ${modalMode} user`, error);
      showToast(`Failed to ${modalMode} user: ${error.message || 'Please try again.'}`, "error");
    } finally {
      setModalLoading(false);
    }
  };

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
          {actionLoading === row.id ? (
            <div className="w-4 h-4 border-2 border-admin-outline-variant border-t-admin-primary rounded-full animate-spin ml-4"></div>
          ) : (
            <div className="flex items-center gap-1">
              {row.status !== "Active" && (
                <button 
                  onClick={() => handleStatusChange(row.id, 'Active')}
                  className="px-2.5 py-1.5 text-[13px] font-medium rounded-lg text-admin-on-surface-variant hover:text-green-500 hover:bg-green-500/10 transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Activate
                </button>
              )}
              {row.status !== "Suspended" && (
                <button 
                  onClick={() => handleStatusChange(row.id, 'Suspended')}
                  className="px-2.5 py-1.5 text-[13px] font-medium rounded-lg text-admin-on-surface-variant hover:text-amber-500 hover:bg-amber-500/10 transition-colors flex items-center gap-1.5"
                >
                  <Ban className="w-3.5 h-3.5" />
                  Suspend
                </button>
              )}
              <button 
                onClick={() => openModal('edit', row)}
                className="px-2.5 py-1.5 text-[13px] font-medium rounded-lg text-admin-on-surface-variant hover:text-admin-on-surface hover:bg-admin-surface-container-high transition-colors flex items-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit
              </button>
              <button 
                onClick={() => handleDelete(row.id)}
                className="px-2.5 py-1.5 text-[13px] font-medium rounded-lg text-admin-on-surface-variant hover:text-admin-error hover:bg-admin-error/10 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-bold text-admin-on-surface tracking-tight">User Management</h2>

        </div>
        
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-admin-surface-container border border-admin-outline-variant text-admin-on-surface rounded-lg font-semibold shadow-sm hover:bg-admin-surface-container-low transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filters
          </button>
          <button 
            onClick={() => openModal('create')}
            className="px-4 py-2 bg-admin-primary text-admin-on-primary rounded-lg font-semibold shadow-md shadow-admin-primary/20 hover:bg-admin-primary-container transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>
      </div>

      <div className="bg-admin-surface-container border border-admin-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-admin-surface-container rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-admin-outline-variant">
              <h3 className="text-xl font-bold text-admin-on-surface tracking-tight">
                {modalMode === 'create' ? 'Add New User' : 'Edit User'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-admin-on-surface-variant hover:text-admin-on-surface transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleModalSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-admin-on-surface mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={modalData.full_name}
                  onChange={(e) => setModalData({...modalData, full_name: e.target.value})}
                  className="w-full px-3 py-2 bg-admin-surface-container-lowest border border-admin-outline-variant rounded-lg text-admin-on-surface focus:ring-2 focus:ring-admin-primary/40 focus:border-admin-primary outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-admin-on-surface mb-1">Email</label>
                <input 
                  type="email" 
                  required
                  value={modalData.email}
                  onChange={(e) => setModalData({...modalData, email: e.target.value})}
                  className="w-full px-3 py-2 bg-admin-surface-container-lowest border border-admin-outline-variant rounded-lg text-admin-on-surface focus:ring-2 focus:ring-admin-primary/40 focus:border-admin-primary outline-none transition-all"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-admin-on-surface mb-1">Phone Number (Optional)</label>
                <input 
                  type="tel" 
                  value={modalData.phone}
                  onChange={(e) => setModalData({...modalData, phone: e.target.value})}
                  className="w-full px-3 py-2 bg-admin-surface-container-lowest border border-admin-outline-variant rounded-lg text-admin-on-surface focus:ring-2 focus:ring-admin-primary/40 focus:border-admin-primary outline-none transition-all"
                  placeholder="+1234567890"
                />
              </div>

              {modalMode === 'create' && (
                <div>
                  <label className="block text-sm font-semibold text-admin-on-surface mb-1">Role</label>
                  <select 
                    value={modalData.role}
                    onChange={(e) => setModalData({...modalData, role: e.target.value})}
                    className="w-full px-3 py-2 bg-admin-surface-container-lowest border border-admin-outline-variant rounded-lg text-admin-on-surface focus:ring-2 focus:ring-admin-primary/40 focus:border-admin-primary outline-none transition-all"
                  >
                    <option value="user">User</option>
                    <option value="merchant">Merchant</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-admin-on-surface mb-1">
                  {modalMode === 'create' ? 'Password' : 'New Password (Leave blank to keep current)'}
                </label>
                <input 
                  type="password" 
                  required={modalMode === 'create'}
                  value={modalData.password}
                  onChange={(e) => setModalData({...modalData, password: e.target.value})}
                  className="w-full px-3 py-2 bg-admin-surface-container-lowest border border-admin-outline-variant rounded-lg text-admin-on-surface focus:ring-2 focus:ring-admin-primary/40 focus:border-admin-primary outline-none transition-all"
                  placeholder={modalMode === 'create' ? "••••••••" : "Leave blank to keep unchanged"}
                  minLength={8}
                />
              </div>

              {modalMode === 'create' && (
                <div>
                  <label className="block text-sm font-semibold text-admin-on-surface mb-1">PIN (6 digits)</label>
                  <input 
                    type="text" 
                    required={modalMode === 'create'}
                    value={modalData.pin}
                    onChange={(e) => setModalData({...modalData, pin: e.target.value.replace(/\D/g, '').slice(0, 6)})}
                    className="w-full px-3 py-2 bg-admin-surface-container-lowest border border-admin-outline-variant rounded-lg text-admin-on-surface focus:ring-2 focus:ring-admin-primary/40 focus:border-admin-primary outline-none transition-all"
                    placeholder="123456"
                    minLength={6}
                    maxLength={6}
                    pattern="\d{6}"
                  />
                </div>
              )}
              
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-transparent text-admin-on-surface-variant hover:text-admin-on-surface transition-colors font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={modalLoading}
                  className="px-6 py-2 bg-admin-primary text-admin-on-primary rounded-lg font-semibold shadow-md shadow-admin-primary/20 hover:bg-admin-primary-container transition-all flex items-center justify-center min-w-[120px] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {modalLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    modalMode === 'create' ? 'Create User' : 'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-xl border flex items-center gap-3 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300 ${
          toast.type === "error" ? "bg-red-600 text-white border-red-700" : "bg-green-600 text-white border-green-700"
        }`}>
          <span className="font-semibold text-sm">{toast.message}</span>
        </div>
      )}
    </div>
  );
}