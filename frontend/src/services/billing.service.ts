import { apiClient } from "./api-client";

export const billingService = {
  // 1. Gói dịch vụ
  getPlans: async () => {
    const response = await apiClient.get<{
      success: boolean;
      data: { plans: any[] };
    }>("/billing/plans/");
    return response.data;
  },

  getPlanDetail: async (id: string | number) => {
    const response = await apiClient.get<{
      success: boolean;
      data: { plan: any };
    }>(`/billing/plans/${id}/`);
    return response.data;
  },

  comparePlans: async () => {
    const response = await apiClient.get<{
      success: boolean;
      data: { plans: any[] };
    }>("/billing/plans/compare/");
    return response.data;
  },

  // 2. Mã giảm giá
  applyCoupon: async (coupon_code: string, plan_id: number | string) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: any;
    }>("/billing/coupons/apply/", { coupon_code, plan_id: Number(plan_id) });
    return response.data;
  },

  // 3. Đơn hàng
  getOrders: async () => {
    const response = await apiClient.get<{
      success: boolean;
      data: { orders: any[] };
    }>("/billing/orders/");
    return response.data;
  },

  getOrderDetail: async (id: string | number) => {
    const response = await apiClient.get<{
      success: boolean;
      data: { order: any };
    }>(`/billing/orders/${id}/`);
    return response.data;
  },

  createOrder: async (data: { plan_id: number | string; coupon_code?: string; notes?: string }) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: { order: any };
    }>("/billing/orders/", data);
    return response.data;
  },

  cancelOrder: async (id: string | number, reason?: string) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: any;
    }>(`/billing/orders/${id}/cancel/`, { reason });
    return response.data;
  },

  // 4. Thanh toán (khởi tạo yêu cầu đối soát, không tự kích hoạt gói từ client)
  payOrder: async (id: string | number, provider: string = "bank_transfer") => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: {
        payment_id: number;
        order_code: string;
        amount_vnd: number;
        provider: string;
        status: string;
        payment_instructions?: {
          payment_mode?: string;
          bank_transfer_configured?: boolean;
          amount?: number;
          currency?: string;
          transfer_content?: string;
          notice?: string;
        };
      };
    }>(`/billing/orders/${id}/pay/`, { provider });
    return response.data;
  },

  // 5. Thuê bao & Hạn mức Quota
  getCurrentSubscription: async () => {
    const response = await apiClient.get<{
      success: boolean;
      data: { subscription: any; quotas: any };
    }>("/billing/subscription/current/");
    return response.data;
  },

  getQuotaLedger: async () => {
    const response = await apiClient.get<{
      success: boolean;
      data: { ledger: any[] };
    }>("/billing/quota/ledger/");
    return response.data;
  },

  // 6. Lịch sử giao dịch
  getTransactions: async () => {
    const response = await apiClient.get<{
      success: boolean;
      data: { transactions: any[] };
    }>("/billing/transactions/");
    return response.data;
  },
};
