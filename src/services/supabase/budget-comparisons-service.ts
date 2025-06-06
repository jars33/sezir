
import { supabase } from "@/integrations/supabase/client";
import { BudgetComparison } from "@/types/budget";

export interface BudgetComparisonBasic {
  id: string;
  description?: string;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

export const budgetComparisonsService = {
  async createBudgetComparison(description: string, projectId?: string): Promise<string | null> {
    try {
      // Get the current authenticated user's ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("User not authenticated");
        return null;
      }
      
      const { data, error } = await supabase
        .from('budget_comparisons')
        .insert({
          description: description || `Budget comparison`,
          project_id: projectId,
          user_id: user.id
        })
        .select('id')
        .single();

      if (error || !data) {
        console.error("Error creating budget comparison:", error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error("Error in createBudgetComparison:", error);
      return null;
    }
  },
  
  async updateBudgetComparison(id: string, description: string, projectId?: string): Promise<boolean> {
    try {
      const updateData: any = {
        description: description,
        project_id: projectId || null
      };
      
      const { error } = await supabase
        .from('budget_comparisons')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error("Error updating budget comparison:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in updateBudgetComparison:", error);
      return false;
    }
  },
  
  async deleteBudgetComparison(id: string): Promise<boolean> {
    try {
      // First delete related data from budget_prices, budget_items, and budget_companies
      // Get budget item IDs that belong to this comparison
      const { data: budgetItems, error: itemsError } = await supabase
        .from('budget_items')
        .select('id')
        .eq('budget_comparison_id', id);
      
      if (itemsError) {
        console.error("Error getting budget items:", itemsError);
        return false;
      }
      
      // Extract item IDs into an array
      const itemIds = (budgetItems || []).map(item => item.id);
      
      // Delete prices related to these items if there are any items
      if (itemIds.length > 0) {
        const { error: pricesError } = await supabase
          .from('budget_prices')
          .delete()
          .in('budget_item_id', itemIds);
        
        if (pricesError) {
          console.error("Error deleting budget prices:", pricesError);
          return false;
        }
      }
      
      // Delete budget items
      const { error: itemsDeleteError } = await supabase
        .from('budget_items')
        .delete()
        .eq('budget_comparison_id', id);
      
      if (itemsDeleteError) {
        console.error("Error deleting budget items:", itemsDeleteError);
        return false;
      }
      
      // Delete budget companies
      const { error: companiesError } = await supabase
        .from('budget_companies')
        .delete()
        .eq('budget_comparison_id', id);
      
      if (companiesError) {
        console.error("Error deleting budget companies:", companiesError);
        return false;
      }
      
      // Finally, delete the budget comparison itself
      const { error } = await supabase
        .from('budget_comparisons')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Error deleting budget comparison:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error in deleteBudgetComparison:", error);
      return false;
    }
  },
  
  async getAllBudgetComparisons(projectId?: string): Promise<BudgetComparisonBasic[]> {
    try {
      let query = supabase
        .from('budget_comparisons')
        .select('id, description, project_id, created_at, updated_at');
        
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      
      const { data, error } = await query.order('updated_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching budget comparisons:", error);
        return [];
      }
      
      return (data || []).map(item => ({
        id: item.id,
        description: item.description || undefined,
        projectId: item.project_id || undefined,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));
    } catch (error) {
      console.error("Error in getAllBudgetComparisons:", error);
      return [];
    }
  }
};
