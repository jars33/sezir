
import { useState } from "react";
import { BudgetComparisonItem } from "@/types/budget";
import { recalculateItemCodes } from "@/components/budget/table/categoryCalculations";
import { calculatePriceStats } from "@/services/supabase/budget-utils/price-calculator";
import { v4 as uuidv4 } from "uuid";

export function useBudgetItems(initialItems: BudgetComparisonItem[] = []) {
  const [budgetItems, setBudgetItems] = useState<BudgetComparisonItem[]>(initialItems);
  
  const addBudgetItem = (description: string, parentCode?: string) => {
    setBudgetItems(prevItems => {
      let newCode: string;
      let isCategory = false;
      
      if (!parentCode) {
        // This is a new category
        isCategory = true;
        const topLevelItems = prevItems.filter(item => !item.code.includes('.'));
        const maxCode = topLevelItems.length > 0 
          ? Math.max(...topLevelItems.map(item => parseInt(item.code)))
          : 0;
        newCode = String(maxCode + 1);
      } else {
        // This is an item within a category
        const childItems = prevItems.filter(item => {
          const [parent] = item.code.split('.');
          return parent === parentCode && item.code.includes('.');
        });
        
        // If there are no child items yet, use .1, otherwise increment the max
        if (childItems.length === 0) {
          newCode = `${parentCode}.1`;
        } else {
          const maxSubCode = Math.max(...childItems.map(item => {
            const [, subCode] = item.code.split('.');
            return parseInt(subCode);
          }));
          newCode = `${parentCode}.${maxSubCode + 1}`;
        }
      }
      
      const newItem: BudgetComparisonItem = {
        id: uuidv4(),
        code: newCode,
        description,
        isCategory,
        prices: {},
        lowestPrice: 0,
        middlePrice: 0,
        averagePrice: 0
      };
      
      return [...prevItems, newItem];
    });
  };
  
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
    addBudgetItem,
    updateItem,
    updateItemObservation,
    updateItemDescription,
    updateItemsForCompanyRemoval,
    deleteBudgetItem
  };
}
