
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export interface TeamMember {
  id: string;
  name: string;
}

export interface AllocationWithSalary {
  id: string;
  month: string;
  allocation_percentage: number;
  team_member_id: string;
  team_member_name: string;
  project_assignment_id: string;
  salary_cost: number;
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

export const allocationService = {
  async getTeamMembers(): Promise<TeamMember[]> {
    const { data, error } = await supabase
      .from("team_members")
      .select("id, name")
      .eq("left_company", false)
      .order("name");

    if (error) throw error;
    return data;
  },

  async getProjectAllocations(projectId: string): Promise<AllocationWithSalary[]> {
    const { data, error } = await supabase
      .rpc("get_project_allocations_with_salaries", {
        p_project_id: projectId
      })
      .order("month");

    if (error) throw error;
    return data as AllocationWithSalary[];
  },

  async getExistingAssignment(projectId: string, teamMemberId: string): Promise<{id: string} | null> {
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

  async updateAllocation(
    assignmentId: string, 
    month: Date, 
    allocationPercentage: number,
    allocationId?: string
  ): Promise<void> {
    const monthStr = format(month, "yyyy-MM-dd");
    
    if (allocationId) {
      // If we have an allocation ID, directly update it
      const { error } = await supabase
        .from("project_member_allocations")
        .update({
          month: monthStr,
          allocation_percentage: allocationPercentage,
        })
        .eq("id", allocationId);

      if (error) throw error;
    } else {
      // Check if allocation exists first
      const existingAllocation = await this.checkExistingAllocation(assignmentId, monthStr);
      
      if (existingAllocation) {
        const { error } = await supabase
          .from("project_member_allocations")
          .update({
            allocation_percentage: allocationPercentage,
          })
          .eq("id", existingAllocation.id);

        if (error) throw error;
      } else {
        await this.createAllocation(assignmentId, monthStr, allocationPercentage);
      }
    }
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
  },
  
  async deleteAllocation(id: string): Promise<void> {
    const { error } = await supabase
      .from("project_member_allocations")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }
};
