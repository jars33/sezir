
import { supabase } from "@/integrations/supabase/client";

export interface BudgetItem {
  id: string;
  code: string;
  description: string;
  item_type: 'category' | 'item';
  observations?: string;
}

export const budgetItemsService = {
  async createItems(budgetComparisonId: string, items: { 
    code: string, 
    description: string, 
    isCategory: boolean,
    observations?: string 
  }[]): Promise<BudgetItem[] | null> {
    try {
      const itemsToInsert = items.map(item => ({
        code: item.code,
        description: item.description,
        item_type: item.isCategory ? 'category' : 'item' as 'category' | 'item',
        budget_comparison_id: budgetComparisonId,
        observations: item.observations
      }));

      const { data, error } = await supabase
        .from('budget_items')
        .insert(itemsToInsert)
        .select('id, code, description, item_type, observations');
        
      if (error || !data) {
        console.error("Error creating budget items:", error);
        return null;
      }
      
      return data as any[];
    } catch (error) {
      console.error("Error in createItems:", error);
      return null;
    }
  },
  
  async getItemsByBudgetId(budgetComparisonId: string): Promise<BudgetItem[] | null> {
    try {
      const { data, error } = await supabase
        .from('budget_items')
        .select('id, code, description, item_type, observations')
        .eq('budget_comparison_id', budgetComparisonId)
        .order('code', { ascending: true });
        
      if (error) {
        console.error("Error fetching budget items:", error);
        return null;
      }
      
      return data as any[];
    } catch (error) {
      console.error("Error in getItemsByBudgetId:", error);
      return null;
    }
  }
};
