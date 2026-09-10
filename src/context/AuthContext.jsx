"use client";

import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

const CUSTOMER_KEY = "crate_customer_session";
const SELLER_KEY = "crate_seller_session";

export function AuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [seller, setSeller] = useState(null);
  const [ready, setReady] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const [promptMessage, setPromptMessage] = useState("");

  useEffect(() => {
    try {
      const c = localStorage.getItem(CUSTOMER_KEY);
      const s = localStorage.getItem(SELLER_KEY);
      if (c) setCustomer(JSON.parse(c));
      if (s) setSeller(JSON.parse(s));
    } catch {
      // ignore malformed storage
    }
    setReady(true);
  }, []);

  const loginCustomerSession = (data) => {
    setCustomer(data);
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(data));
  };

  const logoutCustomer = () => {
    setCustomer(null);
    localStorage.removeItem(CUSTOMER_KEY);
  };

  const loginSellerSession = (data) => {
    setSeller(data);
    localStorage.setItem(SELLER_KEY, JSON.stringify(data));
  };

  const logoutSeller = () => {
    setSeller(null);
    localStorage.removeItem(SELLER_KEY);
  };

  const requireAuth = (message = "Sign in to continue.") => {
    if (customer) return true;
    setPromptMessage(message);
    setPromptOpen(true);
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        seller,
        ready,
        loginCustomerSession,
        logoutCustomer,
        loginSellerSession,
        logoutSeller,
        requireAuth,
        promptOpen,
        promptMessage,
        closePrompt: () => setPromptOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
