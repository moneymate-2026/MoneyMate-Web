import { useState, useEffect } from "react";
import { Shield, Plus, Settings, Users, LayoutDashboard, Store, Headset, ShieldAlert, Edit, Trash2, ArrowLeft, Search } from "lucide-react";
import { rbacService } from "../services/rbac";
import DataTable from "../components/DataTable";

const permissionDefinitions = [
  { 
    id: 'dashboard', 
    name: 'Data Analyst', 
    desc: 'Dashboard Area: View analytics, metrics, and system overview.',
    icon: LayoutDashboard,
    actions: ['read'] 
  },
  { 
    id: 'users', 
    name: 'HR & User Manager', 
    desc: 'Admin Area: Manage user accounts, admin roles, and KYC approvals.',
    icon: Users,
    actions: ['create', 'read', 'update', 'delete']
  },
  { 
    id: 'store', 
    name: 'Merchant Manager', 
    desc: 'Store Area: Manage merchant stores, QR directory, and promotional campaigns.',
    icon: Store,
    actions: ['create', 'read', 'update', 'delete']
  },
  { 
    id: 'support', 
    name: 'Customer Support Executive', 
    desc: 'Support Area: Handle user feedbacks, live chat support, and complaints resolution.',
    icon: Headset,
    actions: ['create', 'read', 'update', 'delete']
  },
  { 
    id: 'settings', 
    name: 'System Administrator', 
    desc: 'Settings Area: Manage global platform configurations, audit logs, and web config.',
    icon: Settings,
    actions: ['read', 'update']
  },
];

