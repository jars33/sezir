
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { format, addMonths, startOfMonth } from "date-fns"
import { Card } from "@/components/ui/card"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function CalendarPage() {
  const [startDate, setStartDate] = useState(startOfMonth(new Date()))
  const months = Array.from({ length: 12 }, (_, i) => addMonths(startDate, i))

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
          {/* Header with months */}
          <div className="grid grid-cols-12 bg-[#F2FCE2] border-b">
            {months.map((month) => (
              <div
                key={month.getTime()}
                className="p-2 text-center text-sm font-medium border-r last:border-r-0"
              >
                {format(month, "MMM yyyy")}
              </div>
            ))}
          </div>

          {/* Projects list */}
          <div className="divide-y">
            {projects?.map((project) => (
              <div
                key={project.id}
                className="grid grid-cols-[200px,1fr] hover:bg-gray-50"
              >
                <div className="p-3 border-r">
                  <div className="font-medium">{project.name}</div>
                  <div className="text-sm text-muted-foreground">
                    #{project.number}
                  </div>
                </div>
                <div className="grid grid-cols-12 relative">
                  {project.start_date && (
                    <div
                      className={`absolute h-6 top-1/2 -translate-y-1/2 rounded ${
                        project.status === "completed"
                          ? "bg-green-100"
                          : project.status === "in_progress"
                          ? "bg-blue-100"
                          : project.status === "planned"
                          ? "bg-yellow-100"
                          : "bg-red-100"
                      }`}
                      style={{
                        left: `${getProjectStartPosition(
                          new Date(project.start_date),
                          months
                        )}%`,
                        width: `${getProjectWidth(
                          new Date(project.start_date),
                          project.end_date
                            ? new Date(project.end_date)
                            : addMonths(new Date(project.start_date), 1),
                          months
                        )}%`,
                      }}
                    />
                  )}
                  {months.map((month) => (
                    <div
                      key={month.getTime()}
                      className="h-12 border-r last:border-r-0"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}

function getProjectStartPosition(
  startDate: Date,
  months: Date[]
): number {
  const firstMonth = months[0]
  const lastMonth = months[months.length - 1]
  
  if (startDate < firstMonth) return 0
  if (startDate > lastMonth) return 100
  
  const totalDays = (lastMonth.getTime() - firstMonth.getTime()) / (1000 * 60 * 60 * 24)
  const daysFromStart = (startDate.getTime() - firstMonth.getTime()) / (1000 * 60 * 60 * 24)
  
  return (daysFromStart / totalDays) * 100
}

function getProjectWidth(
  startDate: Date,
  endDate: Date,
  months: Date[]
): number {
  const firstMonth = months[0]
  const lastMonth = months[months.length - 1]
  
  const effectiveStartDate = startDate < firstMonth ? firstMonth : startDate
  const effectiveEndDate = endDate > lastMonth ? lastMonth : endDate
  
  const totalDays = (lastMonth.getTime() - firstMonth.getTime()) / (1000 * 60 * 60 * 24)
  const projectDays = (effectiveEndDate.getTime() - effectiveStartDate.getTime()) / (1000 * 60 * 60 * 24)
  
  return (projectDays / totalDays) * 100
}
