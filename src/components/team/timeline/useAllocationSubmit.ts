
import { format } from "date-fns"
import { supabase } from "@/integrations/supabase/client"

interface AllocationValues {
  projectId: string
  month: Date
  allocation: string
}

export function useAllocationSubmit(memberId: string, onSuccess: () => Promise<void>) {
  const handleAllocationSubmit = async (values: AllocationValues) => {
    try {
      const { data: existingAssignment, error: assignmentError } = await supabase
        .from("project_assignments")
        .select("id")
        .eq("team_member_id", memberId)
        .eq("project_id", values.projectId)
        .maybeSingle()

      if (assignmentError) throw assignmentError

      let assignmentId: string

      if (existingAssignment) {
        assignmentId = existingAssignment.id
      } else {
        const { data: newAssignment, error: createError } = await supabase
          .from("project_assignments")
          .insert({
            team_member_id: memberId,
            project_id: values.projectId,
            start_date: format(values.month, 'yyyy-MM-dd'),
          })
          .select()
          .single()

        if (createError) throw createError
        assignmentId = newAssignment.id
      }

      const { error: allocationError } = await supabase
        .from("project_member_allocations")
        .insert({
          project_assignment_id: assignmentId,
          month: format(values.month, 'yyyy-MM-dd'),
          allocation_percentage: parseInt(values.allocation),
        })

      if (allocationError) throw allocationError

      await onSuccess()
    } catch (error: any) {
      console.error("Error submitting allocation:", error)
      throw error
    }
  }

  return { handleAllocationSubmit }
}
