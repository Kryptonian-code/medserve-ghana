export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatDate(value?: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-GH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export const ORDER_STATUSES = [
  "Pending",
  "Awaiting Prescription Review",
  "Awaiting Payment",
  "Paid",
  "Processing",
  "Dispatched",
  "Delivered",
  "Cancelled",
];

export const PRESCRIPTION_STATUSES = [
  "Submitted",
  "Under Review",
  "Approved",
  "Rejected",
  "Needs Clarification",
  "Ready for Checkout",
];
