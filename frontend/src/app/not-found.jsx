import Link from "next/link";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center sm:px-6">
      <div className="crate-stamp flex h-16 w-16 items-center justify-center">
        <span className="stencil text-2xl font-bold text-ink">?</span>
      </div>
      <h1 className="stencil mt-6 text-2xl font-semibold text-ink">This crate wasn't found</h1>
      <p className="mt-2 text-sm text-ink-muted">
        The page you're looking for may have moved or no longer exists.
      </p>
      <Button as="link" href="/" variant="primary" className="mt-6">
        Back to homepage
      </Button>
      <Link href="/products" className="mt-3 text-sm text-ink-muted hover:text-ink">
        Or browse all products
      </Link>
    </div>
  );
}
