
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { format, addMonths, startOfMonth, endOfMonth, differenceInDays } from "date-fns"
import { Card } from "@/components/ui/card"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function CalendarPage() {
  const [startDate, setStartDate] = useState(startOfMonth(new Date()))
  const months = Array.from({ length: 12 }, (_, i) => addMonths(startDate, i))
  const navigate = useNavigate()

  const { data: projects } = useQuery({
    queryKey: ["calendar-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("number", { ascending: true })
      
      if (error) throw error
      return data
    },
  })

  const handlePreviousYear = () => {
    setStartDate(prev => addMonths(prev, -12))
  }

  const handleNextYear = () => {
    setStartDate(prev => addMonths(prev, 12))
  }

  return (
    <div className="container py-8 max-w-[1400px]">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Project Timeline</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handlePreviousYear}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextYear}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="overflow-x-auto">
        <div className="min-w-[1200px]">
          <div className="grid grid-cols-[250px_1fr]">
            <div className="bg-[#F2FCE2] dark:bg-gray-800 border-b border-r h-12 flex items-center justify-center px-4 font-medium dark:text-gray-200">
              Project
            </div>
            <div className="grid grid-cols-12 bg-[#F2FCE2] dark:bg-gray-800 border-b">
              {months.map((month) => (
                <div
                  key={month.getTime()}
                  className="h-12 text-center border-r last:border-r-0 flex flex-col justify-center dark:border-gray-700"
                >
                  <div className="text-sm font-medium dark:text-gray-200">
                    {format(month, "MMM")}
                  </div>
                  <div className="text-xs text-muted-foreground dark:text-gray-400">
                    {format(month, "yyyy")}
                  </div>
                </div>
              ))}
            </div>

            <div className="divide-y dark:divide-gray-700">
              {projects?.map((project) => (
                <div 
                  key={project.id} 
                  className="h-12 px-4 flex flex-col justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <div className="font-medium leading-tight">{project.name}</div>
                  <div className="text-sm text-muted-foreground leading-tight">
                    #{project.number}
                  </div>
                </div>
              ))}
            </div>
            <div className="divide-y dark:divide-gray-700">
              {projects?.map((project) => (
                <div 
                  key={project.id} 
                  className="relative h-12 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  {project.start_date && (
                    <div
                      className={`absolute h-6 top-1/2 -translate-y-1/2 rounded ${
                        project.status === "completed"
                          ? "bg-green-100 dark:bg-green-400/10"
                          : project.status === "in_progress"
                          ? "bg-blue-100 dark:bg-blue-400/10"
                          : project.status === "planned"
                          ? "bg-yellow-100 dark:bg-yellow-400/10"
                          : "bg-red-100 dark:bg-red-400/10"
                      }`}
                      style={{
                        left: `${getProjectStartPosition(
                          new Date(project.start_date),
                          months[0],
                          months[months.length - 1]
                        )}%`,
                        width: `${getProjectWidth(
                          new Date(project.start_date),
                          project.end_date
                            ? new Date(project.end_date)
                            : addMonths(new Date(project.start_date), 1),
                          months[0],
                          months[months.length - 1]
                        )}%`,
                      }}
                    />
                  )}
                  <div className="grid grid-cols-12 h-full">
                    {months.map((month) => (
                      <div
                        key={month.getTime()}
                        className="border-r last:border-r-0 dark:border-gray-700"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

function getProjectStartPosition(
  startDate: Date,
  timelineStart: Date,
  timelineEnd: Date
): number {
  const totalDays = differenceInDays(timelineEnd, timelineStart)
  const daysFromStart = differenceInDays(startDate, timelineStart)
  
  // Clamp to timeline range
  if (startDate < timelineStart) return 0
  if (startDate > timelineEnd) return 100
  
  return (daysFromStart / totalDays) * 100
}

function getProjectWidth(
  startDate: Date,
  endDate: Date,
  timelineStart: Date,
  timelineEnd: Date
): number {
  const totalDays = differenceInDays(timelineEnd, timelineStart)
  
  // Clamp dates to timeline range
  const effectiveStartDate = startDate < timelineStart ? timelineStart : startDate
  const effectiveEndDate = endDate > timelineEnd ? timelineEnd : endDate
  
  const duration = differenceInDays(effectiveEndDate, effectiveStartDate)
  
  return (duration / totalDays) * 100
}
