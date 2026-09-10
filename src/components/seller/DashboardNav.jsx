"use client";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "products", label: "Products & Inventory" },
  { id: "orders", label: "Orders" },
  { id: "customers", label: "Customers" },
  { id: "reviews", label: "Reviews" },
  { id: "store", label: "Store Profile" },
  { id: "settings", label: "Settings" },
];

export default function DashboardNav({ active, onChange }) {
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-line pb-px">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`whitespace-nowrap border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors ${
            active === t.id
              ? "border-brass text-ink"
              : "border-transparent text-ink-muted hover:text-ink"
          }`}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}
