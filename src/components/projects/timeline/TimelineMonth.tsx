
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
}: TimelineMonthProps) {
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

  const monthLabel = format(month, "MMM")
  
  const isCurrentMonth =
    new Date().getMonth() === month.getMonth() &&
    new Date().getFullYear() === month.getFullYear()

  return (
    <div 
      className={cn(
        "p-4 space-y-4 rounded-sm",
        isCurrentMonth ? "bg-blue-50 dark:bg-blue-900/20" : "bg-white dark:bg-gray-900"
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{monthLabel}</h3>
        <span className={cn(
          "text-xs font-semibold",
          monthProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
        )}>
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "EUR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(monthProfit)}
        </span>
      </div>

      <TooltipProvider>
        {/* Accumulated Profit Display */}
        <div className="mb-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn(
                "flex items-center text-xs p-1 rounded",
                accumulatedProfit >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              )}>
                <Info className="h-3 w-3 mr-1" />
                <span className="truncate">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "EUR",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(accumulatedProfit)}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Accumulated profit up to this month</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Revenues */}
        {revenues.length > 0 && (
          <div className="space-y-1">
            {revenues.map((revenue) => (
              <Tooltip key={revenue.id}>
                <TooltipTrigger asChild>
                  <Badge 
                    className="w-full justify-between cursor-pointer bg-green-100 hover:bg-green-200 text-green-800 border-0"
                    onClick={() => onSelectRevenue(revenue)}
                  >
                    <CircleDollarSign className="h-3 w-3 mr-1" />
                    <span>
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "EUR",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(revenue.amount)}
                    </span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Revenue {format(new Date(revenue.month), "MMM d, yyyy")}</p>
                  <p>Click to edit</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        )}

        {/* Variable Costs */}
        {variableCosts.length > 0 && (
          <div className="space-y-1 mt-1">
            {variableCosts.map((cost) => (
              <Tooltip key={cost.id}>
                <TooltipTrigger asChild>
                  <Badge 
                    className="w-full justify-between cursor-pointer bg-red-100 hover:bg-red-200 text-red-800 border-0"
                    onClick={() => onSelectVariableCost(cost)}
                  >
                    <TrendingDown className="h-3 w-3 mr-1" />
                    <span>
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "EUR",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(cost.amount)}
                    </span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Variable Cost {format(new Date(cost.month), "MMM d, yyyy")}</p>
                  {cost.description && <p>{cost.description}</p>}
                  <p>Click to edit</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        )}

        {/* Overhead Costs - Automatically calculated */}
        {overheadCosts.length > 0 && (
          <div className="space-y-1 mt-1">
            {overheadCosts.map((cost) => (
              <Tooltip key={cost.id}>
                <TooltipTrigger asChild>
                  <Badge 
                    className="w-full justify-between cursor-pointer bg-orange-100 hover:bg-orange-200 text-orange-800 border-0"
                  >
                    <Calculator className="h-3 w-3 mr-1" />
                    <span>
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "EUR",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(cost.amount)}
                    </span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Overhead Cost {format(new Date(cost.month), "MMM d, yyyy")}</p>
                  {cost.description && <p>{cost.description}</p>}
                  <p>Automatically calculated based on variable costs</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        )}

        {/* Team Allocations */}
        {allocations.length > 0 && (
          <div className="space-y-1 mt-1">
            {allocations.map((allocation) => (
              <Tooltip key={allocation.id}>
                <TooltipTrigger asChild>
                  <Badge 
                    className="w-full justify-between cursor-pointer bg-purple-100 hover:bg-purple-200 text-purple-800 border-0"
                    onClick={() => onSelectAllocation(allocation)}
                  >
                    <CircleUser className="h-3 w-3 mr-1" />
                    <span>
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "EUR",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(allocation.salary_cost)}
                    </span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{allocation.team_member_name} ({allocation.allocation_percentage}%)</p>
                  <p>Click to edit</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        )}
      </TooltipProvider>
    </div>
  )
}
