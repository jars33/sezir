
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, showDecimals: boolean = true): string {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(value);
}

/**
 * Format a percentage value while intelligently handling decimal places
 * - Preserves up to 2 decimal places if they exist
 * - Removes trailing zeros
 * - Adds % symbol
 */
export function formatPercentage(value: number): string {
  // Format with 2 decimal places, then remove trailing zeros
  return value.toFixed(2).replace(/\.?0+$/, '') + '%';
}
