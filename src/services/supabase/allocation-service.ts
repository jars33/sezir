
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
    // Query the project_member_allocations directly with joins instead of using RPC
    const { data, error } = await supabase
      .from("project_member_allocations")
      .select(`
        id,
        month,
        allocation_percentage,
        project_assignments!inner (
          id,
          team_members!inner (
            id,
            name
          )
        )
      `)
      .eq("project_assignments.project_id", projectId)
      .order("month");

    if (error) throw error;
    
    // Transform the data to match the expected AllocationWithSalary format
    // This is a simplified version without actual salary cost calculation
    return data.map(item => ({
      id: item.id,
      month: item.month,
      allocation_percentage: item.allocation_percentage,
      team_member_id: item.project_assignments.team_members.id,
      team_member_name: item.project_assignments.team_members.name,
      project_assignment_id: item.project_assignments.id,
      salary_cost: 0 // Default to 0 as we don't have the salary calculation logic here
    }));
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
        await this.createAllocationRecord(assignmentId, monthStr, allocationPercentage);
      }
    }
  },

  async createAllocationRecord(assignmentId: string, monthStr: string, allocationPercentage: number): Promise<void> {
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
  },

  async createAllocation(
    projectId: string,
    teamMemberId: string,
    month: Date,
    allocationPercentage: number
  ): Promise<void> {
    try {
      const existingAssignment = await this.getExistingAssignment(
        projectId, 
        teamMemberId
      );
      
      let assignmentId: string;
      
      if (existingAssignment) {
        assignmentId = existingAssignment.id;
      } else {
        const newAssignment = await this.createAssignment(
          projectId,
          teamMemberId,
          month
        );
        assignmentId = newAssignment.id;
      }
      
      const monthStr = format(month, "yyyy-MM-dd");
      await this.updateAllocation(assignmentId, month, allocationPercentage);
      
    } catch (error) {
      console.error("Error creating allocation:", error);
      throw error;
    }
  }
};
