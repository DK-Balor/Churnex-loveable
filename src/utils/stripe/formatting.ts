
// Function to format currency based on the current locale and currency
export const formatCurrency = (amount: number, currency = 'gbp') => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0
  }).format(amount);
};
