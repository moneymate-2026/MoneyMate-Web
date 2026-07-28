// Rich mock data and service methods for Admin Merchant Management

let mockMerchants = [
  {
    id: "MCH-1001",
    businessName: "Apex Innovations LLC",
    ownerName: "Abijith Kumar",
    email: "abijith@apex.com",
    phone: "+1 (555) 234-5678",
    category: "Retail",
    tier: "Premium",
    status: "Active",
    kycStatus: "Approved",
    qrCodeId: "QR-STORE-881",
    qrStatus: "Active",
    volume: "$24,496.25",
    volumeNum: 24496.25,
    cashbackIssued: "$1,246.72",
    registeredDate: "2026-05-10",
    address: "742 Evergreen Terrace, Suite 400, NY",
    kycDocs: {
      businessLicense: "LIC-882910-NY.pdf",
      taxId: "EIN-88-291039",
      bankAccount: "Chase ****4920",
      submittedDate: "2026-05-10"
    }
  },
  {
    id: "MCH-1002",
    businessName: "Brew & Bean Coffee Co.",
    ownerName: "Sarah Jenkins",
    email: "sarah@brewbean.com",
    phone: "+1 (555) 876-5432",
    category: "F&B",
    tier: "Enterprise",
    status: "Active",
    kycStatus: "Approved",
    qrCodeId: "QR-STORE-102",
    qrStatus: "Active",
    volume: "$68,120.50",
    volumeNum: 68120.50,
    cashbackIssued: "$3,406.00",
    registeredDate: "2026-04-15",
    address: "120 Madison Ave, Ground Floor, NY",
    kycDocs: {
      businessLicense: "LIC-441029-NY.pdf",
      taxId: "EIN-12-993821",
      bankAccount: "Citi ****8812",
      submittedDate: "2026-04-15"
    }
  },
  {
    id: "MCH-1003",
    businessName: "Gadget Galaxy Store",
    ownerName: "Mike Rossi",
    email: "mike@gadgetgalaxy.io",
    phone: "+1 (555) 345-6789",
    category: "Electronics",
    tier: "Premium",
    status: "Pending KYC",
    kycStatus: "Pending",
    qrCodeId: "QR-STORE-554",
    qrStatus: "Unverified",
    volume: "$4,250.00",
    volumeNum: 4250.00,
    cashbackIssued: "$212.50",
    registeredDate: "2026-07-25",
    address: "88 Market Street, Tech Hub, SF",
    kycDocs: {
      businessLicense: "LIC-PENDING-REV.pdf",
      taxId: "EIN-94-112039",
      bankAccount: "Wells Fargo ****1029",
      submittedDate: "2026-07-25"
    }
  },
  {
    id: "MCH-1004",
    businessName: "Luxe Glow Salon & Spa",
    ownerName: "Elena Rostova",
    email: "elena@luxeglow.com",
    phone: "+1 (555) 901-2345",
    category: "Services",
    tier: "Basic",
    status: "Active",
    kycStatus: "Approved",
    qrCodeId: "QR-STORE-309",
    qrStatus: "Active",
    volume: "$12,800.00",
    volumeNum: 12800.00,
    cashbackIssued: "$640.00",
    registeredDate: "2026-06-01",
    address: "450 Rodeo Drive, Unit 2B, LA",
    kycDocs: {
      businessLicense: "LIC-771823-CA.pdf",
      taxId: "EIN-33-401928",
      bankAccount: "BofA ****5590",
      submittedDate: "2026-06-01"
    }
  },
  {
    id: "MCH-1005",
    businessName: "Urban Streetwear Outlet",
    ownerName: "David Chen",
    email: "david@urbanout.co",
    phone: "+1 (555) 678-9012",
    category: "Retail",
    tier: "Basic",
    status: "Suspended",
    kycStatus: "Rejected",
    qrCodeId: "QR-STORE-990",
    qrStatus: "Disabled",
    volume: "$1,850.00",
    volumeNum: 1850.00,
    cashbackIssued: "$92.50",
    registeredDate: "2026-06-18",
    address: "330 Fashion Way, Brooklyn, NY",
    kycDocs: {
      businessLicense: "LIC-REJECTED.pdf",
      taxId: "EIN-11-293847",
      bankAccount: "Chase ****3321",
      submittedDate: "2026-06-18"
    }
  },
  {
    id: "MCH-1006",
    businessName: "Green Thumb Garden Nursery",
    ownerName: "Chloe Bennett",
    email: "chloe@greenthumb.net",
    phone: "+1 (555) 432-1098",
    category: "Retail",
    tier: "Premium",
    status: "Pending KYC",
    kycStatus: "Pending",
    qrCodeId: "QR-STORE-712",
    qrStatus: "Unverified",
    volume: "$0.00",
    volumeNum: 0.00,
    cashbackIssued: "$0.00",
    registeredDate: "2026-07-26",
    address: "99 Botanica Road, Austin, TX",
    kycDocs: {
      businessLicense: "LIC-TX-88219.pdf",
      taxId: "EIN-74-882910",
      bankAccount: "Frost Bank ****8821",
      submittedDate: "2026-07-26"
    }
  },
  {
    id: "MCH-1007",
    businessName: "Summit Fitness & CrossFit",
    ownerName: "Marcus Vance",
    email: "marcus@summitfit.org",
    phone: "+1 (555) 789-0123",
    category: "Services",
    tier: "Enterprise",
    status: "Active",
    kycStatus: "Approved",
    qrCodeId: "QR-STORE-441",
    qrStatus: "Active",
    volume: "$45,900.00",
    volumeNum: 45900.00,
    cashbackIssued: "$2,295.00",
    registeredDate: "2026-03-10",
    address: "500 Olympus Blvd, Denver, CO",
    kycDocs: {
      businessLicense: "LIC-CO-99102.pdf",
      taxId: "EIN-84-102938",
      bankAccount: "US Bank ****9901",
      submittedDate: "2026-03-10"
    }
  },
  {
    id: "MCH-1008",
    businessName: "Artisan Bakery & Pastry",
    ownerName: "Juliet Montero",
    email: "juliet@artisanbake.com",
    phone: "+1 (555) 210-9876",
    category: "F&B",
    tier: "Premium",
    status: "Active",
    kycStatus: "Approved",
    qrCodeId: "QR-STORE-662",
    qrStatus: "Active",
    volume: "$18,450.00",
    volumeNum: 18450.00,
    cashbackIssued: "$922.50",
    registeredDate: "2026-05-28",
    address: "14 Baker Lane, Seattle, WA",
    kycDocs: {
      businessLicense: "LIC-WA-55412.pdf",
      taxId: "EIN-91-882341",
      bankAccount: "KeyBank ****6642",
      submittedDate: "2026-05-28"
    }
  }
];

