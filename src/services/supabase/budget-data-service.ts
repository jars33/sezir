
import { BudgetComparison } from "@/types/budget";
import { BudgetComparisonData } from "./budget-utils/types";
import { budgetCompaniesService } from "./budget-companies-service";
import { budgetItemsService } from "./budget-items-service";
import { budgetPricesService } from "./budget-prices-service";
import { budgetComparisonsService } from "./budget-comparisons-service";
import { mapItemsWithStats, mapCompanies } from "./budget-utils/budget-mapper";
import { supabase } from "@/integrations/supabase/client";

/**
 * Service for loading complete budget comparison data
 */
export const budgetDataService = {
  /**
   * Retrieves all budget comparisons, optionally filtered by project
   */
  async getBudgetComparisons(projectId?: string): Promise<BudgetComparison[]> {
    return budgetComparisonsService.getAllBudgetComparisons(projectId);
  },
  
  /**
   * Retrieves complete budget comparison data by ID
   */
  async getBudgetComparisonData(id: string): Promise<BudgetComparisonData | null> {
    try {
      // 1. Get companies for this budget comparison
      const companies = await budgetCompaniesService.getCompaniesByBudgetId(id);
      if (!companies) return null;
      
      // 2. Get budget items for this comparison
      const items = await budgetItemsService.getItemsByBudgetId(id);
      if (!items) return null;
      
      // 3. Get all prices for this budget comparison
      const prices = await budgetPricesService.getPricesByBudgetId(id);
      if (!prices) return null;
      
      // 4. Create BudgetComparisonItem objects with stats
      const budgetItems = mapItemsWithStats(items, prices);
      
      return {
        companies: mapCompanies(companies),
        items: budgetItems
      };
    } catch (error) {
      console.error("Error in getBudgetComparisonData:", error);
      return null;
    }
  },

  /**
   * Updates the project ID for a budget comparison
   */
  async updateBudgetProject(budgetId: string, projectId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('budget_comparisons')
        .update({ project_id: projectId || null })
        .eq('id', budgetId);

      if (error) {
        console.error("Error updating budget project:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error in updateBudgetProject:", error);
      return false;
    }
  }
};
