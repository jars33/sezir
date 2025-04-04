
import { BudgetComparisonData } from "./budget-utils/types";
import { budgetComparisonsService } from "./budget-comparisons-service";
import { budgetCompaniesService } from "./budget-companies-service";
import { budgetItemsService } from "./budget-items-service";
import { budgetPricesService } from "./budget-prices-service";

/**
 * Service for saving budget comparison data
 */
export const budgetSaveService = {
  /**
   * Saves a budget comparison (creates new or updates existing)
   */
  async saveBudgetComparison(
    name: string, 
    data: BudgetComparisonData, 
    projectId?: string, 
    existingBudgetId?: string
  ): Promise<string | null> {
    try {
      let budgetId: string;

      // Check if we're updating an existing budget or creating a new one
      if (existingBudgetId) {
        // Update the existing budget name and project
        const updated = await budgetComparisonsService.updateBudgetComparison(
          existingBudgetId, 
          name, 
          projectId
        );
        
        if (!updated) {
          console.error("Failed to update budget comparison");
          return null;
        }
        
        budgetId = existingBudgetId;

        // First, delete existing companies, items and prices
        await budgetCompaniesService.deleteCompaniesByBudgetId(budgetId);
        await budgetItemsService.deleteItemsByBudgetId(budgetId);
        // Prices will be deleted cascade through items
      } else {
        // Create a new budget comparison
        budgetId = await budgetComparisonsService.createBudgetComparison(name, projectId);
        if (!budgetId) return null;
      }
      
      // Create companies - only if there are companies to create
      const insertedCompanies = data.companies.length > 0 
        ? await budgetCompaniesService.createCompanies(
            budgetId, 
            data.companies.map(company => ({ name: company.name }))
          )
        : [];
      
      if (data.companies.length > 0 && !insertedCompanies) {
        console.error("Failed to create companies");
        return budgetId; // Still return the budgetId to allow for updating later
      }
      
      // Create a mapping between company names and their new IDs
      const companyNameToIdMap = this._createCompanyNameToIdMap(insertedCompanies);
      
      // Create budget items and prices if needed
      if (data.items.length > 0) {
        await this._processItems(budgetId, data, companyNameToIdMap);
      }
      
      return budgetId;
    } catch (error) {
      console.error("Error in saveBudgetComparison:", error);
      return null;
    }
  },
  
  /**
   * Creates a mapping from company names to their IDs
   */
  _createCompanyNameToIdMap(insertedCompanies: any[] | null): Map<string, string> {
    const companyNameToIdMap = new Map<string, string>();
    
    if (insertedCompanies && insertedCompanies.length > 0) {
      insertedCompanies.forEach(company => {
        companyNameToIdMap.set(company.name, company.id);
      });
    }
    
    return companyNameToIdMap;
  },
  
  /**
   * Processes items and their prices
   */
  async _processItems(
    budgetId: string, 
    data: BudgetComparisonData, 
    companyNameToIdMap: Map<string, string>
  ): Promise<void> {
    // Create budget items
    const insertedItems = await budgetItemsService.createItems(
      budgetId,
      data.items.map(item => ({
        code: item.code,
        description: item.description,
        isCategory: item.isCategory,
        observations: item.observations
      }))
    );
    
    if (!insertedItems) {
      console.error("Failed to create budget items");
      return;
    }
    
    // Create a mapping between item codes and their new IDs
    const itemCodeToIdMap = new Map<string, string>();
    insertedItems.forEach(item => {
      itemCodeToIdMap.set(item.code, item.id);
    });
    
    // Create price entries
    const pricesToInsert = this._preparePricesForInsertion(
      data, 
      itemCodeToIdMap, 
      companyNameToIdMap
    );
    
    if (pricesToInsert.length > 0) {
      const pricesCreated = await budgetPricesService.createPrices(pricesToInsert);
      if (!pricesCreated) {
        console.error("Error creating prices");
        // Continue anyway, as we have created the main budget entities
      }
    }
  },
  
  /**
   * Prepares price data for insertion
   */
  _preparePricesForInsertion(
    data: BudgetComparisonData, 
    itemCodeToIdMap: Map<string, string>, 
    companyNameToIdMap: Map<string, string>
  ): { budget_item_id: string, company_id: string, price: number }[] {
    const pricesToInsert: { budget_item_id: string, company_id: string, price: number }[] = [];
    
    for (const item of data.items) {
      const itemId = itemCodeToIdMap.get(item.code);
      if (!itemId) continue;
      
      // Add prices for each company
      for (const [companyId, price] of Object.entries(item.prices)) {
        const company = data.companies.find(c => c.id === companyId);
        if (!company) continue;
        
        const newCompanyId = companyNameToIdMap.get(company.name);
        if (!newCompanyId) continue;
        
        if (price > 0) {
          pricesToInsert.push({
            budget_item_id: itemId,
            company_id: newCompanyId,
            price: price
          });
        }
      }
    }
    
    return pricesToInsert;
  }
};
