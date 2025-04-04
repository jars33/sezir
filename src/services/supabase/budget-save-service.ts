
import { supabase } from "@/integrations/supabase/client";
import { BudgetComparisonData } from "./budget-utils/types";
import { budgetCompaniesService } from "./budget-companies-service";
import { budgetItemsService } from "./budget-items-service";
import { budgetPricesService } from "./budget-prices-service";
import { budgetComparisonsService } from "./budget-comparisons-service";

export const budgetSaveService = {
  /**
   * Saves a budget comparison (creates new or updates existing)
   */
  async saveBudgetComparison(
    name: string,
    description: string,
    data: BudgetComparisonData,
    projectId?: string,
    existingBudgetId?: string
  ): Promise<string | null> {
    try {
      let budgetId = existingBudgetId;
      
      // Start a transaction
      const { data: transaction, error: txError } = await supabase.rpc('begin_transaction');
      if (txError) throw txError;
      
      try {
        // 1. Create or update the budget comparison record
        if (existingBudgetId) {
          // Update existing budget
          await budgetComparisonsService.updateBudgetComparison(existingBudgetId, { 
            name, 
            description, 
            project_id: projectId || null 
          });
        } else {
          // Create a new budget comparison
          budgetId = await budgetComparisonsService.createBudgetComparison({
            name,
            description,
            project_id: projectId || null
          });
          
          if (!budgetId) throw new Error("Failed to create budget comparison record");
        }
        
        // If it's an existing budget, delete all previous items, companies and prices
        if (existingBudgetId) {
          await budgetPricesService.deletePricesByBudgetId(existingBudgetId);
          await budgetItemsService.deleteItemsByBudgetId(existingBudgetId);
          await budgetCompaniesService.deleteCompaniesByBudgetId(existingBudgetId);
        }
        
        // 2. Save companies
        const companies = await budgetCompaniesService.createCompanies(
          budgetId as string, 
          data.companies.map(company => ({ name: company.name }))
        );
        
        if (!companies || companies.length !== data.companies.length) {
          throw new Error("Failed to save companies");
        }
        
        // Create a map of local IDs to database IDs for companies
        const companyIdMap = new Map<string, string>();
        for (let i = 0; i < data.companies.length; i++) {
          companyIdMap.set(data.companies[i].id, companies[i].id);
        }
        
        // 3. Save items
        const items = await budgetItemsService.createItems(
          budgetId as string,
          data.items.map(item => ({
            code: item.code,
            description: item.description,
            isCategory: item.isCategory,
            observations: item.observations
          }))
        );
        
        if (!items || items.length !== data.items.length) {
          throw new Error("Failed to save items");
        }
        
        // Create a map of local IDs to database IDs for items
        const itemIdMap = new Map<string, string>();
        for (let i = 0; i < data.items.length; i++) {
          itemIdMap.set(data.items[i].id, items[i].id);
        }
        
        // 4. Save prices
        const pricesToSave = [];
        
        for (const item of data.items) {
          const itemId = itemIdMap.get(item.id);
          if (!itemId) continue;
          
          for (const [companyId, price] of Object.entries(item.prices)) {
            const databaseCompanyId = companyIdMap.get(companyId);
            if (!databaseCompanyId || price <= 0) continue;
            
            pricesToSave.push({
              budget_item_id: itemId,
              company_id: databaseCompanyId,
              price: price
            });
          }
        }
        
        if (pricesToSave.length > 0) {
          const savedPrices = await budgetPricesService.createPrices(pricesToSave);
          if (!savedPrices) {
            throw new Error("Failed to save prices");
          }
        }
        
        // Commit the transaction
        await supabase.rpc('commit_transaction');
        
        return budgetId;
      } catch (innerError) {
        // Rollback on error
        console.error("Transaction error:", innerError);
        await supabase.rpc('rollback_transaction');
        throw innerError;
      }
    } catch (error) {
      console.error("Error in saveBudgetComparison:", error);
      return null;
    }
  }
};
