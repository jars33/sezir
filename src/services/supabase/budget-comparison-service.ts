import { BudgetComparisonItem, Company, BudgetComparison } from "@/types/budget";
import { budgetComparisonsService } from "./budget-comparisons-service";
import { budgetCompaniesService } from "./budget-companies-service";
import { budgetItemsService } from "./budget-items-service";
import { budgetPricesService } from "./budget-prices-service";
import { supabase } from "@/integrations/supabase/client";

export interface BudgetComparisonData {
  companies: Company[];
  items: BudgetComparisonItem[];
}

export const budgetComparisonService = {
  async saveBudgetComparison(name: string, data: BudgetComparisonData, projectId?: string): Promise<string | null> {
    try {
      // 1. Create the budget comparison
      const budgetId = await budgetComparisonsService.createBudgetComparison(name, projectId);
      if (!budgetId) return null;
      
      // 2. Create companies - only if there are companies to create
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
      const companyNameToIdMap = new Map();
      if (insertedCompanies && insertedCompanies.length > 0) {
        insertedCompanies.forEach(company => {
          companyNameToIdMap.set(company.name, company.id);
        });
      }

      // 3. Create budget items - only if there are items to create
      if (data.items.length > 0) {
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
          return budgetId; // Still return the budgetId to allow for updating later
        }
        
        // Create a mapping between item codes and their new IDs
        const itemCodeToIdMap = new Map();
        insertedItems.forEach(item => {
          itemCodeToIdMap.set(item.code, item.id);
        });
        
        // 4. Create price entries - only if there are prices to create
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
        
        if (pricesToInsert.length > 0) {
          const pricesCreated = await budgetPricesService.createPrices(pricesToInsert);
          if (!pricesCreated) {
            console.error("Error creating prices");
            // Continue anyway, as we have created the main budget entities
          }
        }
      }
      
      return budgetId;
    } catch (error) {
      console.error("Error in saveBudgetComparison:", error);
      return null;
    }
  },
  
  async getBudgetComparisons(projectId?: string): Promise<BudgetComparison[]> {
    return budgetComparisonsService.getAllBudgetComparisons(projectId);
  },
  
  async getBudgetComparison(id: string): Promise<BudgetComparisonData | null> {
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
      
      // 4. Organize prices by item and company
      const itemPrices: Record<string, Record<string, number>> = {};
      
      prices.forEach(priceEntry => {
        const itemId = priceEntry.budget_item_id;
        const companyId = priceEntry.company_id;
        const price = priceEntry.price;
        
        if (!itemPrices[itemId]) {
          itemPrices[itemId] = {};
        }
        
        itemPrices[itemId][companyId] = price;
      });
      
      // 5. Create BudgetComparisonItem objects with stats
      const budgetItems: BudgetComparisonItem[] = items.map(item => {
        // Get prices for this item
        const prices = itemPrices[item.id] || {};
        
        // Calculate stats
        const priceValues = Object.values(prices).filter(p => p > 0);
        const lowestPrice = priceValues.length > 0 ? Math.min(...priceValues) : 0;
        const sortedPrices = [...priceValues].sort((a, b) => a - b);
        const middlePrice = sortedPrices.length > 0 
          ? sortedPrices[Math.floor(sortedPrices.length / 2)] 
          : 0;
        const averagePrice = priceValues.length > 0 
          ? priceValues.reduce((sum, p) => sum + p, 0) / priceValues.length 
          : 0;
          
        let standardDeviation = 0;
        if (priceValues.length > 1) {
          const variance = priceValues.reduce((sum, price) => 
            sum + Math.pow(price - averagePrice, 2), 0) / priceValues.length;
          standardDeviation = Math.sqrt(variance);
        }
        
        return {
          id: item.id,
          code: item.code,
          description: item.description,
          isCategory: item.item_type === 'category',
          parentId: undefined, // Handle parent-child relationship if needed
          prices,
          observations: item.observations || undefined,
          lowestPrice,
          middlePrice,
          averagePrice,
          standardDeviation
        };
      });
      
      return {
        companies: companies.map(c => ({ id: c.id, name: c.name })),
        items: budgetItems
      };
    } catch (error) {
      console.error("Error in getBudgetComparison:", error);
      return null;
    }
  },

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
