
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { ProjectAllocationDialog } from "../../allocations/ProjectAllocationDialog"
import { useManagedTeamMembers } from "@/hooks/use-managed-team-members"
import { allocationService } from "@/services/supabase"
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
      await allocationService.createAllocation(
        projectId,
        values.teamMemberId,
        values.month,
        parseInt(values.allocation)
      );

      toast({
        title: "Success",
        description: "Team member allocation added successfully",
      });
      
      setAllocationDialogOpen(false);
      setSelectedAllocation(null);
      
      await refetchTimelineData();
    } catch (error: any) {
      console.error("Error managing allocation:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
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
