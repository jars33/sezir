
import { useState } from "react"
import { format, addMonths, differenceInCalendarMonths, startOfMonth, endOfMonth, isWithinInterval, isBefore, isAfter } from "date-fns"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { useProjectYear } from "@/hooks/use-project-year"
import { ProjectStatusFilter } from "./filters/ProjectStatusFilter"
import { YearSelector } from "./YearSelector"

interface Project {
  id: string
  number: string
  name: string
  status: "planned" | "in_progress" | "completed" | "cancelled"
  start_date: string | null
  end_date: string | null
}

interface GanttChartViewProps {
  projects: Project[]
  onProjectClick: (project: Project) => void
}

export function GanttChartView({ projects, onProjectClick }: GanttChartViewProps) {
  const { year, setYear } = useProjectYear()
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  
  // Create date objects for the start and end of the selected year
  const yearStart = new Date(year, 0, 1) // January 1st
  const yearEnd = new Date(year, 11, 31) // December 31st
  
  // Get current date for the timeline indicator
  const currentDate = new Date()
  
  // Generate array of months for display (full year - 12 months)
  const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1))

  // Calculate current date position as percentage of year (for vertical line)
  const getCurrentDatePosition = () => {
    // If current date is not in the selected year, don't show the line
    if (currentDate.getFullYear() !== year) return null;
    
    // Calculate days passed in the year as percentage of total days in year
    const startOfYear = new Date(year, 0, 1);
    const daysInYear = 365 + (year % 4 === 0 ? 1 : 0); // Account for leap years
    const daysPassed = differenceInCalendarMonths(currentDate, startOfYear) * 30 + 
                      currentDate.getDate() - 1;
    
    return (daysPassed / daysInYear) * 100;
  }

  // Apply filters to projects
  const filteredProjects = projects.filter(project => {
    // Filter by date range (must fall within or overlap with selected year)
    if (!project.start_date) return false;
    
    const projectStart = new Date(project.start_date);
    const projectEnd = project.end_date ? new Date(project.end_date) : null;
    
    const dateInRange = (
      // Either starts in this year
      isWithinInterval(projectStart, { start: yearStart, end: yearEnd }) ||
      // Or started earlier but ends in or after this year
      (isBefore(projectStart, yearStart) && (!projectEnd || isAfter(projectEnd, yearStart)))
    );
    
    // Filter by status if any status filters are selected
    const statusMatch = statusFilter.length === 0 || statusFilter.includes(project.status);
    
    return dateInRange && statusMatch;
  });

  // Sort projects by start date
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    const dateA = a.start_date ? new Date(a.start_date) : new Date()
    const dateB = b.start_date ? new Date(b.start_date) : new Date()
    return dateA.getTime() - dateB.getTime()
  })

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

  // Calculate the position and width of a project bar
  const calculateProjectBar = (project: Project) => {
    if (!project.start_date) return { offset: 0, width: 0 }
    
    const projectStart = new Date(project.start_date)
    const projectEnd = project.end_date ? new Date(project.end_date) : addMonths(projectStart, 1)
    
    // Calculate how many months from the start of the year
    const startOffset = Math.max(
      0, 
      differenceInCalendarMonths(
        isBefore(projectStart, yearStart) ? yearStart : projectStart, 
        yearStart
      )
    )
    
    // Calculate project duration in months (capped at end of year)
    const endDate = isAfter(projectEnd, yearEnd) ? yearEnd : projectEnd
    const duration = Math.max(
      1, 
      differenceInCalendarMonths(endDate, isBefore(projectStart, yearStart) ? yearStart : projectStart) + 1
    )

    return {
      offset: startOffset / 12 * 100, // as percentage of year
      width: duration / 12 * 100      // as percentage of year
    }
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          Project Timeline - {year}
        </h2>
        <div className="flex items-center gap-4">
          <ProjectStatusFilter 
            selectedStatuses={statusFilter}
            onChange={setStatusFilter}
          />
          <YearSelector year={year} onChange={setYear} />
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal" className="min-h-[500px]">
        {/* Project info panel - 30% width */}
        <ResizablePanel defaultSize={30} minSize={20}>
          <div className="pr-2 border-r h-full">
            <div className="font-medium py-2 px-2 bg-gray-100 rounded-t-md mb-2">
              Projects
            </div>
            <div className="space-y-1">
              {sortedProjects.map((project) => (
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
              {sortedProjects.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No projects found for {year}
                </div>
              )}
            </div>
          </div>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        {/* Gantt chart panel - 70% width */}
        <ResizablePanel defaultSize={70}>
          <div className="pl-2 h-full">
            {/* Months header */}
            <div className="grid grid-cols-12 mb-2">
              {months.map((month) => (
                <div key={month.getTime()} className="text-sm font-medium px-1 text-center bg-gray-100 py-2 rounded-t-md">
                  {format(month, 'MMM')}
                </div>
              ))}
            </div>

            {/* Timeline with current date indicator */}
            <div className="relative">
              {/* Current date vertical line */}
              {getCurrentDatePosition() !== null && (
                <div 
                  className="absolute top-0 bottom-0 w-px bg-red-500 z-10"
                  style={{ 
                    left: `${getCurrentDatePosition()}%`,
                    height: `${Math.max(500, sortedProjects.length * 40 + 10)}px`
                  }}
                >
                  <div className="absolute top-0 -translate-x-1/2 bg-red-500 text-white text-xs px-1 rounded">
                    Today
                  </div>
                </div>
              )}

              {/* Project timeline bars - aligned with names */}
              {sortedProjects.map((project, index) => {
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
                      <div className="px-2 text-xs text-white truncate h-full flex items-center">
                        {project.number} - {project.name}
                      </div>
                    </div>
                  </div>
                )
              })}
              {sortedProjects.length === 0 && (
                <div className="h-40 flex items-center justify-center text-gray-500">
                  No projects found for {year}
                </div>
              )}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </Card>
  )
}
