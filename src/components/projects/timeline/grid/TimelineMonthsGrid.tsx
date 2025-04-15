import { useCallback, useMemo, useRef, useState } from "react"
import { format, addMonths } from "date-fns"
import { TimelineMonth } from "../TimelineMonth"
import type { TimelineItem, AllocationItem } from "../actions/types"
import { useProjectSettings } from "@/hooks/use-project-settings"
import { useTranslation } from "react-i18next"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { TimelineDetailsTable } from "../TimelineDetailsTable"

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
  calculateAccumulatedProfitUpToMonth,
  year,
  showDecimals = true
}: TimelineMonthsGridProps) {
  const { t } = useTranslation()
  const { getOverheadPercentage } = useProjectSettings()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  
  const months = useMemo(() => 
    Array.from({ length: 12 }, (_, i) => addMonths(startDate, i)), 
    [startDate]
  )
  
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    
    setIsDragging(true)
    setStartX(e.clientX)
    setScrollLeft(containerRef.current.scrollLeft)
    
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grabbing'
    }
  }
  
  const handleMouseUp = () => {
    setIsDragging(false)
    
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab'
    }
  }
  
  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false)
      
      if (containerRef.current) {
        containerRef.current.style.cursor = 'grab'
      }
    }
  }
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return
    
    e.preventDefault()
    const x = e.clientX
    const distance = x - startX
    containerRef.current.scrollLeft = scrollLeft - distance
  }

  return (
    <div className="space-y-4">
      <div 
        className="overflow-auto w-full" 
        ref={containerRef}
        style={{ cursor: 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        <div className="min-w-[2400px]">
          <div className="grid grid-cols-12 gap-px bg-gray-200 rounded-lg overflow-hidden">
            {months.map((month) => {
              const monthStr = format(month, "yyyy-MM")
              const monthVariableCosts = variableCosts?.filter(c => c.month.startsWith(monthStr)) || []
              const overheadPercentage = getOverheadPercentage(year)
              
              const totalVariableCosts = monthVariableCosts.reduce((sum, c) => sum + Number(c.amount), 0)
              const overheadAmount = (totalVariableCosts * overheadPercentage) / 100
              
              const overheadCosts = overheadAmount > 0 ? [{
                id: `overhead-${monthStr}`,
                month: monthStr,
                amount: overheadAmount,
                percentage: overheadPercentage,
                description: `${showDecimals ? overheadPercentage.toFixed(1) : Math.round(overheadPercentage)}% overhead`
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
                  showDecimals={showDecimals}
                />
              )
            })}
          </div>
        </div>
      </div>
      
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
