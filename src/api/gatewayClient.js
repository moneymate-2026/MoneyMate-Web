// MoneyMate Gateway Client
// Handles backend connectivity to the Go merchant service on Render

const BASE_URL = import.meta.env.VITE_API_URL || 'https://money-mate.duckdns.org/api/v1';
const ADMIN_BASE_URL = import.meta.env.VITE_ADMIN_API_URL || 'https://money-mate.duckdns.org/api/v1';

// Helper to simulate an Auth Service UUID generation
const getOwnerId = (email) => {
  const key = `merchant_owner_uuid_${email}`;
  let uuid = localStorage.getItem(key);
  if (!uuid) {
    uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    localStorage.setItem(key, uuid);
  }
  return uuid;
};

const handleRequest = async (url, options = {}) => {
  const token = localStorage.getItem('merchant_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const isRouteAdmin = url.startsWith('/admin') || url.startsWith('/auth');
  const activeBaseUrl = isRouteAdmin ? ADMIN_BASE_URL : BASE_URL;
  const fullUrl = `${activeBaseUrl}${url}`;
  
  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, data };
    }
    
    let errorMessage = `HTTP error ${response.status}`;
    try {
      const errorBody = await response.json();
      errorMessage = errorBody.error || errorBody.message || errorMessage;
      
      // Sanitize raw Go backend errors for the frontend UI
      if (typeof errorMessage === 'string') {
        if (errorMessage.includes('sql: no rows')) {
          errorMessage = 'Requested data not found or invalid credentials.';
        } else if (errorMessage.includes('duplicate key') || errorMessage.includes('unique constraint')) {
          errorMessage = 'This record (e.g., email or phone) already exists.';
        } else if (errorMessage.includes('connection refused')) {
          errorMessage = 'Unable to connect to the server. Please try again later.';
        } else if (errorMessage.includes('invalid UUID') || errorMessage.includes('uuid: incorrect format')) {
          errorMessage = 'Invalid data ID format.';
        } else if (errorMessage.includes('token') && (errorMessage.includes('invalid') || errorMessage.includes('expired'))) {
          errorMessage = 'Your session has expired or is invalid. Please log in again.';
        } else if (errorMessage.includes('bcrypt:')) {
          errorMessage = 'Invalid password verification.';
        } else if (errorMessage.toLowerCase().includes('invalid credentials') || errorMessage.toLowerCase().includes('unauthorized')) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else {
          // Catch-all: Never expose raw unhandled Go errors (like "pq: ...") directly to the UI
          errorMessage = 'An unexpected server error occurred. Please try again or contact support.';
        }
      }
    } catch (e) {
      // ignore JSON parse error
    }
    
    throw new Error(errorMessage);
  } catch (error) {
    // Suppress console errors per user request to keep console clean
    throw error;
  }
};

