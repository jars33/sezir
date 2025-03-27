
import { format } from "date-fns"
import { useProjectSettings } from "@/hooks/use-project-settings"
import { useGanttCalculations } from "./useGanttCalculations"

interface Project {
  id: string
  number: string
  name: string
  status: "planned" | "in_progress" | "completed" | "cancelled"
  start_date: string | null
  end_date: string | null
}

interface GanttTimelineProps {
  projects: Project[]
  months: Date[]
  year: number
  onProjectClick: (project: Project) => void
  currentDatePosition: number | null
}

export function GanttTimeline({ 
  projects, 
  months, 
  year, 
  onProjectClick, 
  currentDatePosition 
}: GanttTimelineProps) {
  const { getStatusColor, calculateProjectBar } = useGanttCalculations(year)

  return (
    <div className="pl-2 h-full">
      {/* Months header */}
      <div className="grid grid-cols-12 mb-2">
        {months.map((month) => (
          <div key={month.getTime()} className="text-sm font-medium px-1 text-center bg-gray-100 dark:bg-gray-800 dark:text-gray-200 py-2 rounded-t-md">
            {format(month, 'MMM')}
          </div>
        ))}
      </div>

      {/* Timeline with current date indicator */}
      <div className="relative">
        {/* Current date vertical line */}
        {currentDatePosition !== null && (
          <div 
            className="absolute top-0 bottom-0 w-px bg-red-500 z-10"
            style={{ 
              left: `${currentDatePosition}%`,
              height: `${Math.max(500, projects.length * 40 + 50)}px`
            }}
          >
            <div className="absolute top-0 -translate-x-1/2 bg-red-500 text-white text-xs px-1 rounded">
              Today
            </div>
          </div>
        )}

        {/* Project timeline bars - aligned with names */}
        {projects.map((project) => {
          const { offset, width } = calculateProjectBar(project)
          return (
            <div key={project.id} className="h-10 relative">
              {/* Align the bars with the project names */}
              <div 
                className={`absolute rounded h-6 top-1/2 -translate-y-1/2 ${getStatusColor(project.status)} cursor-pointer opacity-80 hover:opacity-100`}
                style={{ 
                  left: `${offset}%`, 
                  width: `${width}%`
                }}
                onClick={() => onProjectClick(project)}
              >
                <div className="px-2 text-xs text-white truncate h-full flex items-center font-medium">
                  {project.number} - {project.name}
                </div>
              </div>
            </div>
          )
        })}
        {projects.length === 0 && (
          <div className="h-40 flex items-center justify-center text-gray-500 dark:text-gray-400">
            No projects found for {year}
          </div>
        )}
      </div>
    </div>
  )
}
