import { Suspense } from "react";
import ProductsPageClient from "./ProductsPageClient";

export const metadata = { title: "All Products — Crate" };

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsPageClient />
    </Suspense>
  );
}
