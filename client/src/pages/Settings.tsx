import { useState } from "react";
import {
  Sun,
  Moon,
  Laptop,
  User,
  Shield,
  Check,
  Palette,
  Crown,
  Sparkles,
  Receipt,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ScanText,
  Lock,
} from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { useTheme, type Theme } from "../hooks/useTheme";
import { useCurrentUser } from "../hooks/useUser";
import { useToast } from "../hooks/useToast";
import {
  useBillingHistory,
  useCreateSubscriptionOrder,
  useCurrentSubscription,
  useDowngradeToFree,
  usePlans,
  useRecordPaymentFailure,
  useUpdateSelectedModel,
  useVerifySubscriptionPayment,
} from "../hooks/useSubscription";
import {
  loadRazorpayCheckout,
  type BillingRecord,
  type PlanConfig,
} from "../services/subscriptionService";
import type { GeminiModelId, PlanId } from "../services/userService";

interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayFailureResponse {
  error?: {
    description?: string;
    reason?: string;
    metadata?: {
      order_id?: string;
      payment_id?: string;
    };
  };
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (
        event: string,
        handler: (response: RazorpayFailureResponse) => void
      ) => void;
    };
  }
}

const PLAN_RANK: Record<PlanId, number> = {
  free: 0,
  plus: 1,
  pro: 2,
};