let mockCampaigns = [
  {
    id: "CMP-901",
    merchantId: "MCH-1001",
    merchantName: "Apex Innovations LLC",
    title: "Weekend Double Cashback",
    type: "2x Rewards Multiplier",
    status: "Active",
    scans: 480,
    cashbackSpent: "$432.00",
    startDate: "2026-07-01",
    endDate: "2026-07-31",
    budget: "$1,000.00"
  },
  {
    id: "CMP-902",
    merchantId: "MCH-1002",
    merchantName: "Brew & Bean Coffee Co.",
    title: "Morning Rush 5% Bonus",
    type: "Percentage Cashback",
    status: "Active",
    scans: 1250,
    cashbackSpent: "$1,875.00",
    startDate: "2026-06-15",
    endDate: "2026-08-15",
    budget: "$3,000.00"
  },
  {
    id: "CMP-903",
    merchantId: "MCH-1004",
    merchantName: "Luxe Glow Salon & Spa",
    title: "Summer Glow Package Discount",
    type: "Flat $10 Reward",
    status: "Active",
    scans: 85,
    cashbackSpent: "$850.00",
    startDate: "2026-07-10",
    endDate: "2026-08-01",
    budget: "$1,500.00"
  },
  {
    id: "CMP-904",
    merchantId: "MCH-1007",
    merchantName: "Summit Fitness & CrossFit",
    title: "New Member QR Check-in Reward",
    type: "Loyalty Stamp",
    status: "Paused",
    scans: 310,
    cashbackSpent: "$620.00",
    startDate: "2026-05-01",
    endDate: "2026-07-20",
    budget: "$1,000.00"
  },
  {
    id: "CMP-905",
    merchantId: "MCH-1005",
    merchantName: "Urban Streetwear Outlet",
    title: "Flash Clearance 10% Back",
    type: "Percentage Cashback",
    status: "Flagged",
    scans: 42,
    cashbackSpent: "$126.00",
    startDate: "2026-06-20",
    endDate: "2026-07-05",
    budget: "$500.00"
  }
];

