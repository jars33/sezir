
import { BudgetComparisonItem, Company } from "@/types/budget";
import { v4 as uuidv4 } from "uuid";

export function useBudgetSampleData() {
  // Generate sample companies
  const createSampleCompanies = (): Company[] => {
    return [
      { id: uuidv4(), name: "BRITOLI" },
      { id: uuidv4(), name: "NORTON" },
      { id: uuidv4(), name: "AOC" }
    ];
  };
  
  // Start with empty budget items (no longer provide sample items)
  const createSampleItems = (): BudgetComparisonItem[] => {
    return [];
  };
  
  return {
    createSampleCompanies,
    createSampleItems
  };
}
