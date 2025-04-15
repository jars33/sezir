
import { Company, BudgetComparisonItem } from "@/types/budget";
import { v4 as uuidv4 } from "uuid";

export function useBudgetSampleData() {
  const createSampleCompanies = (): Company[] => {
    // Return an empty array instead of a single empty company
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
