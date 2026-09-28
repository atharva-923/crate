import { Suspense } from "react";
import LoginPageClient from "./LoginPageClient";

export const metadata = { title: "Log in — Crate" };

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageClient />
    </Suspense>
  );
}
