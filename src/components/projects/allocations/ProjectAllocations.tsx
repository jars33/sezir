
import { format, startOfMonth } from "date-fns"
import { Plus } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProjectAllocationDialog } from "./ProjectAllocationDialog"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface ProjectAllocationsProps {
  projectId: string
}

export function ProjectAllocations({ projectId }: ProjectAllocationsProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()

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
    queryKey: ["project-allocations", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_member_allocations")
        .select(`
          id,
          month,
          allocation_percentage,
          project_assignments!inner (
            team_members!inner (
              id,
              name
            )
          )
        `)
        .eq("project_assignments.project_id", projectId)
        .order("month")

      if (error) throw error
      return data
    },
  })

  const handleAddAllocation = async (values: {
    teamMemberId: string
    month: Date
    allocation: string
  }) => {
    try {
      // First, ensure we have a project assignment
      const { data: existingAssignment, error: assignmentError } = await supabase
        .from("project_assignments")
        .select("id")
        .eq("project_id", projectId)
        .eq("team_member_id", values.teamMemberId)
        .single()

      let assignmentId: string;

      if (assignmentError) {
        // Create new assignment if it doesn't exist
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
        if (!existingAssignment) throw new Error("Failed to get existing assignment")
        assignmentId = existingAssignment.id
      }

      // Format the month as a string in YYYY-MM-DD format
      const monthStr = format(startOfMonth(values.month), "yyyy-MM-dd")

      // Add allocation using the assignment ID
      const { error: allocationError } = await supabase
        .from("project_member_allocations")
        .insert({
          project_assignment_id: assignmentId,
          month: monthStr,
          allocation_percentage: parseInt(values.allocation),
        })

      if (allocationError) throw allocationError

      await refetchAllocations()
      setDialogOpen(false)
      toast({
        title: "Success",
        description: "Team member allocation added successfully",
      })
    } catch (error: any) {
      console.error("Error adding allocation:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Team Allocations</CardTitle>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Allocation
        </Button>
      </CardHeader>
      <CardContent>
        {allocations && allocations.length > 0 ? (
          <div className="space-y-4">
            {allocations.map((allocation) => {
              // Ensure we have the required nested data
              if (!allocation.project_assignments?.team_members) {
                return null
              }
              
              return (
                <div
                  key={allocation.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {allocation.project_assignments.team_members.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(allocation.month), "MMMM yyyy")}
                    </p>
                  </div>
                  <div>
                    <span className="text-lg font-semibold">
                      {allocation.allocation_percentage}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-muted-foreground">No allocations yet</p>
        )}
      </CardContent>

      <ProjectAllocationDialog
        projectId={projectId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleAddAllocation}
        teamMembers={teamMembers || []}
      />
    </Card>
  )
}