let mockStoreQRs = [
  { qrId: "QR-STORE-881", storeName: "Apex Innovations LLC", terminalId: "TERM-NY-01", location: "New York, NY", status: "Online", dailyScans: 45, totalVolume: "$1,450.00", lastScan: "Today, 14:32 PM" },
  { qrId: "QR-STORE-102", storeName: "Brew & Bean Coffee Co.", terminalId: "TERM-NY-04", location: "New York, NY", status: "Online", dailyScans: 142, totalVolume: "$3,210.50", lastScan: "Today, 15:10 PM" },
  { qrId: "QR-STORE-554", storeName: "Gadget Galaxy Store", terminalId: "TERM-SF-02", location: "San Francisco, CA", status: "Offline", dailyScans: 0, totalVolume: "$0.00", lastScan: "Yesterday, 18:20 PM" },
  { qrId: "QR-STORE-309", storeName: "Luxe Glow Salon & Spa", terminalId: "TERM-LA-01", location: "Los Angeles, CA", status: "Online", dailyScans: 12, totalVolume: "$890.00", lastScan: "Today, 12:15 PM" },
  { qrId: "QR-STORE-990", storeName: "Urban Streetwear Outlet", terminalId: "TERM-NY-09", location: "Brooklyn, NY", status: "Disabled", dailyScans: 0, totalVolume: "$0.00", lastScan: "2026-06-25" },
  { qrId: "QR-STORE-712", storeName: "Green Thumb Garden Nursery", terminalId: "TERM-TX-01", location: "Austin, TX", status: "Unverified", dailyScans: 0, totalVolume: "$0.00", lastScan: "Never" },
  { qrId: "QR-STORE-441", storeName: "Summit Fitness & CrossFit", terminalId: "TERM-CO-01", location: "Denver, CO", status: "Online", dailyScans: 68, totalVolume: "$2,100.00", lastScan: "Today, 11:45 AM" },
  { qrId: "QR-STORE-662", storeName: "Artisan Bakery & Pastry", terminalId: "TERM-WA-02", location: "Seattle, WA", status: "Online", dailyScans: 54, totalVolume: "$1,120.00", lastScan: "Today, 13:50 PM" },
];

let mockPlans = [
  {
    id: "PLAN-BASIC",
    name: "Basic Plan",
    price: "$0 / mo",
    mrr: "$0",
    activeMerchants: 450,
    features: ["Up to 100 QR Scans/mo", "Standard 1% Cashback Pool", "Basic Dashboard Analytics", "Email Support"],
    color: "bg-slate-100 text-slate-800 border-slate-300"
  },
  {
    id: "PLAN-PREMIUM",
    name: "Premium Plan",
    price: "$29 / mo",
    mrr: "$21,170",
    activeMerchants: 730,
    features: ["Unlimited QR Scans", "Custom Multiplier Campaigns", "Real-time Earnings & Export", "Priority 24/7 Support", "Custom Store Branding"],
    color: "bg-amber-50 text-amber-900 border-amber-300 ring-2 ring-amber-400"
  },
  {
    id: "PLAN-ENTERPRISE",
    name: "Enterprise Tier",
    price: "$99 / mo",
    mrr: "$23,760",
    activeMerchants: 240,
    features: ["Multi-branch Terminal Management", "Dedicated API & ERP Integration", "Zero Transaction Fee Pool", "Dedicated Account Manager", "Custom RBAC Roles"],
    color: "bg-indigo-50 text-indigo-900 border-indigo-300"
  }
];

