
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
  
  // Add the ability to delete budget items
  const deleteBudgetItem = (itemId: string) => {
    // Get the item to be deleted
    const itemToDelete = budgetItems.find(item => item.id === itemId);
    if (!itemToDelete) return;

    // Find all child items that should be deleted as well
    const childPrefix = itemToDelete.code + ".";
    
    // Filter out the item and all its children
    setBudgetItems(items => items.filter(item => 
      item.id !== itemId && !item.code.startsWith(childPrefix)
    ));
  };
  
  // Calculate category totals for all companies
  const getCategoryTotals = () => {
    const categoryTotals: Record<string, Record<string, number>> = {};
    
    // Get all categories
    const categories = budgetItems.filter(item => item.isCategory);
    
    categories.forEach(category => {
      const childPrefix = category.code + ".";
      
      // Find all direct children of this category that aren't categories themselves
      const directChildren = budgetItems.filter(item => 
        !item.isCategory && 
        item.code.startsWith(childPrefix) &&
        !item.code.substring(childPrefix.length).includes(".")
      );
      
      // Calculate totals per company for this category
      const totals: Record<string, number> = {};
      
      directChildren.forEach(child => {
        Object.entries(child.prices).forEach(([companyId, price]) => {
          totals[companyId] = (totals[companyId] || 0) + price;
        });
      });
      
      categoryTotals[category.id] = totals;
    });
    
    return categoryTotals;
  };
  
  return {
    budgetItems,
    setBudgetItems,
    updateItem,
    updateItemObservation,
    addBudgetItem,
    updateItemsForCompanyRemoval,
    recalculateItemStats,
    deleteBudgetItem,
    getCategoryTotals
  };
}
