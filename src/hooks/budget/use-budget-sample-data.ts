
import { Company, BudgetComparisonItem } from "@/types/budget";
import { v4 as uuidv4 } from "uuid";

export function useBudgetSampleData() {
  const createSampleCompanies = (): Company[] => {
    // Return a single empty company instead of an empty array
    return [{
      id: uuidv4(),
      name: ""
    }];
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
