
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { isSameDay } from "date-fns"

type Project = {
  id: string
  number: string
  name: string
  status: "planned" | "in_progress" | "completed" | "cancelled"
  start_date: string | null
  end_date: string | null
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
      {filteredProjects.map((project) => (
        <Card key={project.id} className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">{project.name}</p>
              <p className="text-sm text-muted-foreground">#{project.number}</p>
            </div>
            <Badge variant="secondary" className={statusColors[project.status]}>
              {project.status.replace("_", " ")}
            </Badge>
          </div>
        </Card>
      ))}
    </div>
  )
}
