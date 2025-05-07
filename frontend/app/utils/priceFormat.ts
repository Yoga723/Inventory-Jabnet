export const formatCurrency = (amount: number, operation: string) => {
  const formatted = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(amount);
  const sign = operation.toLocaleLowerCase() === "masuk" ? "+" : "–";
  return `${sign} ${formatted}`;
};
