
import { BudgetComparison } from "@/types/budget";
import { BudgetComparisonData } from "./budget-utils/types";
import { budgetSaveService } from "./budget-save-service";
import { budgetDataService } from "./budget-data-service";

/**
 * Main service for budget comparison operations
 */
export const budgetComparisonService = {
  /**
   * Saves a budget comparison (creates new or updates existing)
   */
  async saveBudgetComparison(
    name: string,
    data: BudgetComparisonData,
    projectId?: string,
    existingBudgetId?: string
  ): Promise<string | null> {
    return budgetSaveService.saveBudgetComparison(name, data, projectId, existingBudgetId);
  },
  
  /**
   * Retrieves all budget comparisons, optionally filtered by project
   */
  async getBudgetComparisons(projectId?: string): Promise<BudgetComparison[]> {
    return budgetDataService.getBudgetComparisons(projectId);
  },
  
  /**
   * Retrieves a complete budget comparison by ID
   */
  async getBudgetComparison(id: string): Promise<BudgetComparisonData | null> {
    return budgetDataService.getBudgetComparisonData(id);
  },

  /**
   * Updates the project ID for a budget comparison
   */
  async updateBudgetProject(budgetId: string, projectId: string): Promise<boolean> {
    return budgetDataService.updateBudgetProject(budgetId, projectId);
  }
};
