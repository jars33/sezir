
import { CardContent } from "@/components/ui/card"
import { TimelineSummary } from "./TimelineSummary"
import { TimelineMonthsGrid } from "./grid/TimelineMonthsGrid"
import { TimelineActions } from "./TimelineActions"
import { TimelineAllocationManager } from "./allocation/TimelineAllocationManager"
import { SynchronizedScrollProvider } from "@/hooks/use-synchronized-scroll"
import type { TimelineItem, AllocationItem } from "./actions/types"

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
