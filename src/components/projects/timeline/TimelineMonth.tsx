
import { format } from "date-fns"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  CircleDollarSign,
  TrendingDown,
  CircleUser,
  Info,
  Calculator,
} from "lucide-react"
import { useTranslation } from "react-i18next"

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
  accumulatedProfit: number
  showDecimals?: boolean
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
  accumulatedProfit,
  showDecimals = true,
}: TimelineMonthProps) {
  const { t } = useTranslation()
  
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    }).format(amount)
  }

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

  return (
    <div 
      className={cn(
        "p-4 space-y-2 border-r border-gray-200 dark:border-gray-800 flex flex-col",
        isCurrentMonth
          ? "bg-blue-100/50 dark:bg-blue-900/20 border-blue-300/50 dark:border-blue-700/30"
          : "bg-white dark:bg-gray-900"
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
          {formatCurrency(totalRevenues)}
        </div>
      </div>

      {allocations.map((allocation) => (
        <div
          key={allocation.id}
          onClick={() => onSelectAllocation(allocation)}
          className="bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 p-2 rounded-md text-xs cursor-pointer"
        >
          <div className="font-medium">
            {formatCurrency(-allocation.salary_cost)}
          </div>
          <div className="truncate">
            {allocation.team_member_name} ({allocation.allocation_percentage}%)
          </div>
        </div>
      ))}

      {variableCosts.map((cost) => (
        <div
          key={cost.id}
          onClick={() => onSelectVariableCost(cost)}
          className="bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300 p-2 rounded-md text-xs cursor-pointer"
        >
          <div className="font-medium">
            {formatCurrency(-cost.amount)}
          </div>
          {cost.description && (
            <div className="truncate">
              {cost.description}
            </div>
          )}
        </div>
      ))}

      {overheadCosts.map((cost) => (
        <div
          key={cost.id}
          className="bg-orange-50 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 p-2 rounded-md text-xs"
        >
          <div className="font-medium">
            {formatCurrency(-cost.amount)}
          </div>
          <div className="truncate">
            {cost.description || `${cost.percentage}% overhead`}
          </div>
        </div>
      ))}

      <div className="flex-grow"></div>
      
      {/* Removed the profit lines here */}
    </div>
  )
}
