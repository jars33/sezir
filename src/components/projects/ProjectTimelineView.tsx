
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
import { format, getYear } from "date-fns"
import { useProjectSettings } from "@/hooks/use-project-settings"

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

  // Get project settings for overhead percentage
  const { getOverheadPercentage } = useProjectSettings()

  // Calculate timeline data for current year
  const { totalProfit, totalRevenues } = useTimelineCalculations(
    revenues,
    variableCosts,
    allocations,
    year
  )
  
  // Calculate total project profit across all years, including overhead
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
    
    // Calculate total profit with overhead included
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
    year,
    allProjectRevenues,
    allProjectVariableCosts,
    allProjectAllocations
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
            allProjectRevenues={allProjectRevenues}
            allProjectVariableCosts={allProjectVariableCosts}
            allProjectAllocations={allProjectAllocations}
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
