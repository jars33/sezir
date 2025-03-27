
import { useState, useMemo } from "react"
import { format } from "date-fns"
import { Card } from "@/components/ui/card"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { useProjectYear } from "@/hooks/use-project-year"
import { ProjectStatusFilter } from "./filters/ProjectStatusFilter"
import { YearSelector } from "./YearSelector"
import { GanttProjectList } from "./gantt/GanttProjectList"
import { GanttTimeline } from "./gantt/GanttTimeline"
import { useGanttCalculations } from "./gantt/useGanttCalculations"

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
  
  // Generate array of months for display (full year - 12 months)
  const months = useMemo(() => 
    Array.from({ length: 12 }, (_, i) => new Date(year, i, 1)),
    [year]
  )

  const { 
    filterProjectsByDateRange,
    calculateCurrentDatePosition
  } = useGanttCalculations(year)

  // Get current date position for timeline indicator
  const currentDatePosition = calculateCurrentDatePosition()

  // Apply filters to projects
  const filteredProjects = useMemo(() => {
    const dateFilteredProjects = filterProjectsByDateRange(projects)
    
    // Apply status filter if any are selected
    if (statusFilter.length === 0) {
      return dateFilteredProjects
    }
    
    return dateFilteredProjects.filter(project => 
      statusFilter.includes(project.status)
    )
  }, [projects, filterProjectsByDateRange, statusFilter])

  // Sort projects by start date
  const sortedProjects = useMemo(() => 
    [...filteredProjects].sort((a, b) => {
      const dateA = a.start_date ? new Date(a.start_date) : new Date()
      const dateB = b.start_date ? new Date(b.start_date) : new Date()
      return dateA.getTime() - dateB.getTime()
    }), 
    [filteredProjects]
  )

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          Timeline
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
          <GanttProjectList 
            projects={sortedProjects} 
            onProjectClick={onProjectClick} 
          />
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        {/* Gantt chart panel - 70% width */}
        <ResizablePanel defaultSize={70}>
          <GanttTimeline 
            projects={sortedProjects}
            months={months}
            year={year}
            onProjectClick={onProjectClick}
            currentDatePosition={currentDatePosition}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </Card>
  )
}
