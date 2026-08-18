import { gatewayClient } from "../../api/gatewayClient";

export const adminUserService = {
  getUsers: async () => {
    try {
      const response = await gatewayClient.get('/admin/users');
      const dataPayload = response.data?.data || response.data || {};
      const userList = dataPayload.users || [];
      
      const formattedUsers = userList.map(u => ({
        ...u,
        name: u.full_name || u.name || "Unknown",
        role: u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1).toLowerCase() : "User",
        status: u.status ? u.status.charAt(0).toUpperCase() + u.status.slice(1).toLowerCase() : "Unknown",
        joined: new Date(u.created_at).toLocaleDateString()
      }));

      return { data: formattedUsers, total: dataPayload.total_count || formattedUsers.length };
    } catch (error) {
      console.error("Error fetching admin users:", error);
      throw error;
    }
  },
  
  deleteUser: async (id) => {
    return gatewayClient.delete(`/admin/users/${id}`);
  },

  updateUserStatus: async (id, status) => {
    return gatewayClient.patch(`/admin/users/${id}/status`, { status });
  },

  createUser: async (userData) => {
    return gatewayClient.post('/admin/users', {
      email: userData.email,
      phone: userData.phone || undefined,
      full_name: userData.full_name,
      password: userData.password,
      role: userData.role,
      pin: userData.pin
    });
  },

  updateUser: async (id, userData) => {
    const payload = {};
    if (userData.full_name) payload.full_name = userData.full_name;
    if (userData.email) payload.email = userData.email;
    if (userData.phone) payload.phone = userData.phone;
    if (userData.password) payload.password = userData.password;
    
    return gatewayClient.put(`/admin/users/${id}`, payload);
  }
};
