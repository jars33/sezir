
import { useToast } from "@/hooks/use-toast"
import { ProjectAllocationDialog } from "../../allocations/ProjectAllocationDialog"
import { useManagedTeamMembers } from "@/hooks/use-managed-team-members"
import { allocationService } from "@/services/supabase"
import { useTranslation } from "react-i18next"
import { useState } from "react"
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
  const { t } = useTranslation()
  const { data: teamMembers = [] } = useManagedTeamMembers()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAllocationSubmit = async (values: {
    teamMemberId: string
    month: Date
    allocation: string
  }) => {
    if (isSubmitting) return
    
    setIsSubmitting(true)
    
    try {
      await allocationService.createAllocation(
        projectId,
        values.teamMemberId,
        values.month,
        parseInt(values.allocation)
      )

      toast({
        title: t('common.success'),
        description: t('team.allocation.added', 'Team member allocation added successfully'),
      })
      
      setAllocationDialogOpen(false)
      setSelectedAllocation(null)
      
      await refetchTimelineData()
    } catch (error: any) {
      console.error("Error managing allocation:", error)
      
      // Provide more specific error messages based on the error
      if (error.message?.includes("Permission error")) {
        toast({
          variant: "destructive",
          title: t('common.error'),
          description: error.message,
        })
      } else {
        toast({
          variant: "destructive",
          title: t('common.error'),
          description: error.message || t('team.allocation.error', 'Failed to add allocation'),
        })
      }
    } finally {
      setIsSubmitting(false)
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
