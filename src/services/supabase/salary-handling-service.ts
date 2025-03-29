
import { supabase } from "@/integrations/supabase/client";
import type { SalaryHistory } from "@/types/team-member";

export const salaryHandlingService = {
  async addSalary(
    teamMemberId: string,
    amount: number,
    startDate: string,
    endDate: string | null
  ): Promise<void> {
    const { error } = await supabase
      .from("salary_history")
      .insert({
        team_member_id: teamMemberId,
        amount: amount,
        start_date: startDate,
        end_date: endDate,
      });

    if (error) throw error;
  },

  async updateSalary(
    salaryId: string,
    amount: number,
    startDate: string,
    endDate: string | null
  ): Promise<void> {
    const { error } = await supabase
      .from("salary_history")
      .update({
        amount: amount,
        start_date: startDate,
        end_date: endDate || null,
      })
      .eq("id", salaryId);

    if (error) throw error;
  },

  async deleteSalary(salaryId: string): Promise<void> {
    const { error } = await supabase
      .from("salary_history")
      .delete()
      .eq("id", salaryId);

    if (error) throw error;
  },

  async updateSalaryEndDate(salaryId: string, endDate: string): Promise<void> {
    const { error } = await supabase
      .from("salary_history")
      .update({
        end_date: endDate,
      })
      .eq("id", salaryId);

    if (error) throw error;
  }
};
