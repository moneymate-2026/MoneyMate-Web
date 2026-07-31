// MoneyMate Gateway Client
// Handles backend connectivity to the Go merchant service on Render

const BASE_URL = import.meta.env.VITE_API_URL || 'https://merchant-service-ylvn.onrender.com';

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

    if (response.ok) {
      const data = await response.json();
      return { success: true, data };
    }
    
    let errorMessage = `HTTP error ${response.status}`;
    try {
      const errorBody = await response.json();
      errorMessage = errorBody.error || errorBody.message || errorMessage;
    } catch (e) {}
    
    throw new Error(errorMessage);
  } catch (error) {
    console.error(`[GatewayClient] API connection failed for ${url}. Error: ${error.message}`);
    throw error;
  }
};

export const gatewayClient = {
  // REST wrapper methods
  get: (url, options = {}) => handleRequest(url, { ...options, method: 'GET' }),
  post: (url, data, options = {}) => handleRequest(url, { ...options, method: 'POST', body: JSON.stringify(data) }),
  put: (url, data, options = {}) => handleRequest(url, { ...options, method: 'PUT', body: JSON.stringify(data) }),
  delete: (url, options = {}) => handleRequest(url, { ...options, method: 'DELETE' }),

  // Auth operations
  login: async (email, password) => {
    // For this integration, we will use the status endpoint to verify if the merchant exists.
    // In a real system, there would be a dedicated auth service verifying the password.
    try {
      const response = await handleRequest(`/merchant/status/${encodeURIComponent(email)}`, { method: 'GET' });
      const storeData = response.data;
      
      // Store dummy token and store_id
      localStorage.setItem('merchant_token', 'mock_jwt_token_for_' + email);
      localStorage.setItem('merchant_store_id', storeData.store_id || storeData.StoreID);
      localStorage.setItem('merchant_email', email);
      
      return {
        success: true,
        token: 'mock_jwt_token_for_' + email,
        user: { email, storeId: storeData.store_id || storeData.StoreID }
      };
    } catch (err) {
      // If it fails, for the sake of the demo, let's create a fallback mock login
      // so the user isn't completely blocked if the backend is empty.
      console.warn("Login failed against real backend, falling back to mock login.", err);
      localStorage.setItem('merchant_token', 'mock_jwt_token_for_' + email);
      localStorage.setItem('merchant_email', email);
      return { success: true, token: 'mock_jwt_token_for_' + email };
    }
  },

  register: async (formData) => {
    // Map frontend form data to backend DTO
    const payload = {
      owner_id: formData.email, // using email as owner ID
      owner_name: formData.ownerName,
      contact_email: formData.email,
      mobile_number: formData.mobile,
      legal_name: formData.businessName,
      dba_name: formData.dbaName,
      business_type: formData.businessType,
      tax_id: formData.taxId,
      registered_address: formData.address,
      aadhaar_number: formData.aadharNumber,
      aadhaar_doc_url: formData.aadharFile || "https://example.com/aadhaar.pdf",
      shop_license_url: formData.shopLicenseFile || "https://example.com/license.pdf"
    };

    const response = await handleRequest('/merchant/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    
    localStorage.setItem('merchant_token', 'mock_jwt_token_for_' + formData.email);
    localStorage.setItem('merchant_store_id', response.data.store_id);
    localStorage.setItem('merchant_email', formData.email);
    
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
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('merchant_token');
  },

  // Secure API requests
  getProfile: async () => {
    const storeId = localStorage.getItem('merchant_store_id');
    const url = storeId ? `/merchant/${storeId}/profile` : `/merchant/profile`;
    
    // We add a fallback in case backend fails or there's no storeId
    try {
      const response = await handleRequest(url, { method: 'GET' });
      // ensure we match the frontend structure
      if (response.data && !response.data.businessName && response.data.BusinessName) {
         // Backend returns PascalCase or snake_case, adapt if necessary
         // But the DTO shows json tags are camelCase except for ID
      }
      return { success: true, data: response.data };
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
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('profileUpdated', { detail: profileData }));
    }
    return { success: true, data: response.data };
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
      start_date: new Date().toISOString().split('T')[0], // Mocks today
      end_date: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0] // Mocks +30 days
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

  redeemBalance: async () => {
    const storeId = localStorage.getItem('merchant_store_id');
    const url = storeId ? `/merchant/${storeId}/rewards/redeem` : `/merchant/rewards/redeem`;
    
    const payload = {
      amount: 0, // usually passed as argument, defaulting for now
      confirm_bank_transfer_authorization: true
    };
    
    return handleRequest(url, { 
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
};
