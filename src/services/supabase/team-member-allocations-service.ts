
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import type { AllocationData } from "@/components/team/timeline/types";

export const teamMemberAllocationsService = {
  async getTeamMemberAllocations(memberId: string, startDate: string, endDate: string): Promise<AllocationData[]> {
    const { data, error } = await supabase
      .from("project_member_allocations")
      .select(`
        id,
        month,
        allocation_percentage,
        project_assignments!inner (
          project:projects(
            id,
            name,
            number
          )
        )
      `)
      .eq("project_assignments.team_member_id", memberId)
      .gte("month", startDate)
      .lte("month", endDate)
      .order("month");

    if (error) throw error;

    return data.map(allocation => ({
      id: allocation.id,
      month: allocation.month,
      allocation_percentage: allocation.allocation_percentage,
      project: allocation.project_assignments.project
    })) as AllocationData[];
  },

  async createAssignment(
    memberId: string, 
    projectId: string, 
    startDate: Date
  ): Promise<string> {
    try {
      // First check if the assignment already exists
      const { data: existingAssignment, error: assignmentError } = await supabase
        .from("project_assignments")
        .select("id")
        .eq("team_member_id", memberId)
        .eq("project_id", projectId)
        .maybeSingle();

      if (assignmentError) {
        console.error("Error checking for existing assignment:", assignmentError);
        throw assignmentError;
      }

      if (existingAssignment) {
        return existingAssignment.id;
      } else {
        // Get the user's ID to check for authorization
        const { data: userData } = await supabase.auth.getUser();
        
        if (!userData || !userData.user) {
          throw new Error("User not authenticated");
        }

        // Get the project details to verify ownership
        const { data: project, error: projectError } = await supabase
          .from("projects")
          .select("user_id")
          .eq("id", projectId)
          .single();
          
        if (projectError) {
          console.error("Error fetching project details:", projectError);
          throw projectError;
        }
        
        // Create new assignment 
        const { data: newAssignment, error: createError } = await supabase
          .from("project_assignments")
          .insert({
            team_member_id: memberId,
            project_id: projectId,
            start_date: format(startDate, 'yyyy-MM-dd'),
          })
          .select()
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
        
        return newAssignment.id;
      }
    } catch (error) {
      console.error("Error in createAssignment:", error);
      throw error;
    }
  },

  async createAllocation(
    assignmentId: string,
    month: Date, 
    allocationPercentage: number
  ): Promise<any> {
    try {
      const monthStr = format(month, 'yyyy-MM-dd');
      
      // Check if an allocation already exists for this month and assignment
      const { data: existingAllocation, error: checkError } = await supabase
        .from("project_member_allocations")
        .select("id")
        .eq("project_assignment_id", assignmentId)
        .eq("month", monthStr)
        .maybeSingle();
        
      if (checkError) {
        console.error("Error checking for existing allocation:", checkError);
        throw checkError;
      }
      
      if (existingAllocation) {
        // Update existing allocation
        const { data, error: updateError } = await supabase
          .from("project_member_allocations")
          .update({ allocation_percentage: allocationPercentage })
          .eq("id", existingAllocation.id)
          .select();
          
        if (updateError) {
          console.error("Error updating allocation:", updateError);
          if (updateError.message.includes("policy")) {
            throw new Error("Permission error: You don't have access to update this allocation.");
          }
          throw updateError;
        }
        
        return data;
      } else {
        // Create new allocation
        const { data, error: allocationError } = await supabase
          .from("project_member_allocations")
          .insert({
            project_assignment_id: assignmentId,
            month: format(month, 'yyyy-MM-dd'),
            allocation_percentage: allocationPercentage,
          })
          .select();

        if (allocationError) {
          console.error("Error creating allocation:", allocationError);
          if (allocationError.message.includes("policy")) {
            throw new Error("Permission error: You don't have access to create this allocation.");
          }
          throw allocationError;
        }
        
        return data;
      }
    } catch (error) {
      console.error("Error in createAllocation:", error);
      throw error;
    }
  }
};
