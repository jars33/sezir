
import { supabase } from "@/integrations/supabase/client";

export const salaryService = {
  /**
   * Add a new salary record
   */
  async addSalary(teamMemberId: string, amount: number, startDate: string, endDate: string | null): Promise<any> {
    const { data, error } = await supabase
      .from("salary_history")
      .insert({
        team_member_id: teamMemberId,
        amount: amount,
        start_date: startDate,
        end_date: endDate,
      })
      .select();

    if (error) throw error;
    return data;
  },

  /**
   * Update a salary record
   */
  async updateSalary(salaryId: string, amount: number, startDate: string, endDate: string | null): Promise<any> {
    const { data, error } = await supabase
      .from("salary_history")
      .update({
        amount: amount,
        start_date: startDate,
        end_date: endDate,
      })
      .eq("id", salaryId)
      .select();

    if (error) throw error;
    return data;
  },

  /**
   * Update end date of a salary record
   */
  async updateSalaryEndDate(salaryId: string, endDate: string): Promise<any> {
    const { data, error } = await supabase
      .from("salary_history")
      .update({
        end_date: endDate,
      })
      .eq("id", salaryId)
      .select();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a salary record
   */
  async deleteSalary(salaryId: string): Promise<void> {
    const { error } = await supabase
      .from("salary_history")
      .delete()
      .eq("id", salaryId);

    if (error) throw error;
  }
};
