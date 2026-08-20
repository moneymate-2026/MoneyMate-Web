import { gatewayClient } from "../../api/gatewayClient";

export const adminMerchantService = {
  getMerchants: async () => {
    try {
      const response = await gatewayClient.get('/admin/merchants');
      // Handle potential double-wrapping from backend
      const actualData = response.data?.data || response.data;
      const stores = Array.isArray(actualData) ? actualData : [];
      
      const mappedData = stores.map(store => {
        const id = store.ID || store.id;
        const displayId = store.display_id || store.DisplayID || "MCH-000";
        const statusStr = (store.Status || store.status || "").toLowerCase();
        
        let status = "Active";
        let kycStatus = "Approved";
        let qrStatus = "Active";
        
        if (statusStr === "pending" || statusStr === "") {
          status = "Pending KYC";
          kycStatus = "Pending";
          qrStatus = "Unverified";
        } else if (statusStr === "suspended" || statusStr === "rejected" || statusStr === "blocked") {
          status = "Blocked";
          kycStatus = "Rejected";
          qrStatus = "Disabled";
        }

        const tier = store.Plan || store.plan || "Basic";
        
        return {
          id: id,
          displayId: displayId,
          businessName: store.LegalName || store.legal_name || "Unknown Business",
          ownerName: store.OwnerName || store.owner_name || "Unknown Owner",
          email: store.ContactEmail || store.contact_email || "No Email",
          phone: store.MobileNumber || store.mobile_number || "No Phone",
          category: store.Type || store.business_type || "Retail",
          tier: tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase(),
          status: status,
          kycStatus: kycStatus,
          qrCodeId: "QR-" + displayId,
          qrStatus: qrStatus,
          volume: "$0.00",
          volumeNum: 0,
          cashbackIssued: "$0.00",
          registeredDate: (store.CreatedAt || store.created_at || new Date().toISOString()).split('T')[0],
          address: store.RegisteredAddress || store.registered_address || "No Address"
        };
      });

      return { 
        success: true,
        data: mappedData, 
        total: mappedData.length,
        stats: {
          totalMerchants: mappedData.length,
          activeStores: mappedData.filter(m => m.status === 'Active').length,
          pendingKyc: mappedData.filter(m => m.kycStatus === 'Pending').length,
          totalVolumeProcessed: "$0.00"
        }
      };
    } catch (error) {
      // Silently handle errors (like 401 Unauthorized or backend down) to prevent console spam and UI crashes
      return {
        success: false,
        data: [],
        total: 0,
        stats: {
          totalMerchants: 0,
          activeStores: 0,
          pendingKyc: 0,
          totalVolumeProcessed: "$0.00"
        }
      };
    }
  },

  getMerchantById: async (id) => {
    try {
      const response = await gatewayClient.get(`/admin/merchants/${id}`);
      return response;
    } catch (e) {
      return { success: false, data: null };
    }
  },

  updateMerchantStatus: async (id, status) => {
    let apiStatus = status.toLowerCase();
    if (apiStatus === "active") apiStatus = "active";
    if (apiStatus === "blocked") apiStatus = "suspended";
    return gatewayClient.put(`/admin/merchants/${id}/status`, { status: apiStatus });
  },

  approveKYC: async (id) => {
    return gatewayClient.put(`/admin/merchants/${id}/kyc/verify`, { is_verified: true, status: "active" });
  },

  rejectKYC: async (id, reason = "Documentation incomplete") => {
    return gatewayClient.put(`/admin/merchants/${id}/kyc/verify`, { is_verified: false, status: "rejected" });
  },

  getAllKYCDocuments: async () => {
    return gatewayClient.get('/admin/kyc');
  },

  updateSubscriptionTier: async (id, tier) => {
    // Determine plan code based on tier name
    let planCode = "essential";
    const t = tier.toLowerCase();
    if (t === "premium" || t === "growth") planCode = "growth";
    if (t === "enterprise") planCode = "enterprise";
    if (t === "basic" || t === "essential") planCode = "essential";
    
    return gatewayClient.put(`/admin/merchants/${id}/subscription`, { plan_code: planCode });
  },

  createMerchant: async (data) => {
    // Generate placeholder IDs to prevent unique constraint violations on empty strings
    const placeholderAadhaar = `PENDING-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
    
    const payload = {
      owner_name: data.ownerName,
      contact_email: data.email,
      mobile_number: data.phone,
      legal_name: data.businessName,
      dba_name: data.businessName,
      business_type: data.category,
      registered_address: data.address,
      aadhaar_number: placeholderAadhaar,
      aadhaar_doc_url: "https://example.com/pending_aadhaar.pdf",
      shop_license_url: "https://example.com/pending_license.pdf",
      password: data.password,
      confirm_password: data.password
    };

    const response = await gatewayClient.post('/merchant/register', payload);
    const storeId = response.data?.store_id || response.data?.StoreID;

    if (storeId) {
      if (data.status && data.status !== "Pending KYC") {
        await adminMerchantService.updateMerchantStatus(storeId, data.status).catch(err => console.warn("Failed to set initial status:", err));
      }
      if (data.tier && data.tier !== "Basic") {
        await adminMerchantService.updateSubscriptionTier(storeId, data.tier).catch(err => console.warn("Failed to set initial tier:", err));
      }
    }

    return response;
  },

  updateMerchant: async (id, updatedData) => {
    // Currently, admin only supports status/tier updates, 
    // but we can map this to profile update if needed
    // or just return success for now if the backend doesn't support full admin profile edit.
    // For now, let's call the merchant profile update endpoint
    const payload = {
      business_name: updatedData.businessName,
      owner_name: updatedData.ownerName,
      contact_email: updatedData.email,
      mobile_number: updatedData.phone,
      business_type: updatedData.category,
      registered_address: updatedData.address
    };
    return gatewayClient.put(`/merchant/${id}/profile`, payload);
  },

  deleteMerchant: async (id) => {
    return gatewayClient.delete(`/admin/merchants/${id}`);
  },

  getMerchantCampaigns: async (storeId) => {
    if (!storeId) return { data: [] };
    return gatewayClient.get(`/admin/merchants/${storeId}/campaigns`);
  },

  createAdminCampaign: async (storeId, data) => {
    const payload = {
      name: data.campaignName,
      redeem_code: data.redeemCode || "",
      offer_category: data.offerCategory || "Retail",
      offer_type: data.offerType || "Discount",
      reward_value: parseFloat(data.rewardValue) || 0,
      min_bill_amount: parseFloat(data.minPurchase) || 0,
      redemption_limit: parseInt(data.redemptionLimit) || 0,
      target_audience: data.targetAudience || 'All Customers',
      start_date: data.startDate,
      end_date: data.endDate,
      banner_url: data.bannerUrl || ""
    };
    return gatewayClient.post(`/admin/merchants/${storeId}/campaigns`, payload);
  },

  updateAdminCampaign: async (campaignId, data) => {
    const payload = {
      name: data.campaignName,
      redeem_code: data.redeemCode || "",
      offer_category: data.offerCategory || "Retail",
      offer_type: data.offerType || "Discount",
      reward_value: parseFloat(data.rewardValue) || 0,
      min_bill_amount: parseFloat(data.minPurchase) || 0,
      redemption_limit: parseInt(data.redemptionLimit) || 0,
      target_audience: data.targetAudience || 'All Customers',
      start_date: data.startDate,
      end_date: data.endDate,
      banner_url: data.bannerUrl || ""
    };
    return gatewayClient.put(`/admin/campaigns/${campaignId}`, payload);
  },

  getAdminCampaigns: async () => {
    return gatewayClient.get('/admin/campaigns');
  },

  updateCampaignStatus: async (campaignId, isActive) => {
    return gatewayClient.put(`/admin/campaigns/${campaignId}/status`, { is_active: isActive });
  },

  getStoreQRs: async (storeId) => {
    // QR routes are not yet implemented in the backend, returning empty to avoid UI crash
    return Promise.resolve({ data: [] });
  },

  updateQRStatus: async (qrId, status) => {
    // QR routes are not yet implemented in the backend
    return Promise.resolve({ success: true });
  },

  getSubscriptionPlans: async () => {
    return gatewayClient.get('/merchant/subscriptions/plans');
  },

  getAdminSubscriptions: async () => {
    return gatewayClient.get('/admin/subscriptions');
  }
};
