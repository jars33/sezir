
import { Company, BudgetComparisonItem } from "@/types/budget";
import { v4 as uuidv4 } from "uuid";

export function useBudgetSampleData() {
  const createSampleCompanies = (): Company[] => {
    // Return empty array instead of sample companies
    return [];
  };
  
  const createSampleItems = (): BudgetComparisonItem[] => {
    // Return empty array instead of sample items
    return [];
  };
  
  return {
    createSampleCompanies,
    createSampleItems
  };
}
