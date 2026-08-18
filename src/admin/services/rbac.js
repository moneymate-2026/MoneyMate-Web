import { gatewayClient } from "../../api/gatewayClient";

export const rbacService = {
  // --- Roles ---
  getRoles: async () => {
    try {
      const response = await gatewayClient.get('/admin/roles');
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error("Error fetching roles:", error);
      throw error;
    }
  },

  createRole: async (roleData) => {
    const response = await gatewayClient.post('/admin/roles', roleData);
    return response.data?.data || response.data;
  },

  updateRole: async (id, roleData) => {
    const response = await gatewayClient.put(`/admin/roles/${id}`, roleData);
    return response.data?.data || response.data;
  },

  deleteRole: async (id) => {
    const response = await gatewayClient.delete(`/admin/roles/${id}`);
    return response.data?.data || response.data;
  },

  // --- Permissions ---
  getPermissions: async () => {
    try {
      const response = await gatewayClient.get('/admin/permissions');
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error("Error fetching permissions:", error);
      throw error;
    }
  },

  createPermission: async (permissionData) => {
    const response = await gatewayClient.post('/admin/permissions', permissionData);
    return response.data?.data || response.data;
  },

  deletePermission: async (id) => {
    const response = await gatewayClient.delete(`/admin/permissions/${id}`);
    return response.data?.data || response.data;
  },

  // Assign a permission to a role
  assignPermissionToRole: async (roleId, permissionId) => {
    const response = await gatewayClient.post('/admin/permissions/assign', {
      role_id: roleId,
      permission_id: permissionId
    });
    return response.data?.data || response.data;
  },

  // Remove a permission from a role
  removePermissionFromRole: async (roleId, permissionId) => {
    const response = await gatewayClient.delete(`/admin/permissions/roles/${roleId}/permissions/${permissionId}`);
    return response.data?.data || response.data;
  },

  // Get permissions for a specific role
  getRolePermissions: async (roleId) => {
    try {
      const response = await gatewayClient.get(`/admin/permissions/roles/${roleId}`);
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error(`Error fetching permissions for role ${roleId}:`, error);
      throw error;
    }
  },

  // Create an Admin User with a specific role
  createAdminUser: async (userData) => {
    const response = await gatewayClient.post('/admin/staff', userData);
    return response.data?.data || response.data;
  },

  // Get all Admin/Staff Users
  getAdminUsers: async () => {
    try {
      const response = await gatewayClient.get('/admin/staff');
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error("Error fetching staff users:", error);
      throw error;
    }
  },

  // Update staff status
  updateAdminUserStatus: async (id, status) => {
    const response = await gatewayClient.patch(`/admin/staff/${id}/status`, { status });
    return response.data?.data || response.data;
  }
};
