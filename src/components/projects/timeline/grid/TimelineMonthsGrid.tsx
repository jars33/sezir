
import { useCallback, useMemo } from "react"
import { format, addMonths } from "date-fns"
import { TimelineMonth } from "../TimelineMonth"
import type { TimelineItem, AllocationItem } from "../actions/types"
import { useProjectSettings } from "@/hooks/use-project-settings"
import { useTranslation } from "react-i18next"

interface TimelineMonthsGridProps {
  startDate: Date
  revenues: TimelineItem[]
  variableCosts: TimelineItem[]
  allocations: AllocationItem[]
  onSelectRevenue: (revenue: TimelineItem) => void
  onSelectVariableCost: (cost: TimelineItem) => void
  onSelectAllocation: (allocation: AllocationItem) => void
  calculateAccumulatedProfitUpToMonth: (targetMonth: Date) => number
  year: number
}

export function TimelineMonthsGrid({
  startDate,
  revenues,
  variableCosts,
  allocations,
  onSelectRevenue,
  onSelectVariableCost,
  onSelectAllocation,
  calculateAccumulatedProfitUpToMonth,
  year
}: TimelineMonthsGridProps) {
  const { t } = useTranslation()
  const { getOverheadPercentage } = useProjectSettings()
  
  // Generate an array of 12 months starting from startDate
  const months = useMemo(() => 
    Array.from({ length: 12 }, (_, i) => addMonths(startDate, i)), 
    [startDate]
  )

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[1200px]">
        <div className="grid grid-cols-12 gap-px bg-gray-200 rounded-lg overflow-hidden">
          {months.map((month) => {
            const monthStr = format(month, "yyyy-MM")
            const monthVariableCosts = variableCosts?.filter(c => c.month.startsWith(monthStr)) || []
            const overheadPercentage = getOverheadPercentage(year)
            
            // Calculate overhead costs for the month based on variable costs
            const totalVariableCosts = monthVariableCosts.reduce((sum, c) => sum + Number(c.amount), 0)
            const overheadAmount = (totalVariableCosts * overheadPercentage) / 100
            
            // Create a derived overhead cost item
            const overheadCosts = overheadAmount > 0 ? [{
              id: `overhead-${monthStr}`,
              month: monthStr,
              amount: overheadAmount,
              description: `${overheadPercentage}% overhead`
            }] : []
            
            return (
              <TimelineMonth
                key={month.getTime()}
                month={month}
                revenues={revenues?.filter(r => r.month.startsWith(monthStr)) || []}
                variableCosts={monthVariableCosts}
                overheadCosts={overheadCosts}
                allocations={allocations?.filter(a => a.month.startsWith(monthStr)) || []}
                onSelectRevenue={onSelectRevenue}
                onSelectVariableCost={onSelectVariableCost}
                onSelectOverheadCost={() => {}}
                onSelectAllocation={onSelectAllocation}
                accumulatedProfit={calculateAccumulatedProfitUpToMonth(month)}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
