
import { useState } from "react";
import { BudgetComparisonItem } from "@/types/budget";
import { recalculateItemCodes } from "@/components/budget/table/categoryCalculations";
import { calculatePriceStats } from "@/services/supabase/budget-utils/price-calculator";

export function useBudgetItems(initialItems: BudgetComparisonItem[] = []) {
  const [budgetItems, setBudgetItems] = useState<BudgetComparisonItem[]>(initialItems);
  
  const updateItem = (itemId: string, companyId: string, price: number) => {
    setBudgetItems(prevItems => {
      const updatedItems = prevItems.map(item => {
        if (item.id === itemId) {
          const updatedPrices = { ...item.prices, [companyId]: price };
          
          // Recalculate price statistics
          const priceValues = Object.values(updatedPrices).filter(p => 
            typeof p === 'number' && !isNaN(p) && p > 0
          );
          
          const { lowestPrice, middlePrice, averagePrice, standardDeviation } = 
            calculatePriceStats(priceValues as number[]);
          
          return { 
            ...item, 
            prices: updatedPrices,
            lowestPrice,
            middlePrice,
            averagePrice,
            standardDeviation
          };
        }
        return item;
      });
      
      return updatedItems;
    });
  };
  
  const updateItemObservation = (itemId: string, observation: string) => {
    setBudgetItems(prevItems => {
      return prevItems.map(item => {
        if (item.id === itemId) {
          return { ...item, observations: observation };
        }
        return item;
      });
    });
  };
  
  const updateItemDescription = (itemId: string, description: string) => {
    setBudgetItems(prevItems => {
      return prevItems.map(item => {
        if (item.id === itemId) {
          return { ...item, description };
        }
        return item;
      });
    });
  };
  
  const updateItemsForCompanyRemoval = (companyId: string) => {
    setBudgetItems(prevItems => {
      return prevItems.map(item => {
        const newPrices = { ...item.prices };
        delete newPrices[companyId];
        
        // Recalculate price statistics
        const priceValues = Object.values(newPrices).filter(p => 
          typeof p === 'number' && !isNaN(p) && p > 0
        );
        
        const { lowestPrice, middlePrice, averagePrice, standardDeviation } = 
          calculatePriceStats(priceValues as number[]);
        
        return { 
          ...item, 
          prices: newPrices,
          lowestPrice,
          middlePrice,
          averagePrice,
          standardDeviation
        };
      });
    });
  };
  
  const deleteBudgetItem = (id: string) => {
    setBudgetItems(prevItems => {
      // First, identify the item to be deleted
      const itemToDelete = prevItems.find(item => item.id === id);
      
      if (!itemToDelete) return prevItems;
      
      // If it's a category, also delete all its children
      let itemsToKeep = prevItems.filter(item => item.id !== id);
      
      if (itemToDelete.isCategory) {
        const categoryPrefix = itemToDelete.code + ".";
        itemsToKeep = itemsToKeep.filter(item => !item.code.startsWith(categoryPrefix));
      }
      
      // Recalculate item codes after deletion
      return recalculateItemCodes(itemsToKeep);
    });
  };
  
  return {
    budgetItems,
    setBudgetItems,
    updateItem,
    updateItemObservation,
    updateItemDescription,
    updateItemsForCompanyRemoval,
    deleteBudgetItem
  };
}
