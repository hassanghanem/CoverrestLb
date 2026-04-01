export const formatPrice = (
  price: number,
  currency: string = "USD",
  locale: string = "en-US"
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  } catch (error) {
    // fallback if currency is invalid or missing
    console.error("Invalid currency:", currency);
    return `${price.toFixed(2)} ${currency}`;
  }
};