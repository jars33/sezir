
import { useCallback, useMemo } from "react"
import { format, addMonths } from "date-fns"
import { TimelineMonth } from "../TimelineMonth"
import type { TimelineItem, AllocationItem } from "../actions/types"

interface TimelineMonthsGridProps {
  startDate: Date
  revenues: TimelineItem[]
  variableCosts: TimelineItem[]
  overheadCosts: TimelineItem[]
  allocations: AllocationItem[]
  onSelectRevenue: (revenue: TimelineItem) => void
  onSelectVariableCost: (cost: TimelineItem) => void
  onSelectAllocation: (allocation: AllocationItem) => void
  calculateAccumulatedProfitUpToMonth: (targetMonth: Date) => number
}

export function TimelineMonthsGrid({
  startDate,
  revenues,
  variableCosts,
  overheadCosts,
  allocations,
  onSelectRevenue,
  onSelectVariableCost,
  onSelectAllocation,
  calculateAccumulatedProfitUpToMonth
}: TimelineMonthsGridProps) {
  // Generate an array of 12 months starting from startDate
  const months = useMemo(() => 
    Array.from({ length: 12 }, (_, i) => addMonths(startDate, i)), 
    [startDate]
  )

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[1200px]">
        <div className="grid grid-cols-12 gap-px bg-gray-200 rounded-lg overflow-hidden">
          {months.map((month) => (
            <TimelineMonth
              key={month.getTime()}
              month={month}
              revenues={revenues?.filter(r => r.month.startsWith(format(month, "yyyy-MM"))) || []}
              variableCosts={variableCosts?.filter(c => c.month.startsWith(format(month, "yyyy-MM"))) || []}
              overheadCosts={overheadCosts?.filter(c => c.month.startsWith(format(month, "yyyy-MM"))) || []}
              allocations={allocations?.filter(a => a.month.startsWith(format(month, "yyyy-MM"))) || []}
              onSelectRevenue={onSelectRevenue}
              onSelectVariableCost={onSelectVariableCost}
              onSelectOverheadCost={() => {}}
              onSelectAllocation={onSelectAllocation}
              accumulatedProfit={calculateAccumulatedProfitUpToMonth(month)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
