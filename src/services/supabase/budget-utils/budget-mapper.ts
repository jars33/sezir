
import { BudgetComparisonItem, Company } from "@/types/budget";
import { calculatePriceStats, organizePricesByItemAndCompany } from "./price-calculator";

/**
 * Maps database items to BudgetComparisonItem objects with statistics
 */
export function mapItemsWithStats(items: any[], prices: any[]): BudgetComparisonItem[] {
  // Organize prices by item and company
  const itemPrices = organizePricesByItemAndCompany(prices);
  
  // Create BudgetComparisonItem objects with stats
  return items.map(item => {
    // Get prices for this item
    const prices = itemPrices[item.id] || {};
    
    // Get price values for statistics calculation
    const priceValues = Object.values(prices).filter(p => p > 0);
    
    // Calculate stats
    const stats = calculatePriceStats(priceValues);
    
    return {
      id: item.id,
      code: item.code,
      description: item.description,
      isCategory: item.item_type === 'category',
      parentId: undefined, // Handle parent-child relationship if needed
      prices,
      observations: item.observations || undefined,
      ...stats
    };
  });
}

/**
 * Maps database companies to Company objects
 */
export function mapCompanies(companies: any[]): Company[] {
  return companies.map(c => ({ id: c.id, name: c.name }));
}
