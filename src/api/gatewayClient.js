// MoneyMate Gateway Client
// Handles backend connectivity to the Go gateway service with resilient mock fallbacks

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

// In-memory mock database that syncs with localStorage for persistence
const getMockDb = () => {
  const defaultDb = {
    profile: {
      businessName: 'Apex Innovations LLC',
      dbaName: 'Apex Tech',
      address: '123 Innovation Drive, Tech District, CA 90210',
      businessType: 'Limited Liability Company (LLC)',
      taxId: '123456789',
      ownerName: 'John Doe',
      email: 'owner@business.com',
      mobile: '(555) 123-4567',
      status: 'Verified',
    },
    campaigns: [
      { id: 'c1', name: 'Weekend Special', type: 'Double Cashback (4%)', value: '4', minPurchase: '10', audience: 'All Customers', status: 'Active' },
      { id: 'c2', name: 'Loyalty Tier 1', type: 'Flat Cashback Bonus ($2.00)', value: '2', minPurchase: '15', audience: 'VIP Members', status: 'Active' }
    ],
    transactions: [
      { time: "Today, 14:32 PM", customer: "John D.", initial: "JD", color: "bg-primary/20 text-primary", amount: "$45.00", reward: "$0.90", status: "Settled" },
      { time: "Today, 13:15 PM", customer: "Sarah W.", initial: "SW", color: "bg-secondary/20 text-secondary-container", amount: "$12.50", reward: "$0.25", status: "Settled" },
      { time: "Today, 11:05 AM", customer: "Mike R.", initial: "MR", color: "bg-error/20 text-error", amount: "$120.00", reward: "$2.40", status: "Settled" },
      { time: "Yesterday, 18:45 PM", customer: "Anna L.", initial: "AL", color: "bg-primary/20 text-primary", amount: "$8.75", reward: "$0.17", status: "Settled" }
    ],
    balance: 4250.00,
    merchantId: 'MM-9823-XA',
  };

  const stored = localStorage.getItem('moneymate_merchant_db');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Error parsing stored mock database, resetting...", e);
    }
  }
  localStorage.setItem('moneymate_merchant_db', JSON.stringify(defaultDb));
  return defaultDb;
};

