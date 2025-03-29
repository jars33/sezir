
import { supabase } from "@/integrations/supabase/client";

export const variableCostService = {
  /**
   * Get all variable costs for a project
   */
  async getProjectVariableCosts(projectId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from("project_variable_costs")
      .select("*")
      .eq("project_id", projectId);

    if (error) throw error;
    return data;
  },

  /**
   * Create a new variable cost
   */
  async createVariableCost(projectId: string, month: string, amount: number, description: string | null): Promise<any> {
    const { data, error } = await supabase
      .from("project_variable_costs")
      .insert({
        project_id: projectId,
        month: month,
        amount: amount,
        description: description
      })
      .select();

    if (error) throw error;
    return data;
  },

  /**
   * Update a variable cost
   */
  async updateVariableCost(id: string, month: string, amount: number, description: string | null): Promise<any> {
    const { data, error } = await supabase
      .from("project_variable_costs")
      .update({
        month: month,
        amount: amount,
        description: description
      })
      .eq('id', id)
      .select();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a variable cost
   */
  async deleteVariableCost(id: string): Promise<void> {
    const { error } = await supabase
      .from("project_variable_costs")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }
};
