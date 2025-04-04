
import { BudgetComparisonItem } from "@/types/budget";
import { PriceStatsCalculation } from "./types";

/**
 * Calculates statistics for an array of price values
 */
export function calculatePriceStats(priceValues: number[]): PriceStatsCalculation {
  // Default values when there are no prices
  if (priceValues.length === 0) {
    return {
      lowestPrice: 0,
      middlePrice: 0,
      averagePrice: 0,
      standardDeviation: 0
    };
  }
  
  // Calculate lowest price
  const lowestPrice = Math.min(...priceValues);
  
  // Calculate middle (median) price
  const sortedPrices = [...priceValues].sort((a, b) => a - b);
  const middlePrice = sortedPrices[Math.floor(sortedPrices.length / 2)];
  
  // Calculate average price
  const averagePrice = priceValues.reduce((sum, p) => sum + p, 0) / priceValues.length;
  
  // Calculate standard deviation
  let standardDeviation = 0;
  if (priceValues.length > 1) {
    const variance = priceValues.reduce((sum, price) => 
      sum + Math.pow(price - averagePrice, 2), 0) / priceValues.length;
    standardDeviation = Math.sqrt(variance);
  }
  
  return {
    lowestPrice,
    middlePrice,
    averagePrice,
    standardDeviation
  };
}

/**
 * Organizes prices by item and company
 */
export function organizePricesByItemAndCompany(prices: any[]): Record<string, Record<string, number>> {
  const itemPrices: Record<string, Record<string, number>> = {};
  
  prices.forEach(priceEntry => {
    const itemId = priceEntry.budget_item_id;
    const companyId = priceEntry.company_id;
    const price = priceEntry.price;
    
    if (!itemPrices[itemId]) {
      itemPrices[itemId] = {};
    }
    
    itemPrices[itemId][companyId] = price;
  });
  
  return itemPrices;
}
