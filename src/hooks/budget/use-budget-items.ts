
import { useState } from "react";
import { BudgetComparisonItem } from "@/types/budget";

export function useBudgetItems(initialItems: BudgetComparisonItem[] = []) {
  const [budgetItems, setBudgetItems] = useState<BudgetComparisonItem[]>(initialItems);
  
  const updateItem = (itemId: string, companyId: string, price: number) => {
    setBudgetItems(prevItems => {
      return prevItems.map(item => {
        if (item.id === itemId) {
          const updatedPrices = { ...item.prices, [companyId]: price };
          return { ...item, prices: updatedPrices };
        }
        return item;
      });
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
  
  const addBudgetItem = (parentCode: string | null, description: string, isCategory: boolean) => {
    const newItem: BudgetComparisonItem = {
      id: crypto.randomUUID(),
      code: generateNewCode(parentCode, budgetItems),
      description,
      isCategory,
      prices: {},
      lowestPrice: 0,
      middlePrice: 0,
      averagePrice: 0
    };
    
    setBudgetItems(prevItems => [...prevItems, newItem]);
  };
  
  const updateItemsForCompanyRemoval = (companyId: string) => {
    setBudgetItems(prevItems => {
      return prevItems.map(item => {
        const newPrices = { ...item.prices };
        delete newPrices[companyId];
        return { ...item, prices: newPrices };
      });
    });
  };
  
  const deleteBudgetItem = (id: string) => {
    setBudgetItems(prevItems => prevItems.filter(item => item.id !== id));
  };
  
  // Helper function to generate a new code based on parent code
  const generateNewCode = (parentCode: string | null, items: BudgetComparisonItem[]): string => {
    if (!parentCode) {
      // Generate a top-level code (e.g., 1, 2, 3)
      const topLevelCodes = items
        .filter(item => !item.code.includes('.'))
        .map(item => parseInt(item.code, 10))
        .filter(code => !isNaN(code));
      
      const maxCode = topLevelCodes.length > 0 ? Math.max(...topLevelCodes) : 0;
      return (maxCode + 1).toString();
    } else {
      // Generate a child code (e.g., 1.1, 1.2, 1.3)
      const childCodes = items
        .filter(item => 
          item.code.startsWith(parentCode + '.') && 
          !item.code.substring(parentCode.length + 1).includes('.')
        )
        .map(item => {
          const subCode = item.code.substring(parentCode.length + 1);
          return parseInt(subCode, 10);
        })
        .filter(code => !isNaN(code));
      
      const maxChildCode = childCodes.length > 0 ? Math.max(...childCodes) : 0;
      return `${parentCode}.${maxChildCode + 1}`;
    }
  };
  
  return {
    budgetItems,
    setBudgetItems,
    updateItem,
    updateItemObservation,
    updateItemDescription,
    addBudgetItem,
    updateItemsForCompanyRemoval,
    deleteBudgetItem
  };
}
