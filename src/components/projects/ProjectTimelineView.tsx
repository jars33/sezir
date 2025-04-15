
import { Card, CardContent } from "@/components/ui/card"
import { TimelineHeader } from "./timeline/TimelineHeader"
import { TimelineSummary } from "./timeline/TimelineSummary"
import { TimelineMonthsGrid } from "./timeline/grid/TimelineMonthsGrid"
import { TimelineActions } from "./timeline/TimelineActions"
import { TimelineAllocationManager } from "./timeline/allocation/TimelineAllocationManager"
import { useTimelineCalculations } from "./timeline/TimelineCalculations"
import { useTimelineData } from "./timeline/useTimelineData"
import { useTimelineState } from "./timeline/useTimelineState"
import { useTimelineProfitability } from "./timeline/hooks/useTimelineProfitability"
import { useQueryClient } from "@tanstack/react-query"
import { SynchronizedScrollProvider } from "@/hooks/use-synchronized-scroll"
import { useMemo } from "react"
import { format } from "date-fns"

interface ProjectTimelineViewProps {
  projectId: string
}

export function ProjectTimelineView({ projectId }: ProjectTimelineViewProps) {
  // Get timeline data and state
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
  
  const {
    year,
    startDate,
    addRevenueDate,
    addVariableCostDate,
    selectedRevenue,
    selectedVariableCost,
    deleteRevenue,
    deleteVariableCost,
    selectedAllocation,
    allocationDialogOpen,
    setAddRevenueDate,
    setAddVariableCostDate,
    setSelectedRevenue,
    setSelectedVariableCost,
    setDeleteRevenue,
    setDeleteVariableCost,
    setSelectedAllocation,
    setAllocationDialogOpen,
    handlePreviousYear,
    handleNextYear,
    handleRevenueSeleсtion,
    handleAllocationSelection,
    handleAddAllocation
  } = useTimelineState()

  // Calculate timeline data for current year
  const { totalProfit, totalRevenues } = useTimelineCalculations(
    revenues,
    variableCosts,
    allocations,
    year
  )
  
  // Calculate total project profit across all years
  const { totalProjectProfit, totalProjectRevenues } = useMemo(() => {
    // Calculate total revenues across all years
    const totalRevs = allProjectRevenues?.reduce((sum, r) => sum + Number(r.amount), 0) || 0;
    
    // Calculate total variable costs across all years
    const totalVarCosts = allProjectVariableCosts?.reduce((sum, c) => sum + Number(c.amount), 0) || 0;
    
    // Calculate total salary costs across all years
    const totalSalaryCosts = allProjectAllocations?.reduce((sum, a) => sum + Number(a.salary_cost), 0) || 0;
    
    // Calculate total profit
    const totalProfit = totalRevs - totalVarCosts - totalSalaryCosts;
    
    return {
      totalProjectProfit: totalProfit,
      totalProjectRevenues: totalRevs
    };
  }, [allProjectRevenues, allProjectVariableCosts, allProjectAllocations]);

  const { calculateAccumulatedProfitUpToMonth, showDecimals } = useTimelineProfitability(
    revenues,
    variableCosts,
    allocations,
    year
  )

  const queryClient = useQueryClient()

  // Handle cost updates
  const handleVariableCostUpdate = async () => {
    queryClient.invalidateQueries({ queryKey: ["project-variable-costs", projectId] })
    queryClient.invalidateQueries({ queryKey: ["project-revenues", projectId] })
    await refetchTimelineData()
  }

  if (isLoading) {
    return <div className="p-4">Loading...</div>
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
