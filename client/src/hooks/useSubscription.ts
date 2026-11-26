import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSubscriptionOrder,
  downgradeToFree,
  getBillingHistory,
  getCurrentSubscription,
  getPlans,
  recordPaymentFailure,
  verifySubscriptionPayment,
  type VerifyPaymentPayload,
} from "../services/subscriptionService";
import { updateSelectedModel, type GeminiModelId } from "../services/userService";

export const usePlans = () => {
  return useQuery({
    queryKey: ["subscriptionPlans"],
    queryFn: getPlans,
  });
};

export const useCurrentSubscription = () => {
  return useQuery({
    queryKey: ["currentSubscription"],
    queryFn: getCurrentSubscription,
    retry: false,
  });
};

export const useBillingHistory = () => {
  return useQuery({
    queryKey: ["billingHistory"],
    queryFn: getBillingHistory,
    retry: false,
  });
};

export const useCreateSubscriptionOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (plan: "plus" | "pro") => createSubscriptionOrder(plan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billingHistory"] });
    },
  });
};

export const useVerifySubscriptionPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: VerifyPaymentPayload) =>
      verifySubscriptionPayment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["currentSubscription"] });
      queryClient.invalidateQueries({ queryKey: ["billingHistory"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useRecordPaymentFailure = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recordPaymentFailure,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billingHistory"] });
    },
  });
};

export const useDowngradeToFree = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: downgradeToFree,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["currentSubscription"] });
      queryClient.invalidateQueries({ queryKey: ["billingHistory"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useUpdateSelectedModel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (model: GeminiModelId) => updateSelectedModel(model),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["currentSubscription"] });
    },
  });
};
