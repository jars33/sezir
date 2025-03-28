
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "react-i18next"

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
  const { t } = useTranslation();
  
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

  const getStatusTranslation = (status: string) => {
    switch (status) {
      case "planned": return t('project.planned')
      case "in_progress": return t('project.inProgress')
      case "completed": return t('project.completed')
      case "cancelled": return t('project.cancelled')
      default: return status
    }
  }

  return (
    <div className="pr-2 border-r h-full dark:border-gray-700">
      <div className="font-medium py-2 px-2 bg-gray-100 dark:bg-gray-800 dark:text-gray-200 rounded-t-md mb-2">
        {t('common.projects')}
      </div>
      <div className="space-y-1">
        {projects.map((project) => (
          <div 
            key={project.id}
            className="pl-2 py-1 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            onClick={() => onProjectClick(project)}
          >
            <div className="font-medium dark:text-gray-100">{project.number} - {project.name}</div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={`${getStatusColor(project.status)} text-white text-xs`}>
                {getStatusTranslation(project.status)}
              </Badge>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {project.start_date ? format(new Date(project.start_date), 'MMM d, yyyy') : 'No date'} 
                {project.end_date ? ` - ${format(new Date(project.end_date), 'MMM d, yyyy')}` : ''}
              </span>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            {t('common.noProjectsFound')}
          </div>
        )}
      </div>
    </div>
  )
}
