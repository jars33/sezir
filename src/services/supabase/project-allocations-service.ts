
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export interface TeamMember {
  id: string;
  name: string;
}

export interface ProjectAllocation {
  id: string;
  month: string;
  allocation_percentage: number;
  project_assignments: {
    id: string;
    team_members: {
      id: string;
      name: string;
    }
  }
}

export const projectAllocationsService = {
  async getTeamMembers(): Promise<TeamMember[]> {
    const { data, error } = await supabase
      .from("team_members")
      .select("id, name")
      .eq("left_company", false)
      .order("name");

    if (error) throw error;
    return data;
  },

  async getProjectAllocations(projectId: string, yearStart: string, yearEnd: string): Promise<ProjectAllocation[]> {
    const { data, error } = await supabase
      .from("project_member_allocations")
      .select(`
        id,
        month,
        allocation_percentage,
        project_assignments!inner (
          id,
          project_id,
          team_members!inner (
            id,
            name
          )
        )
      `)
      .eq("project_assignments.project_id", projectId)
      .gte("month", yearStart)
      .lte("month", yearEnd)
      .order("month");

    if (error) throw error;
    return data;
  },

  async getExistingAssignment(projectId: string, teamMemberId: string) {
    const { data, error } = await supabase
      .from("project_assignments")
      .select("id")
      .eq("project_id", projectId)
      .eq("team_member_id", teamMemberId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createAssignment(projectId: string, teamMemberId: string, startDate: Date) {
    const { data, error } = await supabase
      .from("project_assignments")
      .insert({
        project_id: projectId,
        team_member_id: teamMemberId,
        start_date: format(startDate, "yyyy-MM-dd"),
      })
      .select("id")
      .single();

    if (error) throw error;
    if (!data) throw new Error("Failed to create assignment");
    return data;
  },

  async checkExistingAllocation(assignmentId: string, monthStr: string): Promise<{id: string} | null> {
    const { data, error } = await supabase
      .from("project_member_allocations")
      .select("id")
      .eq("project_assignment_id", assignmentId)
      .eq("month", monthStr)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async updateAllocation(id: string, allocationPercentage: number): Promise<void> {
    const { error } = await supabase
      .from("project_member_allocations")
      .update({
        allocation_percentage: allocationPercentage,
      })
      .eq("id", id);

    if (error) throw error;
  },

  async createAllocation(assignmentId: string, monthStr: string, allocationPercentage: number): Promise<void> {
    const { error } = await supabase
      .from("project_member_allocations")
      .insert({
        project_assignment_id: assignmentId,
        month: monthStr,
        allocation_percentage: allocationPercentage,
      });

    if (error) throw error;
  }
};
