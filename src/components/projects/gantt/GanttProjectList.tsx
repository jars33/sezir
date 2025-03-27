
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

interface Project {
  id: string
  number: string
  name: string
  status: "planned" | "in_progress" | "completed" | "cancelled"
  start_date: string | null
  end_date: string | null
}

interface GanttProjectListProps {
  projects: Project[]
  onProjectClick: (project: Project) => void
}

export function GanttProjectList({ projects, onProjectClick }: GanttProjectListProps) {
  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "planned":
        return "bg-yellow-500"
      case "in_progress":
        return "bg-blue-500"
      case "completed":
        return "bg-green-500"
      case "cancelled":
        return "bg-gray-500"
      default:
        return "bg-gray-300"
    }
  }

  return (
    <div className="pr-2 border-r h-full">
      <div className="font-medium py-2 px-2 bg-gray-100 rounded-t-md mb-2">
        Projects
      </div>
      <div className="space-y-1">
        {projects.map((project) => (
          <div 
            key={project.id}
            className="pl-2 py-1 text-sm cursor-pointer hover:bg-gray-100 rounded"
            onClick={() => onProjectClick(project)}
          >
            <div className="font-medium">{project.number} - {project.name}</div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={`${getStatusColor(project.status)} text-white text-xs`}>
                {project.status.replace('_', ' ')}
              </Badge>
              <span className="text-xs text-gray-500">
                {project.start_date ? format(new Date(project.start_date), 'MMM d, yyyy') : 'No date'} 
                {project.end_date ? ` - ${format(new Date(project.end_date), 'MMM d, yyyy')}` : ''}
              </span>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No projects found
          </div>
        )}
      </div>
    </div>
  )
}
