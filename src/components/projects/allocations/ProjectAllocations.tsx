
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProjectAllocationDialog } from "./ProjectAllocationDialog"
import { useProjectYear } from "@/hooks/use-project-year"
import { teamMembersService } from "@/services/supabase"
import { projectAllocationsService } from "@/services/supabase/project-allocations-service"
import { AllocationsGrid } from "./AllocationsGrid"
import { useAllocations } from "./useAllocations"
import { format } from "date-fns"

interface ProjectAllocationsProps {
  projectId: string
}

export function ProjectAllocations({ projectId }: ProjectAllocationsProps) {
  const { year } = useProjectYear()
  const startDate = new Date(year, 0, 1)
  
  const { 
    selectedAllocation,
    dialogOpen,
    setDialogOpen,
    handleAllocationClick,
    handleAddAllocation
  } = useAllocations(projectId)

  const { data: teamMembers } = useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      return teamMembersService.getTeamMembers()
    },
  })

  const { data: allocations } = useQuery({
    queryKey: ["project-allocations", projectId, year],
    queryFn: async () => {
      const yearStart = format(startDate, 'yyyy-01-01')
      const yearEnd = format(startDate, 'yyyy-12-31')

      console.log('Fetching allocations for period:', yearStart, 'to', yearEnd)
      console.log('Project ID:', projectId)

      return projectAllocationsService.getProjectAllocations(projectId, yearStart, yearEnd)
    },
  })

  const months = Array.from({ length: 12 }, (_, i) => {
    return new Date(year, i, 1)
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Allocations</CardTitle>
      </CardHeader>
      <CardContent>
        <AllocationsGrid 
          months={months}
          allocations={allocations || []}
          onAllocationClick={handleAllocationClick}
        />
      </CardContent>

      <ProjectAllocationDialog
        projectId={projectId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleAddAllocation}
        teamMembers={teamMembers || []}
        initialAllocation={selectedAllocation ? {
          id: selectedAllocation.id,
          teamMemberId: selectedAllocation.project_assignments.team_members.id,
          month: new Date(selectedAllocation.month),
          allocation: selectedAllocation.allocation_percentage.toString(),
        } : undefined}
      />
    </Card>
  )
}
