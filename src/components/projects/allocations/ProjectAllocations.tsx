
import { useState } from "react"
import { addMonths, format, startOfMonth, setMonth, getYear } from "date-fns"
import { Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProjectAllocationDialog } from "./ProjectAllocationDialog"
import { useToast } from "@/hooks/use-toast"

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
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedAllocation, setSelectedAllocation] = useState<AllocationData | null>(null)
  const { toast } = useToast()
  const [startDate, setStartDate] = useState(() => {
    const now = new Date()
    return new Date(getYear(now), 0, 1)
  })

  const { data: teamMembers } = useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("id, name")
        .eq("left_company", false)
        .order("name")

      if (error) throw error
      return data
    },
  })

  const { data: allocations, refetch: refetchAllocations } = useQuery({
    queryKey: ["project-allocations", projectId, "with-salaries", format(startDate, 'yyyy')],
    queryFn: async () => {
      const yearStart = format(startDate, 'yyyy-01-01')
      const yearEnd = format(startDate, 'yyyy-12-31')

      console.log('Fetching allocations for period:', yearStart, 'to', yearEnd)

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
        .gte("month", yearStart)
        .lte("month", yearEnd)
        .order("month")

      if (error) {
        console.error('Error fetching allocations:', error)
        throw error
      }

      console.log('Fetched allocations:', data)
      return data
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

      let assignmentId: string;

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

      await refetchAllocations()
      setDialogOpen(false)
      setSelectedAllocation(null)
    } catch (error: any) {
      console.error("Error managing allocation:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
    }
  }

  const handlePreviousYear = () => {
    const newDate = new Date(getYear(startDate) - 1, 0, 1)
    setStartDate(newDate)
  }

  const handleNextYear = () => {
    const newDate = new Date(getYear(startDate) + 1, 0, 1)
    setStartDate(newDate)
  }

  const handleAllocationClick = (allocation: AllocationData) => {
    setSelectedAllocation(allocation)
    setDialogOpen(true)
  }

  const months = Array.from({ length: 12 }, (_, i) => {
    return new Date(getYear(startDate), i, 1)
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Project Allocations</CardTitle>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handlePreviousYear}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="px-2 py-1 font-medium">
              {format(startDate, 'yyyy')}
            </div>
            <Button variant="outline" size="icon" onClick={handleNextYear}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button 
            variant="outline"
            size="sm"
            className="hover:bg-blue-50 hover:text-blue-600"
            onClick={() => {
              setSelectedAllocation(null)
              setDialogOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Allocation
          </Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="min-w-[1200px]">
          <div className="grid grid-cols-12 gap-px bg-gray-200 rounded-lg overflow-hidden">
            {months.map((month) => {
              const monthStr = format(month, "yyyy-MM")
              const monthAllocations = allocations?.filter(allocation => {
                if (!allocation?.project_assignments?.team_members) return false
                return format(new Date(allocation.month), "yyyy-MM") === monthStr
              }) || []

              return (
                <div key={month.getTime()} className="bg-white p-4 min-h-[250px] flex flex-col">
                  <div className="text-sm font-medium mb-4">
                    {format(month, "MMM yyyy")}
                  </div>
                  <div className="flex-1 space-y-2">
                    {monthAllocations.map((allocation) => (
                      <div
                        key={allocation.id}
                        onClick={() => handleAllocationClick(allocation)}
                        className="p-2 bg-blue-50 border border-blue-100 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                      >
                        <div className="text-sm font-medium">
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
