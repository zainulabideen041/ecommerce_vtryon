import {
  AlertCircle,
  ArrowRight,
  Loader2,
  Package,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { orderState } from "@/lib/order-presentation";

export function AdminPageHeader({
  index,
  eyebrow,
  title,
  accent,
  description,
  action,
}) {
  return (
    <div className="admin-page-heading" data-admin-reveal>
      <div>
        <p className="admin-eyebrow">
          {index} / {eyebrow}
        </p>
        <h1>
          {title} {accent && <em>{accent}</em>}
        </h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
export function AdminState({
  error = false,
  title,
  description,
  onRetry,
  action,
}) {
  const Icon = error ? AlertCircle : Package;
  return (
    <div
      className={`admin-empty ${error ? "is-error" : ""}`}
      role={error ? "alert" : undefined}
    >
      <Icon size={34} strokeWidth={1} />
      <h3>{title}</h3>
      <p>{description}</p>
      {onRetry && (
        <button className="admin-button" onClick={onRetry}>
          Try again <ArrowRight size={16} />
        </button>
      )}
      {action}
    </div>
  );
}
export function AdminLoading({ label = "Loading your workspace", count = 3 }) {
  return (
    <div className="admin-loading-grid" role="status">
      <span className="sr-only">{label}</span>
      {Array.from({ length: count }, (_, index) => (
        <div className="admin-skeleton" key={index} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      ))}
    </div>
  );
}
export function AdminStatus({ value }) {
  const status = orderState(value);
  return (
    <span className={`admin-status tone-${status.tone}`}>
      <span />
      {status.label}
    </span>
  );
}
export function AdminConfirm({
  open,
  onOpenChange,
  title,
  description,
  pending,
  onConfirm,
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!pending) onOpenChange(value);
      }}
    >
      <DialogContent
        className="admin-confirm"
        onEscapeKeyDown={(event) => {
          if (pending) event.preventDefault();
        }}
        onInteractOutside={(event) => {
          if (pending) event.preventDefault();
        }}
      >
        <span className="admin-confirm-icon">
          <Trash2 size={25} strokeWidth={1} />
        </span>
        <p className="admin-eyebrow">A CHANGE TO YOUR STORE</p>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
        <div>
          <button
            className="admin-button secondary"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            Keep it
          </button>
          <button
            className="admin-button danger"
            disabled={pending}
            onClick={onConfirm}
          >
            {pending ? (
              <Loader2 size={15} className="admin-spin" />
            ) : (
              <Trash2 size={15} />
            )}
            {pending ? "Removing…" : "Yes, remove"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
