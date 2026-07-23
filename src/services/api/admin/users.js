// Mock data to simulate backend response
const mockUsers = [
  { id: "USR-001", name: "Alice Smith", email: "alice@example.com", role: "Customer", status: "Active", joined: "2025-01-15" },
  { id: "USR-002", name: "Bob Jones", email: "bob@example.com", role: "Merchant", status: "Active", joined: "2025-02-20" },
  { id: "USR-003", name: "Charlie Davis", email: "charlie@example.com", role: "Customer", status: "Suspended", joined: "2025-03-10" },
  { id: "USR-004", name: "Diana Evans", email: "diana@example.com", role: "Admin", status: "Active", joined: "2024-11-05" },
  { id: "USR-005", name: "Ethan Hall", email: "ethan@example.com", role: "Customer", status: "Pending KYC", joined: "2025-04-22" },
];

export const adminUserService = {
  getUsers: async () => {
    // Simulate network latency
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: mockUsers, total: mockUsers.length });
      }, 800);
    });
  },
  
  deleteUser: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 500);
    });
  },

  updateUserStatus: async (id, status) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 500);
    });
  }
};
