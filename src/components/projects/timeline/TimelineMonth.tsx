
import { format } from "date-fns"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { cn, formatCurrency } from "@/lib/utils"
import {
  CircleDollarSign,
  TrendingDown,
  CircleUser,
  Info,
  Calculator,
  DragHandleDots2,
} from "lucide-react"
import { useTranslation } from "react-i18next"
import { useDrag, useDrop } from "react-dnd"

interface TimelineMonthProps {
  month: Date
  revenues: any[]
  variableCosts: any[]
  overheadCosts: any[]
  allocations: any[]
  onSelectRevenue: (revenue: any) => void
  onSelectVariableCost: (cost: any) => void
  onSelectOverheadCost: (cost: any) => void
  onSelectAllocation: (allocation: any) => void
  onMoveItem?: (itemId: string, itemType: string, sourceMonth: string, targetMonth: string) => void
  accumulatedProfit: number
  showDecimals?: boolean
}

const ITEM_TYPES = {
  REVENUE: 'revenue',
  VARIABLE_COST: 'variable-cost',
  ALLOCATION: 'allocation'
}

export function TimelineMonth({
  month,
  revenues,
  variableCosts,
  overheadCosts,
  allocations,
  onSelectRevenue,
  onSelectVariableCost,
  onSelectOverheadCost,
  onSelectAllocation,
  onMoveItem,
  accumulatedProfit,
  showDecimals = true,
}: TimelineMonthProps) {
  const { t } = useTranslation()
  const monthStr = format(month, "yyyy-MM")
  
  const totalRevenues = revenues.reduce((sum, r) => sum + Number(r.amount), 0)
  const totalVariableCosts = variableCosts.reduce(
    (sum, c) => sum + Number(c.amount),
    0
  )
  const totalOverheadCosts = overheadCosts.reduce(
    (sum, c) => sum + Number(c.amount),
    0
  )
  
  const totalSalaryCosts = allocations.reduce(
    (sum, a) => sum + Number(a.salary_cost),
    0
  )

  const totalCosts = totalVariableCosts + totalOverheadCosts + totalSalaryCosts
  const monthProfit = totalRevenues - totalCosts

  const getMonthKey = (month: Date) => {
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
    return monthNames[month.getMonth()]
  }
  
  const isCurrentMonth =
    new Date().getMonth() === month.getMonth() &&
    new Date().getFullYear() === month.getFullYear()

  const handleRevenueClick = () => {
    if (revenues.length === 1) {
      onSelectRevenue(revenues[0]);
    } 
    else if (revenues.length > 1) {
      onSelectRevenue(revenues[0]);
    } 
    else {
      // Create a new revenue item with the correct month format (YYYY-MM)
      const formattedMonth = format(month, "yyyy-MM")
      onSelectRevenue({ 
        id: null, 
        month: formattedMonth,
        amount: "",
        isNew: true 
      });
    }
  }

  // Set up drop target for this month
  const [{ isOver }, drop] = useDrop({
    accept: [ITEM_TYPES.REVENUE, ITEM_TYPES.VARIABLE_COST, ITEM_TYPES.ALLOCATION],
    drop: (item: any) => {
      if (item.month !== monthStr && onMoveItem) {
        onMoveItem(item.id, item.type, item.month, monthStr);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div 
      ref={drop}
      className={cn(
        "p-4 space-y-2 border-r border-gray-200 dark:border-gray-800 flex flex-col",
        isCurrentMonth
          ? "bg-blue-100/50 dark:bg-blue-900/20 border-blue-300/50 dark:border-blue-700/30"
          : "bg-white dark:bg-gray-900",
        isOver && "bg-blue-100 dark:bg-blue-800/30"
      )}
    >
      <div className="text-center font-medium text-sm mb-3">
        {t(`common.months.${getMonthKey(month)}`)} {month.getFullYear()}
      </div>

      <div 
        onClick={handleRevenueClick}
        className={cn(
          "p-2 rounded-md text-center cursor-pointer hover:opacity-80 transition-opacity",
          totalRevenues > 0 ? "bg-green-50 dark:bg-green-900/20" : "bg-gray-50 dark:bg-gray-800/20"
        )}
      >
        <div className="text-sm font-medium">
          {formatCurrency(totalRevenues, showDecimals)}
        </div>
      </div>

      {allocations.map((allocation) => {
        // Create draggable allocation item
        const [{ isDragging }, drag] = useDrag({
          type: ITEM_TYPES.ALLOCATION,
          item: { 
            id: allocation.id, 
            type: ITEM_TYPES.ALLOCATION, 
            month: format(new Date(allocation.month), "yyyy-MM") 
          },
          collect: (monitor) => ({
            isDragging: monitor.isDragging(),
          }),
        });
        
        return (
          <div
            key={allocation.id}
            ref={drag}
            onClick={() => onSelectAllocation(allocation)}
            className={cn(
              "bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 p-2 rounded-md text-xs cursor-pointer",
              "flex items-center justify-between gap-1",
              isDragging && "opacity-50"
            )}
          >
            <div className="flex-1">
              <div className="font-medium">
                {formatCurrency(-allocation.salary_cost, showDecimals)}
              </div>
              <div className="truncate">
                {allocation.team_member_name} ({allocation.allocation_percentage}%)
              </div>
            </div>
            <DragHandleDots2 className="h-4 w-4 text-blue-500 opacity-50 hover:opacity-100" />
          </div>
        );
      })}

      {variableCosts.map((cost) => {
        // Create draggable variable cost item
        const [{ isDragging }, drag] = useDrag({
          type: ITEM_TYPES.VARIABLE_COST,
          item: { 
            id: cost.id, 
            type: ITEM_TYPES.VARIABLE_COST, 
            month: format(new Date(cost.month), "yyyy-MM") 
          },
          collect: (monitor) => ({
            isDragging: monitor.isDragging(),
          }),
        });
        
        return (
          <div
            key={cost.id}
            ref={drag}
            onClick={() => onSelectVariableCost(cost)}
            className={cn(
              "bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300 p-2 rounded-md text-xs cursor-pointer",
              "flex items-center justify-between gap-1",
              isDragging && "opacity-50"
            )}
          >
            <div className="flex-1">
              <div className="font-medium">
                {formatCurrency(-cost.amount, showDecimals)}
              </div>
              {cost.description && (
                <div className="truncate">
                  {cost.description}
                </div>
              )}
            </div>
            <DragHandleDots2 className="h-4 w-4 text-red-500 opacity-50 hover:opacity-100" />
          </div>
        );
      })}

      {revenues.map((revenue) => {
        // Create draggable revenue item
        const [{ isDragging }, drag] = useDrag({
          type: ITEM_TYPES.REVENUE,
          item: { 
            id: revenue.id, 
            type: ITEM_TYPES.REVENUE, 
            month: format(new Date(revenue.month), "yyyy-MM") 
          },
          collect: (monitor) => ({
            isDragging: monitor.isDragging(),
          }),
        });
        
        return (
          <div
            key={revenue.id}
            ref={drag}
            onClick={() => onSelectRevenue(revenue)}
            className={cn(
              "bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300 p-2 rounded-md text-xs cursor-pointer",
              "flex items-center justify-between gap-1",
              isDragging && "opacity-50"
            )}
          >
            <div className="flex-1">
              <div className="font-medium">
                {formatCurrency(revenue.amount, showDecimals)}
              </div>
            </div>
            <DragHandleDots2 className="h-4 w-4 text-green-500 opacity-50 hover:opacity-100" />
          </div>
        );
      })}

      {overheadCosts.map((cost) => (
        <div
          key={cost.id}
          className="bg-orange-50 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 p-2 rounded-md text-xs"
        >
          <div className="font-medium">
            {formatCurrency(-cost.amount, showDecimals)}
          </div>
          <div className="truncate">
            {cost.description || `${cost.percentage.toFixed(2).replace(/\.?0+$/, '')}% overhead`}
          </div>
        </div>
      ))}

      <div className="flex-grow"></div>
    </div>
  )
}
