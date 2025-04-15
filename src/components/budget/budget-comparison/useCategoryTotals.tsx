
import { useState, useMemo } from "react";
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
          totals[companyId] = (totals[companyId] || 0) + price;
        });
      });
      
      categoryTotals[category.id] = totals;
    });
    
    return categoryTotals;
  }, [budgetItems]);
};
