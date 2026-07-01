export function formatRupees(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatLakhs(value: number) {
  return `₹${(value / 100000).toFixed(value % 100000 === 0 ? 0 : 1)}L`;
}

