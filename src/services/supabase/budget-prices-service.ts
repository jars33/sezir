
import { supabase } from "@/integrations/supabase/client";

export interface BudgetPrice {
  budget_item_id: string;
  company_id: string;
  price: number;
}

export const budgetPricesService = {
  async createPrices(prices: BudgetPrice[]): Promise<boolean> {
    try {
      if (prices.length === 0) return true;
      
      const { error } = await supabase
        .from('budget_prices')
        .insert(prices);
          
      if (error) {
        console.error("Error creating prices:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error in createPrices:", error);
      return false;
    }
  },
  
  async getPricesByBudgetId(budgetComparisonId: string): Promise<BudgetPrice[] | null> {
    try {
      const { data, error } = await supabase
        .from('budget_prices')
        .select(`
          price,
          company_id,
          budget_item_id,
          budget_items!inner(id, budget_comparison_id)
        `)
        .eq('budget_items.budget_comparison_id', budgetComparisonId);
        
      if (error) {
        console.error("Error fetching prices:", error);
        return null;
      }
      
      return data as any[];
    } catch (error) {
      console.error("Error in getPricesByBudgetId:", error);
      return null;
    }
  }
};