export const adminMerchantService = {
  getMerchants: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ 
          data: mockMerchants, 
          total: mockMerchants.length,
          stats: {
            totalMerchants: mockMerchants.length,
            activeStores: mockMerchants.filter(m => m.status === 'Active').length,
            pendingKyc: mockMerchants.filter(m => m.kycStatus === 'Pending').length,
            totalVolumeProcessed: "$175,916.75"
          }
        });
      }, 600);
    });
  },

  getMerchantById: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const merchant = mockMerchants.find(m => m.id === id);
        resolve({ data: merchant || null });
      }, 300);
    });
  },

  updateMerchantStatus: async (id, status) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockMerchants = mockMerchants.map(m => 
          m.id === id ? { ...m, status } : m
        );
        resolve({ success: true });
      }, 400);
    });
  },

  approveKYC: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockMerchants = mockMerchants.map(m => 
          m.id === id ? { ...m, kycStatus: "Approved", status: "Active", qrStatus: "Active" } : m
        );
        resolve({ success: true });
      }, 400);
    });
  },

  rejectKYC: async (id, reason = "Documentation incomplete") => {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockMerchants = mockMerchants.map(m => 
          m.id === id ? { ...m, kycStatus: "Rejected", status: "Suspended", qrStatus: "Disabled" } : m
        );
        resolve({ success: true });
      }, 400);
    });
  },

  updateSubscriptionTier: async (id, tier) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockMerchants = mockMerchants.map(m => 
          m.id === id ? { ...m, tier } : m
        );
        resolve({ success: true });
      }, 400);
    });
  },

  createMerchant: async (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newId = `MCH-${1001 + mockMerchants.length}`;
        const newMerchant = {
          id: newId,
          businessName: data.businessName || "New Merchant Store",
          ownerName: data.ownerName || "Unknown Owner",
          email: data.email || "store@example.com",
          phone: data.phone || "+1 (555) 000-0000",
          category: data.category || "Retail",
          tier: data.tier || "Basic",
          status: data.status || "Active",
          kycStatus: data.status === "Active" ? "Approved" : "Pending",
          qrCodeId: `QR-STORE-${Math.floor(100 + Math.random() * 900)}`,
          qrStatus: data.status === "Active" ? "Active" : "Unverified",
          volume: "$0.00",
          volumeNum: 0.00,
          cashbackIssued: "$0.00",
          registeredDate: new Date().toISOString().split('T')[0],
          address: data.address || "123 Business Blvd, City, ST",
          kycDocs: {
            businessLicense: "LIC-NEW-REG.pdf",
            taxId: "EIN-PENDING",
            bankAccount: "Bank ****0000",
            submittedDate: new Date().toISOString().split('T')[0]
          }
        };
        mockMerchants = [newMerchant, ...mockMerchants];
        resolve({ success: true, data: newMerchant });
      }, 450);
    });
  },

  updateMerchant: async (id, updatedData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockMerchants = mockMerchants.map(m => {
          if (m.id === id) {
            return {
              ...m,
              ...updatedData,
              kycStatus: updatedData.status === "Active" && m.kycStatus === "Pending" ? "Approved" : m.kycStatus
            };
          }
          return m;
        });
        const updated = mockMerchants.find(m => m.id === id);
        resolve({ success: true, data: updated });
      }, 400);
    });
  },

  deleteMerchant: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockMerchants = mockMerchants.filter(m => m.id !== id);
        resolve({ success: true });
      }, 400);
    });
  },

  getMerchantCampaigns: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: mockCampaigns });
      }, 500);
    });
  },

  updateCampaignStatus: async (campaignId, status) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockCampaigns = mockCampaigns.map(c => 
          c.id === campaignId ? { ...c, status } : c
        );
        resolve({ success: true });
      }, 300);
    });
  },

  getStoreQRs: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: mockStoreQRs });
      }, 500);
    });
  },

  updateQRStatus: async (qrId, status) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockStoreQRs = mockStoreQRs.map(q => 
          q.qrId === qrId ? { ...q, status } : q
        );
        resolve({ success: true });
      }, 300);
    });
  },

  getSubscriptionPlans: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: mockPlans });
      }, 400);
    });
  }
};
