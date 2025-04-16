
import { CardContent } from "@/components/ui/card"
import { TimelineSummary } from "./TimelineSummary"
import { TimelineMonthsGrid } from "./grid/TimelineMonthsGrid"
import { TimelineActions } from "./TimelineActions"
import { TimelineAllocationManager } from "./allocation/TimelineAllocationManager"
import { SynchronizedScrollProvider } from "@/hooks/use-synchronized-scroll"
import { format } from "date-fns"
import type { TimelineItem, AllocationItem } from "./actions/types"
import { allocationService, revenueService, variableCostService } from "@/services/supabase"
import { toast } from "sonner"

interface TimelineContentProps {
  projectId: string
  year: number
  startDate: Date
  revenues: TimelineItem[]
  variableCosts: TimelineItem[]
  allocations: AllocationItem[]
  calculateAccumulatedProfitUpToMonth: (targetMonth: Date) => number
  showDecimals: boolean
  onSelectRevenue: (revenue: TimelineItem) => void
  onSelectVariableCost: (cost: TimelineItem) => void
  onSelectAllocation: (allocation: AllocationItem) => void
  // Timeline actions props
  addRevenueDate: Date | null
  addVariableCostDate: Date | null
  selectedRevenue: TimelineItem | null
  selectedVariableCost: TimelineItem | null
  deleteRevenue: TimelineItem | null
  deleteVariableCost: TimelineItem | null
  setAddRevenueDate: (date: Date | null) => void
  setAddVariableCostDate: (date: Date | null) => void
  setSelectedRevenue: (revenue: TimelineItem | null) => void
  setSelectedVariableCost: (cost: TimelineItem | null) => void
  setDeleteRevenue: (revenue: TimelineItem | null) => void
  setDeleteVariableCost: (cost: TimelineItem | null) => void
  onVariableCostUpdate: () => Promise<void>
  // Allocation dialog props
  selectedAllocation: AllocationItem | null
  allocationDialogOpen: boolean
  setAllocationDialogOpen: (open: boolean) => void
  setSelectedAllocation: (allocation: AllocationItem | null) => void
  refetchTimelineData: () => Promise<void>
}

export function TimelineContent({
  projectId,
  year,
  startDate,
  revenues,
  variableCosts,
  allocations,
  calculateAccumulatedProfitUpToMonth,
  showDecimals,
  onSelectRevenue,
  onSelectVariableCost,
  onSelectAllocation,
  // Timeline actions props
  addRevenueDate,
  addVariableCostDate,
  selectedRevenue,
  selectedVariableCost,
  deleteRevenue,
  deleteVariableCost,
  setAddRevenueDate,
  setAddVariableCostDate,
  setSelectedRevenue,
  setSelectedVariableCost,
  setDeleteRevenue,
  setDeleteVariableCost,
  onVariableCostUpdate,
  // Allocation dialog props
  selectedAllocation,
  allocationDialogOpen,
  setAllocationDialogOpen,
  setSelectedAllocation,
  refetchTimelineData
}: TimelineContentProps) {
  
  // Handle moving items between months
  const handleMoveItem = async (
    itemId: string, 
    itemType: string, 
    sourceMonth: string, 
    targetMonth: string
  ) => {
    try {
      const targetMonthDate = new Date(`${targetMonth}-01`);
      
      switch (itemType) {
        case 'revenue':
          const revenue = revenues.find(r => r.id === itemId);
          if (revenue) {
            await revenueService.updateRevenue(
              itemId,
              targetMonth + "-01",
              revenue.amount
            );
          }
          break;
          
        case 'variable-cost':
          const cost = variableCosts.find(c => c.id === itemId);
          if (cost) {
            await variableCostService.updateVariableCost(
              itemId,
              targetMonth + "-01", 
              cost.amount, 
              cost.description || ""
            );
          }
          break;
          
        case 'allocation':
          const allocation = allocations.find(a => a.id === itemId);
          if (allocation) {
            await allocationService.updateAllocation(
              allocation.project_assignment_id,
              targetMonthDate,
              allocation.allocation_percentage,
              itemId
            );
          }
          break;
          
        default:
          throw new Error("Unknown item type");
      }
      
      // Refresh the timeline data
      await refetchTimelineData();
      
    } catch (error) {
      console.error("Error moving item:", error);
      toast.error("Failed to move item to new month");
      throw error;
    }
  };

  return (
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
          onSelectRevenue={onSelectRevenue}
          onSelectVariableCost={onSelectVariableCost}
          onSelectAllocation={onSelectAllocation}
          onMoveItem={handleMoveItem}
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
        onVariableCostUpdate={onVariableCostUpdate}
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
  )
}
