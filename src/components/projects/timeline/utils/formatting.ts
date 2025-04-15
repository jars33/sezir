
import { useLocalStorage } from "@/hooks/use-local-storage";

/**
 * Formats a currency value according to user preferences
 */
export const formatCurrency = (amount: number, showDecimals: boolean) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);
};

/**
 * Formats a percentage value according to user preferences
 */
export const formatPercentage = (percentage: number, showDecimals: boolean) => {
  return `${showDecimals ? percentage.toFixed(1) : Math.round(percentage)}%`;
};

/**
 * Returns the appropriate CSS class for a value based on its sign and context
 */
export const getValueColorClass = (value: number, isPositive: boolean) => {
  if (value === 0) {
    return "text-gray-400 dark:text-gray-500";
  }
  if (isPositive) {
    return value >= 0 
      ? "text-emerald-600 dark:text-emerald-400" 
      : "text-red-600 dark:text-red-400";
  } else {
    return "text-red-700 dark:text-red-400";
  }
};
