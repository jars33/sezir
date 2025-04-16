
import { useMemo } from "react"
import { format, addMonths } from "date-fns"
import { TimelineMonth } from "../TimelineMonth"
import type { TimelineItem, AllocationItem } from "../actions/types"
import { useProjectSettings } from "@/hooks/use-project-settings"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import { TimelineDetailsTable } from "../TimelineDetailsTable"
import { useSynchronizedScroll } from "@/hooks/use-synchronized-scroll"
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { toast } from "sonner"

interface TimelineMonthsGridProps {
  startDate: Date
  revenues: TimelineItem[]
  variableCosts: TimelineItem[]
  allocations: AllocationItem[]
  onSelectRevenue: (revenue: TimelineItem) => void
  onSelectVariableCost: (cost: TimelineItem) => void
  onSelectAllocation: (allocation: AllocationItem) => void
  onMoveItem?: (itemId: string, itemType: string, sourceMonth: string, targetMonth: string) => Promise<void>
  calculateAccumulatedProfitUpToMonth: (targetMonth: Date) => number
  year: number
  showDecimals?: boolean
}

export function TimelineMonthsGrid({
  startDate,
  revenues,
  variableCosts,
  allocations,
  onSelectRevenue,
  onSelectVariableCost,
  onSelectAllocation,
  onMoveItem,
  calculateAccumulatedProfitUpToMonth,
  year,
  showDecimals = true
}: TimelineMonthsGridProps) {
  const { t } = useTranslation()
  const { getOverheadPercentage } = useProjectSettings()
  const { registerContainer } = useSynchronizedScroll()
  const timelineContainerRef = useMemo(() => ({ current: null }), [])
  
  const months = useMemo(() => 
    Array.from({ length: 12 }, (_, i) => addMonths(startDate, i)), 
    [startDate]
  )

  const handleMoveItem = async (itemId: string, itemType: string, sourceMonth: string, targetMonth: string) => {
    try {
      if (onMoveItem) {
        await onMoveItem(itemId, itemType, sourceMonth, targetMonth);
        toast.success(t('timeline.itemMoved'));
      }
    } catch (error) {
      console.error("Error moving item:", error);
      toast.error(t('common.errorOccurred'));
    }
  };

  return (
    <div className="space-y-4">
      <DndProvider backend={HTML5Backend}>
        <div 
          className="overflow-auto w-full" 
          ref={(el) => {
            timelineContainerRef.current = el;
            registerContainer(el);
          }}
        >
          <div className="min-w-[2400px]">
            <div className="grid grid-cols-12 gap-px bg-gray-200 rounded-lg overflow-hidden">
              {months.map((month) => {
                const monthStr = format(month, "yyyy-MM")
                const monthVariableCosts = variableCosts?.filter(c => c.month.startsWith(monthStr)) || []
                const monthAllocations = allocations?.filter(a => a.month.startsWith(monthStr)) || []
                
                const overheadPercentage = getOverheadPercentage(year)
                
                const totalVariableCosts = monthVariableCosts.reduce((sum, c) => sum + Number(c.amount), 0)
                const totalSalaryCosts = monthAllocations.reduce((sum, a) => sum + Number(a.salary_cost), 0)
                
                // Calculate overhead based on both variable costs and allocations
                const overheadAmount = ((totalVariableCosts + totalSalaryCosts) * overheadPercentage) / 100
                
                const overheadCosts = overheadAmount > 0 ? [{
                  id: `overhead-${monthStr}`,
                  month: monthStr,
                  amount: overheadAmount,
                  percentage: overheadPercentage,
                  description: `${overheadPercentage.toFixed(2).replace(/\.?0+$/, '')}% overhead`
                }] : []
                
                return (
                  <TimelineMonth
                    key={month.getTime()}
                    month={month}
                    revenues={revenues?.filter(r => r.month.startsWith(monthStr)) || []}
                    variableCosts={monthVariableCosts}
                    overheadCosts={overheadCosts}
                    allocations={monthAllocations}
                    onSelectRevenue={onSelectRevenue}
                    onSelectVariableCost={onSelectVariableCost}
                    onSelectOverheadCost={() => {}}
                    onSelectAllocation={onSelectAllocation}
                    onMoveItem={handleMoveItem}
                    accumulatedProfit={calculateAccumulatedProfitUpToMonth(month)}
                    showDecimals={showDecimals}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </DndProvider>
      
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-2">{t('costs.detailedBreakdown')}</h3>
        <TimelineDetailsTable
          startDate={startDate}
          revenues={revenues}
          variableCosts={variableCosts}
          allocations={allocations}
          calculateAccumulatedProfitUpToMonth={calculateAccumulatedProfitUpToMonth}
          year={year}
        />
      </div>
    </div>
  )
}
