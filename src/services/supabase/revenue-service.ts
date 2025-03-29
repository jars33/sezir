
import { supabase } from "@/integrations/supabase/client";

export const revenueService = {
  /**
   * Get all revenues for a project
   */
  async getProjectRevenues(projectId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from("project_revenues")
      .select("*")
      .eq("project_id", projectId)
      .order("month", { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Check if a revenue exists for a month
   */
  async checkExistingRevenue(projectId: string, month: string): Promise<any> {
    const { data, error } = await supabase
      .from("project_revenues")
      .select("*")
      .eq("project_id", projectId)
      .eq("month", month)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Create a new revenue
   */
  async createRevenue(projectId: string, month: string, amount: number): Promise<any> {
    const { data, error } = await supabase
      .from("project_revenues")
      .insert([{
        project_id: projectId,
        month: month,
        amount: amount,
      }])
      .select();

    if (error) throw error;
    return data;
  },

  /**
   * Update a revenue
   */
  async updateRevenue(id: string, month: string, amount: number): Promise<any> {
    const { data, error } = await supabase
      .from("project_revenues")
      .update({
        month: month,
        amount: amount,
      })
      .eq("id", id)
      .select();

    if (error) throw error;
    return data;
  },

  /**
   * Update a revenue amount only
   */
  async updateRevenueAmount(id: string, amount: number): Promise<any> {
    const { data, error } = await supabase
      .from("project_revenues")
      .update({ amount: amount })
      .eq("id", id)
      .select();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a revenue
   */
  async deleteRevenue(id: string): Promise<void> {
    const { error } = await supabase
      .from("project_revenues")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }
};
