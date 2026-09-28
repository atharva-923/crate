import { Suspense } from "react";
import OrderDetailPageClient from "./OrderDetailPageClient";

export default function OrderDetailPage() {
  return (
    <Suspense fallback={null}>
      <OrderDetailPageClient />
    </Suspense>
  );
}
