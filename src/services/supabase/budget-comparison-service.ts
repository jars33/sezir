
import { supabase } from "@/integrations/supabase/client";
import { BudgetState, Company, BudgetComparisonItem, BudgetComparison } from "@/types/budget";

export interface BudgetComparisonData {
  companies: Company[];
  items: BudgetComparisonItem[];
}

export const budgetComparisonService = {
  async saveBudgetComparison(name: string, data: BudgetComparisonData): Promise<string | null> {
    try {
      // 1. Create the budget comparison
      const { data: budgetComparison, error: budgetError } = await supabase
        .from('budget_comparisons')
        .insert({
          name: name,
          description: `Budget comparison for ${name}`
        })
        .select('id')
        .single();

      if (budgetError || !budgetComparison) {
        console.error("Error creating budget comparison:", budgetError);
        return null;
      }

      const budgetId = budgetComparison.id;
      
      // 2. Create companies
      const companiesToInsert = data.companies.map(company => ({
        name: company.name,
        budget_comparison_id: budgetId
      }));
      
      const { data: insertedCompanies, error: companiesError } = await supabase
        .from('budget_companies')
        .insert(companiesToInsert)
        .select('id, name');
        
      if (companiesError || !insertedCompanies) {
        console.error("Error creating companies:", companiesError);
        return null;
      }
      
      // Create a mapping between company names and their new IDs
      const companyNameToIdMap = new Map();
      (insertedCompanies as any[]).forEach((company: any) => {
        companyNameToIdMap.set(company.name, company.id);
      });

      // 3. Create budget items (considering parent-child relationships)
      const itemsToInsert = data.items.map(item => ({
        code: item.code,
        description: item.description,
        item_type: item.isCategory ? 'category' : 'item' as 'category' | 'item',
        budget_comparison_id: budgetId,
        observations: item.observations
      }));

      const { data: insertedItems, error: itemsError } = await supabase
        .from('budget_items')
        .insert(itemsToInsert)
        .select('id, code');
        
      if (itemsError || !insertedItems) {
        console.error("Error creating budget items:", itemsError);
        return null;
      }
      
      // Create a mapping between item codes and their new IDs
      const itemCodeToIdMap = new Map();
      (insertedItems as any[]).forEach((item: any) => {
        itemCodeToIdMap.set(item.code, item.id);
      });
      
      // 4. Create price entries
      const pricesToInsert = [];
      
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
        const { error: pricesError } = await supabase
          .from('budget_prices')
          .insert(pricesToInsert);
          
        if (pricesError) {
          console.error("Error creating prices:", pricesError);
          return null;
        }
      }
      
      return budgetId;
    } catch (error) {
      console.error("Error in saveBudgetComparison:", error);
      return null;
    }
  },
  
  async getBudgetComparisons(): Promise<BudgetComparison[]> {
    const { data, error } = await supabase
      .from('budget_comparisons')
      .select('id, name, description, created_at, updated_at')
      .order('updated_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching budget comparisons:", error);
      return [];
    }
    
    return (data as any[]).map(item => ({
      id: item.id,
      name: item.name,
      description: item.description || undefined,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  },
  
  async getBudgetComparison(id: string): Promise<BudgetComparisonData | null> {
    try {
      // 1. Get companies for this budget comparison
      const { data: companiesData, error: companiesError } = await supabase
        .from('budget_companies')
        .select('id, name')
        .eq('budget_comparison_id', id);
        
      if (companiesError) {
        console.error("Error fetching companies:", companiesError);
        return null;
      }
      
      const companies: Company[] = (companiesData as any[]).map(company => ({
        id: company.id,
        name: company.name
      }));
      
      // 2. Get budget items for this comparison
      const { data: itemsData, error: itemsError } = await supabase
        .from('budget_items')
        .select('id, code, description, item_type, observations')
        .eq('budget_comparison_id', id)
        .order('code', { ascending: true });
        
      if (itemsError) {
        console.error("Error fetching budget items:", itemsError);
        return null;
      }
      
      // 3. Get all prices for this budget comparison
      const { data: pricesData, error: pricesError } = await supabase
        .from('budget_prices')
        .select(`
          price,
          company_id,
          budget_item_id,
          budget_items!inner(id, budget_comparison_id)
        `)
        .eq('budget_items.budget_comparison_id', id);
        
      if (pricesError) {
        console.error("Error fetching prices:", pricesError);
        return null;
      }
      
      // 4. Organize prices by item and company
      const itemPrices: Record<string, Record<string, number>> = {};
      
      (pricesData as any[]).forEach(priceEntry => {
        const itemId = priceEntry.budget_item_id;
        const companyId = priceEntry.company_id;
        const price = priceEntry.price;
        
        if (!itemPrices[itemId]) {
          itemPrices[itemId] = {};
        }
        
        itemPrices[itemId][companyId] = price;
      });
      
      // 5. Create BudgetComparisonItem objects with stats
      const items: BudgetComparisonItem[] = (itemsData as any[]).map(item => {
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
        companies,
        items
      };
    } catch (error) {
      console.error("Error in getBudgetComparison:", error);
      return null;
    }
  }
};
