
import { useMemo } from "react";
import { BudgetComparisonItem } from "@/types/budget";

export const useCategoryTotals = (budgetItems: BudgetComparisonItem[]) => {
  return useMemo(() => {
    const categoryTotals: Record<string, Record<string, number>> = {};
    
    const categories = budgetItems.filter(item => item.isCategory);
    
    categories.forEach(category => {
      const childPrefix = category.code + ".";
      
      const directChildren = budgetItems.filter(item => 
        !item.isCategory && 
        item.code.startsWith(childPrefix) &&
        !item.code.substring(childPrefix.length).includes(".")
      );
      
      const totals: Record<string, number> = {};
      
      directChildren.forEach(child => {
        Object.entries(child.prices).forEach(([companyId, price]) => {
          // Fix the typing issue by explicitly casting price to number and checking it's a valid number
          const numericPrice = Number(price);
          if (!isNaN(numericPrice) && numericPrice > 0) {
            totals[companyId] = (totals[companyId] || 0) + numericPrice;
          }
        });
      });
      
      // Calculate lowest price
      const priceValues = Object.values(totals).filter(p => p > 0);
      let lowestPrice = 0;
      let averagePrice = 0;
      
      if (priceValues.length > 0) {
        lowestPrice = Math.min(...priceValues);
        averagePrice = priceValues.reduce((sum, price) => sum + price, 0) / priceValues.length;
      }
      
      categoryTotals[category.id] = {
        ...totals,
        lowestPrice,
        averagePrice
      };
    });
    
    return categoryTotals;
  }, [budgetItems]);
};
