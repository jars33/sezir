
import { supabase } from "@/integrations/supabase/client";
import { BudgetComparison } from "@/types/budget";

export interface BudgetComparisonBasic {
  id: string;
  name: string;
  description?: string;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

export const budgetComparisonService = {
  async getBudgetComparisons(projectId?: string): Promise<BudgetComparisonBasic[]> {
    try {
      // Get the current authenticated user's ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("User not authenticated");
        return [];
      }
      
      let query = supabase
        .from('budget_comparisons')
        .select('id, name, description, project_id, created_at, updated_at')
        .eq('user_id', user.id);
        
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
        name: item.name,
        description: item.description || undefined,
        projectId: item.project_id || undefined,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));
    } catch (error) {
      console.error("Error in getBudgetComparisons:", error);
      return [];
    }
  },

  async getBudgetComparison(id: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('budget_comparisons')
        .select('data')
        .eq('id', id)
        .single();
        
      if (error || !data) {
        console.error("Error fetching budget comparison:", error);
        return null;
      }
      
      return data.data;
    } catch (error) {
      console.error("Error in getBudgetComparison:", error);
      return null;
    }
  },
  
  async saveBudgetComparison(name: string, data: any, projectId?: string): Promise<string | null> {
    try {
      // Get the current authenticated user's ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("User not authenticated");
        return null;
      }
      
      const { data: insertData, error } = await supabase
        .from('budget_comparisons')
        .insert({
          name,
          data,
          project_id: projectId,
          user_id: user.id
        })
        .select('id')
        .single();

      if (error || !insertData) {
        console.error("Error saving budget comparison:", error);
        return null;
      }

      return insertData.id;
    } catch (error) {
      console.error("Error in saveBudgetComparison:", error);
      return null;
    }
  }
};
