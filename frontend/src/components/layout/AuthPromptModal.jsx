"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";

export default function AuthPromptModal() {
  const { promptOpen, promptMessage, closePrompt } = useAuth();

  if (!promptOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/50" onClick={closePrompt} />
      <div className="relative w-full max-w-sm rounded-t-lg sm:rounded-lg border border-line bg-surface p-6 shadow-lift">
        <div className="crate-stamp mx-auto flex h-12 w-12 items-center justify-center">
          <span className="stencil text-lg font-bold text-ink">C</span>
        </div>
        <h3 className="stencil mt-4 text-center text-lg font-semibold text-ink">
          Sign in to continue
        </h3>
        <p className="mt-1.5 text-center text-sm text-ink-muted">{promptMessage}</p>
        <div className="mt-6 flex flex-col gap-2.5">
          <Button as="link" href="/login" variant="primary" onClick={closePrompt}>
            Log in
          </Button>
          <Button as="link" href="/register" variant="outline" onClick={closePrompt}>
            Create account
          </Button>
          <button
            onClick={closePrompt}
            className="mt-1 text-center text-sm text-ink-muted hover:text-ink"
          >
            Continue browsing
          </button>
        </div>
      </div>
    </div>
  );
}
