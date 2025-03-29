import { useState } from "react"
import { format, startOfMonth, setMonth, getYear } from "date-fns"
import { PlusCircle } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProjectAllocationDialog } from "./ProjectAllocationDialog"
import { useToast } from "@/hooks/use-toast"
import { useProjectYear } from "@/hooks/use-project-year"
import { useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { teamMembersService, ServiceTeamMember } from "@/services/supabase"

interface ProjectAllocationsProps {
  projectId: string
}

interface AllocationData {
  id: string
  month: string
  allocation_percentage: number
  project_assignments: {
    id: string
    team_members: {
      id: string
      name: string
    }
  }
}

export function ProjectAllocations({ projectId }: ProjectAllocationsProps) {
  const { t } = useTranslation()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedAllocation, setSelectedAllocation] = useState<AllocationData | null>(null)
  const { toast } = useToast()
  const { year, setYear } = useProjectYear()
  const [startDate, setStartDate] = useState(() => new Date(year, 0, 1))
  const queryClient = useQueryClient()

  const getMonthKey = (month: Date) => {
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
    return monthNames[month.getMonth()]
  }

  const { data: teamMembers } = useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      return teamMembersService.getTeamMembers();
    },
  })

  const { data: allocations } = useQuery({
    queryKey: ["project-allocations", projectId, year],
    queryFn: async () => {
      const yearStart = format(startDate, 'yyyy-01-01')
      const yearEnd = format(startDate, 'yyyy-12-31')

      console.log('Fetching allocations for period:', yearStart, 'to', yearEnd)
      console.log('Project ID:', projectId)

      const { data, error } = await supabase
        .from("project_member_allocations")
        .select(`
          id,
          month,
          allocation_percentage,
          project_assignments!inner (
            id,
            project_id,
            team_members!inner (
              id,
              name
            )
          )
        `)
        .eq("project_assignments.project_id", projectId)
        .gte("month", yearStart)
        .lte("month", yearEnd)
        .order("month")

      if (error) {
        console.error('Error fetching allocations:', error)
        throw error
      }

      console.log('Fetched allocations:', data)
      return data as AllocationData[]
    },
  })

  const handleAddAllocation = async (values: {
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

      const monthStr = format(startOfMonth(values.month), "yyyy-MM-dd")

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
          title: t('common.success'),
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
          title: t('common.success'),
          description: "Team member allocation added successfully",
        })
      }

      queryClient.invalidateQueries({ queryKey: ["project-allocations"] })
      setDialogOpen(false)
      setSelectedAllocation(null)
    } catch (error: any) {
      console.error("Error managing allocation:", error)
      toast({
        variant: "destructive",
        title: t('common.error'),
        description: error.message,
      })
    }
  }

  const handleAllocationClick = (allocation: AllocationData) => {
    setSelectedAllocation(allocation)
    setDialogOpen(true)
  }

  const months = Array.from({ length: 12 }, (_, i) => {
    return new Date(year, i, 1)
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Allocations</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="min-w-[1200px]">
          <div className="grid grid-cols-12 gap-px bg-gray-200 rounded-lg overflow-hidden">
            {months.map((month) => {
              const monthStr = format(month, "yyyy-MM")
              const monthAllocations = allocations?.filter(allocation => 
                format(new Date(allocation.month), "yyyy-MM") === monthStr
              ) || []

              return (
                <div key={month.getTime()} className="bg-white p-2 min-h-[250px] flex flex-col">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <div className="text-sm font-medium">
                      {t(`common.months.${getMonthKey(month)}`)} {month.getFullYear()}
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    {monthAllocations.map((allocation) => (
                      <div
                        key={allocation.id}
                        onClick={() => handleAllocationClick(allocation)}
                        className="p-2 min-h-[50px] bg-blue-50 border border-blue-100 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                      >
                        <div className="text-sm font-medium text-center">
                          {allocation.project_assignments.team_members.name}
                        </div>
                        <div className="text-xs text-gray-600 text-center">
                          {allocation.allocation_percentage}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
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
