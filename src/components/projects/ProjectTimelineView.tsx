
import { Card } from "@/components/ui/card"
import { TimelineHeader } from "./timeline/TimelineHeader"
import { TimelineContent } from "./timeline/TimelineContent"
import { LoadingIndicator } from "./timeline/LoadingIndicator" 
import { useTimelineCalculations } from "./timeline/TimelineCalculations"
import { useTimelineData } from "./timeline/useTimelineData"
import { useTimelineState } from "./timeline/useTimelineState"
import { useTimelineProfitability } from "./timeline/hooks/useTimelineProfitability"
import { TotalProjectFinancials } from "./timeline/TotalProjectFinancials"
import { useQueryClient } from "@tanstack/react-query"

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
  
  // Get total project financials across all years
  const { totalProjectProfit, totalProjectRevenues } = TotalProjectFinancials({
    allProjectRevenues,
    allProjectVariableCosts,
    allProjectAllocations
  })

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
    return <LoadingIndicator />
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
      <TimelineContent 
        projectId={projectId}
        year={year}
        startDate={startDate}
        revenues={revenues}
        variableCosts={variableCosts}
        allocations={allocations}
        calculateAccumulatedProfitUpToMonth={calculateAccumulatedProfitUpToMonth}
        showDecimals={showDecimals}
        onSelectRevenue={handleRevenueSeleсtion}
        onSelectVariableCost={setSelectedVariableCost}
        onSelectAllocation={handleAllocationSelection}
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
        selectedAllocation={selectedAllocation}
        allocationDialogOpen={allocationDialogOpen}
        setAllocationDialogOpen={setAllocationDialogOpen}
        setSelectedAllocation={setSelectedAllocation}
        refetchTimelineData={refetchTimelineData}
      />
    </Card>
  )
}
