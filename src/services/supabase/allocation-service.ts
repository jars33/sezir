
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export interface Allocation {
  id: string;
  project_assignment_id: string;
  month: string;
  allocation_percentage: number;
  created_at?: string;
  updated_at?: string;
}

export interface AllocationWithDetails extends Allocation {
  team_member_name: string;
  team_member_id: string;
  salary_cost: number;
}

export const allocationService = {
  async getProjectAllocations(projectId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from("project_member_allocations")
      .select(`
        id,
        month,
        allocation_percentage,
        project_assignment_id,
        project_assignments!inner (
          id,
          team_members!inner (
            id,
            name
          )
        )
      `)
      .eq("project_assignments.project_id", projectId);

    if (error) throw error;

    // For each allocation, get the valid salary for that month
    const allocationsWithSalaries = await Promise.all(
      (data || []).map(async (allocation) => {
        const { data: salaryData } = await supabase
          .from("salary_history")
          .select("amount")
          .eq("team_member_id", allocation.project_assignments.team_members.id)
          .lte("start_date", allocation.month)
          .or(`end_date.is.null,end_date.gte.${allocation.month}`)
          .order("start_date", { ascending: false })
          .maybeSingle();

        // If no salary data is found or there's an error, use 0 as the salary
        const monthlySalary = salaryData?.amount || 0;
        const salary_cost = (monthlySalary * allocation.allocation_percentage) / 100;

        return {
          id: allocation.id,
          month: allocation.month,
          allocation_percentage: allocation.allocation_percentage,
          team_member_name: allocation.project_assignments.team_members.name,
          team_member_id: allocation.project_assignments.team_members.id,
          project_assignment_id: allocation.project_assignment_id,
          salary_cost
        };
      })
    );

    return allocationsWithSalaries;
  },

  async createAllocation(
    projectId: string,
    teamMemberId: string,
    month: Date,
    allocationPercentage: number
  ): Promise<Allocation> {
    try {
      // Check if there's an existing assignment for this team member and project
      const { data: existingAssignment, error: assignmentError } = await supabase
        .from("project_assignments")
        .select("id")
        .eq("project_id", projectId)
        .eq("team_member_id", teamMemberId)
        .maybeSingle();

      if (assignmentError) {
        console.error("Error checking existing assignment:", assignmentError);
        throw new Error(`Assignment check failed: ${assignmentError.message}`);
      }

      let assignmentId: string;

      if (!existingAssignment) {
        // If there's no existing assignment, create one
        const { data: newAssignment, error: createError } = await supabase
          .from("project_assignments")
          .insert({
            project_id: projectId,
            team_member_id: teamMemberId,
            start_date: format(month, "yyyy-MM-dd"),
          })
          .select("id")
          .single();

        if (createError) {
          console.error("Error creating assignment:", createError);
          if (createError.message.includes("policy")) {
            throw new Error("Permission error: You don't have access to create this assignment.");
          }
          throw createError;
        }
        
        if (!newAssignment) {
          throw new Error("Failed to create assignment");
        }
        
        assignmentId = newAssignment.id;
      } else {
        assignmentId = existingAssignment.id;
      }

      const monthStr = format(month, "yyyy-MM-dd");

      // Check if there's an existing allocation for this assignment and month
      const { data: existingAllocation, error: checkError } = await supabase
        .from("project_member_allocations")
        .select("id")
        .eq("project_assignment_id", assignmentId)
        .eq("month", monthStr)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking existing allocation:", checkError);
        throw new Error(`Allocation check failed: ${checkError.message}`);
      }

      if (existingAllocation) {
        // Update existing allocation
        const { data: updatedAllocation, error: updateError } = await supabase
          .from("project_member_allocations")
          .update({ allocation_percentage: allocationPercentage })
          .eq("id", existingAllocation.id)
          .select()
          .single();

        if (updateError) {
          console.error("Error updating allocation:", updateError);
          if (updateError.message.includes("policy")) {
            throw new Error("Permission error: You don't have access to update this allocation.");
          }
          throw updateError;
        }
        
        return updatedAllocation;
      } else {
        // Create new allocation
        const { data, error } = await supabase
          .from("project_member_allocations")
          .insert({
            project_assignment_id: assignmentId,
            month: monthStr,
            allocation_percentage: allocationPercentage,
          })
          .select()
          .single();

        if (error) {
          console.error("Error creating allocation:", error);
          if (error.message.includes("policy")) {
            throw new Error("Permission error: You don't have access to create this allocation.");
          }
          throw error;
        }
        
        return data;
      }
    } catch (error) {
      console.error("Error in createAllocation:", error);
      throw error;
    }
  },

  async updateAllocation(
    id: string, 
    allocationPercentage: number
  ): Promise<Allocation> {
    const { data, error } = await supabase
      .from("project_member_allocations")
      .update({
        allocation_percentage: allocationPercentage,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.message.includes("policy")) {
        throw new Error("Permission error: You don't have access to update this allocation.");
      }
      throw error;
    }
    
    return data;
  },

  async deleteAllocation(id: string): Promise<void> {
    const { error } = await supabase
      .from("project_member_allocations")
      .delete()
      .eq("id", id);

    if (error) {
      if (error.message.includes("policy")) {
        throw new Error("Permission error: You don't have access to delete this allocation.");
      }
      throw error;
    }
  }
};
