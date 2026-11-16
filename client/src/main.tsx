import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { ClerkProvider } from "@clerk/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import './index.css'
import App from './App.tsx'

import ApiProvider from "./components/providers/ApiProvider";

// eslint-disable-next-line react-refresh/only-export-components
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if(!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <QueryClientProvider client={queryClient}>
        <ApiProvider>
          <App />
        </ApiProvider>
      </QueryClientProvider>
    </ClerkProvider>
  </StrictMode>,
)
