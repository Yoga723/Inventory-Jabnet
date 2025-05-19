<<<<<<< HEAD
export const formatCurrency = (amount: number | string, operation: string) => {
  // Convert string to number if needed
  const numAmount = typeof amount === "string" ? Number(amount.replace(/[^0-9.-]/g, "")) : amount;

  const formatted = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numAmount);

  return `${formatted}`;
};
=======
export const formatCurrency = (amount: number | string, operation: string) => {
  // Convert string to number if needed
  const numAmount = typeof amount === "string" ? Number(amount.replace(/[^0-9.-]/g, "")) : amount;

  const formatted = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numAmount);

  return `${formatted}`;
};
>>>>>>> 4289c65a (change name placeholder)
