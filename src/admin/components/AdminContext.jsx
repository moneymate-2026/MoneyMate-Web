import React, { createContext, useContext, useState, useEffect } from 'react';
import { rbacService } from '../services/rbac';
import { useNavigate } from 'react-router-dom';

const AdminContext = createContext(null);

export const useAdmin = () => useContext(AdminContext);

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export const AdminProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]); // Array of strings like "users.read"
  const [roleName, setRoleName] = useState(null);
  const [isSystemAdmin, setIsSystemAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const decoded = parseJwt(token);
      let userRoleName = null;
      
      // Attempt to get role from JWT claims
      if (decoded && decoded.roles && decoded.roles.length > 0) {
        userRoleName = decoded.roles[0];
      } else if (decoded && decoded.handle) {
        userRoleName = decoded.handle;
      }

      // If user is the master admin
      if (userRoleName === 'admin' || userRoleName === 'System Administrator') {
        setRoleName('admin');
        setIsSystemAdmin(true);
        setLoading(false);
        return;
      }

      if (!userRoleName) {
        setLoading(false);
        return;
      }

      setRoleName(userRoleName);

      try {
        // Fetch all roles to find the ID of the user's role
        const allRoles = await rbacService.getRoles();
        const userRole = allRoles.find(r => r.name === userRoleName || r.id === userRoleName);

        if (userRole) {
          if (userRole.isSystem) {
            setIsSystemAdmin(true);
          } else {
            // Fetch permissions for this role
            const rolePerms = await rbacService.getRolePermissions(userRole.id);
            setPermissions(rolePerms.map(p => p.name));
          }
        }
      } catch (err) {
        console.error("Failed to fetch permissions:", err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const hasPermission = (module, action) => {
    if (isSystemAdmin) return true;
    return permissions.includes(`${module}.${action}`);
  };

  const hasAnyPermission = (module) => {
    if (isSystemAdmin) return true;
    return permissions.some(p => p.startsWith(`${module}.`));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-admin-background text-admin-on-surface">
        <div className="w-8 h-8 border-4 border-admin-outline-variant border-t-admin-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AdminContext.Provider value={{ permissions, roleName, isSystemAdmin, hasPermission, hasAnyPermission }}>
      {children}
    </AdminContext.Provider>
  );
};
