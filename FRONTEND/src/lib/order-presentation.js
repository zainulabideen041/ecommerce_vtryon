const states = {
  pending: { label: "Order placed", tone: "pending", step: 0, group: "active" },
  confirmed: {
    label: "Confirmed",
    tone: "confirmed",
    step: 0,
    group: "active",
  },
  inprocess: {
    label: "Preparing your order",
    tone: "processing",
    step: 1,
    group: "active",
  },
  inshipping: {
    label: "On the way",
    tone: "shipping",
    step: 2,
    group: "active",
  },
  delivered: {
    label: "Delivered",
    tone: "delivered",
    step: 3,
    group: "delivered",
  },
  rejected: {
    label: "Order rejected",
    tone: "rejected",
    step: null,
    group: "other",
  },
  cancelled: {
    label: "Cancelled",
    tone: "rejected",
    step: null,
    group: "other",
  },
  canceled: {
    label: "Cancelled",
    tone: "rejected",
    step: null,
    group: "other",
  },
};

export function orderState(value) {
  return (
    states[String(value || "").toLowerCase()] || {
      label: value || "Status unavailable",
      tone: "unknown",
      step: null,
      group: "other",
    }
  );
}
export function orderDate(value) {
  const date = new Date(value);
  return value && Number.isFinite(date.getTime())
    ? date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      })
    : "Date unavailable";
}
export function orderMoney(value) {
  if (value == null || value === "") return "—";
  const amount = Number(value);
  return Number.isFinite(amount)
    ? `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "—";
}
export function orderLineTotal(item) {
  if (item.price == null || item.price === "" || item.quantity == null)
    return undefined;
  const total = Number(item.price) * Number(item.quantity);
  return Number.isFinite(total) ? total : undefined;
}
export const orderQuantity = (order) =>
  (order?.cartItems || []).reduce(
    (sum, item) => sum + Math.max(0, Number(item.quantity) || 0),
    0,
  );
export const orderReference = (id) =>
  String(id || "")
    .slice(-8)
    .toUpperCase();
