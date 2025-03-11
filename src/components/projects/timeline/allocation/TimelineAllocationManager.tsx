
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { ProjectAllocationDialog } from "../../allocations/ProjectAllocationDialog"
import { useManagedTeamMembers } from "@/hooks/use-managed-team-members"
import type { AllocationItem } from "../actions/types"

interface TimelineAllocationManagerProps {
  projectId: string
  selectedAllocation: AllocationItem | null
  allocationDialogOpen: boolean
  setAllocationDialogOpen: (open: boolean) => void
  setSelectedAllocation: (allocation: AllocationItem | null) => void
  refetchTimelineData: () => Promise<void>
}

export function TimelineAllocationManager({
  projectId,
  selectedAllocation,
  allocationDialogOpen,
  setAllocationDialogOpen,
  setSelectedAllocation,
  refetchTimelineData
}: TimelineAllocationManagerProps) {
  const { toast } = useToast()
  const { data: teamMembers = [] } = useManagedTeamMembers()

  const handleAllocationSubmit = async (values: {
    teamMemberId: string
    month: Date
    allocation: string
  }) => {
    try {
      const { data: existingAssignment, error: assignmentError } = await supabase
        .from("project_assignments")
        .select("id")
        .eq("project_id", projectId)
        .eq("team_member_id", values.teamMemberId)
        .maybeSingle()

      let assignmentId: string

      if (!existingAssignment) {
        const { data: newAssignment, error: createError } = await supabase
          .from("project_assignments")
          .insert({
            project_id: projectId,
            team_member_id: values.teamMemberId,
            start_date: format(values.month, "yyyy-MM-dd"),
          })
          .select("id")
          .single()

        if (createError) throw createError
        if (!newAssignment) throw new Error("Failed to create assignment")
        
        assignmentId = newAssignment.id
      } else {
        assignmentId = existingAssignment.id
      }

      const monthStr = format(new Date(values.month), "yyyy-MM-dd")

      const { data: existingAllocation, error: checkError } = await supabase
        .from("project_member_allocations")
        .select("id")
        .eq("project_assignment_id", assignmentId)
        .eq("month", monthStr)
        .maybeSingle()

      if (checkError) throw checkError

      if (existingAllocation) {
        const { error: updateError } = await supabase
          .from("project_member_allocations")
          .update({
            allocation_percentage: parseInt(values.allocation),
          })
          .eq("id", existingAllocation.id)

        if (updateError) throw updateError

        toast({
          title: "Success",
          description: "Team member allocation updated successfully",
        })
      } else {
        const { error: insertError } = await supabase
          .from("project_member_allocations")
          .insert({
            project_assignment_id: assignmentId,
            month: monthStr,
            allocation_percentage: parseInt(values.allocation),
          })

        if (insertError) throw insertError

        toast({
          title: "Success",
          description: "Team member allocation added successfully",
        })
      }

      setAllocationDialogOpen(false)
      setSelectedAllocation(null)
      
      await refetchTimelineData()
    } catch (error: any) {
      console.error("Error managing allocation:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
    }
  }

  // Extract simplified team members list for the dropdown
  const teamMembersList = teamMembers.map(member => ({
    id: member.id,
    name: member.name
  }))

  return (
    <ProjectAllocationDialog
      projectId={projectId}
      open={allocationDialogOpen}
      onOpenChange={setAllocationDialogOpen}
      onSubmit={handleAllocationSubmit}
      teamMembers={teamMembersList}
      initialAllocation={selectedAllocation ? {
        id: selectedAllocation.id,
        teamMemberId: selectedAllocation.team_member_id,
        month: new Date(selectedAllocation.month),
        allocation: selectedAllocation.allocation_percentage.toString(),
      } : undefined}
    />
  )
}
