
import { useState, useCallback, useMemo } from "react"
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
import { setMonth, startOfMonth, format, getYear } from "date-fns"
import { useQueryClient } from "@tanstack/react-query"
import type { TimelineItem, AllocationItem } from "./actions/types"
import { useProjectSettings } from "@/hooks/use-project-settings"
import { SynchronizedScrollProvider } from "@/hooks/use-synchronized-scroll"

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
  const { getOverheadPercentage } = useProjectSettings()

  const { 
    revenues, 
    variableCosts, 
    allocations, 
    allProjectRevenues, 
    allProjectVariableCosts, 
    allProjectAllocations, 
    isLoading, 
    refetchTimelineData 
  } = useTimelineData(projectId)

  const { totalProfit: totalProfitCalc, totalRevenues } = useTimelineCalculations(
    revenues,
    variableCosts,
    allocations,
    year
  )

  // Calculate total project profit across all years with overhead
  const { totalProjectProfit, totalProjectRevenues } = useMemo(() => {
    // Calculate total revenues across all years
    const totalRevs = allProjectRevenues?.reduce((sum, r) => sum + Number(r.amount), 0) || 0;
    
    // Calculate total variable costs across all years
    const totalVarCosts = allProjectVariableCosts?.reduce((sum, c) => sum + Number(c.amount), 0) || 0;
    
    // Calculate total salary costs across all years
    const totalSalaryCosts = allProjectAllocations?.reduce((sum, a) => sum + Number(a.salary_cost), 0) || 0;
    
    // Group costs by year for proper overhead calculation
    const costsByYear = new Map<number, { varCosts: number, salaryCosts: number }>();
    
    // Group variable costs by year
    allProjectVariableCosts?.forEach(cost => {
      const costYear = getYear(new Date(cost.month));
      if (!costsByYear.has(costYear)) {
        costsByYear.set(costYear, { varCosts: 0, salaryCosts: 0 });
      }
      const yearData = costsByYear.get(costYear)!;
      yearData.varCosts += Number(cost.amount);
      costsByYear.set(costYear, yearData);
    });
    
    // Group salary costs by year
    allProjectAllocations?.forEach(allocation => {
      const allocYear = getYear(new Date(allocation.month));
      if (!costsByYear.has(allocYear)) {
        costsByYear.set(allocYear, { varCosts: 0, salaryCosts: 0 });
      }
      const yearData = costsByYear.get(allocYear)!;
      yearData.salaryCosts += Number(allocation.salary_cost);
      costsByYear.set(allocYear, yearData);
    });
    
    // Calculate overhead costs for each year based on that year's costs (variable + salary)
    let totalOverheadCosts = 0;
    costsByYear.forEach((costs, yearNum) => {
      const yearOverheadPercentage = getOverheadPercentage(yearNum);
      const yearTotalCosts = costs.varCosts + costs.salaryCosts;
      totalOverheadCosts += (yearTotalCosts * yearOverheadPercentage) / 100;
    });
    
    // Calculate total profit
    const totalProfit = totalRevs - totalVarCosts - totalSalaryCosts - totalOverheadCosts;
    
    return {
      totalProjectProfit: totalProfit,
      totalProjectRevenues: totalRevs
    };
  }, [allProjectRevenues, allProjectVariableCosts, allProjectAllocations, getOverheadPercentage]);

  const { calculateAccumulatedProfitUpToMonth, showDecimals } = useTimelineProfitability(
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

  const handleAddAllocation = () => {
    setSelectedAllocation(null)
    setAllocationDialogOpen(true)
  }

  return (
    <Card>
      <TimelineHeader
        onAddRevenue={() => setAddRevenueDate(new Date())}
        onAddVariableCost={() => setAddVariableCostDate(new Date())}
        onAddAllocation={handleAddAllocation}
        onPreviousYear={handlePreviousYear}
        onNextYear={handleNextYear}
        totalProjectProfit={totalProjectProfit}
        totalProjectRevenues={totalProjectRevenues}
        startDate={startDate}
      />
      <CardContent className="space-y-6">
        <TimelineSummary
          year={year}
          revenues={revenues}
          variableCosts={variableCosts}
          allocations={allocations}
        />
        
        <SynchronizedScrollProvider>
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
            showDecimals={showDecimals}
          />
        </SynchronizedScrollProvider>

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