export const gatewayClient = {
  // REST wrapper methods
  get: (url, options = {}) => handleRequest(url, { ...options, method: 'GET' }),
  post: (url, data, options = {}) => handleRequest(url, { ...options, method: 'POST', body: JSON.stringify(data) }),
  put: (url, data, options = {}) => handleRequest(url, { ...options, method: 'PUT', body: JSON.stringify(data) }),
  patch: (url, data, options = {}) => handleRequest(url, { ...options, method: 'PATCH', body: JSON.stringify(data) }),
  delete: (url, options = {}) => handleRequest(url, { ...options, method: 'DELETE' }),

  // Auth operations
  login: async (email, password) => {
    const response = await handleRequest('/merchant/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    const storeData = response.data;
    
    if (response.success && response.data) {
      localStorage.setItem('merchant_token', response.data.token);
      localStorage.setItem('merchant_store_id', response.data.store_id);
      localStorage.setItem('merchant_data', JSON.stringify(response.data));
    }
    
    return {
      success: true,
      token: storeData.token,
      user: { email, storeId: storeData.store_id || storeData.StoreID }
    };
  },

  register: async (formData) => {
    const ownerId = getOwnerId(formData.email);
    // Map frontend form data to backend DTO
    const payload = {
      owner_id: ownerId, // must be a valid UUID
      owner_name: formData.ownerName,
      contact_email: formData.email,
      mobile_number: formData.mobile,
      legal_name: formData.businessName,
      dba_name: formData.dbaName,
      business_type: formData.businessType,
      tax_id: formData.taxId,
      registered_address: formData.address,
      aadhaar_number: formData.aadharNumber,
      aadhaar_doc_url: formData.aadharFileBase64 || "https://example.com/aadhaar.pdf",
      shop_license_url: formData.shopLicenseFileBase64 || "https://example.com/license.pdf",
      password: formData.password,
      confirm_password: formData.confirmPassword
    };

    const response = await handleRequest('/merchant/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    
    if (response.success && response.data) {
      localStorage.setItem('merchant_token', response.data.token);
      localStorage.setItem('merchant_store_id', response.data.store_id);
      localStorage.setItem('merchant_data', JSON.stringify(response.data));
    }
    
    // Store unique IDs and QR code generated by the backend
    if (response.data.display_id) localStorage.setItem('merchant_display_id', response.data.display_id);
    if (response.data.vpa) localStorage.setItem('merchant_vpa', response.data.vpa);
    if (response.data.qr_code_base64) localStorage.setItem('merchant_qr', response.data.qr_code_base64);
    
    return {
      success: true,
      message: 'Registration successful',
      data: response.data,
    };
  },

  // Token management
  logout: () => {
    localStorage.removeItem('merchant_token');
    localStorage.removeItem('merchant_store_id');
    localStorage.removeItem('merchant_email');
    localStorage.removeItem('merchant_data');
    localStorage.removeItem('merchant_display_id');
    localStorage.removeItem('merchant_vpa');
    localStorage.removeItem('merchant_qr');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('merchant_token');
  },

  // Secure API requests
  getProfile: async () => {
    const storeId = localStorage.getItem('merchant_store_id');
    const url = storeId ? `/merchant/${storeId}/profile` : `/merchant/profile`;
    
    try {
      const response = await handleRequest(url, { method: 'GET' });
      // Backend returns { success: true, data: { ... } }
      const actualData = response.data?.data || response.data;
      
      return { success: true, data: actualData };
    } catch(err) {
      console.warn("getProfile failed", err);
      throw err;
    }
  },

  updateProfile: async (profileData) => {
    const storeId = localStorage.getItem('merchant_store_id');
    const url = storeId ? `/merchant/${storeId}/profile` : `/merchant/profile`;
    
    const response = await handleRequest(url, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    
    const actualData = response.data?.data || response.data;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('profileUpdated', { detail: actualData }));
    }
    return { success: true, data: actualData };
  },

  getDashboardData: async () => {
    const storeId = localStorage.getItem('merchant_store_id');
    const url = storeId ? `/merchant/${storeId}/dashboard` : `/merchant/dashboard`;
    return handleRequest(url, { method: 'GET' });
  },

  createCampaign: async (campaignData) => {
    const storeId = localStorage.getItem('merchant_store_id');
    const url = storeId ? `/merchant/${storeId}/campaigns` : `/merchant/campaigns`;
    
    // Map frontend structure to DTO CreateCampaignRequest
    const payload = {
      name: campaignData.campaignName,
      offer_type: campaignData.offerType,
      reward_value: parseFloat(campaignData.rewardValue) || 0,
      min_bill_amount: parseFloat(campaignData.minPurchase) || 0,
      start_date: campaignData.startDate || new Date().toISOString().split('T')[0],
      end_date: campaignData.endDate || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
      banner_url: campaignData.bannerFile || campaignData.bannerUrl || ""
    };

    return handleRequest(url, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  
  getCampaigns: async () => {
    const storeId = localStorage.getItem('merchant_store_id');
    const url = storeId ? `/merchant/${storeId}/campaigns` : `/merchant/campaigns`;
    return handleRequest(url, { method: 'GET' });
  },

  updateCampaignStatus: async (campaignId, isActive) => {
    const storeId = localStorage.getItem('merchant_store_id');
    const url = storeId ? `/merchant/${storeId}/campaigns/${campaignId}/status` : `/merchant/campaigns/${campaignId}/status`;

    return handleRequest(url, {
      method: 'PUT',
      body: JSON.stringify({ is_active: isActive }),
    });
  },

  redeemBalance: async (amount = 0) => {
    const storeId = localStorage.getItem('merchant_store_id');
    const url = storeId ? `/merchant/${storeId}/rewards/redeem` : `/merchant/rewards/redeem`;
    
    const payload = {
      amount: parseFloat(amount),
      confirm_bank_transfer_authorization: true
    };
    
    return handleRequest(url, { 
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Reward Center routes
  getRewardSummary: async () => {
    const storeId = localStorage.getItem('merchant_store_id');
    const url = storeId ? `/merchant/${storeId}/rewards/summary` : `/merchant/rewards/summary`;
    return handleRequest(url, { method: 'GET' });
  },
  
  getRewardHistory: async () => {
    const storeId = localStorage.getItem('merchant_store_id');
    const url = storeId ? `/merchant/${storeId}/rewards/history` : `/merchant/rewards/history`;
    return handleRequest(url, { method: 'GET' });
  },

  // Wallet routes
  getWalletData: async (filter = 'all') => {
    const storeId = localStorage.getItem('merchant_store_id');
    const url = storeId ? `/merchant/${storeId}/wallet?filter=${filter}` : `/merchant/wallet?filter=${filter}`;
    return handleRequest(url, { method: 'GET' });
  },

  // Earnings routes
  getEarningsData: async () => {
    const storeId = localStorage.getItem('merchant_store_id');
    const url = storeId ? `/merchant/${storeId}/earnings` : `/merchant/earnings`;
    return handleRequest(url, { method: 'GET' });
  },

  requestEarningsPayout: async (milestoneScans, rewardAmount) => {
    const storeId = localStorage.getItem('merchant_store_id');
    const url = storeId ? `/merchant/${storeId}/earnings/payouts` : `/merchant/earnings/payouts`;
    return handleRequest(url, { 
      method: 'POST',
      body: JSON.stringify({ milestone_scans: milestoneScans, reward_amount: rewardAmount })
    });
  },

  // Subscription Plans & Billing routes
  getSubscriptionPlans: async () => {
    const storeId = localStorage.getItem('merchant_store_id');
    const url = storeId ? `/merchant/${storeId}/subscriptions/plans` : `/merchant/subscriptions/plans`;
    return handleRequest(url, { method: 'GET' });
  },

  getCurrentSubscription: async () => {
    const storeId = localStorage.getItem('merchant_store_id');
    const url = storeId ? `/merchant/${storeId}/subscriptions/current` : `/merchant/subscriptions/current`;
    return handleRequest(url, { method: 'GET' });
  },

  changeSubscriptionPlan: async (planCode, reason = "") => {
    const storeId = localStorage.getItem('merchant_store_id');
    const url = storeId ? `/merchant/${storeId}/subscriptions/change` : `/merchant/subscriptions/change`;
    
    return handleRequest(url, {
      method: 'POST',
      body: JSON.stringify({ plan_code: planCode, reason })
    });
  },

  initiateUpgrade: async (planCode) => {
    const storeId = localStorage.getItem('merchant_store_id');
    const url = storeId ? `/merchant/${storeId}/subscriptions/upgrade/initiate` : `/merchant/subscriptions/upgrade/initiate`;
    return handleRequest(url, {
      method: 'POST',
      body: JSON.stringify({ plan_code: planCode })
    });
  },

  verifyUpgrade: async (paymentId, orderId, signature, planCode) => {
    const storeId = localStorage.getItem('merchant_store_id');
    const url = storeId ? `/merchant/${storeId}/subscriptions/upgrade/verify` : `/merchant/subscriptions/upgrade/verify`;
    return handleRequest(url, {
      method: 'POST',
      body: JSON.stringify({ 
        razorpay_payment_id: paymentId, 
        razorpay_order_id: orderId, 
        razorpay_signature: signature,
        plan_code: planCode
      })
    });
  },

  // KYC Verification & Compliance routes
  getKYCStatus: async () => {
    const storeId = localStorage.getItem('merchant_store_id');
    const url = storeId ? `/merchant/${storeId}/kyc/status` : `/merchant/kyc/status`;
    return handleRequest(url, { method: 'GET' });
  },

  updateKYCDocuments: async (kycData) => {
    const storeId = localStorage.getItem('merchant_store_id');
    const url = storeId ? `/merchant/${storeId}/kyc/update` : `/merchant/kyc/update`;
    
    // Map to UpdateKYCDocumentsRequest
    const payload = {
      aadhaar_number: kycData.aadhaarNumber || "",
      aadhaar_doc_url: kycData.aadhaarDocUrl || "",
      shop_license_url: kycData.shopLicenseUrl || ""
    };

    return handleRequest(url, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
};
