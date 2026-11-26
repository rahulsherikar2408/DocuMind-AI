export const AVAILABLE_MODELS = {
  "gemini-3.1-flash-lite": {
    id: "gemini-3.1-flash-lite",
    label: "Gemini 3.1 Flash Lite",
    description: "Fast, lightweight model included across all plans.",
  },
  "gemini-3.5-flash-lite": {
    id: "gemini-3.5-flash-lite",
    label: "Gemini 3.5 Flash Lite",
    description: "Enhanced reasoning & speed, exclusive to Pro.",
  },
};

export const PLANS = {
  free: {
    id: "free",
    name: "Free",
    priceInr: 0,
    amountPaise: 0,
    currency: "INR",
    dailyUploadLimit: 2,
    allowScannedOcr: true,
    allowedModels: ["gemini-3.1-flash-lite"],
    defaultModel: "gemini-3.1-flash-lite",
    description: "Essential document chat for getting started.",
    features: [
      "Up to 2 documents per day",
      "Text-based & scanned documents (OCR)",
      "Gemini 3.1 Flash Lite model",
    ],
  },
  plus: {
    id: "plus",
    name: "Plus",
    priceInr: 99,
    amountPaise: 9900,
    currency: "INR",
    dailyUploadLimit: 10,
    allowScannedOcr: true,
    allowedModels: ["gemini-3.1-flash-lite"],
    defaultModel: "gemini-3.1-flash-lite",
    description: "More uploads and OCR for scanned documents.",
    features: [
      "Up to 10 documents per day",
      "Text-based & scanned documents (OCR)",
      "Gemini 3.1 Flash Lite model",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceInr: 199,
    amountPaise: 19900,
    currency: "INR",
    dailyUploadLimit: null,
    allowScannedOcr: true,
    allowedModels: ["gemini-3.1-flash-lite", "gemini-3.5-flash-lite"],
    defaultModel: "gemini-3.5-flash-lite",
    description: "Unlimited uploads, OCR, and switchable Gemini models.",
    features: [
      "Unlimited documents per day",
      "Text-based & scanned documents (OCR)",
      "Switch between gemini-3.1-flash-lite & gemini-3.5-flash-lite",
    ],
  },
};

export const getPlanConfig = (planId) => {
  return PLANS[planId] || PLANS.free;
};

export const resolveModelForUser = (user, requestedModel) => {
  const planConfig = getPlanConfig(user?.plan);

  if (requestedModel && planConfig.allowedModels.includes(requestedModel)) {
    return requestedModel;
  }

  if (
    user?.selectedModel &&
    planConfig.allowedModels.includes(user.selectedModel)
  ) {
    return user.selectedModel;
  }

  return planConfig.defaultModel;
};

export const getStartOfToday = () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay;
};