export default function RBAC() {
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'form'
  const [roles, setRoles] = useState([]);
  const [staff, setStaff] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    id: null,
    name: "",
    email: "",
    password: "",
    permissions: {}
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const fetchedRoles = await rbacService.getRoles();
      const fetchedPerms = await rbacService.getPermissions();
      setAllPermissions(fetchedPerms || []);
      
      const rolesWithPerms = await Promise.all((fetchedRoles || []).map(async (role) => {
        try {
          const perms = await rbacService.getRolePermissions(role.id);
          const uiPermissions = {};
          (perms || []).forEach(p => {
            const [mod, action] = p.name.split('.');
            if (mod && action) {
              if (!uiPermissions[mod]) uiPermissions[mod] = [];
              uiPermissions[mod].push(action);
            }
          });
          return { ...role, permissions: uiPermissions, isSystem: role.name.toLowerCase() === 'admin' };
        } catch (e) {
          console.error(`Failed to fetch perms for ${role.id}`, e);
          return { ...role, permissions: {}, isSystem: role.name.toLowerCase() === 'admin' };
        }
      }));
      
      setRoles(rolesWithPerms);

      // Fetch Staff Users and merge with their role data
      try {
        const fetchedStaff = await rbacService.getAdminUsers();
        const staffList = fetchedStaff.users || fetchedStaff || [];
        const staffWithRoles = staffList.map(s => {
          const roleData = rolesWithPerms.find(r => r.name === s.role) || { 
            id: null, name: s.role, isSystem: s.role?.toLowerCase() === 'admin', permissions: {} 
          };
          return { ...s, roleData };
        });
        setStaff(staffWithRoles);
      } catch (err) {
        console.error("Failed to fetch staff users", err);
      }
    } catch (error) {
      console.error("Failed to fetch roles/permissions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenForm = (staffMember = null) => {
    if (staffMember && staffMember.roleData && staffMember.roleData.id) {
      const role = staffMember.roleData;
      setFormData({
        id: role.id,
        name: role.name,
        email: staffMember.email,
        password: "",
        permissions: JSON.parse(JSON.stringify(role.permissions)) // Deep copy
      });
    } else {
      const initialPermissions = {};
      permissionDefinitions.forEach(perm => {
        initialPermissions[perm.id] = [];
      });
      setFormData({
        id: null,
        name: "",
        email: "",
        password: "",
        permissions: initialPermissions
      });
    }
    setViewMode('form');
  };

  const handleToggleFormPermission = (permId, action) => {
    const isSystem = roles.find(r => r.id === formData.id)?.isSystem;
    if (isSystem) return;

    setFormData(prev => {
      const modPerms = prev.permissions[permId] || [];
      const hasPerm = modPerms.includes(action);
      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [permId]: hasPerm ? modPerms.filter(a => a !== action) : [...modPerms, action]
        }
      };
    });
  };

  const handleFormSave = async (e) => {
    e.preventDefault();
    if (processing) return;
    setProcessing(true);

    try {
      let roleId = formData.id;
      const isNewRole = !roleId;
      
      const finalRoleName = isNewRole ? (`Admin Role - ${formData.email.split('@')[0]}_${Math.random().toString(36).substr(2, 4)}`) : formData.name;

      // 1. Create or Update Role
      if (isNewRole) {
        const createdRole = await rbacService.createRole({ name: finalRoleName });
        roleId = createdRole.id;
      } else {
        const existingRole = roles.find(r => r.id === roleId);
        if (existingRole && existingRole.name !== finalRoleName) {
          await rbacService.updateRole(roleId, { name: finalRoleName });
        }
      }

      const existingRole = roles.find(r => r.id === roleId) || { permissions: {} };

      // 2. Diff and Sync Permissions
      for (const permDef of permissionDefinitions) {
        const permId = permDef.id;
        const currentActions = formData.permissions[permId] || [];
        const prevActions = existingRole.permissions[permId] || [];

        for (const action of permDef.actions) {
          const nowHas = currentActions.includes(action);
          const prevHad = prevActions.includes(action);
          
          if (nowHas !== prevHad) {
            const permName = `${permId}.${action}`;
            const targetPerm = allPermissions.find(p => p.name === permName);
            
            if (targetPerm) {
              if (nowHas) {
                await rbacService.assignPermissionToRole(roleId, targetPerm.id);
              } else {
                await rbacService.removePermissionFromRole(roleId, targetPerm.id);
              }
            } else {
              console.warn(`Permission ${permName} not found in system.`);
            }
          }
        }
      }

      // 3. Create Admin User if new role and credentials provided
      if (isNewRole && formData.email && formData.password) {
        try {
          await rbacService.createAdminUser({
            email: formData.email,
            password: formData.password,
            full_name: finalRoleName, // use role name as the user's name for simplicity
            role: finalRoleName // the name of the role we just created
          });
        } catch (err) {
          console.error("Failed to create admin credentials", err);
          alert("Role was created, but failed to create the admin login. Email may already be in use.");
        }
      }

      await fetchData();
      setViewMode('list');
    } catch (error) {
      console.error("Failed to save role", error);
      alert("Failed to save role configuration. It may already exist.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteRole = async (id) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;
    try {
      await rbacService.deleteRole(id);
      await fetchData();
    } catch (error) {
      console.error("Failed to delete role", error);
      alert("Failed to delete role. It might be assigned to users or protected.");
    }
  };

  const filteredStaff = staff.filter(s => 
    (s.email && s.email.toLowerCase().includes(search.toLowerCase())) || 
    (s.roleData && s.roleData.name.toLowerCase().includes(search.toLowerCase()))
  );

  const columns = [
    {
      header: "Admin Email",
      accessor: "email",
      render: (row) => (
        <div className="font-semibold text-admin-on-surface">{row.email}</div>
      )
    },
    {
      header: "Access Configuration",
      accessor: "role",
      render: (row) => {
        const isSystem = row.roleData?.isSystem;
        return (
          <div className="flex items-center gap-2">
            <div className="text-admin-on-surface-variant text-sm">
              {isSystem ? "System Default Administrator" : "Custom Sub-Admin"}
            </div>
            {isSystem && (
              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded text-[10px] font-bold uppercase tracking-wide">
                Protected
              </span>
            )}
          </div>
        )
      }
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${row.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
          {row.status || 'Active'}
        </span>
      )
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleOpenForm(row)}
            className="px-2.5 py-1.5 text-[13px] font-medium rounded-lg text-admin-on-surface-variant hover:text-admin-on-surface hover:bg-admin-surface-container-high transition-colors flex items-center gap-1.5"
          >
            <Edit className="w-3.5 h-3.5" />
            {row.roleData?.isSystem ? 'View' : 'Edit Access'}
          </button>
          {!row.roleData?.isSystem && (
            <button 
              onClick={() => handleDeleteRole(row.roleData?.id)}
              className="px-2.5 py-1.5 text-[13px] font-medium rounded-lg text-admin-on-surface-variant hover:text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove
            </button>
          )}
        </div>
      )
    }
  ];

  if (viewMode === 'list') {
    return (
      <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-[24px] font-bold text-admin-on-surface tracking-tight flex items-center gap-2">
              <Shield className="w-6 h-6 text-admin-primary" />
              Role-Based Access Control
            </h2>
          </div>
          <button 
            onClick={() => handleOpenForm()}
            className="px-4 py-2 bg-admin-primary text-admin-on-primary rounded-lg font-semibold shadow-md shadow-admin-primary/20 hover:bg-admin-primary-container transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Sub-Admin
          </button>
        </div>

        <div className="bg-admin-surface-container border border-admin-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-admin-outline-variant flex items-center justify-between gap-4 bg-admin-surface-container-lowest">
            <div className="flex-1 max-w-md flex items-center gap-2 px-3 py-2 rounded-lg border border-admin-outline-variant/60 focus-within:border-admin-primary focus-within:ring-2 focus-within:ring-admin-primary/20 transition-all bg-admin-surface-container">
              <Search className="w-4 h-4 text-admin-on-surface-variant" />
              <input 
                type="text"
                placeholder="Search sub-admins..."
                className="bg-transparent border-none outline-none text-sm w-full text-admin-on-surface"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="text-sm text-admin-on-surface-variant font-medium">
              Total Sub-Admins: <span className="text-admin-on-surface">{filteredStaff.length}</span>
            </div>
          </div>

          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center text-admin-on-surface-variant">
              <div className="w-8 h-8 border-4 border-admin-outline-variant border-t-admin-primary rounded-full animate-spin mb-4"></div>
              <p className="font-medium">Loading data...</p>
            </div>
          ) : (
            <DataTable columns={columns} data={filteredStaff} className="border-0 shadow-none rounded-none" emptyMessage="No sub-admins configured yet." />
          )}
        </div>
      </div>
    );
  }

  // Form View (Create/Edit)
  const isSystemRole = roles.find(r => r.id === formData.id)?.isSystem;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-8 duration-300">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setViewMode('list')}
          disabled={processing}
          className="p-2 bg-admin-surface-container border border-admin-outline-variant rounded-xl text-admin-on-surface-variant hover:text-admin-on-surface hover:bg-admin-surface-container-high transition-all disabled:opacity-50"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-[24px] font-bold text-admin-on-surface tracking-tight">
            {formData.id ? (isSystemRole ? 'View System Role' : 'Edit Role') : 'Create New Role'}
          </h2>
        </div>
      </div>

      <form onSubmit={handleFormSave} className="bg-admin-surface-container border border-admin-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-admin-outline-variant">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {!formData.id ? (
              <>
                <div>
                  <label className="block text-sm font-semibold text-admin-on-surface mb-2">Admin Login Email</label>
                  <input 
                    type="email" 
                    required={!formData.id}
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    disabled={processing}
                    className="w-full px-4 py-2.5 bg-admin-surface-container-lowest border border-admin-outline-variant rounded-lg text-admin-on-surface focus:ring-2 focus:ring-admin-primary/40 focus:border-admin-primary outline-none transition-all disabled:opacity-50"
                    placeholder="admin@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-admin-on-surface mb-2">Admin Login Password</label>
                  <input 
                    type="password" 
                    required={!formData.id}
                    minLength={8}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    disabled={processing}
                    className="w-full px-4 py-2.5 bg-admin-surface-container-lowest border border-admin-outline-variant rounded-lg text-admin-on-surface focus:ring-2 focus:ring-admin-primary/40 focus:border-admin-primary outline-none transition-all disabled:opacity-50"
                    placeholder="••••••••"
                  />
                  <p className="text-xs text-admin-on-surface-variant mt-1">Min. 8 characters</p>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-admin-on-surface mb-2">Role Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  disabled
                  className="w-full px-4 py-2.5 bg-admin-surface-container-lowest border border-admin-outline-variant rounded-lg text-admin-on-surface focus:ring-2 focus:ring-admin-primary/40 focus:border-admin-primary outline-none transition-all disabled:opacity-50"
                />
                {isSystemRole && (
                  <p className="text-xs text-amber-500 mt-2 flex items-center gap-1 font-medium">
                    <ShieldAlert className="w-3.5 h-3.5" /> System roles cannot be renamed.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 bg-admin-surface-container-lowest">
          <h4 className="text-sm font-bold text-admin-on-surface-variant uppercase tracking-wider mb-6">
            Module CRUD Permissions
          </h4>
          
          <div className="space-y-4">
            {permissionDefinitions.map((perm) => {
              const activePerms = formData.permissions[perm.id] || [];
              const Icon = perm.icon;
              return (
                <div 
                  key={perm.id} 
                  className={`p-5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${
                    activePerms.length > 0 
                      ? "bg-admin-primary/5 border-admin-primary/30" 
                      : "bg-admin-surface-container border-admin-outline-variant/60"
                  }`}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-2.5 rounded-lg ${activePerms.length > 0 ? "bg-admin-primary/20 text-admin-primary" : "bg-admin-surface-container-high text-admin-on-surface-variant"}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className={`font-semibold ${activePerms.length > 0 ? "text-admin-on-surface" : "text-admin-on-surface-variant"}`}>
                        {perm.name}
                      </h5>
                      <p className="text-sm text-admin-on-surface-variant mt-0.5">
                        {perm.desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 pl-14 md:pl-0 flex-wrap">
                    {perm.actions.map(action => {
                      const isGranted = activePerms.includes(action);
                      const getActionColor = () => {
                        switch(action) {
                          case 'create': return 'bg-green-500';
                          case 'read': return 'bg-blue-500';
                          case 'update': return 'bg-amber-500';
                          case 'delete': return 'bg-red-500';
                          default: return 'bg-admin-primary';
                        }
                      };

                      return (
                        <div key={action} className="flex items-center gap-2">
                          <span className={`text-[11px] font-bold uppercase tracking-wider ${isGranted ? 'text-admin-on-surface' : 'text-admin-on-surface-variant'}`}>
                            {action}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleFormPermission(perm.id, action)}
                            disabled={processing}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                              isGranted ? getActionColor() : 'bg-admin-surface-container-highest border border-admin-outline-variant/50'
                            } disabled:opacity-50`}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm`}
                              style={{ transform: isGranted ? 'translateX(18px)' : 'translateX(4px)' }}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 border-t border-admin-outline-variant bg-admin-surface-container flex gap-3">
          {!isSystemRole && (
            <button 
              type="submit"
              disabled={processing}
              className="px-6 py-2.5 bg-admin-primary text-admin-on-primary rounded-lg font-semibold shadow-md hover:bg-admin-primary-container transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {processing ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : null}
              {formData.id ? 'Save Changes' : 'Create Role & Assign Permissions'}
            </button>
          )}
          <button 
            type="button"
            onClick={() => setViewMode('list')}
            disabled={processing}
            className="px-6 py-2.5 bg-transparent border border-admin-outline-variant text-admin-on-surface rounded-lg font-medium hover:bg-admin-surface-container-high transition-all disabled:opacity-50"
          >
            {isSystemRole ? 'Go Back' : 'Cancel'}
          </button>
        </div>
      </form>
    </div>
  );
}