const saveMockDb = (db) => {
  localStorage.setItem('moneymate_merchant_db', JSON.stringify(db));
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const handleRequest = async (url, options = {}) => {
  const token = localStorage.getItem('merchant_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const fullUrl = `${BASE_URL}${url}`;
  
  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    // Check if the response is successful and not a stub (like 501 Not Implemented)
    if (response.ok && response.status !== 501) {
      return await response.json();
    }
    
    // If backend returns a stub (e.g. 501) or other HTTP error, trigger the fallback
    const errorBody = await response.json().catch(() => ({}));
    const errorMessage = errorBody.error || `HTTP error ${response.status}`;
    console.warn(`[GatewayClient] Backend API returned status ${response.status} (${errorMessage}). Falling back to local mock handling.`);
    throw new Error(errorMessage);

  } catch (error) {
    // If it's a network error (server offline) or backend returned a stub, handle locally
    console.warn(`[GatewayClient] API connection failed for ${url}. Error: ${error.message}. Running in mock-fallback mode.`);
    return handleMockFallback(url, options);
  }
};

const handleMockFallback = async (url, options) => {
  await delay(800); // Simulate network latency

  const method = options.method || 'GET';
  const db = getMockDb();

  // Route mapping for fallbacks
  if (url === '/auth/login' && method === 'POST') {
    const { email } = JSON.parse(options.body || '{}');
    localStorage.setItem('merchant_token', 'mock_jwt_token_for_' + email);
    return {
      success: true,
      token: 'mock_jwt_token_for_' + email,
      user: {
        email,
        businessName: db.profile.businessName,
      }
    };
  }

  if (url === '/auth/register' && method === 'POST') {
    const data = JSON.parse(options.body || '{}');
    db.profile = {
      ...db.profile,
      businessName: data.businessName || db.profile.businessName,
      dbaName: data.dbaName || db.profile.dbaName,
      address: data.address || db.profile.address,
      businessType: data.businessType || db.profile.businessType,
      taxId: data.taxId || db.profile.taxId,
      ownerName: data.ownerName || db.profile.ownerName,
      email: data.email || db.profile.email,
      mobile: data.mobile || db.profile.mobile,
      status: 'Pending Review',
    };
    saveMockDb(db);
    localStorage.setItem('merchant_token', 'mock_jwt_token_for_' + (data.email || 'new_merchant'));
    return {
      success: true,
      message: 'Registration successful',
      token: 'mock_jwt_token_for_' + (data.email || 'new_merchant'),
    };
  }

  if (url === '/secure/profile') {
    if (method === 'GET') {
      return { success: true, data: db.profile };
    }
    if (method === 'PUT') {
      const data = JSON.parse(options.body || '{}');
      db.profile = { ...db.profile, ...data };
      saveMockDb(db);
      return { success: true, message: 'Profile updated successfully', data: db.profile };
    }
  }

  if (url === '/secure/dashboard' && method === 'GET') {
    return {
      success: true,
      data: {
        stats: [
          {
            title: "Total Rewards Issued",
            value: `$${(db.transactions.reduce((acc, tx) => acc + parseFloat(tx.reward.replace('$', '')), 0) + 1243).toFixed(2)}`,
            icon: "workspace_premium",
            iconColorClass: "text-primary bg-primary/10",
            borderClass: "border-l-primary",
            trend: { text: "+12% this week", type: "up" }
          },
          {
            title: "Total QR Scan Volume",
            value: `$${(db.transactions.reduce((acc, tx) => acc + parseFloat(tx.amount.replace('$', '')), 0) + 24310).toFixed(2)}`,
            icon: "payments",
            iconColorClass: "text-tertiary bg-tertiary/10",
            borderClass: "border-l-tertiary",
            trend: { text: "+8% vs last month", type: "up" }
          },
          {
            title: "Active Campaigns",
            value: `${db.campaigns.filter(c => c.status === 'Active').length} Active`,
            icon: "local_offer",
            iconColorClass: "text-secondary bg-secondary-fixed/35",
            borderClass: "border-l-secondary",
            trend: { text: "1 ending soon", type: "neutral" }
          },
          {
            title: "Customers Rewarded",
            value: `${db.transactions.length + 1146}`,
            icon: "person",
            iconColorClass: "text-outline bg-outline/10",
            borderClass: "border-l-outline",
            trend: { text: "+45 new today", type: "up" }
          }
        ],
        transactions: db.transactions,
        campaigns: db.campaigns,
        balance: db.balance,
        merchantId: db.merchantId,
      }
    };
  }

  if (url === '/secure/campaigns') {
    if (method === 'POST') {
      const campaignData = JSON.parse(options.body || '{}');
      const newCampaign = {
        id: 'c' + (db.campaigns.length + 1),
        name: campaignData.campaignName,
        type: campaignData.offerType,
        value: campaignData.rewardValue,
        minPurchase: campaignData.minPurchase,
        audience: campaignData.targetAudience,
        status: 'Active',
      };
      db.campaigns.unshift(newCampaign);
      saveMockDb(db);
      return { success: true, message: 'Campaign created successfully', data: newCampaign };
    }
    if (method === 'GET') {
      return { success: true, data: db.campaigns };
    }
  }

  if (url === '/secure/redeem' && method === 'POST') {
    db.balance = 0;
    saveMockDb(db);
    return { success: true, message: 'Redemption processed successfully' };
  }

  // General fallback for unmapped endpoints
  return { success: true, message: 'Mock data fallback response', data: {} };
};

export const gatewayClient = {
  // REST wrapper methods
  get: (url, options = {}) => handleRequest(url, { ...options, method: 'GET' }),
  post: (url, data, options = {}) => handleRequest(url, { ...options, method: 'POST', body: JSON.stringify(data) }),
  put: (url, data, options = {}) => handleRequest(url, { ...options, method: 'PUT', body: JSON.stringify(data) }),
  delete: (url, options = {}) => handleRequest(url, { ...options, method: 'DELETE' }),

  // Auth operations
  login: async (email, password) => {
    return handleRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (formData) => {
    return handleRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
  },

  // Token management
  logout: () => {
    localStorage.removeItem('merchant_token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('merchant_token');
  },

  // Secure API requests
  getProfile: () => {
    return handleRequest('/secure/profile', { method: 'GET' });
  },

  updateProfile: (profileData) => {
    return handleRequest('/secure/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  getDashboardData: () => {
    return handleRequest('/secure/dashboard', { method: 'GET' });
  },

  createCampaign: (campaignData) => {
    return handleRequest('/secure/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    });
  },

  redeemBalance: () => {
    return handleRequest('/secure/redeem', { method: 'POST' });
  }
};
