
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export const allocationService = {
  /**
   * Get allocations for a team member on a project
   */
  async getAllocationsForMember(memberId: string, selectedYear: number): Promise<any[]> {
    const startDate = format(new Date(selectedYear, 0, 1), 'yyyy-MM-dd');
    const endDate = format(new Date(selectedYear, 11, 31), 'yyyy-MM-dd');

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
    return data;
  },

  /**
   * Create allocation for a team member on a project
   */
  async createOrUpdateAssignment(projectId: string, teamMemberId: string, startDate: string): Promise<string> {
    const { data: existingAssignment, error: assignmentError } = await supabase
      .from("project_assignments")
      .select("id")
      .eq("team_member_id", teamMemberId)
      .eq("project_id", projectId)
      .maybeSingle();

    if (assignmentError) throw assignmentError;

    if (existingAssignment) {
      return existingAssignment.id;
    } else {
      const { data: newAssignment, error: createError } = await supabase
        .from("project_assignments")
        .insert({
          team_member_id: teamMemberId,
          project_id: projectId,
          start_date: startDate,
        })
        .select()
        .single();

      if (createError) throw createError;
      if (!newAssignment) throw new Error("Failed to create assignment");
      
      return newAssignment.id;
    }
  },

  /**
   * Create allocation for a team member on a project
   */
  async createAllocation(assignmentId: string, month: string, percentage: number): Promise<any> {
    const { data, error: allocationError } = await supabase
      .from("project_member_allocations")
      .insert({
        project_assignment_id: assignmentId,
        month: month,
        allocation_percentage: percentage,
      })
      .select();

    if (allocationError) throw allocationError;
    return data;
  },

  /**
   * Update allocation for a team member on a project
   */
  async updateAllocation(id: string, percentage: number): Promise<any> {
    const { data, error } = await supabase
      .from("project_member_allocations")
      .update({
        allocation_percentage: percentage,
      })
      .eq("id", id)
      .select();

    if (error) throw error;
    return data;
  },

  /**
   * Delete allocation
   */
  async deleteAllocation(id: string): Promise<void> {
    const { error } = await supabase
      .from("project_member_allocations")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }
};
