
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
  GripVertical,
  MoveHorizontal,
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
  onMoveMonth?: (sourceMonth: string, targetMonth: string) => void
  accumulatedProfit: number
  showDecimals?: boolean
}

const ITEM_TYPES = {
  REVENUE: 'revenue',
  VARIABLE_COST: 'variable-cost',
  ALLOCATION: 'allocation',
  MONTH: 'month'
}

// Helper component for draggable items to ensure hooks are always used in the same order
function DraggableItem({ item, type, onSelect, children }) {
  const [{ isDragging }, drag] = useDrag({
    type,
    item: { 
      id: item.id, 
      type, 
      month: format(new Date(item.month), "yyyy-MM") 
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  return (
    <div
      ref={drag}
      onClick={() => onSelect(item)}
      className={cn(
        isDragging && "opacity-50"
      )}
    >
      {children}
    </div>
  );
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
  onMoveMonth,
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

  // Make the month header draggable
  const [{ isDragging: isMonthDragging }, dragMonth] = useDrag({
    type: ITEM_TYPES.MONTH,
    item: { 
      type: ITEM_TYPES.MONTH, 
      month: monthStr,
      revenues: revenues,
      variableCosts: variableCosts,
      allocations: allocations
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Set up drop target for this month - always create the drop target regardless of onMoveItem availability
  const [{ isOver }, drop] = useDrop({
    accept: [ITEM_TYPES.REVENUE, ITEM_TYPES.VARIABLE_COST, ITEM_TYPES.ALLOCATION, ITEM_TYPES.MONTH],
    drop: (item: any) => {
      // Handle dropping a single item
      if (item.type !== ITEM_TYPES.MONTH && item.month !== monthStr && onMoveItem) {
        onMoveItem(item.id, item.type, item.month, monthStr);
      }
      // Handle dropping an entire month
      else if (item.type === ITEM_TYPES.MONTH && item.month !== monthStr && onMoveMonth) {
        onMoveMonth(item.month, monthStr);
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
      <div 
        ref={dragMonth}
        className={cn(
          "text-center font-medium text-sm mb-3 cursor-grab active:cursor-grabbing",
          isMonthDragging && "opacity-50"
        )}
      >
        <div className="flex items-center justify-center">
          {t(`common.months.${getMonthKey(month)}`)} {month.getFullYear()}
          <MoveHorizontal className="ml-1 h-3 w-3 text-gray-500" />
        </div>
      </div>

      {/* Revenue Summary - Add drag handles to make it clear it's draggable */}
      {totalRevenues > 0 ? (
        revenues.map((revenue) => (
          <DraggableItem 
            key={revenue.id}
            item={revenue}
            type={ITEM_TYPES.REVENUE}
            onSelect={onSelectRevenue}
          >
            <div className={cn(
              "bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300 p-2 rounded-md",
              "flex items-center justify-between gap-1 cursor-pointer"
            )}>
              <div className="flex-1">
                <div className="font-medium">
                  {formatCurrency(revenue.amount, showDecimals)}
                </div>
              </div>
              <GripVertical className="h-4 w-4 text-green-500 opacity-50 hover:opacity-100" />
            </div>
          </DraggableItem>
        ))
      ) : (
        <div 
          onClick={handleRevenueClick}
          className="p-2 rounded-md text-center cursor-pointer hover:opacity-80 transition-opacity bg-gray-50 dark:bg-gray-800/20"
        >
          <div className="text-sm font-medium">
            {formatCurrency(0, showDecimals)}
          </div>
        </div>
      )}

      {/* Allocations - Using the DraggableItem component to ensure consistent hook rendering */}
      {allocations.map((allocation) => (
        <DraggableItem 
          key={allocation.id}
          item={allocation}
          type={ITEM_TYPES.ALLOCATION}
          onSelect={onSelectAllocation}
        >
          <div className={cn(
            "bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 p-2 rounded-md text-xs cursor-pointer",
            "flex items-center justify-between gap-1"
          )}>
            <div className="flex-1">
              <div className="font-medium">
                {formatCurrency(-allocation.salary_cost, showDecimals)}
              </div>
              <div className="truncate">
                {allocation.team_member_name} ({allocation.allocation_percentage}%)
              </div>
            </div>
            <GripVertical className="h-4 w-4 text-blue-500 opacity-50 hover:opacity-100" />
          </div>
        </DraggableItem>
      ))}

      {/* Variable Costs - Using the DraggableItem component to ensure consistent hook rendering */}
      {variableCosts.map((cost) => (
        <DraggableItem 
          key={cost.id}
          item={cost}
          type={ITEM_TYPES.VARIABLE_COST}
          onSelect={onSelectVariableCost}
        >
          <div className={cn(
            "bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300 p-2 rounded-md text-xs cursor-pointer",
            "flex items-center justify-between gap-1"
          )}>
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
            <GripVertical className="h-4 w-4 text-red-500 opacity-50 hover:opacity-100" />
          </div>
        </DraggableItem>
      ))}

      {/* Overhead Costs - These don't need drag functionality */}
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
