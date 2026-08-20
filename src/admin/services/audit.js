import { gatewayClient } from "../../api/gatewayClient";

export const adminAuditService = {
  getAuditLogs: async () => {
    try {
      const response = await gatewayClient.get('/admin/audit');
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      return [];
    }
  },

  createAuditLog: async (logData) => {
    try {
      const response = await gatewayClient.post('/admin/audit', {
        admin_name: logData.admin_name || "System Admin",
        module: logData.module,
        action: logData.action
      });
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Error creating audit log:", error);
      return null;
    }
  }
};

