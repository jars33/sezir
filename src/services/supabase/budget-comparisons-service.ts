
import { supabase } from "@/integrations/supabase/client";
import { BudgetComparison } from "@/types/budget";

interface BudgetComparisonCreateData {
  name: string;
  description?: string;
  project_id?: string | null;
}

interface BudgetComparisonUpdateData {
  name?: string;
  description?: string;
  project_id?: string | null;
}

export const budgetComparisonsService = {
  /**
   * Creates a new budget comparison record
   */
  async createBudgetComparison(data: BudgetComparisonCreateData): Promise<string | null> {
    try {
      const { data: newBudget, error } = await supabase
        .from('budget_comparisons')
        .insert({
          name: data.name,
          description: data.description || null,
          project_id: data.project_id || null,
          user_id: (await supabase.auth.getUser()).data.user?.id || null
        })
        .select('id')
        .single();
        
      if (error) {
        console.error("Error creating budget comparison:", error);
        return null;
      }
      
      return newBudget?.id || null;
    } catch (error) {
      console.error("Error in createBudgetComparison:", error);
      return null;
    }
  },
  
  /**
   * Updates an existing budget comparison record
   */
  async updateBudgetComparison(id: string, data: BudgetComparisonUpdateData): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('budget_comparisons')
        .update({
          name: data.name,
          description: data.description,
          project_id: data.project_id
        })
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
  
  /**
   * Retrieves all budget comparisons, optionally filtered by project
   */
  async getAllBudgetComparisons(projectId?: string): Promise<BudgetComparison[]> {
    try {
      let query = supabase
        .from('budget_comparisons')
        .select('id, name, description, project_id, created_at, updated_at')
        .order('created_at', { ascending: false });
      
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching budget comparisons:", error);
        return [];
      }
      
      // Map database field names to camelCase
      return (data || []).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        projectId: item.project_id,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));
    } catch (error) {
      console.error("Error in getAllBudgetComparisons:", error);
      return [];
    }
  },
  
  /**
   * Deletes a budget comparison by ID
   */
  async deleteBudgetComparison(id: string): Promise<boolean> {
    try {
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
  }
};
