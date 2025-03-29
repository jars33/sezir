
import { supabase } from "@/integrations/supabase/client";

export interface Revenue {
  id: string;
  project_id: string;
  month: string;
  amount: number;
  created_at?: string;
  updated_at?: string;
}

export const revenueService = {
  async getProjectRevenues(projectId: string): Promise<Revenue[]> {
    const { data, error } = await supabase
      .from("project_revenues")
      .select("*")
      .eq("project_id", projectId)
      .order("month", { ascending: false });

    if (error) throw error;
    return data;
  },

  async createRevenue(projectId: string, month: string, amount: number): Promise<Revenue> {
    const { data, error } = await supabase
      .from("project_revenues")
      .insert([{
        project_id: projectId,
        month: month,
        amount: amount,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateRevenue(id: string, month: string, amount: number): Promise<Revenue> {
    const { data, error } = await supabase
      .from("project_revenues")
      .update({
        month: month,
        amount: amount,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteRevenue(id: string): Promise<void> {
    const { error } = await supabase
      .from("project_revenues")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }
};
