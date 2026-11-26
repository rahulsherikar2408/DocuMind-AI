import api from "./api";

export type PlanId = "free" | "plus" | "pro";
export type GeminiModelId = "gemini-3.1-flash-lite" | "gemini-3.5-flash-lite";

export interface User {
  _id: string;
  clerkId: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl: string;
  plan: PlanId;
  selectedModel: GeminiModelId;
  subscriptionStatus?: "active" | "inactive" | "cancelled" | "expired";
  subscriptionStartDate?: string | null;
  subscriptionEndDate?: string | null;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserResponse {
  success: boolean;
  message: string;
  user: User;
}

interface UpdateModelResponse {
  success: boolean;
  message: string;
  selectedModel: GeminiModelId;
  user: User;
}

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<UserResponse>("/api/users/me");
  return response.data.user;
};

export const updateSelectedModel = async (
  model: GeminiModelId
): Promise<UpdateModelResponse> => {
  const response = await api.patch<UpdateModelResponse>("/api/users/model", {
    model,
  });
  return response.data;
};