function Settings() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const toast = useToast();
  const { data: user } = useCurrentUser();
  const { data: plansData, isLoading: isPlansLoading } = usePlans();
  const { data: subscription, isLoading: isSubLoading } =
    useCurrentSubscription();
  const {
    data: billingHistory = [],
    isLoading: isBillingLoading,
    error: billingError,
  } = useBillingHistory();

  const createOrderMutation = useCreateSubscriptionOrder();
  const verifyPaymentMutation = useVerifySubscriptionPayment();
  const recordFailureMutation = useRecordPaymentFailure();
  const downgradeMutation = useDowngradeToFree();
  const updateModelMutation = useUpdateSelectedModel();

  const [payingPlan, setPayingPlan] = useState<"plus" | "pro" | null>(null);
  const [statusBanner, setStatusBanner] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const currentPlan: PlanId = subscription?.plan || user?.plan || "free";
  const activeModel =
    subscription?.selectedModel || user?.selectedModel || "gemini-3.1-flash-lite";
  const usage = subscription?.usage;
  const plans: PlanConfig[] = plansData?.plans || [];
  const models = plansData?.models || [
    {
      id: "gemini-3.1-flash-lite" as GeminiModelId,
      label: "Gemini 3.1 Flash Lite",
      description: "Fast, lightweight model included across all plans.",
    },
    {
      id: "gemini-3.5-flash-lite" as GeminiModelId,
      label: "Gemini 3.5 Flash Lite",
      description: "Enhanced reasoning & speed, exclusive to Pro.",
    },
  ];

  const handleSubscribe = async (planId: "plus" | "pro") => {
    if (PLAN_RANK[planId] <= PLAN_RANK[currentPlan]) return;

    setStatusBanner(null);
    setPayingPlan(planId);

    try {
      const sdkLoaded = await loadRazorpayCheckout();
      if (!sdkLoaded || !window.Razorpay) {
        throw new Error(
          "Unable to load Razorpay Checkout SDK. Please check your internet connection."
        );
      }

      const orderResponse = await createOrderMutation.mutateAsync(planId);
      const keyId =
        orderResponse.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || "";

      if (!keyId) {
        throw new Error("Razorpay public key is missing.");
      }

      const fullName = user?.firstName
        ? `${user.firstName} ${user.lastName || ""}`.trim()
        : "DocuMind User";

      const options: Record<string, unknown> = {
        key: keyId,
        amount: orderResponse.order.amount,
        currency: orderResponse.order.currency,
        name: "DocuMind AI",
        description: `${orderResponse.plan.name} Plan Subscription (₹${orderResponse.plan.priceInr})`,
        order_id: orderResponse.order.id,
        prefill: {
          name: fullName,
          email: user?.email || "",
        },
        notes: {
          plan: planId,
        },
        theme: {
          color: "#4f46e5",
        },
        handler: async (response: RazorpaySuccessResponse) => {
          try {
            const verification = await verifyPaymentMutation.mutateAsync({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: planId,
            });

            const successMsg =
              verification.message ||
              `Subscribed to ${orderResponse.plan.name} plan successfully!`;
            setStatusBanner({
              type: "success",
              message: successMsg,
            });
            toast.success(successMsg, "Subscription Active");
          } catch (verifyErr) {
            const errMsg =
              (
                verifyErr as {
                  response?: { data?: { message?: string } };
                }
              )?.response?.data?.message ||
              (verifyErr instanceof Error
                ? verifyErr.message
                : "Payment verification failed.");
            setStatusBanner({
              type: "error",
              message: errMsg,
            });
            toast.error(errMsg, "Verification Failed");
          } finally {
            setPayingPlan(null);
          }
        },
        modal: {
          ondismiss: async () => {
            try {
              await recordFailureMutation.mutateAsync({
                razorpay_order_id: orderResponse.order.id,
                reason: "Payment modal dismissed by user",
              });
            } catch {
              // Ignore failure-logging error
            } finally {
              toast.info("Payment checkout was cancelled.", "Checkout Cancelled");
              setPayingPlan(null);
            }
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on("payment.failed", async (failResponse) => {
        const errDesc =
          failResponse.error?.description ||
          failResponse.error?.reason ||
          "Payment failed.";

        try {
          await recordFailureMutation.mutateAsync({
            razorpay_order_id:
              failResponse.error?.metadata?.order_id || orderResponse.order.id,
            razorpay_payment_id: failResponse.error?.metadata?.payment_id,
            reason: errDesc,
          });
        } catch {
          // Ignore logging error
        }

        setStatusBanner({
          type: "error",
          message: `Payment failed: ${errDesc}`,
        });
        toast.error(`Payment failed: ${errDesc}`, "Payment Failed");
        setPayingPlan(null);
      });

      razorpayInstance.open();
    } catch (error) {
      const apiErrMsg =
        (
          error as {
            response?: { data?: { message?: string } };
          }
        )?.response?.data?.message ||
        (error instanceof Error
          ? error.message
          : "Unable to start Razorpay checkout.");

      setStatusBanner({
        type: "error",
        message: apiErrMsg,
      });
      toast.error(apiErrMsg, "Checkout Error");
      setPayingPlan(null);
    }
  };

  const handleDowngradeFree = async () => {
    if (currentPlan === "plus" || currentPlan === "pro") return;

    setStatusBanner(null);
    try {
      const res = await downgradeMutation.mutateAsync();
      setStatusBanner({
        type: "success",
        message: res.message || "Switched to Free plan.",
      });
    } catch (error) {
      const apiErrMsg =
        (
          error as {
            response?: { data?: { message?: string } };
          }
        )?.response?.data?.message ||
        (error instanceof Error
          ? error.message
          : "Unable to switch to Free plan.");
      setStatusBanner({
        type: "error",
        message: apiErrMsg,
      });
    }
  };

  const handleModelSwitch = async (modelId: GeminiModelId) => {
    setStatusBanner(null);
    try {
      const res = await updateModelMutation.mutateAsync(modelId);
      const msg = res.message || `Switched active model to ${modelId}.`;
      setStatusBanner({
        type: "success",
        message: msg,
      });
      toast.success(msg, "Model Updated");
    } catch (error) {
      const apiErrMsg =
        (
          error as {
            response?: { data?: { message?: string } };
          }
        )?.response?.data?.message ||
        (error instanceof Error
          ? error.message
          : "Unable to switch AI model.");
      setStatusBanner({
        type: "error",
        message: apiErrMsg,
      });
      toast.error(apiErrMsg, "Model Switch Error");
    }
  };

  const getBillingStatusBadge = (status: BillingRecord["status"]) => {
    switch (status) {
      case "paid":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400";
      case "failed":
        return "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400";
      case "refunded":
        return "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400";
      default:
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400";
    }
  };

  const themeOptions: {
    id: Theme;
    label: string;
    description: string;
    icon: typeof Sun;
  }[] = [
    {
      id: "light",
      label: "Light Mode",
      description: "Clean, bright interface optimal for daytime use",
      icon: Sun,
    },
    {
      id: "dark",
      label: "Dark Mode",
      description: "Easy on the eyes in low-light environments",
      icon: Moon,
    },
    {
      id: "system",
      label: "System Preference",
      description: "Automatically matches your operating system theme",
      icon: Laptop,
    },
  ];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Settings
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your account details, appearance, subscription, and billing history.
          </p>
        </div>

        {/* Status Banner */}
        {statusBanner && (
          <div
            className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
              statusBanner.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
            }`}
          >
            {statusBanner.type === "success" ? (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            ) : (
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
            )}
            <span className="flex-1">{statusBanner.message}</span>
          </div>
        )}

        {/* 1. Account Information */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-colors dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5 dark:border-slate-800">
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <User size={22} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Account Details
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your authenticated user profile and subscription tier
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Full Name
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                {user?.firstName
                  ? `${user.firstName} ${user.lastName || ""}`
                  : "Not provided"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Email Address
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                {user?.email || "Signed In"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Subscription Plan
              </p>
              <p className="mt-1 text-sm font-semibold capitalize text-indigo-600 dark:text-indigo-400">
                {currentPlan} Plan
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Active Model
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                {activeModel}
              </p>
            </div>
          </div>
        </section>

        {/* 2. Appearance / Theme Settings */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-colors dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5 dark:border-slate-800">
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Palette size={22} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Appearance & Theme
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose how DocuMind AI looks to you. Active theme:{" "}
                <span className="font-semibold capitalize text-indigo-600 dark:text-indigo-400">
                  {theme} ({resolvedTheme})
                </span>
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = theme === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setTheme(option.id);
                    toast.info(`Theme set to ${option.label}`);
                  }}
                  className={`group relative flex flex-col justify-between rounded-xl border p-5 text-left transition cursor-pointer ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/50 shadow-sm ring-2 ring-indigo-500/20 dark:border-indigo-500 dark:bg-indigo-950/30"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div
                        className={`rounded-lg p-2.5 transition ${
                          isSelected
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-600 group-hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-slate-700"
                        }`}
                      >
                        <Icon size={20} />
                      </div>

                      {isSelected && (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white dark:bg-indigo-500">
                          <Check size={14} strokeWidth={3} />
                        </span>
                      )}
                    </div>

                    <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
                      {option.label}
                    </h3>

                    <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      {option.description}
                    </p>
                  </div>

                  {/* Visual preview box */}
                  <div
                    className={`mt-4 rounded-lg border p-2 text-[10px] ${
                      option.id === "dark" ||
                      (option.id === "system" && resolvedTheme === "dark")
                        ? "border-slate-800 bg-slate-950 text-slate-400"
                        : "border-slate-200 bg-slate-50 text-slate-600"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-indigo-500" />
                      <span className="font-medium">
                        {option.id === "system" ? "Auto Adaptive" : option.label}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. Subscription & Plans */}
        <section
          id="subscription"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-colors dark:border-slate-800 dark:bg-slate-900 sm:p-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                <Crown size={22} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Subscription & Plans
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Upgrade your workspace with Razorpay for higher daily upload limits and model switching
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold capitalize text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
              <Sparkles size={14} />
              Active: {currentPlan} Plan
            </div>
          </div>

          {/* Usage & Capabilities Bar */}
          {!isSubLoading && usage && (
            <div className="mt-6 grid gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40 sm:grid-cols-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Daily Uploads
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {usage.dailyUploadLimit === null
                    ? `${usage.todayUploadsCount} uploaded today (Unlimited)`
                    : `${usage.todayUploadsCount} / ${usage.dailyUploadLimit} documents today`}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Scanned Docs / OCR
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-800 dark:text-slate-200">
                  <ScanText
                    size={15}
                    className={
                      usage.allowScannedOcr
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-slate-400"
                    }
                  />
                  {usage.allowScannedOcr ? "Enabled (All Plans)" : "Text PDFs Only"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Active AI Model
                </p>
                <p className="mt-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                  {activeModel}
                </p>
              </div>
            </div>
          )}

          {/* Plan Cards */}
          {isPlansLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
            </div>
          ) : (
            <div className="mt-6 grid gap-5 lg:grid-cols-3">
              {plans.map((plan) => {
                const isCurrent = currentPlan === plan.id;
                const isLowerTierDisabled =
                  PLAN_RANK[plan.id] < PLAN_RANK[currentPlan];
                const isPro = plan.id === "pro";
                const isProcessingThis = payingPlan === plan.id;

                return (
                  <div
                    key={plan.id}
                    className={`relative flex flex-col justify-between rounded-2xl border p-6 transition ${
                      isCurrent
                        ? "border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20 dark:border-indigo-500 dark:bg-indigo-950/25"
                        : isLowerTierDisabled
                          ? "border-slate-200 bg-slate-50/60 opacity-70 dark:border-slate-800 dark:bg-slate-900/50"
                          : isPro
                            ? "border-violet-200 bg-white dark:border-violet-900/50 dark:bg-slate-900"
                            : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                          {plan.name}
                        </h3>

                        {isCurrent ? (
                          <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                            Current Plan
                          </span>
                        ) : isLowerTierDisabled ? (
                          <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            Unavailable
                          </span>
                        ) : isPro ? (
                          <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-[11px] font-semibold text-violet-700 dark:bg-violet-950/70 dark:text-violet-300">
                            Best Value
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {plan.description}
                      </p>

                      <div className="mt-5 flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                          ₹{plan.priceInr}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {plan.priceInr === 0 ? "forever" : "/ month"}
                        </span>
                      </div>

                      <ul className="mt-5 space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2">
                            <Check
                              size={16}
                              className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                            />
                            <span className="text-xs leading-5">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-6">
                      {isCurrent ? (
                        <button
                          type="button"
                          disabled
                          className="w-full rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 opacity-80 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 cursor-not-allowed"
                        >
                          Active Plan
                        </button>
                      ) : isLowerTierDisabled ? (
                        <button
                          type="button"
                          disabled
                          className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-400 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-500 cursor-not-allowed"
                        >
                          <Lock size={14} />
                          Included in {currentPlan === "pro" ? "Pro" : "Plus"}
                        </button>
                      ) : plan.id === "free" ? (
                        <button
                          type="button"
                          onClick={handleDowngradeFree}
                          disabled={downgradeMutation.isPending || payingPlan !== null}
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          {downgradeMutation.isPending
                            ? "Switching..."
                            : "Switch to Free"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            handleSubscribe(plan.id as "plus" | "pro")
                          }
                          disabled={payingPlan !== null}
                          className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer ${
                            isPro
                              ? "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
                              : "bg-indigo-600 hover:bg-indigo-700"
                          }`}
                        >
                          {isProcessingThis ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>Upgrade to {plan.name} (₹{plan.priceInr})</>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Model Selection */}
          <div className="mt-8 border-t border-slate-100 pt-6 dark:border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <Cpu size={19} className="text-indigo-600 dark:text-indigo-400" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    AI Model Selection
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {currentPlan === "pro"
                      ? "Switch between Gemini 3.1 Flash Lite and Gemini 3.5 Flash Lite anytime."
                      : "Free and Plus plans use Gemini 3.1 Flash Lite. Upgrade to Pro to unlock model switching."}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {models.map((m) => {
                const isAllowed =
                  usage?.allowedModels?.includes(m.id) ??
                  (currentPlan === "pro" || m.id === "gemini-3.1-flash-lite");
                const isSelected = activeModel === m.id;

                return (
                  <button
                    key={m.id}
                    type="button"
                    disabled={!isAllowed || updateModelMutation.isPending}
                    onClick={() => handleModelSwitch(m.id)}
                    className={`flex items-start justify-between rounded-xl border p-4 text-left transition ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 dark:border-indigo-500 dark:bg-indigo-950/30"
                        : isAllowed
                          ? "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 cursor-pointer"
                          : "border-slate-200 bg-slate-50 opacity-70 dark:border-slate-800 dark:bg-slate-800/40 cursor-not-allowed"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          {m.label}
                        </span>
                        <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          {m.id}
                        </code>
                      </div>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {m.description}
                      </p>
                    </div>

                    {isSelected ? (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
                        <Check size={13} strokeWidth={3} />
                      </span>
                    ) : !isAllowed ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                        <Lock size={10} />
                        Pro
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4. Billing History */}
        <section
          id="billing-history"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-colors dark:border-slate-800 dark:bg-slate-900 sm:p-8"
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-5 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                <Receipt size={22} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Billing History
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your Razorpay subscription payments and transaction records
                </p>
              </div>
            </div>

            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {billingHistory.length} transaction{billingHistory.length === 1 ? "" : "s"}
            </span>
          </div>

          {isBillingLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            </div>
          ) : billingError ? (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
              Unable to load billing history.
            </div>
          ) : billingHistory.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-800">
              <Receipt
                size={34}
                className="mx-auto text-slate-300 dark:text-slate-600"
              />
              <h3 className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
                No billing transactions yet
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Upgrade to Plus or Pro above to see your Razorpay invoices and payment history here.
              </p>
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3.5 font-semibold">Date</th>
                    <th className="px-4 py-3.5 font-semibold">Plan</th>
                    <th className="px-4 py-3.5 font-semibold">Amount</th>
                    <th className="px-4 py-3.5 font-semibold">Payment / Order ID</th>
                    <th className="px-4 py-3.5 font-semibold">Method</th>
                    <th className="px-4 py-3.5 font-semibold">Valid Until</th>
                    <th className="px-4 py-3.5 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {billingHistory.map((item) => (
                    <tr
                      key={item._id}
                      className="transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-300">
                        <div>{new Date(item.createdAt).toLocaleDateString()}</div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(item.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-semibold capitalize text-slate-800 dark:text-slate-200">
                        {item.plan} Plan
                      </td>

                      <td className="px-4 py-3.5 font-semibold text-slate-800 dark:text-slate-200">
                        ₹{item.amount}
                      </td>

                      <td className="px-4 py-3.5 text-xs text-slate-500 dark:text-slate-400">
                        <div className="font-mono">
                          {item.razorpayPaymentId || item.razorpayOrderId || item.receipt || "-"}
                        </div>
                        {item.failureReason && (
                          <div className="mt-0.5 text-[11px] text-red-500">
                            {item.failureReason}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-xs capitalize text-slate-500 dark:text-slate-400">
                        {item.paymentMethod
                          ? item.paymentMethod.replace(/_/g, " ")
                          : item.paymentGateway}
                      </td>

                      <td className="px-4 py-3.5 text-xs text-slate-500 dark:text-slate-400">
                        {item.billingPeriodEnd
                          ? new Date(item.billingPeriodEnd).toLocaleDateString()
                          : "-"}
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getBillingStatusBadge(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* 5. Security & System Info */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-colors dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5 dark:border-slate-800">
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Shield size={22} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Privacy & Data Security
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                How your documents and AI interactions are secured
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <p>
              Your uploaded documents are stored securely with user-specific isolation.
              Only you have access to search, summarize, or query them.
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Theme preference is saved locally on your browser. Payments are processed securely via Razorpay.
            </p>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default Settings;
