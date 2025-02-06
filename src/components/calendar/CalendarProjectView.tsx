
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { isSameDay } from "date-fns"
import { supabase } from "@/integrations/supabase/client"
import type { Database } from "@/integrations/supabase/types"

type Project = {
  id: string
  number: string
  name: string
  status: "planned" | "in_progress" | "completed" | "cancelled"
  start_date: string | null
  end_date: string | null
}

type ProjectAssignment = Database["public"]["Tables"]["project_assignments"]["Row"] & {
  team_member: {
    name: string
  }
}

interface CalendarProjectViewProps {
  date: Date
  projects: Project[]
}

export function CalendarProjectView({ date, projects }: CalendarProjectViewProps) {
  const statusColors = {
    planned: "bg-yellow-100 text-yellow-800",
    in_progress: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  }

  const { data: assignments } = useQuery({
    queryKey: ["project-assignments", date],
    queryFn: async () => {
      const formattedDate = date.toISOString().split("T")[0]
      const { data, error } = await supabase
        .from("project_assignments")
        .select(`
          id,
          project_id,
          team_member_id,
          start_date,
          end_date,
          team_member:team_members(name)
        `)
        .lte("start_date", formattedDate)
        .or(`end_date.is.null,end_date.gte.${formattedDate}`)

      if (error) throw error
      return (data || []) as ProjectAssignment[]
    },
  })

  const filteredProjects = projects.filter((project) => {
    if (!project.start_date) return false
    return isSameDay(new Date(project.start_date), date)
  })

  if (filteredProjects.length === 0) {
    return (
      <Card className="p-4">
        <p className="text-muted-foreground">No projects starting on this date.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {filteredProjects.map((project) => {
        const projectAssignments = assignments?.filter(
          (a) => a.project_id === project.id
        )

        return (
          <Card key={project.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{project.name}</p>
                <p className="text-sm text-muted-foreground">#{project.number}</p>
                {projectAssignments && projectAssignments.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-600">Assigned team members:</p>
                    <ul className="mt-1 space-y-1">
                      {projectAssignments.map((assignment) => (
                        <li key={assignment.id} className="text-sm text-gray-600">
                          {assignment.team_member.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <Badge variant="secondary" className={statusColors[project.status]}>
                {project.status.replace("_", " ")}
              </Badge>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
