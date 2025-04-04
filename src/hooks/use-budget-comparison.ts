
import { useState, useEffect } from "react";
import { BudgetComparisonItem, Company } from "@/types/budget";
import { v4 as uuidv4 } from "uuid";

// Sample initial data to populate the table with common budget item categories
const initialCategories: Partial<BudgetComparisonItem>[] = [
  { 
    code: "1", 
    description: "NOTAS INTRODUTÓRIAS",
    isCategory: true 
  },
  {
    code: "1.1",
    description: "Descrição do terreno para construir pilares",
    isCategory: false
  },
  {
    code: "1.2",
    description: "Higiene/Segurança, Salubridade e Saúde incluindo todas as medidas previstas",
    isCategory: false
  },
  {
    code: "1.3",
    description: "INSTALAÇÕES DO DONO DE OBRA E DA FISCALIZAÇÃO",
    isCategory: true
  },
  {
    code: "1.3.1",
    description: "Montagens e desmontagem provisórias",
    isCategory: false
  },
  {
    code: "1.3.2",
    description: "Sanitários separados por género",
    isCategory: false
  },
  {
    code: "1.4",
    description: "PROJECTOS DE INFRAESTRUTURAS GERAIS DE ESTALEIRO",
    isCategory: true
  },
  {
    code: "1.5",
    description: "OUTROS ARTIGOS OU RISCOS",
    isCategory: true
  }
];

export function useBudgetComparison() {
  const [companies, setCompanies] = useState<Company[]>([
    { id: uuidv4(), name: "BRITOLI" },
    { id: uuidv4(), name: "NORTON" },
    { id: uuidv4(), name: "AOC" },
    { id: uuidv4(), name: "NVE" },
    { id: uuidv4(), name: "ATLANTINIVEL" }
  ]);
  
  const [budgetItems, setBudgetItems] = useState<BudgetComparisonItem[]>([]);
  
  // Initialize with sample data
  useEffect(() => {
    const initialItems: BudgetComparisonItem[] = initialCategories.map(cat => ({
      id: uuidv4(),
      code: cat.code || '',
      description: cat.description || '',
      isCategory: cat.isCategory || false,
      prices: {},
      lowestPrice: 0,
      middlePrice: 0,
      averagePrice: 0
    }));
    
    setBudgetItems(initialItems);
  }, []);
  
  const addCompany = (name: string) => {
    const newCompany: Company = {
      id: uuidv4(),
      name
    };
    
    setCompanies([...companies, newCompany]);
  };
  
  const removeCompany = (companyId: string) => {
    setCompanies(companies.filter(c => c.id !== companyId));
    
    // Also remove this company's prices from all items
    setBudgetItems(items => items.map(item => {
      const newPrices = { ...item.prices };
      delete newPrices[companyId];
      
      // Recalculate statistics
      const priceValues = Object.values(newPrices).filter(p => p > 0);
      const lowestPrice = priceValues.length > 0 ? Math.min(...priceValues) : 0;
      const middlePrice = priceValues.length > 0 
        ? priceValues.sort((a, b) => a - b)[Math.floor(priceValues.length / 2)] 
        : 0;
      const averagePrice = priceValues.length > 0 
        ? priceValues.reduce((sum, price) => sum + price, 0) / priceValues.length 
        : 0;
        
      return {
        ...item,
        prices: newPrices,
        lowestPrice,
        middlePrice,
        averagePrice
      };
    }));
  };
  
  const updateItem = (itemId: string, companyId: string, price: number) => {
    setBudgetItems(items => {
      return items.map(item => {
        if (item.id === itemId) {
          // Update price for this company
          const newPrices = { ...item.prices, [companyId]: price };
          
          // Calculate stats based on updated prices
          const priceValues = Object.values(newPrices).filter(p => p > 0);
          const lowestPrice = priceValues.length > 0 ? Math.min(...priceValues) : 0;
          const middlePrice = priceValues.length > 0 
            ? priceValues.sort((a, b) => a - b)[Math.floor(priceValues.length / 2)] 
            : 0;
          const averagePrice = priceValues.length > 0 
            ? priceValues.reduce((sum, price) => sum + price, 0) / priceValues.length 
            : 0;
          
          return {
            ...item,
            prices: newPrices,
            lowestPrice,
            middlePrice,
            averagePrice
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
      averagePrice: 0
    };
    
    // Insert at appropriate position based on code ordering
    const newItems = [...budgetItems];
    const insertIndex = newItems.findIndex(item => {
      return compareCodeStrings(item.code, newCode) > 0;
    });
    
    if (insertIndex >= 0) {
      newItems.splice(insertIndex, 0, newItem);
    } else {
      newItems.push(newItem);
    }
    
    setBudgetItems(newItems);
  };
  
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
  
  return {
    budgetItems,
    companies,
    addCompany,
    removeCompany,
    updateItem,
    addBudgetItem
  };
}
