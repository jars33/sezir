
import { useCallback, useMemo, useRef, useState } from "react"
import { format, addMonths } from "date-fns"
import { TimelineMonth } from "../TimelineMonth"
import type { TimelineItem, AllocationItem } from "../actions/types"
import { useProjectSettings } from "@/hooks/use-project-settings"
import { useTranslation } from "react-i18next"
import { ScrollArea } from "@/components/ui/scroll-area"

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
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  
  // Generate an array of 12 months starting from startDate
  const months = useMemo(() => 
    Array.from({ length: 12 }, (_, i) => addMonths(startDate, i)), 
    [startDate]
  )
  
  // Mouse handlers for drag to scroll
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollRef.current) return
    
    setIsDragging(true)
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
  }, [])
  
  const handleMouseLeave = useCallback(() => {
    setIsDragging(false)
  }, [])
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 1.5 // Scroll speed multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk
  }, [isDragging, startX, scrollLeft])

  return (
    <ScrollArea className="h-full w-full">
      <div 
        className="min-w-[2400px]"
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
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
    </ScrollArea>
  )
}
