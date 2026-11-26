import api from "./api";
import type { GeminiModelId, PlanId, User } from "./userService";

export interface PlanConfig {
  id: PlanId;
  name: string;
  priceInr: number;
  amountPaise: number;
  currency: string;
  dailyUploadLimit: number | null;
  allowScannedOcr: boolean;
  allowedModels: GeminiModelId[];
  defaultModel: GeminiModelId;
  description: string;
  features: string[];
}

export interface ModelInfo {
  id: GeminiModelId;
  label: string;
  description: string;
}

export interface UsageStats {
  todayUploadsCount: number;
  dailyUploadLimit: number | null;
  remainingUploads: number | null;
  allowScannedOcr: boolean;
  allowedModels: GeminiModelId[];
  activeModel: GeminiModelId;
}

export interface CurrentSubscription {
  plan: PlanId;
  planDetails: PlanConfig;
  selectedModel: GeminiModelId;
  subscriptionStatus: string;
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
  usage: UsageStats;
}

export interface BillingRecord {
  _id: string;
  user: string;
  plan: PlanId;
  previousPlan: PlanId;
  amount: number;
  amountPaise: number;
  currency: string;
  paymentGateway: "razorpay" | "system";
  razorpayOrderId: string;
  razorpayPaymentId: string;
  receipt: string;
  status: "created" | "paid" | "failed" | "refunded";
  paymentMethod: string;
  billingPeriodStart: string | null;
  billingPeriodEnd: string | null;
  paidAt: string | null;
  failureReason: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlansResponse {
  success: boolean;
  plans: PlanConfig[];
  models: ModelInfo[];
  keyId: string;
}

export interface CreateOrderResponse {
  success: boolean;
  message: string;
  keyId: string;
  order: {
    id: string;
    amount: number;
    currency: string;
    receipt: string;
  };
  plan: PlanConfig;
  billingId: string;
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  plan: "plus" | "pro";
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  user: User;
  billing: BillingRecord;
  subscription: CurrentSubscription;
}

export const getPlans = async (): Promise<PlansResponse> => {
  const { data } = await api.get<PlansResponse>("/api/subscriptions/plans");
  return data;
};

export const getCurrentSubscription =
  async (): Promise<CurrentSubscription> => {
    const { data } = await api.get<{
      success: boolean;
      subscription: CurrentSubscription;
    }>("/api/subscriptions/current");
    return data.subscription;
  };

export const createSubscriptionOrder = async (
  plan: "plus" | "pro"
): Promise<CreateOrderResponse> => {
  const { data } = await api.post<CreateOrderResponse>(
    "/api/subscriptions/create-order",
    { plan }
  );
  return data;
};

export const verifySubscriptionPayment = async (
  payload: VerifyPaymentPayload
): Promise<VerifyPaymentResponse> => {
  const { data } = await api.post<VerifyPaymentResponse>(
    "/api/subscriptions/verify-payment",
    payload
  );
  return data;
};

export const recordPaymentFailure = async (payload: {
  razorpay_order_id: string;
  razorpay_payment_id?: string;
  reason?: string;
}): Promise<void> => {
  await api.post("/api/subscriptions/record-failure", payload);
};

export const downgradeToFree = async (): Promise<{
  success: boolean;
  message: string;
  user: User;
}> => {
  const { data } = await api.post("/api/subscriptions/downgrade-free");
  return data;
};

export const getBillingHistory = async (): Promise<BillingRecord[]> => {
  const { data } = await api.get<{
    success: boolean;
    count: number;
    billings: BillingRecord[];
  }>("/api/subscriptions/billing-history");
  return data.billings;
};

export const loadRazorpayCheckout = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as unknown as { Razorpay?: unknown }).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};
