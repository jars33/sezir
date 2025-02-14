
import { format } from "date-fns"

interface TimelineItem {
  id: string
  month: string
  amount: number
  description?: string
}

interface AllocationItem {
  id: string
  month: string
  allocation_percentage: number
  team_member_name: string
  salary_cost: number
  team_member_id: string
  project_assignment_id: string
}

interface TimelineMonthProps {
  month: Date
  revenues: TimelineItem[]
  variableCosts: TimelineItem[]
  overheadCosts: TimelineItem[]
  allocations: AllocationItem[]
  onSelectRevenue: (revenue: TimelineItem) => void
  onSelectVariableCost: (cost: TimelineItem) => void
  onSelectOverheadCost: (cost: TimelineItem) => void
  onSelectAllocation?: (allocation: AllocationItem) => void
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
}: TimelineMonthProps) {
  const totalRevenue = revenues.reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
  const totalVariableCosts = variableCosts.reduce((sum, c) => sum + (Number(c.amount) || 0), 0)
  const totalOverheadCosts = overheadCosts.reduce((sum, c) => sum + (Number(c.amount) || 0), 0)
  const totalSalaryCosts = allocations.reduce((sum, a) => sum + (Number(a.salary_cost) || 0), 0)
  const profit = totalRevenue - totalVariableCosts - totalOverheadCosts - totalSalaryCosts

  const formatAmount = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return "0.00"
    return amount.toFixed(2)
  }

  return (
    <div className="bg-white p-2 flex flex-col">
      {/* Header */}
      <div className="text-center mb-2">
        <h3 className="text-sm font-medium">{format(month, "MMM yyyy")}</h3>
      </div>

      {/* Timeline Grid */}
      <div className="flex-1 grid grid-rows-[auto_1fr] gap-4">
        {/* Revenues Section - Top Row */}
        <div className="space-y-1">
          {revenues.map((revenue) => (
            <div
              key={revenue.id}
              onClick={() => onSelectRevenue(revenue)}
              className="p-2 min-h-[40px] flex items-center justify-center bg-green-50 border border-green-200 rounded text-sm cursor-pointer hover:bg-green-100 w-full text-center"
            >
              €{formatAmount(revenue.amount)}
            </div>
          ))}
        </div>

        {/* Costs Section - Bottom Row */}
        <div className="space-y-1">
          {/* Allocations */}
          {allocations.map((allocation) => (
            <div
              key={allocation.id}
              onClick={() => onSelectAllocation?.(allocation)}
              className="p-2 min-h-[50px] bg-blue-50 border border-blue-200 rounded text-sm cursor-pointer hover:bg-blue-100 w-full"
            >
              <div className="text-center">-€{formatAmount(allocation.salary_cost)}</div>
              <div className="text-xs text-gray-600 text-center">{allocation.team_member_name}</div>
            </div>
          ))}

          {/* Variable Costs */}
          {variableCosts.map((cost) => (
            <div
              key={cost.id}
              onClick={() => onSelectVariableCost(cost)}
              className="p-2 min-h-[40px] bg-red-50 border border-red-200 rounded text-sm cursor-pointer hover:bg-red-100 w-full"
            >
              <div className="text-center">-€{formatAmount(cost.amount)}</div>
              {cost.description && (
                <div className="text-xs text-gray-600 text-center">{cost.description}</div>
              )}
            </div>
          ))}

          {/* Overhead Costs */}
          {overheadCosts.map((cost) => (
            <div
              key={cost.id}
              onClick={() => onSelectOverheadCost(cost)}
              className="p-2 min-h-[40px] flex items-center justify-center bg-orange-50 border border-orange-200 rounded text-sm cursor-pointer hover:bg-orange-100 w-full text-center"
            >
              -€{formatAmount(cost.amount)}
            </div>
          ))}
        </div>
      </div>

      {/* Footer with Profit */}
      <div className={`mt-2 text-sm font-medium text-center ${
        profit >= 0 
          ? "text-green-600"
          : "text-red-600"
      }`}>
        €{formatAmount(profit)}
      </div>
    </div>
  )
}
