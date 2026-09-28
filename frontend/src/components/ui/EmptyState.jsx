import Button from "./Button";

export default function EmptyState({ icon, title, description, actionLabel, actionHref, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-line bg-surface px-6 py-16 text-center">
      {icon && <div className="mb-4 text-ink-muted">{icon}</div>}
      <h3 className="stencil text-xl font-semibold text-ink">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-ink-muted">{description}</p>}
      {actionLabel && (actionHref || onAction) && (
        <Button
          as={actionHref ? "link" : "button"}
          href={actionHref}
          onClick={onAction}
          variant="accent"
          className="mt-6"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
