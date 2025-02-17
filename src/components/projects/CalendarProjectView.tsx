
import { useState } from "react"
import { addMonths, format, startOfMonth, subMonths } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface Project {
  id: string
  number: string
  name: string
  status: "planned" | "in_progress" | "completed" | "cancelled"
  start_date: string | null
  end_date: string | null
}

interface CalendarProjectViewProps {
  projects: Project[]
  onProjectClick: (project: Project) => void
}

export function CalendarProjectView({ projects, onProjectClick }: CalendarProjectViewProps) {
  const [currentDate, setCurrentDate] = useState(() => startOfMonth(new Date()))

  // Generate array of months for display (current month + 5 months)
  const months = Array.from({ length: 6 }, (_, i) => addMonths(currentDate, i))

  const handlePreviousMonth = () => {
    setCurrentDate(prevDate => subMonths(prevDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, 1))
  }

  const getProjectsForMonth = (month: Date) => {
    return projects.filter(project => {
      if (!project.start_date) return false
      const startDate = new Date(project.start_date)
      const endDate = project.end_date ? new Date(project.end_date) : null
      const monthStart = startOfMonth(month)
      const monthEnd = addMonths(monthStart, 1)

      return (
        (startDate <= monthEnd && (!endDate || endDate >= monthStart))
      )
    })
  }

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "planned":
        return "border-yellow-500"
      case "in_progress":
        return "border-blue-500"
      case "completed":
        return "border-green-500"
      case "cancelled":
        return "border-gray-500"
      default:
        return "border-gray-300"
    }
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {format(currentDate, "MMMM yyyy")} - {format(addMonths(currentDate, 5), "MMMM yyyy")}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-4">
        {months.map(month => (
          <div key={month.getTime()} className="min-h-[200px]">
            <div className="text-sm font-medium mb-2">
              {format(month, "MMMM yyyy")}
            </div>
            <div className="space-y-2">
              {getProjectsForMonth(month).map(project => (
                <div
                  key={project.id}
                  onClick={() => onProjectClick(project)}
                  className={`
                    p-2 rounded border-l-4 bg-white dark:bg-gray-800 
                    shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700
                    ${getStatusColor(project.status)}
                  `}
                >
                  <div className="text-sm font-medium">{project.number}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {project.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
