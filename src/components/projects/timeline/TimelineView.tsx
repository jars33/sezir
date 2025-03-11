
import { useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TimelineHeader } from "./TimelineHeader"
import { TimelineActions } from "./TimelineActions"
import { TimelineSummary } from "./TimelineSummary"
import { TimelineMonthsGrid } from "./grid/TimelineMonthsGrid"
import { TimelineAllocationManager } from "./allocation/TimelineAllocationManager"
import { useTimelineCalculations } from "./TimelineCalculations"
import { useTimelineData } from "./useTimelineData"
import { useTimelineProfitability } from "./hooks/useTimelineProfitability"
import { useProjectYear } from "@/hooks/use-project-year"
import { setMonth, startOfMonth, format } from "date-fns"
import { useQueryClient } from "@tanstack/react-query"
import type { TimelineItem, AllocationItem } from "./actions/types"

interface TimelineViewProps {
  projectId: string
}

export function TimelineView({ projectId }: TimelineViewProps) {
  const { year, setYear } = useProjectYear()
  const [startDate, setStartDate] = useState(() => {
    return startOfMonth(setMonth(new Date(year, 0), 0))
  })

  const [addRevenueDate, setAddRevenueDate] = useState<Date | null>(null)
  const [addVariableCostDate, setAddVariableCostDate] = useState<Date | null>(null)
  const [selectedRevenue, setSelectedRevenue] = useState<TimelineItem | null>(null)
  const [selectedVariableCost, setSelectedVariableCost] = useState<TimelineItem | null>(null)
  const [deleteRevenue, setDeleteRevenue] = useState<TimelineItem | null>(null)
  const [deleteVariableCost, setDeleteVariableCost] = useState<TimelineItem | null>(null)
  const [selectedAllocation, setSelectedAllocation] = useState<AllocationItem | null>(null)
  const [allocationDialogOpen, setAllocationDialogOpen] = useState(false)

  const queryClient = useQueryClient()

  const { revenues, variableCosts, allocations, isLoading, refetchTimelineData } = useTimelineData(projectId)

  const { totalProfit: totalProfitCalc } = useTimelineCalculations(
    revenues,
    variableCosts,
    allocations,
    year
  )

  const { calculateAccumulatedProfitUpToMonth } = useTimelineProfitability(
    revenues,
    variableCosts,
    allocations,
    year
  )

  const handlePreviousYear = () => {
    const newYear = year - 1
    setYear(newYear)
    setStartDate(startOfMonth(setMonth(new Date(newYear, 0), 0)))
  }

  const handleNextYear = () => {
    const newYear = year + 1
    setYear(newYear)
    setStartDate(startOfMonth(setMonth(new Date(newYear, 0), 0)))
  }

  const handleVariableCostUpdate = async () => {
    queryClient.invalidateQueries({ queryKey: ["project-variable-costs", projectId] })
    queryClient.invalidateQueries({ queryKey: ["project-revenues", projectId] })
    await refetchTimelineData()
  }

  const handleRevenueSeleсtion = (revenue: TimelineItem) => {
    // Check if revenue has the isNew property and it's true
    if (revenue.isNew === true) {
      setAddRevenueDate(new Date(revenue.month))
    } else {
      setSelectedRevenue(revenue)
    }
  }

  const handleAllocationSelection = (allocation: AllocationItem) => {
    setSelectedAllocation(allocation)
    setAllocationDialogOpen(true)
  }

  return (
    <Card>
      <TimelineHeader
        onAddRevenue={() => setAddRevenueDate(new Date())}
        onAddVariableCost={() => setAddVariableCostDate(new Date())}
        onPreviousYear={handlePreviousYear}
        onNextYear={handleNextYear}
        totalProfit={totalProfitCalc}
        startDate={startDate}
      />
      <CardContent className="space-y-6">
        <TimelineSummary
          year={year}
          revenues={revenues}
          variableCosts={variableCosts}
          allocations={allocations}
        />
        
        <TimelineMonthsGrid
          startDate={startDate}
          revenues={revenues}
          variableCosts={variableCosts}
          allocations={allocations}
          onSelectRevenue={handleRevenueSeleсtion}
          onSelectVariableCost={setSelectedVariableCost}
          onSelectAllocation={handleAllocationSelection}
          calculateAccumulatedProfitUpToMonth={calculateAccumulatedProfitUpToMonth}
          year={year}
        />

        <TimelineActions
          projectId={projectId}
          addRevenueDate={addRevenueDate}
          addVariableCostDate={addVariableCostDate}
          selectedRevenue={selectedRevenue}
          selectedVariableCost={selectedVariableCost}
          deleteRevenue={deleteRevenue}
          deleteVariableCost={deleteVariableCost}
          setAddRevenueDate={setAddRevenueDate}
          setAddVariableCostDate={setAddVariableCostDate}
          setSelectedRevenue={setSelectedRevenue}
          setSelectedVariableCost={setSelectedVariableCost}
          setDeleteRevenue={setDeleteRevenue}
          setDeleteVariableCost={setDeleteVariableCost}
          onVariableCostUpdate={handleVariableCostUpdate}
        />

        <TimelineAllocationManager
          projectId={projectId}
          selectedAllocation={selectedAllocation}
          allocationDialogOpen={allocationDialogOpen}
          setAllocationDialogOpen={setAllocationDialogOpen}
          setSelectedAllocation={setSelectedAllocation}
          refetchTimelineData={refetchTimelineData}
        />
      </CardContent>
    </Card>
  )
}
