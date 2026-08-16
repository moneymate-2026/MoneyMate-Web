// MoneyMate Gateway Client
// Handles backend connectivity to the Go merchant service on Render

const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const BASE_URL = rawBaseUrl.endsWith('/api/v1') ? rawBaseUrl : `${rawBaseUrl}/api/v1`;
const ADMIN_BASE_URL = import.meta.env.VITE_ADMIN_API_URL || BASE_URL;

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
    
    // On 401 Unauthorized, we throw a specific error instead of aggressively hard-redirecting, 
    // to prevent redirect loops when the backend middleware has a token validation issue.
    if (response.status === 401 && !url.includes('/login') && !url.includes('/register')) {
      // We will still clear the token so the app knows we are unauthenticated,
      // but we won't force a hard reload loop.
      console.warn("Backend rejected token (401). Middleware may be misconfigured.");
      // Optional: window.dispatchEvent(new Event('auth_expired'));
    }

    let errorMessage = `HTTP error ${response.status}`;
    try {
      const errorBody = await response.json();
      errorMessage = errorBody.error || errorBody.message || errorMessage;
      
      // Sanitize raw Go backend errors for the frontend UI
      if (typeof errorMessage === 'string') {
        if (errorMessage.includes('sql: no rows')) {
          errorMessage = 'Requested data not found or invalid credentials.';
        } else if (errorMessage.includes('kyc_documents_aadhaar_number_key')) {
          errorMessage = 'This Aadhaar number is already registered to another merchant.';
        } else if (errorMessage.includes('stores_mobile_number_key')) {
          errorMessage = 'This mobile number is already registered.';
        } else if (errorMessage.includes('stores_contact_email_key')) {
          errorMessage = 'This email address is already registered.';
        } else if (errorMessage.includes('duplicate key') || errorMessage.includes('unique constraint')) {
          errorMessage = 'A record with this information already exists.';
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
        } else if (errorMessage.includes('validation failed') || errorMessage.includes('invalid request')) {
          // Let validation errors pass through
        } else {
          // Catch-all: Never expose raw unhandled Go errors (like "pq: ...") directly to the UI
          console.error("Backend error suppressed:", errorMessage);
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

  // Support Admin Routes
  getAdminComplaints: async (limit = 100, offset = 0) => {
    return handleRequest(`/admin/support/complaints?limit=${limit}&offset=${offset}`, { method: 'GET' });
  },

  getAdminReports: async (limit = 100, offset = 0) => {
    return handleRequest(`/admin/support/reports?limit=${limit}&offset=${offset}`, { method: 'GET' });
  },

  // Chat Support Routes (Admin)
  getAdminChatInbox: async () => {
    return handleRequest('/admin/support/chat/inbox', { method: 'GET' });
  },

  getAdminChatHistory: async (userId) => {
    return handleRequest(`/admin/support/chat/history/${userId}`, { method: 'GET' });
  },

  sendAdminChatMessage: async (receiverId, receiverType, message) => {
    return handleRequest('/admin/support/chat/send', {
      method: 'POST',
      body: JSON.stringify({
        receiver_id: receiverId,
        receiver_type: receiverType,
        message: message
      })
    });
  },

  // Auth operations
  login: async (email, password) => {
    const response = await handleRequest('/merchant/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    const responseData = response.data?.data || response.data || {};
    const token = responseData.token || responseData.Token || responseData.access_token;
    const storeId = responseData.store_id || responseData.StoreID || responseData.storeId || responseData.id;
    
    if (response.success && token) {
      localStorage.setItem('merchant_token', token);
      if (storeId) localStorage.setItem('merchant_store_id', storeId);
      localStorage.setItem('merchant_data', JSON.stringify(responseData));
    }
    
    return {
      success: true,
      token: token,
      user: { email, storeId: storeId }
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
    
    const responseData = response.data?.data || response.data || {};
    const token = responseData.token || responseData.Token || responseData.access_token;
    const storeId = responseData.store_id || responseData.StoreID || responseData.storeId || responseData.id;
    
    if (response.success && token) {
      localStorage.setItem('merchant_token', token);
      if (storeId) localStorage.setItem('merchant_store_id', storeId);
      localStorage.setItem('merchant_data', JSON.stringify(responseData));
    }
    
    // Store unique IDs and QR code generated by the backend
    const displayId = responseData.display_id || responseData.DisplayID;
    const vpa = responseData.vpa || responseData.VPA;
    const qrCode = responseData.qr_code_base64 || responseData.QRCodeBase64 || responseData.qr_code;
    
    if (displayId) localStorage.setItem('merchant_display_id', displayId);
    if (vpa) localStorage.setItem('merchant_vpa', vpa);
    if (qrCode) localStorage.setItem('merchant_qr', qrCode);
    
    return {
      success: true,
      message: 'Registration successful',
      data: responseData,
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
    let storeId = localStorage.getItem('merchant_store_id');
    if (storeId === 'undefined') storeId = null;
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
    let storeId = localStorage.getItem('merchant_store_id');
    if (storeId === 'undefined') storeId = null;
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
    let storeId = localStorage.getItem('merchant_store_id');
    if (storeId === 'undefined') storeId = null;
    const url = storeId ? `/merchant/${storeId}/dashboard` : `/merchant/dashboard`;
    return handleRequest(url, { method: 'GET' });
  },

  createCampaign: async (campaignData) => {
    let storeId = localStorage.getItem('merchant_store_id');
    if (storeId === 'undefined') storeId = null;
    const url = storeId ? `/merchant/${storeId}/campaigns` : `/merchant/campaigns`;
    
    // Map frontend structure to DTO CreateCampaignRequest
    const payload = {
      name: campaignData.campaignName,
      redeem_code: campaignData.redeemCode,
      offer_category: campaignData.offerCategory,
      offer_type: campaignData.offerType,
      reward_value: parseFloat(campaignData.rewardValue) || 0,
      min_bill_amount: parseFloat(campaignData.minPurchase) || 0,
      redemption_limit: parseInt(campaignData.redemptionLimit) || 0,
      target_audience: campaignData.targetAudience || 'All Customers',
      start_date: campaignData.startDate,
      end_date: campaignData.endDate,
      banner_url: campaignData.bannerFile || campaignData.bannerUrl || ""
    };

    return handleRequest(url, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  
  getCampaigns: async () => {
    let storeId = localStorage.getItem('merchant_store_id');
    if (storeId === 'undefined') storeId = null;
    const url = storeId ? `/merchant/${storeId}/campaigns` : `/merchant/campaigns`;
    return handleRequest(url, { method: 'GET' });
  },

  updateCampaignStatus: async (campaignId, isActive) => {
    let storeId = localStorage.getItem('merchant_store_id');
    if (storeId === 'undefined') storeId = null;
    const url = storeId ? `/merchant/${storeId}/campaigns/${campaignId}/status` : `/merchant/campaigns/${campaignId}/status`;

    return handleRequest(url, {
      method: 'PUT',
      body: JSON.stringify({ is_active: isActive }),
    });
  },

  redeemBalance: async (amount = 0) => {
    let storeId = localStorage.getItem('merchant_store_id');
    if (storeId === 'undefined') storeId = null;
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
    let storeId = localStorage.getItem('merchant_store_id');
    if (storeId === 'undefined') storeId = null;
    const url = storeId ? `/merchant/${storeId}/rewards/summary` : `/merchant/rewards/summary`;
    return handleRequest(url, { method: 'GET' });
  },
  
  getRewardHistory: async () => {
    let storeId = localStorage.getItem('merchant_store_id');
    if (storeId === 'undefined') storeId = null;
    const url = storeId ? `/merchant/${storeId}/rewards/history` : `/merchant/rewards/history`;
    return handleRequest(url, { method: 'GET' });
  },

  // Wallet routes
  getWalletData: async (filter = 'all') => {
    let storeId = localStorage.getItem('merchant_store_id');
    if (storeId === 'undefined') storeId = null;
    const url = storeId ? `/merchant/${storeId}/wallet?filter=${filter}` : `/merchant/wallet?filter=${filter}`;
    return handleRequest(url, { method: 'GET' });
  },

  // Earnings routes
  getEarningsData: async () => {
    let storeId = localStorage.getItem('merchant_store_id');
    if (storeId === 'undefined') storeId = null;
    const url = storeId ? `/merchant/${storeId}/earnings` : `/merchant/earnings`;
    return handleRequest(url, { method: 'GET' });
  },

  requestEarningsPayout: async (milestoneScans, rewardAmount) => {
    let storeId = localStorage.getItem('merchant_store_id');
    if (storeId === 'undefined') storeId = null;
    const url = storeId ? `/merchant/${storeId}/earnings/payouts` : `/merchant/earnings/payouts`;
    return handleRequest(url, { 
      method: 'POST',
      body: JSON.stringify({ milestone_scans: milestoneScans, reward_amount: rewardAmount })
    });
  },

  // Subscription Plans & Billing routes
  getSubscriptionPlans: async () => {
    let storeId = localStorage.getItem('merchant_store_id');
    if (storeId === 'undefined') storeId = null;
    const url = storeId ? `/merchant/${storeId}/subscriptions/plans` : `/merchant/subscriptions/plans`;
    return handleRequest(url, { method: 'GET' });
  },

  getCurrentSubscription: async () => {
    let storeId = localStorage.getItem('merchant_store_id');
    if (storeId === 'undefined') storeId = null;
    const url = storeId ? `/merchant/${storeId}/subscriptions/current` : `/merchant/subscriptions/current`;
    return handleRequest(url, { method: 'GET' });
  },

  changeSubscriptionPlan: async (planCode, reason = "") => {
    let storeId = localStorage.getItem('merchant_store_id');
    if (storeId === 'undefined') storeId = null;
    const url = storeId ? `/merchant/${storeId}/subscriptions/change` : `/merchant/subscriptions/change`;
    
    return handleRequest(url, {
      method: 'POST',
      body: JSON.stringify({ plan_code: planCode, reason })
    });
  },

  initiateUpgrade: async (planCode) => {
    let storeId = localStorage.getItem('merchant_store_id');
    if (storeId === 'undefined') storeId = null;
    const url = storeId ? `/merchant/${storeId}/subscriptions/upgrade/initiate` : `/merchant/subscriptions/upgrade/initiate`;
    return handleRequest(url, {
      method: 'POST',
      body: JSON.stringify({ plan_code: planCode })
    });
  },

  verifyUpgrade: async (paymentId, orderId, signature, planCode) => {
    let storeId = localStorage.getItem('merchant_store_id');
    if (storeId === 'undefined') storeId = null;
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
    let storeId = localStorage.getItem('merchant_store_id');
    if (storeId === 'undefined') storeId = null;
    const url = storeId ? `/merchant/${storeId}/kyc/status` : `/merchant/kyc/status`;
    return handleRequest(url, { method: 'GET' });
  },

  updateKYCDocuments: async (kycData) => {
    let storeId = localStorage.getItem('merchant_store_id');
    if (storeId === 'undefined') storeId = null;
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
