
import { supabase } from "@/integrations/supabase/client";

export interface VariableCost {
  id: string;
  project_id: string;
  month: string;
  amount: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export const variableCostService = {
  async getProjectVariableCosts(projectId: string): Promise<VariableCost[]> {
    const { data, error } = await supabase
      .from("project_variable_costs")
      .select("*")
      .eq("project_id", projectId)
      .order("month");

    if (error) throw error;
    return data;
  },

  async createVariableCost(
    projectId: string, 
    month: string, 
    amount: number, 
    description: string
  ): Promise<VariableCost> {
    const { data, error } = await supabase
      .from("project_variable_costs")
      .insert({
        project_id: projectId,
        month: month,
        amount: amount,
        description: description
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateVariableCost(
    id: string, 
    month: string, 
    amount: number, 
    description: string
  ): Promise<VariableCost> {
    const { data, error } = await supabase
      .from("project_variable_costs")
      .update({
        month: month,
        amount: amount,
        description: description
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteVariableCost(id: string): Promise<void> {
    const { error } = await supabase
      .from("project_variable_costs")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }
};
