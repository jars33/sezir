
import { useState } from "react";
import { BudgetComparisonItem } from "@/types/budget";
import { v4 as uuidv4 } from "uuid";

export function useBudgetItems(initialItems: BudgetComparisonItem[] = []) {
  const [budgetItems, setBudgetItems] = useState<BudgetComparisonItem[]>(initialItems);
  
  // Helper function to compare code strings (e.g. "1.2.3" > "1.2")
  const compareCodeStrings = (a: string, b: string) => {
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);
    
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aPart = i < aParts.length ? aParts[i] : 0;
      const bPart = i < bParts.length ? bParts[i] : 0;
      
      if (aPart !== bPart) {
        return aPart - bPart;
      }
    }
    
    return 0;
  };
  
  // Helper function to calculate item statistics
  const recalculateItemStats = (item: BudgetComparisonItem): BudgetComparisonItem => {
    const priceValues = Object.values(item.prices).filter(p => p > 0);
    
    // Calculate basic stats
    const lowestPrice = priceValues.length > 0 ? Math.min(...priceValues) : 0;
    const middlePrice = priceValues.length > 0 
      ? priceValues.sort((a, b) => a - b)[Math.floor(priceValues.length / 2)] 
      : 0;
    const averagePrice = priceValues.length > 0 
      ? priceValues.reduce((sum, price) => sum + price, 0) / priceValues.length 
      : 0;
    
    // Calculate standard deviation
    let standardDeviation = 0;
    if (priceValues.length > 1) {
      const variance = priceValues.reduce((sum, price) => 
        sum + Math.pow(price - averagePrice, 2), 0) / priceValues.length;
      standardDeviation = Math.sqrt(variance);
    }
    
    return {
      ...item,
      lowestPrice,
      middlePrice,
      averagePrice,
      standardDeviation
    };
  };
  
  const updateItem = (itemId: string, companyId: string, price: number) => {
    setBudgetItems(items => {
      return items.map(item => {
        if (item.id === itemId) {
          // Update price for this company
          const newPrices = { ...item.prices, [companyId]: price };
          
          // Calculate stats based on updated prices
          return recalculateItemStats({
            ...item,
            prices: newPrices
          });
        }
        return item;
      });
    });
  };
  
  const updateItemObservation = (itemId: string, observation: string) => {
    setBudgetItems(items => {
      return items.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            observations: observation
          };
        }
        return item;
      });
    });
  };
  
  const addBudgetItem = (
    parentCode: string | null, 
    description: string, 
    isCategory: boolean = false
  ) => {
    // Generate appropriate code based on parent
    let newCode = "";
    if (!parentCode) {
      // Find highest top-level code and increment
      const topLevelCodes = budgetItems
        .filter(item => !item.code.includes("."))
        .map(item => parseInt(item.code));
      const maxCode = Math.max(0, ...topLevelCodes);
      newCode = (maxCode + 1).toString();
    } else {
      // Find items with this parent code
      const prefix = parentCode + ".";
      const subItems = budgetItems
        .filter(item => item.code.startsWith(prefix))
        .map(item => {
          const subCode = item.code.substring(prefix.length);
          return !subCode.includes(".") ? parseInt(subCode) : 0;
        });
      const maxSubCode = Math.max(0, ...subItems);
      newCode = `${parentCode}.${maxSubCode + 1}`;
    }
    
    const newItem: BudgetComparisonItem = {
      id: uuidv4(),
      code: newCode,
      description,
      isCategory,
      prices: {},
      lowestPrice: 0,
      middlePrice: 0,
      averagePrice: 0,
      standardDeviation: 0
    };
    
    // Insert at appropriate position based on code ordering
    setBudgetItems(prevItems => {
      const newItems = [...prevItems];
      const insertIndex = newItems.findIndex(item => {
        return compareCodeStrings(item.code, newCode) > 0;
      });
      
      if (insertIndex >= 0) {
        newItems.splice(insertIndex, 0, newItem);
      } else {
        newItems.push(newItem);
      }
      
      return newItems;
    });
  };

  const updateItemsForCompanyRemoval = (companyId: string) => {
    setBudgetItems(items => items.map(item => {
      const newPrices = { ...item.prices };
      delete newPrices[companyId];
      
      return recalculateItemStats({
        ...item,
        prices: newPrices
      });
    }));
  };
  
  return {
    budgetItems,
    setBudgetItems,
    updateItem,
    updateItemObservation,
    addBudgetItem,
    updateItemsForCompanyRemoval,
    recalculateItemStats
  };
}
