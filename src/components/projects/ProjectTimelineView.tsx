
import { useState } from "react"
import { addMonths, format, startOfMonth, setMonth, getYear } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { TimelineHeader } from "./timeline/TimelineHeader"
import { TimelineMonth } from "./timeline/TimelineMonth"
import { TimelineActions } from "./timeline/TimelineActions"
import { useTimelineData } from "./timeline/useTimelineData"
import { useTimelineCalculations } from "./timeline/TimelineCalculations"

interface TimelineItem {
  id: string
  month: string
  amount: number
  description?: string
}

interface ProjectTimelineViewProps {
  projectId: string
}

export function ProjectTimelineView({ projectId }: ProjectTimelineViewProps) {
  const [startDate, setStartDate] = useState(() => {
    const now = new Date()
    return startOfMonth(setMonth(now, 0)) // Set to January of current year
  })

  const [addRevenueDate, setAddRevenueDate] = useState<Date | null>(null)
  const [addVariableCostDate, setAddVariableCostDate] = useState<Date | null>(null)
  const [addOverheadCostDate, setAddOverheadCostDate] = useState<Date | null>(null)
  const [selectedRevenue, setSelectedRevenue] = useState<TimelineItem | null>(null)
  const [selectedVariableCost, setSelectedVariableCost] = useState<TimelineItem | null>(null)
  const [selectedOverheadCost, setSelectedOverheadCost] = useState<TimelineItem | null>(null)
  const [deleteRevenue, setDeleteRevenue] = useState<TimelineItem | null>(null)
  const [deleteVariableCost, setDeleteVariableCost] = useState<TimelineItem | null>(null)
  const [deleteOverheadCost, setDeleteOverheadCost] = useState<TimelineItem | null>(null)

  const { revenues, variableCosts, overheadCosts, allocations } = useTimelineData(projectId)
  const months = Array.from({ length: 12 }, (_, i) => addMonths(startDate, i))
  const currentYear = getYear(startDate)

  const { totalProfit } = useTimelineCalculations(
    revenues,
    variableCosts,
    overheadCosts,
    currentYear
  )

  const handlePreviousYear = () => {
    setStartDate(prev => addMonths(prev, -12))
  }

  const handleNextYear = () => {
    setStartDate(prev => addMonths(prev, 12))
  }

  return (
    <Card>
      <TimelineHeader
        onAddRevenue={() => setAddRevenueDate(new Date())}
        onAddVariableCost={() => setAddVariableCostDate(new Date())}
        onAddOverheadCost={() => setAddOverheadCostDate(new Date())}
        onPreviousYear={handlePreviousYear}
        onNextYear={handleNextYear}
        totalProfit={totalProfit}
        startDate={startDate}
      />
      <CardContent className="overflow-x-auto">
        <div className="min-w-[1200px]">
          <div className="grid grid-cols-12 gap-px bg-gray-200 rounded-lg overflow-hidden">
            {months.map((month) => {
              const monthStr = format(month, "yyyy-MM")
              const monthRevenues = revenues?.filter(
                (r) => r.month.startsWith(monthStr)
              ) || []
              const monthVariableCosts = variableCosts?.filter(
                (c) => c.month.startsWith(monthStr)
              ) || []
              const monthOverheadCosts = overheadCosts?.filter(
                (c) => c.month.startsWith(monthStr)
              ) || []
              const monthAllocations = allocations?.filter(
                (a) => a.month.startsWith(monthStr)
              ) || []

              return (
                <TimelineMonth
                  key={month.getTime()}
                  month={month}
                  revenues={monthRevenues}
                  variableCosts={monthVariableCosts}
                  overheadCosts={monthOverheadCosts}
                  allocations={monthAllocations}
                  onSelectRevenue={setSelectedRevenue}
                  onSelectVariableCost={setSelectedVariableCost}
                  onSelectOverheadCost={setSelectedOverheadCost}
                />
              )
            })}
          </div>
        </div>

        <TimelineActions
          projectId={projectId}
          addRevenueDate={addRevenueDate}
          addVariableCostDate={addVariableCostDate}
          addOverheadCostDate={addOverheadCostDate}
          selectedRevenue={selectedRevenue}
          selectedVariableCost={selectedVariableCost}
          selectedOverheadCost={selectedOverheadCost}
          deleteRevenue={deleteRevenue}
          deleteVariableCost={deleteVariableCost}
          deleteOverheadCost={deleteOverheadCost}
          setAddRevenueDate={setAddRevenueDate}
          setAddVariableCostDate={setAddVariableCostDate}
          setAddOverheadCostDate={setAddOverheadCostDate}
          setSelectedRevenue={setSelectedRevenue}
          setSelectedVariableCost={setSelectedVariableCost}
          setSelectedOverheadCost={setSelectedOverheadCost}
          setDeleteRevenue={setDeleteRevenue}
          setDeleteVariableCost={setDeleteVariableCost}
          setDeleteOverheadCost={setDeleteOverheadCost}
        />
      </CardContent>
    </Card>
  )
}
