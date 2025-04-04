
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

export const budgetComparisonsService = {
  async createBudgetComparison(name: string, projectId?: string, description?: string): Promise<string | null> {
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
          name: name,
          description: description || `Budget comparison for ${name}`,
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
  
  async updateBudgetComparison(id: string, name: string, projectId?: string, description?: string): Promise<boolean> {
    try {
      const updateData: any = {
        name: name,
        project_id: projectId || null
      };
      
      if (description) {
        updateData.description = description;
      }
      
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
  
  async getAllBudgetComparisons(projectId?: string): Promise<BudgetComparisonBasic[]> {
    try {
      let query = supabase
        .from('budget_comparisons')
        .select('id, name, description, project_id, created_at, updated_at');
        
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
      console.error("Error in getAllBudgetComparisons:", error);
      return [];
    }
  }
};
