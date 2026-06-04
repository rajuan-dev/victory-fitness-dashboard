export const formatDisplayDate = (value) => {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString();
};

export const formatDisplayDateTime = (value) => {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleString();
};

export const formatEnumLabel = (value) => {
  const normalized = String(value || "").trim();
  if (!normalized) {
    return "N/A";
  }

  return normalized
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export const formatBooleanLabel = (value) => (value ? "Yes" : "No");

export const getStatusBadgeClassName = (value) => {
  const normalized = String(value || "").toUpperCase();

  if (normalized === "ACTIVE") {
    return "bg-green-400/30 text-green-100";
  }

  if (normalized === "PENDING") {
    return "bg-amber-400/30 text-amber-100";
  }

  return "bg-red-400/30 text-red-100";
};

export const addBillingCycleToDate = (value, billingCycle) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const normalizedCycle = String(billingCycle || "").toLowerCase();

  if (normalizedCycle === "monthly") {
    date.setMonth(date.getMonth() + 1);
    return date;
  }

  if (normalizedCycle === "quarterly") {
    date.setMonth(date.getMonth() + 3);
    return date;
  }

  if (normalizedCycle === "weekly") {
    date.setDate(date.getDate() + 7);
    return date;
  }

  if (normalizedCycle === "yearly" || normalizedCycle === "annual") {
    date.setFullYear(date.getFullYear() + 1);
    return date;
  }

  return null;
};
