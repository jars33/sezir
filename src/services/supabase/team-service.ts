
import { supabase } from "@/integrations/supabase/client";
import type { TeamMember, SalaryHistory } from "@/types/team-member";

export const teamService = {
  /**
   * Get a team member by ID
   */
  async getTeamMember(id: string): Promise<TeamMember | null> {
    if (!id || id === 'new') return null;
    
    const { data, error } = await supabase
      .from("team_members")
      .select()
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data as TeamMember | null;
  },

  /**
   * Get salary history for a team member
   */
  async getSalaryHistory(id: string): Promise<SalaryHistory[]> {
    if (!id || id === 'new') return [];
    
    const { data, error } = await supabase
      .from("salary_history")
      .select()
      .eq("team_member_id", id)
      .order("start_date", { ascending: false });

    if (error) throw error;
    return data as SalaryHistory[];
  },

  /**
   * Get all team members
   */
  async getAllTeamMembers(): Promise<TeamMember[]> {
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    return data as TeamMember[];
  }
};
